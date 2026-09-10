import {db} from '@orbit/db';
import {likelyGroupField,likelyNumericField} from './semantic';
import type {DataAnalysis} from './analytics';
import type {CollectionSnapshot,SourceRef,WorkspaceSnapshot} from './types';

type DynamicRecord=Record<string,unknown>&{id:string};
type JoinedRow=Record<string,DynamicRecord>;
type Relation={id:string;name:string;fromCollectionId:string;toCollectionId:string;fromFieldKey:string;toFieldKey:string};
const norm=(v:unknown)=>String(v??'').trim().toLowerCase();
const numberValue=(v:unknown)=>{const n=typeof v==='number'?v:Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:null};

export async function analyzeAcrossRelations(message:string,s:WorkspaceSnapshot):Promise<DataAnalysis|null>{
 const joinRequested=/(اربط|join|connect|relationship|علاق|مع بعض|بين الملفات)/i.test(message);
 const mentioned=s.collections.filter(c=>message.toLowerCase().includes(c.name.toLowerCase())||message.toLowerCase().includes(c.slug.toLowerCase()));
 if(!joinRequested&&mentioned.length<2)return null;
 const relations=await db.collectionRelation.findMany({where:{fromCollection:{workspaceId:s.id}},select:{id:true,name:true,fromCollectionId:true,toCollectionId:true,fromFieldKey:true,toFieldKey:true}});
 if(!relations.length)return {answer:'طلبك يحتاج ربط أكثر من ملف، لكن ما لقيت علاقات محفوظة أقدر أعتمد عليها. ما راح أفترض الربط من تشابه أسماء الأعمدة فقط.',evidence:[],sources:[],hasSource:false};
 const preferred=new Set(mentioned.map(c=>c.id));
 const chain=buildConnectedChain(relations,preferred.size?preferred:null,4);
 if(!chain.length)return {answer:'لقيت علاقات في مساحة العمل، لكن ما لقيت مسار محفوظ يربط المصادر اللي طلبتها تحديدًا.',evidence:[],sources:[],hasSource:false};
 const covered=new Set(chain.flatMap(r=>[r.fromCollectionId,r.toCollectionId]));
 if(preferred.size>1&&[...preferred].some(id=>!covered.has(id)))return {answer:'فيه علاقات محفوظة، لكن ما قدرت أوصل كل الملفات اللي ذكرتيها بمسار علاقة واحد وآمن.',evidence:[],sources:[],hasSource:false};
 const collectionIds=Array.from(covered);const collections=collectionIds.map(id=>s.collections.find(c=>c.id===id)).filter((c):c is CollectionSnapshot=>Boolean(c));if(collections.length<2)return null;
 const recordSets=new Map<string,DynamicRecord[]>();
 await Promise.all(collections.map(async c=>{const rows=await db.dataRecord.findMany({where:{collectionId:c.id},select:{id:true,data:true},take:10000});recordSets.set(c.id,rows.map(r=>({id:r.id,...((r.data&&typeof r.data==='object'&&!Array.isArray(r.data)?r.data:{}) as Record<string,unknown>)})))}));
 const first=chain[0];const seed=recordSets.get(first.fromCollectionId)||[];let joined:JoinedRow[]=seed.map(row=>({[first.fromCollectionId]:row}));
 for(const relation of chain){joined=joinRelation(joined,relation,recordSets);if(joined.length>50000)joined=joined.slice(0,50000)}
 const sources:SourceRef[]=collections.map(c=>({collectionId:c.id,collectionName:c.name,fields:fieldsUsedFor(c,chain),examinedRows:recordSets.get(c.id)?.length||0,totalRows:c.recordCount,href:`/dashboard/collections/${c.id}`}));
 const numericChoice=collections.map(c=>({c,field:likelyNumericField(message,c)})).find(x=>x.field);const groupChoice=collections.map(c=>({c,field:likelyGroupField(message,c)})).find(x=>x.field&&x.field.key!==numericChoice?.field?.key);
 if(numericChoice?.field&&groupChoice?.field&&/(اعلى|أعلى|اكثر|أكثر|top|highest|قارن|compare|تكلف|cost|متوسط|average|sum|مجموع)/i.test(message)){
  const aggregate=new Map<string,{sum:number;count:number;max:number}>();for(const tuple of joined){const n=numberValue(tuple[numericChoice.c.id]?.[numericChoice.field.key]);if(n===null)continue;const g=String(tuple[groupChoice.c.id]?.[groupChoice.field.key]??'(فارغ)');const value=aggregate.get(g)||{sum:0,count:0,max:-Infinity};value.sum+=n;value.count++;value.max=Math.max(value.max,n);aggregate.set(g,value)}
  const average=/(متوسط|average|avg)/i.test(message),maxMode=/(اعلى|أعلى|highest|max)/i.test(message);const ranking=[...aggregate].map(([label,v])=>({label,value:average?v.sum/v.count:maxMode?v.max:v.sum})).sort((a,b)=>b.value-a.value).slice(0,10);
  return {hasSource:true,sources,collectionId:numericChoice.c.id,answer:ranking.length?`ربطت ${collections.map(c=>`«${c.name}»`).join(' + ')} عبر العلاقات المحفوظة، ووجدت ${joined.length.toLocaleString('ar-SA')} صف مترابط. الأعلى حسب «${groupChoice.field.label||groupChoice.field.key}» هو «${ranking[0].label}» بقيمة ${ranking[0].value.toLocaleString('ar-SA',{maximumFractionDigits:2})}.`:'ربطت المصادر بنجاح، لكن ما لقيت قيم رقمية صالحة للحساب المطلوب.',evidence:ranking.map(x=>({kind:'metric',label:x.label,value:x.value.toLocaleString('ar-SA',{maximumFractionDigits:2})}))};
 }
 return {hasSource:true,sources,collectionId:collections[0].id,answer:`ربطت ${collections.map(c=>`«${c.name}»`).join(' + ')} عبر ${chain.length} علاقات محفوظة، ووجدت ${joined.length.toLocaleString('ar-SA')} صف مترابط.`,evidence:chain.map(r=>({kind:'field',label:'علاقة مستخدمة',value:`${nameOf(s,r.fromCollectionId)}.${r.fromFieldKey} ↔ ${nameOf(s,r.toCollectionId)}.${r.toFieldKey}`}))};
}

