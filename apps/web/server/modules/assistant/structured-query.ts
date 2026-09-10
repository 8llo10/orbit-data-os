import {db} from '@orbit/db';
import type {DataAnalysis} from './analytics';
import type {CollectionSnapshot,QueryFilter,StructuredQueryPlan,WorkspaceSnapshot} from './types';

type DynamicRecord=Record<string,unknown>&{id:string};
const text=(v:unknown)=>String(v??'').trim();
const numberValue=(v:unknown)=>{const n=typeof v==='number'?v:Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:null};

export function validateStructuredPlan(plan:StructuredQueryPlan,s:WorkspaceSnapshot):StructuredQueryPlan|null{
  const collection=findCollection(plan.collection,s);if(!collection)return null;
  const metricField=plan.metric.field?findField(plan.metric.field,collection):undefined;
  if(plan.metric.op!=='count'&&!metricField)return null;
  const groupBy=plan.groupBy?findField(plan.groupBy,collection)?.key:undefined;
  if(plan.groupBy&&!groupBy)return null;
  const filters:(QueryFilter[])=(plan.filters||[]).slice(0,8).flatMap(f=>{const field=findField(f.field,collection);return field?[{...f,field:field.key}]:[]});
  return {collection:collection.id,filters,groupBy,metric:{op:plan.metric.op,field:metricField?.key},order:plan.order==='asc'?'asc':'desc',limit:Math.max(1,Math.min(25,plan.limit||10))};
}

export async function executeStructuredQuery(plan:StructuredQueryPlan,s:WorkspaceSnapshot):Promise<DataAnalysis>{
  const collection=findCollection(plan.collection,s);
  if(!collection)return {answer:'ما قدرت أحدد مصدر صالح للخطة التحليلية.',evidence:[],sources:[],hasSource:false};
  const rows=await db.dataRecord.findMany({where:{collectionId:collection.id},select:{id:true,data:true},take:20000});
  const records:DynamicRecord[]=rows.map(r=>({id:r.id,...((r.data&&typeof r.data==='object'&&!Array.isArray(r.data)?r.data:{}) as Record<string,unknown>)}));
  const filtered=records.filter(r=>(plan.filters||[]).every(f=>matches(r,f)));
  const usedFields=Array.from(new Set([...(plan.filters||[]).map(f=>f.field),...(plan.groupBy?[plan.groupBy]:[]),...(plan.metric.field?[plan.metric.field]:[])].filter(Boolean)));
  const source={collectionId:collection.id,collectionName:collection.name,fields:usedFields,examinedRows:records.length,totalRows:collection.recordCount,href:`/dashboard/collections/${collection.id}`};

  if(plan.groupBy){
    const groups=new Map<string,unknown[]>();
    for(const row of filtered){const key=text(row[plan.groupBy])||'(فارغ)';const values=groups.get(key)||[];values.push(plan.metric.field?row[plan.metric.field]:1);groups.set(key,values);}
    const ranked=[...groups.entries()].map(([label,values])=>({label,value:aggregate(values,plan.metric.op)})).filter(x=>x.value!==null).sort((a,b)=>plan.order==='asc'?Number(a.value)-Number(b.value):Number(b.value)-Number(a.value)).slice(0,plan.limit||10);
    const metricLabel=plan.metric.op==='count'?'العدد':`${plan.metric.op.toUpperCase()} ${plan.metric.field||''}`;
    return {hasSource:true,collectionId:collection.id,sources:[source],answer:ranked.length?`حسب «${collection.name}»، وبعد تطبيق الفلاتر على ${filtered.length.toLocaleString('ar-SA')} سجل، الأعلى في ${metricLabel} حسب «${plan.groupBy}» هو «${ranked[0].label}» بقيمة ${formatNumber(Number(ranked[0].value))}.`:`فحصت «${collection.name}» لكن ما لقيت نتائج مطابقة للخطة المطلوبة.`,evidence:ranked.map(x=>({kind:'metric',label:x.label,value:formatNumber(Number(x.value)),source}))};
  }

  const values=plan.metric.field?filtered.map(r=>r[plan.metric.field!]):filtered.map(()=>1);
  const value=aggregate(values,plan.metric.op);
  return {hasSource:true,collectionId:collection.id,sources:[source],answer:value===null?`لقيت المصدر «${collection.name}» لكن ما لقيت قيم صالحة للحساب المطلوب.`:`النتيجة من «${collection.name}» بعد فحص ${records.length.toLocaleString('ar-SA')} سجل وتطبيق الفلاتر: ${formatNumber(Number(value))}.`,evidence:value===null?[]:[{kind:'metric',label:plan.metric.field||'السجلات',value:formatNumber(Number(value)),source}]};
}

function findCollection(value:string,s:WorkspaceSnapshot){const n=value.trim().toLowerCase();return s.collections.find(c=>c.id===value||c.name.toLowerCase()===n||c.slug.toLowerCase()===n)||null;}
function findField(value:string,c:CollectionSnapshot){const n=value.trim().toLowerCase();return c.fields.find(f=>f.key.toLowerCase()===n||f.label.toLowerCase()===n)||null;}
function matches(row:DynamicRecord,f:QueryFilter){const actual=row[f.field];const av=text(actual).toLowerCase();const expected=text(f.value).toLowerCase();const an=numberValue(actual);const en=numberValue(f.value);switch(f.op){case'eq':return av===expected;case'neq':return av!==expected;case'contains':return av.includes(expected);case'isEmpty':return actual===null||actual===undefined||av==='';case'notEmpty':return actual!==null&&actual!==undefined&&av!=='';case'gt':return an!==null&&en!==null&&an>en;case'gte':return an!==null&&en!==null&&an>=en;case'lt':return an!==null&&en!==null&&an<en;case'lte':return an!==null&&en!==null&&an<=en;default:return false;}}
function aggregate(values:unknown[],op:StructuredQueryPlan['metric']['op']){if(op==='count')return values.length;if(op==='countDistinct')return new Set(values.map(v=>text(v)).filter(Boolean)).size;const nums=values.map(numberValue).filter((v):v is number=>v!==null);if(!nums.length)return null;if(op==='sum')return nums.reduce((a,b)=>a+b,0);if(op==='avg')return nums.reduce((a,b)=>a+b,0)/nums.length;if(op==='min')return Math.min(...nums);return Math.max(...nums);}
function formatNumber(v:number){return v.toLocaleString('ar-SA',{maximumFractionDigits:2});}
