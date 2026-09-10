import {activeMembership} from '@/lib/auth';
import {AppError,errorResponse} from '@/server/core/errors';
import {executeAssistantAction} from '@/server/modules/assistant/action-executor';
import type {AssistantAction} from '@/server/modules/assistant/types';

export async function POST(req:Request){
 try{
  const membership=await activeMembership();if(!membership)throw new AppError('NO_WORKSPACE',404,'ما لقينا مساحة عمل مرتبطة بالحساب.');
  const body=await req.json().catch(()=>null) as {confirmed?:boolean;action?:AssistantAction}|null;
  if(body?.confirmed!==true)throw new AppError('CONFIRMATION_REQUIRED',409,'لازم تأكيد واضح قبل تنفيذ الإجراء.');
  if(!body.action||typeof body.action.id!=='string'||typeof body.action.type!=='string')throw new AppError('INVALID_ACTION',400,'بيانات الإجراء غير صالحة.');
  const result=await executeAssistantAction({action:body.action,workspaceId:membership.workspaceId,userId:membership.userId,role:membership.role});
  return Response.json(result);
 }catch(error){return errorResponse(error)}
}