function joinRelation(current:JoinedRow[],r:Relation,sets:Map<string,DynamicRecord[]>){const currentHasFrom=current.some(x=>Boolean(x[r.fromCollectionId])),currentHasTo=current.some(x=>Boolean(x[r.toCollectionId]));if(currentHasFrom&&!currentHasTo){const index=indexRows(sets.get(r.toCollectionId)||[],r.toFieldKey);return current.flatMap(tuple=>(index.get(norm(tuple[r.fromCollectionId]?.[r.fromFieldKey]))||[]).map(row=>({...tuple,[r.toCollectionId]:row})))}if(currentHasTo&&!currentHasFrom){const index=indexRows(sets.get(r.fromCollectionId)||[],r.fromFieldKey);return current.flatMap(tuple=>(index.get(norm(tuple[r.toCollectionId]?.[r.toFieldKey]))||[]).map(row=>({...tuple,[r.fromCollectionId]:row})))}return current}
function indexRows(rows:DynamicRecord[],key:string){const map=new Map<string,DynamicRecord[]>();for(const row of rows){const value=norm(row[key]);if(!value)continue;const bucket=map.get(value);if(bucket)bucket.push(row);else map.set(value,[row])}return map}
function buildConnectedChain(relations:Relation[],preferred:Set<string>|null,maxEdges:number){if(!relations.length)return [];const startId=preferred?.values().next().value as string|undefined;const start=relations.find(r=>!startId||r.fromCollectionId===startId||r.toCollectionId===startId)||relations[0];const chain:Relation[]=[start];const seen=new Set([start.fromCollectionId,start.toCollectionId]);while(chain.length<maxEdges){if(preferred&&[...preferred].every(id=>seen.has(id)))break;const candidates=relations.filter(r=>!chain.includes(r)&&(seen.has(r.fromCollectionId)!==seen.has(r.toCollectionId)));if(!candidates.length)break;candidates.sort((a,b)=>edgeScore(b,seen,preferred)-edgeScore(a,seen,preferred));const next=candidates[0];chain.push(next);seen.add(next.fromCollectionId);seen.add(next.toCollectionId)}return chain}
function edgeScore(r:Relation,seen:Set<string>,preferred:Set<string>|null){const next=seen.has(r.fromCollectionId)?r.toCollectionId:r.fromCollectionId;return preferred?.has(next)?10:1}
function fieldsUsedFor(c:CollectionSnapshot,chain:Relation[]){const fields=new Set<string>();for(const r of chain){if(r.fromCollectionId===c.id)fields.add(r.fromFieldKey);if(r.toCollectionId===c.id)fields.add(r.toFieldKey)}return [...fields]}
function nameOf(s:WorkspaceSnapshot,id:string){return s.collections.find(c=>c.id===id)?.name||id.slice(0,8)}
