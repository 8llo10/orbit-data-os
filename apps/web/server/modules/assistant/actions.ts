import {randomUUID} from 'crypto';
import type {AssistantAction,AssistantIntent} from './types';

const wantsCreate=/(سو|سوي|أنشئ|انشئ|اعمل|ابني|جهز|create|make|build|save|أضف|اضف|ضيف)/i;
const wantsDashboard=/(dashboard|داشبورد|لوحة)/i;
const wantsAutomation=/(automation|أتمت|اتمت|تنبيه|نبه|alert|remind|webhook|trigger)/i;
const wantsView=/(view|عرض محفوظ|احفظ.*نتيج|save.*view)/i;
const wantsFormula=/(عمود|حقل|column|field).*(احسب|حساب|معادلة|formula|=|من)/i;
const wantsRecord=/(أضف|اضف|ضيف|أنشئ|انشئ|create|add).*(سجل|record)/i;
const wantsCsv=/(csv|سي ?اس ?في|اكسل|excel)/i;
const wantsJson=/(json|جيسون)/i;
const wantsExport=/(صدر|صدّر|export|download|نزل|نزّل)/i;

export const navigateAction=(label:string,href:string):AssistantAction=>({id:randomUUID(),type:'navigate',label,href,requiresConfirmation:false});

function dashboardAction(message:string,collectionId?:string):AssistantAction{return{id:randomUUID(),type:'create_dashboard',label:'إنشاء Dashboard من النتيجة',requiresConfirmation:true,payload:{name:'ORBIT Generated Dashboard',collectionId:collectionId||null,request:message}}}
function automationAction(message:string,collectionId?:string):AssistantAction{return{id:randomUUID(),type:'create_automation',label:'إنشاء الأتمتة المقترحة',requiresConfirmation:true,payload:{name:`ORBIT: ${message.slice(0,70)}`,collectionId:collectionId||null,request:message}}}
function viewAction(message:string,collectionId:string):AssistantAction{return{id:randomUUID(),type:'create_view',label:'حفظ النتيجة كـ View',requiresConfirmation:true,payload:{name:'ORBIT Generated View',collectionId,request:message}}}

function formulaAction(message:string,collectionId:string):AssistantAction|null{
 if(!wantsFormula.test(message))return null;
 const eq=message.match(/(?:عمود|حقل|column|field)\s+[«"']?([^=:\n،,]{2,60}?)[»"']?\s*(?:=|يساوي|formula[:：]?|معادل(?:ة|ته)[:：]?|من)\s*(.+)$/i);
 if(!eq)return null;
 const label=eq[1].trim().replace(/^(اسمه|اسمة|باسم|name)\s+/i,'').trim();
 let formula=eq[2].trim().replace(/[.،]+$/,'');
 if(!label||!formula)return null;
 formula=formula.replace(/\b([A-Za-z_][A-Za-z0-9_-]*)\b/g,(token)=>['CONCAT'].includes(token.toUpperCase())||/^\d/.test(token)?token:`{${token}}`);
 formula=formula.replace(/\{CONCAT\}/gi,'CONCAT');
 return {id:randomUUID(),type:'create_formula',label:`إنشاء الحقل «${label}» وحسابه`,requiresConfirmation:true,payload:{collectionId,label,formula,request:message}};
}

function recordAction(message:string,collectionId:string):AssistantAction|null{
 if(!wantsRecord.test(message))return null;
 const body=message.includes(':')?message.slice(message.indexOf(':')+1):message.replace(/^.*?(?:سجل|record)\s*/i,'');
 const values:Record<string,unknown>={};
 const json=body.trim();
 if(json.startsWith('{')&&json.endsWith('}')){try{const parsed=JSON.parse(json);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))Object.assign(values,parsed)}catch{}}
 if(!Object.keys(values).length){for(const part of body.split(/[,،;]\s*/)){const m=part.match(/^\s*([A-Za-z0-9_\-\u0600-\u06ff]+)\s*(?:=|:|يساوي)\s*(.+?)\s*$/);if(!m)continue;values[m[1]]=coerce(m[2]);}}
 if(!Object.keys(values).length)return null;
 return {id:randomUUID(),type:'create_record',label:`إضافة سجل جديد (${Object.keys(values).length} حقول)`,requiresConfirmation:true,payload:{collectionId,values,request:message}};
}

function coerce(raw:string):unknown{const value=raw.trim().replace(/^['"«]|['"»]$/g,'');if(/^null$/i.test(value))return null;if(/^true$/i.test(value))return true;if(/^false$/i.test(value))return false;const n=Number(value.replace(/,/g,''));return Number.isFinite(n)&&value!==''?n:value;}

export function exportActions(message:string,collectionId?:string):AssistantAction[]{
 if(!collectionId||!wantsExport.test(message))return [];
 const actions:AssistantAction[]=[];
 if(wantsJson.test(message))actions.push({id:randomUUID(),type:'export_json',label:'تصدير JSON',href:`/api/collections/${collectionId}/export?format=json`,requiresConfirmation:false});
 if(wantsCsv.test(message)||!actions.length)actions.push({id:randomUUID(),type:'export_csv',label:'تصدير CSV',href:`/api/collections/${collectionId}/export?format=csv`,requiresConfirmation:false});
 return actions;
}

export function requestedMutationActions(input:{intent:AssistantIntent;message:string;collectionId?:string}){
 const {intent,message,collectionId}=input;const explicit=wantsCreate.test(message);const steps:AssistantAction[]=[];
 if(collectionId){const record=recordAction(message,collectionId);if(record)steps.push(record);const formula=formulaAction(message,collectionId);if(formula)steps.push(formula);}
 if((explicit&&wantsDashboard.test(message))||intent==='DASHBOARD')steps.push(dashboardAction(message,collectionId));
 if((explicit&&wantsAutomation.test(message))||intent==='AUTOMATION')steps.push(automationAction(message,collectionId));
 if(collectionId&&explicit&&wantsView.test(message))steps.push(viewAction(message,collectionId));
 if(steps.length<=1)return steps;
 return [{id:randomUUID(),type:'execute_plan',label:`تنفيذ ${steps.length} إجراءات مطلوبة`,requiresConfirmation:true,payload:{steps,request:message,resume:false}} satisfies AssistantAction];
}

export function mutationActions(input:{intent:AssistantIntent;message:string;collectionId?:string}){
 const explicit=requestedMutationActions(input);if(explicit.length)return explicit;
 const {intent,message,collectionId}=input;
 if((intent==='ANALYSIS'||intent==='RANKING')&&collectionId)return [dashboardAction(message,collectionId)];
 if(intent==='SEARCH'&&collectionId)return [viewAction(message,collectionId)];
 return [];
}
