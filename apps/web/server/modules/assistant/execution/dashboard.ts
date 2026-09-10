import {db} from '@orbit/db';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {payloadString} from './types';

export async function executeDashboardAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
  const {action,workspaceId,userId,role}=context;
  if(!can(role,'dashboard:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إنشاء Dashboard.');
  const request=payloadString(action,'request');
  const name=(payloadString(action,'name')||'ORBIT Generated Dashboard').slice(0,120);
  const dashboard=await db.dashboard.create({data:{workspaceId,name,layout:['stats','collections']}});
  await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_DASHBOARD_CREATED',entityType:'Dashboard',entityId:dashboard.id,metadata:{assistantActionId:action.id,request}}});
  return {ok:true,message:`تم إنشاء Dashboard «${dashboard.name}».`,href:'/dashboard/builder',entityId:dashboard.id};
}
