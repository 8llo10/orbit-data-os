import {assistantConfig,providerConfigured} from './config';

export type ProviderStatus={
 configured:boolean;
 mode:'ai-orchestrated'|'deterministic';
 model:string|null;
 endpoint:string|null;
 timeoutMs:number;
 capabilities:string[];
 missing:string[];
};

function safeEndpoint(raw?:string){
 if(!raw)return null;
 try{const url=new URL(raw);return `${url.protocol}//${url.host}${url.pathname}`;}catch{return 'configured';}
}

export function getProviderStatus():ProviderStatus{
 const missing:string[]=[];
 if(!process.env.AI_API_URL)missing.push('AI_API_URL');
 if(!process.env.AI_API_KEY)missing.push('AI_API_KEY');
 if(!process.env.AI_MODEL)missing.push('AI_MODEL');
 const configured=providerConfigured();
 return {
  configured,
  mode:configured?'ai-orchestrated':'deterministic',
  model:process.env.AI_MODEL||null,
  endpoint:safeEndpoint(process.env.AI_API_URL),
  timeoutMs:assistantConfig.providerTimeoutMs,
  capabilities:configured?['conversation','structured-planning','grounded-explanation','deterministic-execution']:['deterministic-analysis','grounded-sources','deterministic-execution'],
  missing
 };
}
