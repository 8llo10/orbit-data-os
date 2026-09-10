import {randomUUID} from 'crypto';
import type {AssistantAction,AssistantIntent} from './types';

const wantsCreate=/(سو|سوي|أنشئ|انشئ|اعمل|ابني|جهز|create|make|build|save)/i;
const wantsDashboard=/(dashboard|داشبورد|لوحة)/i;
const wantsAutomation=/(automation|أتمت|اتمت|تنبيه|نبه|alert|remind|webhook|trigger)/i;
const wantsView=/(view|عرض محفوظ|احفظ.*نتيج|save.*view)/i;

export const navigateAction=(label:string,href:string):AssistantAction=>({id:randomUUID(),type:'navigate',label,href,requiresConfirmation:false});

function dashboardAction(message:string,collectionId?:string):AssistantAction{return{id:randomUUID(),type:'create_dashboard',label:'إنشاء Dashboard من النتيجة',requiresConfirmation:true,payload:{name:'ORBIT Generated Dashboard',collectionId:collectionId||null,request:message}}}
function automationAction(message:string,collectionId?:string):AssistantAction{return{id:randomUUID(),type:'create_automation',label:'إنشاء الأتمتة المقترحة',requiresConfirmation:true,payload:{name:`ORBIT: ${message.slice(0,70)}`,collectionId:collectionId||null,request:message}}}
function viewAction(message:string,collectionId:string):AssistantAction{return{id:randomUUID(),type:'create_view',label:'حفظ النتيجة كـ View',requiresConfirmation:true,payload:{name:'ORBIT Generated View',collectionId,request:message}}}

export function requestedMutationActions(input:{intent:AssistantIntent;message:string;collectionId?:string}){
 const {intent,message,collectionId}=input;const explicit=wantsCreate.test(message);const steps:AssistantAction[]=[];
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
