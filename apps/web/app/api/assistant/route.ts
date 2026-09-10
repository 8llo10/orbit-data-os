import {NextResponse} from 'next/server';
import {activeMembership} from '@/lib/auth';
import {AppError,errorResponse} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import {assistantConfig} from '@/server/modules/assistant/config';
import {loadWorkspaceSnapshot} from '@/server/modules/assistant/repository';
import {runAssistant} from '@/server/modules/assistant/service';
import type {ChatTurn} from '@/server/modules/assistant/types';

type Body={message?:unknown;history?:unknown};

export async function POST(req:Request){
  try{
    const membership=await activeMembership();
    if(!membership)throw new AppError('NO_WORKSPACE',404,'ما لقينا مساحة عمل مرتبطة بالحساب.');
    if(!can(membership.role,'assistant:use'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية لاستخدام ORBIT Copilot.');

    const body=await req.json().catch(()=>null) as Body|null;
    const message=typeof body?.message==='string'?body.message.trim():'';
    if(!message)throw new AppError('INVALID_MESSAGE',400,'اكتب سؤالك أولًا.');
    if(message.length>assistantConfig.maxMessageChars)throw new AppError('MESSAGE_TOO_LONG',400,`الرسالة طويلة جدًا. الحد ${assistantConfig.maxMessageChars} حرف.`);

    const history:ChatTurn[]=Array.isArray(body?.history)?body.history
      .filter((x):x is {role:'user'|'assistant';content:string}=>Boolean(x&&typeof x==='object'&&(((x as {role?:unknown}).role==='user')||((x as {role?:unknown}).role==='assistant'))&&typeof (x as {content?:unknown}).content==='string'))
      .slice(-assistantConfig.maxHistoryTurns)
      .map(x=>({role:x.role,content:x.content.slice(0,1800)})):[];

    const snapshot=await loadWorkspaceSnapshot(membership.workspaceId,membership.role);
    const result=await runAssistant(message,snapshot,history);
    return NextResponse.json(result);
  }catch(error){return errorResponse(error)}
}
