import {concepts,resolveFields} from '../semantic';
import type {Evidence} from '../types';
import type {AnalysisStrategy} from './types';
import {formatNumber,numeric} from './utils';

const anomalyWords=/(شاذ|غير طبيعي|غير طبيعيه|غير طبيعية|anomal|outlier|spike|قفز|مرتفع|عالي|حرار|temperature|latency|cpu|memory|ذاكر|معالج)/i;

function percentile(sorted:number[],p:number){if(!sorted.length)return 0;const idx=Math.min(sorted.length-1,Math.max(0,Math.floor((sorted.length-1)*p)));return sorted[idx];}

export const analyzeAnomalies:AnalysisStrategy=context=>{
 if(!anomalyWords.test(context.query))return null;
 const requested=resolveFields(context.message,context.collection,12).filter(f=>f.type==='NUMBER');
 const numericFields=requested.length?requested:context.collection.fields.filter(f=>f.type==='NUMBER').filter(f=>{
  const cs=concepts(`${f.key} ${f.label}`);return cs.some(c=>['temperature','latency','quantity','cost'].includes(c))||/(cpu|memory|ram|latency|temp|temperature|حرار)/i.test(`${f.key} ${f.label}`);
 }).slice(0,5);
 if(!numericFields.length)return null;
 const evidence:Evidence[]=[];const used:string[]=[];
 for(const field of numericFields){
  const values=context.records.map(r=>numeric(r[field.key])).filter((v):v is number=>v!==null).sort((a,b)=>a-b);
  if(values.length<8)continue;
  const q1=percentile(values,.25),q3=percentile(values,.75),iqr=q3-q1;const lower=q1-1.5*iqr,upper=q3+1.5*iqr;
  const anomalous=values.filter(v=>v<lower||v>upper);if(!anomalous.length)continue;
  used.push(field.key);evidence.push({kind:'warning',label:field.label||field.key,value:`${anomalous.length.toLocaleString('ar-SA')} قيمة شاذة · النطاق المعتاد تقريبًا ${formatNumber(q1)}–${formatNumber(q3)}`});
 }
 if(!used.length)return null;
 const source=context.source(used);
 return {hasSource:true,collectionId:context.collection.id,sources:[source],answer:`لقيت مؤشرات قيم غير طبيعية في «${context.collection.name}». استخدمت قاعدة IQR على الحقول الرقمية المطلوبة بدل ما أفترض حد ثابت من عندي.`,evidence:evidence.map(e=>({...e,source}))};
};
