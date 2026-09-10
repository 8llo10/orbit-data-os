import {db} from '@orbit/db';
import type {AssistantResult,ChatTurn} from './types';

export async function getOrCreateConversation(input:{conversationId?:string;workspaceId:string;userId:string;firstMessage:string}){
  if(input.conversationId){
    const existing=await db.assistantConversation.findFirst({where:{id:input.conversationId,workspaceId:input.workspaceId,userId:input.userId},select:{id:true}});
    if(existing)return existing.id;
  }
  const conversation=await db.assistantConversation.create({data:{workspaceId:input.workspaceId,userId:input.userId,title:makeTitle(input.firstMessage)}});
  return conversation.id;
}

export async function loadConversationHistory(conversationId:string,workspaceId:string,userId:string,limit=12):Promise<ChatTurn[]>{
  const conversation=await db.assistantConversation.findFirst({where:{id:conversationId,workspaceId,userId},select:{id:true}});
  if(!conversation)return [];
  const messages=await db.assistantMessage.findMany({where:{conversationId},orderBy:{createdAt:'desc'},take:limit,select:{role:true,content:true}});
  return messages.reverse().flatMap(m=>m.role==='user'||m.role==='assistant'?[{role:m.role,content:m.content} as ChatTurn]:[]);
}

export async function appendUserMessage(conversationId:string,content:string){
  return db.assistantMessage.create({data:{conversationId,role:'user',content},select:{id:true}});
}

export async function appendAssistantMessage(conversationId:string,result:AssistantResult){
  return db.assistantMessage.create({
    data:{conversationId,role:'assistant',content:result.answer,metadata:{requestId:result.requestId,intent:result.intent,confidence:result.confidence,mode:result.mode,sources:result.sources,evidence:result.evidence.map(e=>({kind:e.kind,label:e.label,value:e.value}))}},
    select:{id:true}
  });
}

export async function saveAssistantFeedback(input:{workspaceId:string;userId:string;messageId:string;rating:1|-1;reason?:string}){
  const message=await db.assistantMessage.findFirst({where:{id:input.messageId,conversation:{workspaceId:input.workspaceId,userId:input.userId}},select:{id:true}});
  if(!message)return null;
  return db.assistantFeedback.upsert({
    where:{userId_messageId:{userId:input.userId,messageId:input.messageId}},
    create:{workspaceId:input.workspaceId,userId:input.userId,messageId:input.messageId,rating:input.rating,reason:input.reason?.slice(0,500)},
    update:{rating:input.rating,reason:input.reason?.slice(0,500)}
  });
}

function makeTitle(message:string){const title=message.replace(/\s+/g,' ').trim();return title.length>72?`${title.slice(0,69)}...`:title||'ORBIT conversation';}
