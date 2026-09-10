import {assistantConfig,providerConfigured} from './config';
import {buildSystemPrompt} from './prompt';
import type {AssistantIntent,ChatTurn,ModelAssistantPlan,WorkspaceSnapshot} from './types';

type ProviderMessage={role:'system'|'user'|'assistant';content:string};

export async function askProvider(input:{message:string;intent:AssistantIntent;snapshot:WorkspaceSnapshot;groundTruth:string;history:ChatTurn[]}){
  if(!providerConfigured())return null;
  const system=buildSystemPrompt({intent:input.intent,snapshot:input.snapshot,groundedResult:input.groundTruth,history:input.history});
  const messages:ProviderMessage[]=[
    {role:'system',content:system},
    ...input.history.slice(-assistantConfig.maxHistoryTurns),
    {role:'user',content:input.message}
  ];
  return callProvider(messages,assistantConfig.providerMaxTokens);
}

export async function planWithProvider(input:{message:string;snapshot:WorkspaceSnapshot;history:ChatTurn[]}):Promise<ModelAssistantPlan|null>{
  if(!providerConfigured())return null;
  const schema=input.snapshot.collections.slice(0,assistantConfig.maxProviderContextCollections).map(c=>({name:c.name,slug:c.slug,fields:c.fields.map(f=>({key:f.key,label:f.label,type:f.type}))}));
  const system=[
    'You are the planning layer for ORBIT Copilot.',
    'Return ONLY one JSON object. Do not answer the user.',
    'Choose a structured query only when the user asks for a calculation/filter/ranking that can be answered from ONE collection.',
    'Never invent collection or field names. Use exact names/keys from WORKSPACE_SCHEMA.',
    'For multi-file joins, leave query=null; another deterministic relational engine handles saved relationships.',
    'Valid metric ops: count,sum,avg,min,max,countDistinct.',
    'Valid filter ops: eq,neq,contains,gt,gte,lt,lte,isEmpty,notEmpty.',
    'Use metric as the primary sort/answer metric. If the user asks for additional measures in the same grouping, put up to 4 extra measures in metrics.',
    'Shape: {"intent":"ANALYSIS","needsData":true,"query":{"collection":"exact collection name","filters":[],"groupBy":"exact field key or omitted","metric":{"op":"sum","field":"exact field key","label":"optional human label"},"metrics":[{"op":"count","label":"optional"}],"order":"desc","limit":10},"rationale":"short"}',
    `WORKSPACE_SCHEMA=${JSON.stringify(schema)}`,
    `RECENT_HISTORY=${JSON.stringify(input.history.slice(-8))}`
  ].join('\n');
  const raw=await callProvider([{role:'system',content:system},{role:'user',content:input.message}],700);
  if(!raw)return null;
  const json=extractJson(raw);if(!json)return null;
  try{return JSON.parse(json) as ModelAssistantPlan}catch{return null}
}

async function callProvider(messages:ProviderMessage[],maxTokens:number){
  const {AI_API_URL:url,AI_API_KEY:key,AI_MODEL:model}=process.env;
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),assistantConfig.providerTimeoutMs);
  try{
    const response=await fetch(url!,{
      method:'POST',signal:controller.signal,
      headers:{'content-type':'application/json',authorization:`Bearer ${key}`},
      body:JSON.stringify({model,temperature:assistantConfig.providerTemperature,max_tokens:maxTokens,messages})
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

function extractJson(text:string){const start=text.indexOf('{');const end=text.lastIndexOf('}');return start>=0&&end>start?text.slice(start,end+1):null;}
