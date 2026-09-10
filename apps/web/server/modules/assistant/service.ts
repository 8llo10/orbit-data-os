import {randomUUID} from 'crypto';
import {detectIntent} from './intent';
import {askProvider} from './provider';
import {analyzeQuestion} from './analytics';
import {largestCollections,relationEvidence,workspaceEvidence} from './query-engine';
import type {AssistantAction,AssistantResult,SourceRef,WorkspaceSnapshot} from './types';

const nav=(label:string,href:string):AssistantAction=>({id:randomUUID(),type:'navigate',label,href,requiresConfirmation:false});
const mut=(type:'create_dashboard'|'create_automation'|'create_view',label:string,payload:Record<string,unknown>):AssistantAction=>({id:randomUUID(),type,label,requiresConfirmation:true,payload});

export async function runAssistant(message:string,s:WorkspaceSnapshot):Promise<AssistantResult>{
 const requestId=randomUUID();const intent=detectIntent(message);let answer='';let evidence=workspaceEvidence(s);let sources:SourceRef[]=[];let actions:AssistantAction[]=[];
 if(!s.collectionCount){answer='ما عندي ملفات أقدر أعتمد عليها للحين. ارفع CSV أو Excel أو JSON وبعدها أي معلومة أذكرها لك بربطها بمصدر واضح.';actions=[nav('رفع أول ملف','/dashboard/imports')];return result(answer,intent,evidence,sources,actions,false,requestId)}

 if(intent==='WORKSPACE_SUMMARY'){
  const top=largestCollections(s)[0];answer=`مساحة «${s.name}» فيها ${s.collectionCount} مجموعات بإجمالي ${s.recordCount.toLocaleString('ar-SA')} سجل، و${s.relationCount} علاقات و${s.automationCount} أتمتة فعالة.${top?` أكبر مجموعة هي «${top.label}» وفيها ${top.value}.`:''}`;actions=[nav('فتح البيانات','/dashboard/collections'),mut('create_dashboard','بناء Dashboard من هذا الملخص',{name:'ORBIT Generated Overview',kind:'overview'})];
 }else if(intent==='RELATIONSHIPS'){
  evidence=relationEvidence(s);answer=`عندك ${s.relationCount} علاقات معرفة رسميًا. وعرضت لك فقط مفاتيح متشابهة كعلاقات محتملة؛ ما أعتبرها صحيحة إلا بعد إثباتها أو تأكيدك.`;actions=[nav('فتح مخطط العلاقات','/dashboard/graph')];
 }else{
  const analysis=await analyzeQuestion(message,s);answer=analysis.answer;evidence=analysis.evidence;sources=analysis.sources;
  if(analysis.collectionId)actions.push(nav('فتح المصدر','/dashboard/collections'));
  if(intent==='AUTOMATION')actions.push(mut('create_automation','إنشاء الأتمتة المقترحة',{name:`ORBIT: ${message.slice(0,70)}`,collectionId:analysis.collectionId||null,request:message}));
  if(intent==='DASHBOARD'||intent==='ANALYSIS'||intent==='RANKING')actions.push(mut('create_dashboard','إنشاء Dashboard من النتيجة',{name:'ORBIT Generated Dashboard',collectionId:analysis.collectionId||null,request:message}));
  if(!analysis.hasSource)actions=[];
 }

 const groundedText=`${answer}\n\nالمصادر المتاحة: ${sources.length?sources.map(x=>`${x.collectionName} [${x.fields.join(', ')}] - ${x.examinedRows}/${x.totalRows} rows`).join(' | '):'لا يوجد مصدر ملف لهذا الاستنتاج.'}`;
 const ai=await askProvider(message,intent,s,groundedText).catch(()=>null);
 if(ai&&sources.length)answer=ai;
 return {answer,intent,confidence:sources.length?0.96:0.8,evidence,sources,actions,followUps:sources.length?['ورّني مشاكل الجودة في نفس المصدر','وش أعلى القيم أو الحالات فيه؟','حوّل النتيجة إلى Dashboard']:['وش الملفات الموجودة عندي؟','لخص مساحة العمل'],mode:ai&&sources.length?'ai-orchestrated':'deterministic',requestId};
}

function result(answer:string,intent:AssistantResult['intent'],evidence:AssistantResult['evidence'],sources:SourceRef[],actions:AssistantAction[],ai:boolean,requestId:string):AssistantResult{return {answer,intent,confidence:0.95,evidence,sources,actions,followUps:[],mode:ai?'ai-orchestrated':'deterministic',requestId}}
