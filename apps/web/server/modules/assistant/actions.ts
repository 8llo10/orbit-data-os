import {randomUUID} from 'crypto';
import type {AssistantAction,AssistantIntent} from './types';

export const navigateAction=(label:string,href:string):AssistantAction=>({
  id:randomUUID(),type:'navigate',label,href,requiresConfirmation:false
});

export function mutationActions(input:{intent:AssistantIntent;message:string;collectionId?:string}){
  const {intent,message,collectionId}=input;
  const actions:AssistantAction[]=[];
  if(intent==='AUTOMATION')actions.push({id:randomUUID(),type:'create_automation',label:'إنشاء الأتمتة المقترحة',requiresConfirmation:true,payload:{name:`ORBIT: ${message.slice(0,70)}`,collectionId:collectionId||null,request:message}});
  if(intent==='DASHBOARD'||intent==='ANALYSIS'||intent==='RANKING')actions.push({id:randomUUID(),type:'create_dashboard',label:'إنشاء Dashboard من النتيجة',requiresConfirmation:true,payload:{name:'ORBIT Generated Dashboard',collectionId:collectionId||null,request:message}});
  if(intent==='SEARCH'&&collectionId)actions.push({id:randomUUID(),type:'create_view',label:'حفظ النتيجة كـ View',requiresConfirmation:true,payload:{name:'ORBIT Generated View',collectionId,request:message}});
  return actions;
}
