import {db} from '@orbit/db';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {payloadString} from './types';

export async function executeAutomationAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
  const {action,workspaceId,userId,role}=context;
  if(!can(role,'automation:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إنشاء Automation.');
  const request=payloadString(action,'request');
  const name=(payloadString(action,'name')||'ORBIT Generated Automation').slice(0,120);
  const rule=await db.automationRule.create({data:{workspaceId,name,status:'PAUSED',trigger:{type:'ASSISTANT_PROPOSAL'},conditions:[],actions:[{type:'REVIEW_REQUIRED',request}]}});
  await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_AUTOMATION_CREATED',entityType:'AutomationRule',entityId:rule.id,metadata:{assistantActionId:action.id,status:'PAUSED_FOR_REVIEW',request}}});
  return {ok:true,message:`أنشأت Automation «${rule.name}» بحالة Paused عشان تراجعينها قبل التشغيل.`,href:'/dashboard/automations',entityId:rule.id};
}
