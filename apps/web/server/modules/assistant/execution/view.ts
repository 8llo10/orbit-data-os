import {db} from '@orbit/db';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {payloadString} from './types';

export async function executeViewAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
  const {action,workspaceId,userId,role}=context;
  if(!can(role,'data:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إنشاء View.');
  const collectionId=payloadString(action,'collectionId');
  const collection=await db.collection.findFirst({where:{id:collectionId,workspaceId},select:{id:true,name:true}});
  if(!collection)throw new AppError('SOURCE_NOT_FOUND',404,'ما لقيت مجموعة البيانات المطلوبة.');
  const request=payloadString(action,'request');
  const name=(payloadString(action,'name')||'ORBIT Generated View').slice(0,120);
  const view=await db.savedView.create({data:{collectionId,name,type:'TABLE',config:{source:'assistant',request}}});
  await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_VIEW_CREATED',entityType:'SavedView',entityId:view.id,metadata:{assistantActionId:action.id,collectionId}}});
  return {ok:true,message:`تم إنشاء View داخل «${collection.name}».`,href:`/dashboard/collections/${collection.id}?view=${view.id}`,entityId:view.id};
}
