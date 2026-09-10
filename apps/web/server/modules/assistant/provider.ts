import {assistantConfig,providerConfigured} from './config';
import {buildSystemPrompt} from './prompt';
import type {AssistantIntent,ChatTurn,WorkspaceSnapshot} from './types';

export async function askProvider(input:{message:string;intent:AssistantIntent;snapshot:WorkspaceSnapshot;groundTruth:string;history:ChatTurn[]}){
  if(!providerConfigured())return null;
  const {AI_API_URL:url,AI_API_KEY:key,AI_MODEL:model}=process.env;
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),assistantConfig.providerTimeoutMs);
  try{
    const system=buildSystemPrompt({intent:input.intent,snapshot:input.snapshot,groundedResult:input.groundTruth,history:input.history});
    const messages=[
      {role:'system',content:system},
      ...input.history.slice(-assistantConfig.maxHistoryTurns).map(x=>({role:x.role,content:x.content})),
      {role:'user',content:input.message}
    ];
    const response=await fetch(url!,{
      method:'POST',signal:controller.signal,
      headers:{'content-type':'application/json',authorization:`Bearer ${key}`},
      body:JSON.stringify({model,temperature:assistantConfig.providerTemperature,max_tokens:assistantConfig.providerMaxTokens,messages})
    });
    if(!response.ok){console.error('[ORBIT AI provider]',response.status,await response.text().catch(()=>''));return null;}
    const data=await response.json() as {choices?:Array<{message?:{content?:unknown}}>};
    const content=data.choices?.[0]?.message?.content;
    return typeof content==='string'&&content.trim()?content.trim():null;
  }catch(error){
    if(error instanceof Error&&error.name!=='AbortError')console.error('[ORBIT AI provider]',error);
    return null;
  }finally{clearTimeout(timeout)}
}
