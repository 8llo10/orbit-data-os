import {likelyGroupField} from '../semantic';
import type {AnalysisStrategy} from './types';
import {display,truthy} from './utils';

export const analyzeSla:AnalysisStrategy=context=>{
  if(!/sla|breach|تجاوز|متأخر|متاخر/i.test(context.query))return null;
  const field=context.collection.fields.find(f=>/sla.*breach|breach.*sla/i.test(f.key));
  const group=likelyGroupField(context.message,context.collection)||context.collection.fields.find(f=>/location|site|city|branch/i.test(f.key));
  if(!field||!group)return null;
  const counts=new Map<string,number>();
  for(const record of context.records){if(!truthy(record[field.key]))continue;const key=display(record[group.key]);counts.set(key,(counts.get(key)||0)+1)}
  const ranking=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
  const source=context.source([field.key,group.key]);
  return {
    hasSource:true,collectionId:context.collection.id,sources:[source],
    answer:ranking.length?`حسب ملف «${context.collection.name}»، أعلى ${group.label||group.key} في تجاوزات SLA هو «${ranking[0][0]}» بعدد ${ranking[0][1]} حالة. فحصت ${context.records.length.toLocaleString('ar-SA')} سجل فعليًا.`:`لقيت أعمدة SLA في «${context.collection.name}»، لكن ما لقيت حالات breach مثبتة في السجلات المفحوصة.`,
    evidence:ranking.map(([label,value])=>({kind:'metric',label,value:`${value} تجاوز`,source}))
  };
};
