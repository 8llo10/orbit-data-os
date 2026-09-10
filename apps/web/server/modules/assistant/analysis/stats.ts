import {resolveFields} from '../semantic';
import type {Evidence} from '../types';
import type {AnalysisStrategy} from './types';
import {formatNumber,numeric} from './utils';

const statsWords=/(احصائ|إحصائ|stats|statistics|ملخص رقمي|describe|متوسط|average|minimum|maximum|اقل قيمة|أقل قيمة|اعلى قيمة|أعلى قيمة)/i;

export const analyzeStats:AnalysisStrategy=context=>{
 if(!statsWords.test(context.query))return null;
 const matched=resolveFields(context.message,context.collection,12).filter(f=>f.type==='NUMBER');
 const fields=(matched.length?matched:context.collection.fields.filter(f=>f.type==='NUMBER')).slice(0,4);
 if(!fields.length)return null;
 const evidence:Evidence[]=[];const used:string[]=[];
 for(const field of fields){
  const values=context.records.map(r=>numeric(r[field.key])).filter((v):v is number=>v!==null);if(!values.length)continue;
  used.push(field.key);const sum=values.reduce((a,b)=>a+b,0);const avg=sum/values.length;
  evidence.push({kind:'metric',label:`${field.label||field.key} · المتوسط`,value:formatNumber(avg)});
  evidence.push({kind:'metric',label:`${field.label||field.key} · الأدنى`,value:formatNumber(Math.min(...values))});
  evidence.push({kind:'metric',label:`${field.label||field.key} · الأعلى`,value:formatNumber(Math.max(...values))});
 }
 if(!used.length)return null;const source=context.source(used);
 return {hasSource:true,collectionId:context.collection.id,sources:[source],answer:`حسبت لك ملخصًا رقميًا من «${context.collection.name}» على ${context.records.length.toLocaleString('ar-SA')} سجل تم فحصه.`,evidence:evidence.map(e=>({...e,source}))};
};
