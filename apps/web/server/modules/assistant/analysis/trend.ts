import {resolveFields} from '../semantic';
import type {Evidence} from '../types';
import type {AnalysisStrategy} from './types';
import {formatNumber,numeric} from './utils';

const trendWords=/(ترند|اتجاه|trend|شهري|اسبوع|أسبوع|يومي|monthly|weekly|daily|بمرور الوقت|مع الوقت|فتره|فترة|period)/i;

function parseDate(v:unknown){const d=v instanceof Date?v:new Date(String(v??''));return Number.isFinite(d.getTime())?d:null;}
function bucket(d:Date,mode:'day'|'week'|'month'){
 if(mode==='month')return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
 if(mode==='day')return d.toISOString().slice(0,10);
 const x=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);const yearStart=new Date(Date.UTC(x.getUTCFullYear(),0,1));const week=Math.ceil((((x.getTime()-yearStart.getTime())/86400000)+1)/7);return `${x.getUTCFullYear()}-W${String(week).padStart(2,'0')}`;
}

export const analyzeTrend:AnalysisStrategy=context=>{
 if(!trendWords.test(context.query))return null;
 const matched=resolveFields(context.message,context.collection,12);
 const dateField=matched.find(f=>f.type==='DATE'||f.type==='DATETIME')||context.collection.fields.find(f=>f.type==='DATE'||f.type==='DATETIME'||/(date|time|created|opened|closed|due|timestamp|تاريخ|وقت)/i.test(`${f.key} ${f.label}`));
 if(!dateField)return null;
 const metricField=matched.find(f=>f.type==='NUMBER')||context.collection.fields.find(f=>f.type==='NUMBER');
 const mode:'day'|'week'|'month'=/(يومي|daily)/i.test(context.query)?'day':/(اسبوع|أسبوع|weekly)/i.test(context.query)?'week':'month';
 const groups=new Map<string,{count:number,sum:number,n:number}>();
 for(const row of context.records){const d=parseDate(row[dateField.key]);if(!d)continue;const key=bucket(d,mode);const g=groups.get(key)||{count:0,sum:0,n:0};g.count++;if(metricField){const v=numeric(row[metricField.key]);if(v!==null){g.sum+=v;g.n++;}}groups.set(key,g);}
 const points=[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-12);if(points.length<2)return null;
 const values=points.map(([label,g])=>({label,value:metricField&&g.n?g.sum/g.n:g.count}));const first=values[0].value,last=values.at(-1)!.value;const change=first===0?null:((last-first)/Math.abs(first))*100;
 const evidence:Evidence[]=values.slice(-8).map(x=>({kind:'metric',label:x.label,value:formatNumber(x.value)}));const source=context.source([dateField.key,...(metricField?[metricField.key]:[])]);
 const direction=last>first?'صاعد':last<first?'نازل':'مستقر تقريبًا';
 return {hasSource:true,collectionId:context.collection.id,sources:[source],answer:`الاتجاه في «${context.collection.name}» ${direction} عبر ${points.length.toLocaleString('ar-SA')} فترات ${mode==='day'?'يومية':mode==='week'?'أسبوعية':'شهرية'}${change===null?'':`، والتغير من أول فترة لآخر فترة حوالي ${formatNumber(change)}٪`}.${metricField?` القياس هنا هو متوسط «${metricField.label||metricField.key}» لكل فترة.`:' القياس هنا هو عدد السجلات لكل فترة.'}`,evidence:evidence.map(e=>({...e,source}))};
};
