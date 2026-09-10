import {db} from '@orbit/db';
import type {WorkspaceRole} from '@prisma/client';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import type {AssistantAction} from './types';

export async function executeAssistantAction(input:{action:AssistantAction;workspaceId:string;userId:string;role:WorkspaceRole}){
 const {action,workspaceId,userId,role}=input;
 if(!action.requiresConfirmation)throw new AppError('ACTION_NOT_EXECUTABLE',400,'هذا الإجراء لا يحتاج تنفيذ من الخادم.');
 if(action.type==='create_dashboard'){
  if(!can(role,'dashboard:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إنشاء Dashboard.');
  const name=typeof action.payload?.name==='string'?action.payload.name.slice(0,120):'ORBIT Generated Dashboard';
  const dashboard=await db.dashboard.create({data:{workspaceId,name,layout:['stats','collections']}});
  await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_DASHBOARD_CREATED',entityType:'Dashboard',entityId:dashboard.id,metadata:{assistantActionId:action.id,request:action.payload?.request??null}}});
  return {ok:true,message:`تم إنشاء Dashboard «${dashboard.name}».`,href:'/dashboard/builder',entityId:dashboard.id};
 }
 if(action.type==='create_automation'){
  if(!can(role,'automation:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إنشاء Automation.');
  const name=typeof action.payload?.name==='string'?action.payload.name.slice(0,120):'ORBIT Generated Automation';
  const rule=await db.automationRule.create({data:{workspaceId,name,status:'PAUSED',trigger:{type:'ASSISTANT_PROPOSAL'},conditions:[],actions:[{type:'REVIEW_REQUIRED',request:action.payload?.request??''}]}});
  await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_AUTOMATION_CREATED',entityType:'AutomationRule',entityId:rule.id,metadata:{assistantActionId:action.id,status:'PAUSED_FOR_REVIEW'}}});
  return {ok:true,message:`أنشأت Automation «${rule.name}» بحالة Paused عشان تراجعينها قبل التشغيل.`,href:'/dashboard/automations',entityId:rule.id};
 }
 if(action.type==='create_view'){
  if(!can(role,'data:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إنشاء View.');
  const collectionId=typeof action.payload?.collectionId==='string'?action.payload.collectionId:'';
  const collection=await db.collection.findFirst({where:{id:collectionId,workspaceId}});if(!collection)throw new AppError('SOURCE_NOT_FOUND',404,'ما لقيت مجموعة البيانات المطلوبة.');
  const view=await db.savedView.create({data:{collectionId,name:typeof action.payload?.name==='string'?action.payload.name.slice(0,120):'ORBIT Generated View',type:'TABLE',config:{source:'assistant',request:action.payload?.request??''}}});
  await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_VIEW_CREATED',entityType:'SavedView',entityId:view.id,metadata:{assistantActionId:action.id}}});
  return {ok:true,message:`تم إنشاء View داخل «${collection.name}».`,href:'/dashboard/collections',entityId:view.id};
 }
 throw new AppError('UNSUPPORTED_ACTION',400,'الإجراء المطلوب غير مدعوم للتنفيذ.');
}
