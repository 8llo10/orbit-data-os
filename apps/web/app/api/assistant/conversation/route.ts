import {activeMembership} from '@/lib/auth';
import {AppError,errorResponse} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import {db} from '@orbit/db';

export async function GET(req:Request){
  try{
    const membership=await activeMembership();
    if(!membership)throw new AppError('NO_WORKSPACE',404,'ما لقينا مساحة عمل مرتبطة بالحساب.');
    if(!can(membership.role,'assistant:use'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية لاستخدام ORBIT Copilot.');
    const id=new URL(req.url).searchParams.get('id')||'';
    if(!id)throw new AppError('INVALID_CONVERSATION',400,'معرف المحادثة مطلوب.');
    const conversation=await db.assistantConversation.findFirst({
      where:{id,workspaceId:membership.workspaceId,userId:membership.userId},
      select:{id:true,title:true,messages:{orderBy:{createdAt:'asc'},take:100,select:{id:true,role:true,content:true,metadata:true,createdAt:true}}}
    });
    if(!conversation)throw new AppError('CONVERSATION_NOT_FOUND',404,'المحادثة غير موجودة.');
    return Response.json({id:conversation.id,title:conversation.title,messages:conversation.messages});
  }catch(error){return errorResponse(error)}
}
