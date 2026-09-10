import {db} from '@orbit/db';
import {likelyGroupField,likelyNumericField,resolveCollection,resolveFields} from './semantic';
import type {Evidence,SourceRef,WorkspaceSnapshot} from './types';

const truthy=(v:unknown)=>v===true||['true','1','yes','breached','critical','حرج'].includes(String(v??'').trim().toLowerCase());
const num=(v:unknown)=>{const n=typeof v==='number'?v:Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:null};
const display=(v:unknown)=>v===null||v===undefined||v===''?'(فارغ)':String(v);

type DynamicRecord=Record<string,unknown>&{id:string};
export type DataAnalysis={answer:string;evidence:Evidence[];sources:SourceRef[];collectionId?:string;hasSource:boolean};

export async function analyzeQuestion(message:string,s:WorkspaceSnapshot):Promise<DataAnalysis>{
 const c=resolveCollection(message,s);
 if(!c)return {answer:'ما لقيت مصدر داخل الملفات الحالية يثبت إجابة لهذا الطلب. إذا كنت تقصد ملفًا معيّنًا اذكر اسمه أو اسم أحد أعمدته، وأنا أبحث فيه مباشرة.',evidence:[],sources:[],hasSource:false};
 const rows=await db.dataRecord.findMany({where:{collectionId:c.id},select:{id:true,data:true},take:20000});
 const records:DynamicRecord[]=rows.map(r=>({id:r.id,...((r.data&&typeof r.data==='object'&&!Array.isArray(r.data)?r.data:{}) as Record<string,unknown>)}));
 const fields=resolveFields(message,c,8);const sourceBase=(usedFields:string[]):SourceRef=>({collectionId:c.id,collectionName:c.name,fields:usedFields,examinedRows:records.length,totalRows:c.recordCount,href:`/dashboard/collections/${c.id}`});
 const q=message.toLowerCase();

 if(/sla|breach|تجاوز|متأخر|متاخر/.test(q)){
  const sla=c.fields.find(f=>/sla.*breach|breach.*sla/i.test(f.key));const group=likelyGroupField(message,c)||c.fields.find(f=>/location|site|city|branch/i.test(f.key));
  if(sla&&group){const map=new Map<string,number>();for(const r of records)if(truthy(r[sla.key])){const k=display(r[group.key]);map.set(k,(map.get(k)||0)+1)}const top=[...map].sort((a,b)=>b[1]-a[1]).slice(0,10);const src=sourceBase([sla.key,group.key]);return {hasSource:true,collectionId:c.id,sources:[src],answer:top.length?`حسب ملف «${c.name}»، أعلى ${group.label||group.key} في تجاوزات SLA هو «${top[0][0]}» بعدد ${top[0][1]} حالة. فحصت ${records.length.toLocaleString('ar-SA')} سجل فعليًا.`:`لقيت أعمدة SLA في «${c.name}»، لكن ما لقيت حالات breach مثبتة في السجلات المفحوصة.`,evidence:top.map(([k,v])=>({kind:'metric',label:k,value:`${v} تجاوز`,source:src}))};}
 }

 if(/جود|quality|ناقص|missing|مكرر|duplicate|شاذ|anomal/.test(q)){
  const ev:Evidence[]=[];const used:string[]=[];for(const f of c.fields){let missing=0;const seen=new Set<string>();let dup=0;for(const r of records){const v=r[f.key];if(v===null||v===undefined||String(v).trim()==='')missing++;else if(/id|email|serial|code/i.test(f.key)){const k=String(v).trim().toLowerCase();if(seen.has(k))dup++;seen.add(k)}}if(missing||dup){used.push(f.key);ev.push({kind:'warning',label:f.label||f.key,value:`مفقود ${missing} · تكرار مشتبه ${dup}`})}}
  const src=sourceBase(used.length?used:c.fields.slice(0,5).map(f=>f.key));return {hasSource:true,collectionId:c.id,sources:[src],answer:ev.length?`لقيت ${ev.length} أعمدة فيها مؤشرات جودة تستحق المراجعة داخل «${c.name}». الحساب مبني على ${records.length.toLocaleString('ar-SA')} سجل، مو على عينة.`:`فحصت ${records.length.toLocaleString('ar-SA')} سجل في «${c.name}» وما لقيت missing/duplicate indicators واضحة بالقواعد الحالية.`,evidence:ev.slice(0,12).map(e=>({...e,source:src}))};
 }

 const numeric=likelyNumericField(message,c);const group=likelyGroupField(message,c);
 if(numeric&&(/أعلى|اعلى|أكثر|اكثر|top|highest|قارن|compare|تكلف|cost|حرار|temp|latency|تأخير|تاخير/.test(q))){
  if(group&&group.key!==numeric.key){const agg=new Map<string,{sum:number,count:number,max:number}>();for(const r of records){const n=num(r[numeric.key]);if(n===null)continue;const k=display(r[group.key]);const x=agg.get(k)||{sum:0,count:0,max:-Infinity};x.sum+=n;x.count++;x.max=Math.max(x.max,n);agg.set(k,x)}const useAvg=/متوسط|average|avg/.test(q);const ranked=[...agg].map(([k,v])=>[k,useAvg?v.sum/v.count:/أعلى|اعلى|max|حرار|temp|latency/.test(q)?v.max:v.sum] as [string,number]).sort((a,b)=>b[1]-a[1]).slice(0,10);const src=sourceBase([group.key,numeric.key]);return {hasSource:true,collectionId:c.id,sources:[src],answer:ranked.length?`حللت «${numeric.label||numeric.key}» حسب «${group.label||group.key}» داخل «${c.name}». الأعلى هو «${ranked[0][0]}» بقيمة ${ranked[0][1].toLocaleString('ar-SA',{maximumFractionDigits:2})}.`:'لقيت الأعمدة المطلوبة لكن ما لقيت قيم رقمية صالحة للحساب.',evidence:ranked.map(([k,v])=>({kind:'metric',label:k,value:v.toLocaleString('ar-SA',{maximumFractionDigits:2}),source:src}))};}
  const idField=c.fields.find(f=>/asset.*id|device.*id|employee.*id|vendor.*id|maintenance.*id|work.*order.*id/i.test(f.key));const ranked=records.map(r=>({id:r.id,value:num(r[numeric.key]),label:display(idField?r[idField.key]:r.id)})).filter(x=>x.value!==null).sort((a,b)=>(b.value as number)-(a.value as number)).slice(0,10);const src=sourceBase([numeric.key,...(idField?[idField.key]:[])]);return {hasSource:true,collectionId:c.id,sources:[src],answer:ranked.length?`أعلى قيمة في «${numeric.label||numeric.key}» داخل «${c.name}» هي ${Number(ranked[0].value).toLocaleString('ar-SA',{maximumFractionDigits:2})} للسجل «${ranked[0].label}».`:'ما لقيت قيم رقمية قابلة للتحليل في الحقل المطلوب.',evidence:ranked.map(x=>({kind:'metric',label:x.label,value:Number(x.value).toLocaleString('ar-SA',{maximumFractionDigits:2}),source:src}))};
 }

 const used=fields.length?fields:c.fields.slice(0,6);const src=sourceBase(used.map(f=>f.key));return {hasSource:true,collectionId:c.id,sources:[src],answer:`لقيت مصدر مناسب في «${c.name}» وفحصت ${records.length.toLocaleString('ar-SA')} من أصل ${c.recordCount.toLocaleString('ar-SA')} سجل. الأعمدة الأقرب لسؤالك: ${used.map(f=>`«${f.label||f.key}»`).join('، ')}. ما عندي قاعدة حساب أكثر تحديدًا لهذا السؤال بدون افتراض؛ لذلك ما راح أخترع نتيجة.`,evidence:used.slice(0,8).map(f=>({kind:'field',label:f.label||f.key,value:f.type,source:src}))};
}
