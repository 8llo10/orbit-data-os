import {NextResponse} from 'next/server';
import {activeMembership} from '@/lib/auth';
import {AppError,errorResponse} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import {assistantRuntimeStatus} from '@/server/modules/assistant/runtime-status';

export async function GET(){
 try{
  const membership=await activeMembership();
  if(!membership)throw new AppError('NO_WORKSPACE',404,'ما لقينا مساحة عمل مرتبطة بالحساب.');
  if(!can(membership.role,'assistant:use'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية لاستخدام ORBIT Copilot.');
  return NextResponse.json(assistantRuntimeStatus());
 }catch(error){return errorResponse(error)}
}
