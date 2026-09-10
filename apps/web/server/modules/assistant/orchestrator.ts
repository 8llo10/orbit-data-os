import {randomUUID} from 'crypto';
import {analyzeQuestion} from './analytics';
import {analyzeAcrossRelations} from './relational-analytics';
import {largestCollections,relationEvidence,workspaceEvidence} from './query-engine';
import {askProvider,planWithProvider} from './provider';
import {buildGroundTruth,providerAnswerIsGrounded} from './grounding';
import {exportActions,mutationActions,navigateAction} from './actions';
import {planAssistantRequest} from './planner';
import {proposeRelationshipAction} from './relationship-proposals';
import {executeStructuredQuery,validateStructuredPlan} from './structured-query';
import {composeNaturalResponse} from './response-composer';
import type {AssistantAction,AssistantResult,AssistantRunInput,Evidence,SourceRef} from './types';
const relationRequest=/اربط|علاق|relation|join|connect|مع بعض|بين .* و/i;const wantsResult=/احسب|حلل|طلع|اعرض|أعرض|قارن|رتب|أعلى|اعلى|اقل|أقل|average|sum|count|compare|rank|show/i;
export async function orchestrateAssistant(input:AssistantRunInput):Promise<AssistantResult>{
 const requestId=randomUUID();const plan=planAssistantRequest(input.message,input.history);const {intent,effectiveMessage,history}=plan;const s=input.snapshot;
 if(!s.collectionCount)return {answer:'ما عندك ملفات مرفوعة للحين. ارفع CSV أو Excel أو JSON، وبعدها أقدر أقرأ بياناتك وأجاوبك منها بالمصدر.',intent,confidence:1,evidence:workspaceEvidence(s),sources:[],actions:[navigateAction('رفع أول ملف','/dashboard/imports')],followUps:[],mode:'deterministic',requestId};
 let answer='';let evidence:Evidence[]=[];let sources:SourceRef[]=[];let collectionId:string|undefined;const explicitRelation=relationRequest.test(input.message);
 if(intent==='WORKSPACE_SUMMARY'){evidence=[...workspaceEvidence(s),...largestCollections(s)];answer=composeNaturalResponse({intent,answer:'',evidence,sources,snapshot:s});}
 else if(intent==='RELATIONSHIPS'&&!wantsResult.test(input.message)){evidence=relationEvidence(s);answer=`عندك ${s.relationCount} علاقات محفوظة رسميًا. أي علاقة ثانية أعرضها لك كاقتراح فقط، وما أعتمدها في التحليل إلا بعد تأكيدها.`;}
 else{const relational=explicitRelation?await analyzeAcrossRelations(effectiveMessage,s):null;if(relational){answer=relational.answer;evidence=relational.evidence;sources=relational.sources;collectionId=relational.collectionId;}else{const modelPlan=await planWithProvider({message:input.message,snapshot:s,history});const validated=modelPlan?.query?validateStructuredPlan(modelPlan.query,s):null;const analysis=validated?await executeStructuredQuery(validated,s):await analyzeQuestion(effectiveMessage,s);answer=analysis.answer;evidence=analysis.evidence;sources=analysis.sources;collectionId=analysis.collectionId;}answer=composeNaturalResponse({intent,answer,evidence,sources,snapshot:s});}
 const actions:AssistantAction[]=[];if(collectionId)actions.push(navigateAction('فتح المصدر',`/dashboard/collections/${collectionId}`));if(intent==='WORKSPACE_SUMMARY')actions.push(navigateAction('فتح البيانات','/dashboard/collections'));
 if(intent==='RELATIONSHIPS'||explicitRelation){actions.push(navigateAction('فتح مخطط العلاقات','/dashboard/graph'));const proposal=proposeRelationshipAction(s,input.message);if(proposal){if(wantsResult.test(input.message))actions.push({id:randomUUID(),type:'execute_plan',label:'إنشاء العلاقة وإكمال الطلب',requiresConfirmation:true,payload:{steps:[proposal],request:input.message,resume:true}});else actions.push(proposal);}}
 if(collectionId)actions.push(...exportActions(input.message,collectionId));
 if(sources.length)actions.push(...mutationActions({intent,message:input.message,collectionId}));
 const groundTruth=buildGroundTruth(answer,sources);const ai=await askProvider({message:input.message,intent,snapshot:s,groundTruth,history});const aiAccepted=Boolean(ai&&providerAnswerIsGrounded(ai,groundTruth));if(aiAccepted&&ai)answer=ai;
 return {answer,intent,confidence:sources.length?0.97:intent==='WORKSPACE_SUMMARY'||intent==='RELATIONSHIPS'?0.95:0.78,evidence,sources,actions,followUps:followUpsFor(intent,Boolean(sources.length)),mode:aiAccepted?'ai-orchestrated':'deterministic',requestId};
}
function followUpsFor(intent:AssistantResult['intent'],hasSource:boolean){if(intent==='RELATIONSHIPS')return ['وش أفضل علاقة أبدأ فيها؟','وش الحقول المشتركة؟','بعد الربط حللهم مع بعض'];if(!hasSource)return ['لخص مساحة العمل','وش الملفات الموجودة عندي؟','ورّني العلاقات بين البيانات'];if(intent==='DATA_QUALITY')return ['وش أخطر مشكلة جودة؟','ورّني الحقول الأكثر نقصًا','سو لي View للمشاكل'];if(intent==='AUTOMATION')return ['وش بيصير قبل ما أشغلها؟','خلها Paused أول','ورّني المصدر المستخدم'];return ['حلل نفس المصدر بشكل أعمق','وش أعلى القيم فيه؟','حوّل النتيجة إلى Dashboard'];}
