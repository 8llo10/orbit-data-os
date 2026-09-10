import {activeMembership} from '@/lib/auth';
import {AppError,errorResponse} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import {saveAssistantFeedback} from '@/server/modules/assistant/conversation-store';

export async function POST(req:Request){
  try{
    const membership=await activeMembership();
    if(!membership)throw new AppError('NO_WORKSPACE',404,'ما لقينا مساحة عمل مرتبطة بالحساب.');
    if(!can(membership.role,'assistant:use'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية لاستخدام ORBIT Copilot.');
    const body=await req.json().catch(()=>null) as {messageId?:unknown;rating?:unknown;reason?:unknown}|null;
    const messageId=typeof body?.messageId==='string'?body.messageId:'';
    const rating=body?.rating===1?1:body?.rating===-1?-1:null;
    if(!messageId||rating===null)throw new AppError('INVALID_FEEDBACK',400,'بيانات التقييم غير صالحة.');
    const saved=await saveAssistantFeedback({workspaceId:membership.workspaceId,userId:membership.userId,messageId,rating,reason:typeof body?.reason==='string'?body.reason:undefined});
    if(!saved)throw new AppError('MESSAGE_NOT_FOUND',404,'ما لقينا رسالة ORBIT المطلوبة.');
    return Response.json({ok:true});
  }catch(error){return errorResponse(error)}
}
