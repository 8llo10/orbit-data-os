import {db} from '@orbit/db';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import {inferAutomationRule} from '../automation-plan';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {payloadString} from './types';

export async function executeAutomationAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
 const {action,workspaceId,userId,role}=context;
 if(!can(role,'automation:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إنشاء Automation.');
 const request=payloadString(action,'request');const name=(payloadString(action,'name')||'ORBIT Generated Automation').slice(0,120);const collectionId=payloadString(action,'collectionId')||null;
 if(collectionId){const exists=await db.collection.findFirst({where:{id:collectionId,workspaceId},select:{id:true}});if(!exists)throw new AppError('SOURCE_NOT_FOUND',404,'مصدر الأتمتة غير موجود داخل مساحة العمل.');}
 const parsed=inferAutomationRule(request,collectionId);
 const rule=await db.automationRule.create({data:{workspaceId,name,status:'PAUSED',trigger:parsed.trigger,conditions:[],actions:[...parsed.actions]}});
 await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_AUTOMATION_CREATED',entityType:'AutomationRule',entityId:rule.id,metadata:{assistantActionId:action.id,status:'PAUSED_FOR_REVIEW',request,executable:parsed.executable,trigger:parsed.trigger,actions:parsed.actions}}});
 const detail=parsed.executable?'ترجمت طلبك إلى Trigger وAction مدعومين فعليًا.':'حفظت الطلب للمراجعة لأن جزء منه ما له منفذ فعلي آمن للحين.';
 return {ok:true,message:`أنشأت Automation «${rule.name}» بحالة Paused. ${detail}`,href:'/dashboard/automations',entityId:rule.id};
}
