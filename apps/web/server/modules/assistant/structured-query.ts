import {db} from '@orbit/db';
import type {DataAnalysis} from './analytics';
import type {CollectionSnapshot,QueryFilter,QueryMetric,StructuredQueryPlan,WorkspaceSnapshot} from './types';

type DynamicRecord=Record<string,unknown>&{id:string};
const text=(v:unknown)=>String(v??'').trim();
const numberValue=(v:unknown)=>{const n=typeof v==='number'?v:Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:null};

export function validateStructuredPlan(plan:StructuredQueryPlan,s:WorkspaceSnapshot):StructuredQueryPlan|null{
 const collection=findCollection(plan.collection,s);if(!collection)return null;
 const primary=validateMetric(plan.metric,collection);if(!primary)return null;
 const extras=(plan.metrics||[]).slice(0,4).map(m=>validateMetric(m,collection)).filter((m):m is QueryMetric=>Boolean(m));
 const groupBy=plan.groupBy?findField(plan.groupBy,collection)?.key:undefined;if(plan.groupBy&&!groupBy)return null;
 const filters:(QueryFilter[])=(plan.filters||[]).slice(0,8).flatMap(f=>{const field=findField(f.field,collection);return field?[{...f,field:field.key}]:[]});
 return {collection:collection.id,filters,groupBy,metric:primary,metrics:extras,order:plan.order==='asc'?'asc':'desc',limit:Math.max(1,Math.min(25,plan.limit||10))};
}

export async function executeStructuredQuery(plan:StructuredQueryPlan,s:WorkspaceSnapshot):Promise<DataAnalysis>{
 const collection=findCollection(plan.collection,s);
 if(!collection)return {answer:'ما قدرت أحدد مصدر صالح للخطة التحليلية.',evidence:[],sources:[],hasSource:false};
 const rows=await db.dataRecord.findMany({where:{collectionId:collection.id},select:{id:true,data:true},take:20000});
 const records:DynamicRecord[]=rows.map(r=>({id:r.id,...((r.data&&typeof r.data==='object'&&!Array.isArray(r.data)?r.data:{}) as Record<string,unknown>)}));
 const filtered=records.filter(r=>(plan.filters||[]).every(f=>matches(r,f)));
 const metrics=[plan.metric,...(plan.metrics||[])];
 const usedFields=Array.from(new Set([...(plan.filters||[]).map(f=>f.field),...(plan.groupBy?[plan.groupBy]:[]),...metrics.flatMap(m=>m.field?[m.field]:[])].filter(Boolean)));
 const source={collectionId:collection.id,collectionName:collection.name,fields:usedFields,examinedRows:records.length,totalRows:collection.recordCount,href:`/dashboard/collections/${collection.id}`};

 if(plan.groupBy){
  const groups=new Map<string,DynamicRecord[]>();
  for(const row of filtered){const key=text(row[plan.groupBy])||'(فارغ)';const bucket=groups.get(key)||[];bucket.push(row);groups.set(key,bucket);}
  const rowsWithMetrics=[...groups.entries()].map(([label,groupRows])=>({label,values:metrics.map(metric=>aggregate(groupRows.map(r=>metric.field?r[metric.field]:1),metric.op))})).filter(x=>x.values[0]!==null);
  rowsWithMetrics.sort((a,b)=>{const av=Number(a.values[0]??0),bv=Number(b.values[0]??0);return plan.order==='asc'?av-bv:bv-av});
  const ranked=rowsWithMetrics.slice(0,plan.limit||10);
  const primaryLabel=metricLabel(plan.metric);
  const answer=ranked.length?`حسب «${collection.name}»، وبعد تطبيق الفلاتر على ${filtered.length.toLocaleString('ar-SA')} سجل، ${plan.order==='asc'?'الأقل':'الأعلى'} في ${primaryLabel} حسب «${plan.groupBy}» هو «${ranked[0].label}» بقيمة ${formatMaybe(ranked[0].values[0])}.${metrics.length>1?' وحسبت معاه المقاييس الإضافية المطلوبة.':''}`:`فحصت «${collection.name}» لكن ما لقيت نتائج مطابقة للخطة المطلوبة.`;
  const evidence=ranked.flatMap(row=>metrics.map((metric,i)=>({kind:'metric' as const,label:`${row.label} · ${metricLabel(metric)}`,value:formatMaybe(row.values[i]),source})));
  return {hasSource:true,collectionId:collection.id,sources:[source],answer,evidence};
 }

 const results=metrics.map(metric=>aggregate(metric.field?filtered.map(r=>r[metric.field!]):filtered.map(()=>1),metric.op));
 const available=results.map((value,i)=>({value,metric:metrics[i]})).filter(x=>x.value!==null);
 return {hasSource:true,collectionId:collection.id,sources:[source],answer:available.length?`النتيجة من «${collection.name}» بعد فحص ${records.length.toLocaleString('ar-SA')} سجل وتطبيق الفلاتر: ${available.map(x=>`${metricLabel(x.metric)} = ${formatMaybe(x.value)}`).join('، ')}.`:`لقيت المصدر «${collection.name}» لكن ما لقيت قيم صالحة للحساب المطلوب.`,evidence:available.map(x=>({kind:'metric',label:metricLabel(x.metric),value:formatMaybe(x.value),source}))};
}

function validateMetric(metric:QueryMetric|undefined,c:CollectionSnapshot):QueryMetric|null{if(!metric||!['count','sum','avg','min','max','countDistinct'].includes(metric.op))return null;const field=metric.field?findField(metric.field,c):undefined;if(metric.op!=='count'&&!field)return null;return {op:metric.op,field:field?.key,label:metric.label?.slice(0,80)};}
function findCollection(value:string,s:WorkspaceSnapshot){const n=value.trim().toLowerCase();return s.collections.find(c=>c.id===value||c.name.toLowerCase()===n||c.slug.toLowerCase()===n)||null;}
function findField(value:string,c:CollectionSnapshot){const n=value.trim().toLowerCase();return c.fields.find(f=>f.key.toLowerCase()===n||f.label.toLowerCase()===n)||null;}
function matches(row:DynamicRecord,f:QueryFilter){const actual=row[f.field];const av=text(actual).toLowerCase();const expected=text(f.value).toLowerCase();const an=numberValue(actual);const en=numberValue(f.value);switch(f.op){case'eq':return av===expected;case'neq':return av!==expected;case'contains':return av.includes(expected);case'isEmpty':return actual===null||actual===undefined||av==='';case'notEmpty':return actual!==null&&actual!==undefined&&av!=='';case'gt':return an!==null&&en!==null&&an>en;case'gte':return an!==null&&en!==null&&an>=en;case'lt':return an!==null&&en!==null&&an<en;case'lte':return an!==null&&en!==null&&an<=en;default:return false;}}
function aggregate(values:unknown[],op:QueryMetric['op']){if(op==='count')return values.length;if(op==='countDistinct')return new Set(values.map(v=>text(v)).filter(Boolean)).size;const nums=values.map(numberValue).filter((v):v is number=>v!==null);if(!nums.length)return null;if(op==='sum')return nums.reduce((a,b)=>a+b,0);if(op==='avg')return nums.reduce((a,b)=>a+b,0)/nums.length;if(op==='min')return Math.min(...nums);return Math.max(...nums);}
function metricLabel(metric:QueryMetric){if(metric.label)return metric.label;if(metric.op==='count')return 'العدد';if(metric.op==='countDistinct')return `عدد القيم المختلفة في ${metric.field||'الحقل'}`;const ar={sum:'مجموع',avg:'متوسط',min:'أقل',max:'أعلى'} as const;return `${ar[metric.op as keyof typeof ar]||metric.op} ${metric.field||''}`.trim();}
function formatMaybe(v:number|null){return v===null?'—':v.toLocaleString('ar-SA',{maximumFractionDigits:2});}
