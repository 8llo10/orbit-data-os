import {likelyGroupField,likelyNumericField} from '../semantic';
import type {AnalysisStrategy} from './types';
import {display,formatNumber,numeric} from './utils';

export const analyzeRanking:AnalysisStrategy=context=>{
  const numericField=likelyNumericField(context.message,context.collection);
  if(!numericField||!/أعلى|اعلى|أكثر|اكثر|top|highest|قارن|compare|تكلف|cost|حرار|temp|latency|تأخير|تاخير/i.test(context.query))return null;
  const group=likelyGroupField(context.message,context.collection);

  if(group&&group.key!==numericField.key){
    const aggregation=new Map<string,{sum:number;count:number;max:number}>();
    for(const record of context.records){
      const value=numeric(record[numericField.key]);if(value===null)continue;
      const key=display(record[group.key]);const item=aggregation.get(key)||{sum:0,count:0,max:-Infinity};
      item.sum+=value;item.count++;item.max=Math.max(item.max,value);aggregation.set(key,item);
    }
    const useAverage=/متوسط|average|avg/i.test(context.query);
    const useMax=/أعلى|اعلى|max|حرار|temp|latency/i.test(context.query);
    const ranking=[...aggregation].map(([label,item])=>[label,useAverage?item.sum/item.count:useMax?item.max:item.sum] as [string,number]).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const source=context.source([group.key,numericField.key]);
    return {hasSource:true,collectionId:context.collection.id,sources:[source],answer:ranking.length?`حللت «${numericField.label||numericField.key}» حسب «${group.label||group.key}» داخل «${context.collection.name}». الأعلى هو «${ranking[0][0]}» بقيمة ${formatNumber(ranking[0][1])}.`:'لقيت الأعمدة المطلوبة لكن ما لقيت قيم رقمية صالحة للحساب.',evidence:ranking.map(([label,value])=>({kind:'metric',label,value:formatNumber(value),source}))};
  }

  const idField=context.collection.fields.find(f=>/asset.*id|device.*id|employee.*id|vendor.*id|maintenance.*id|work.*order.*id/i.test(f.key));
  const ranking=context.records.map(record=>({value:numeric(record[numericField.key]),label:display(idField?record[idField.key]:record.id)})).filter((item):item is {value:number;label:string}=>item.value!==null).sort((a,b)=>b.value-a.value).slice(0,10);
  const source=context.source([numericField.key,...(idField?[idField.key]:[])]);
  return {hasSource:true,collectionId:context.collection.id,sources:[source],answer:ranking.length?`أعلى قيمة في «${numericField.label||numericField.key}» داخل «${context.collection.name}» هي ${formatNumber(ranking[0].value)} للسجل «${ranking[0].label}».`:'ما لقيت قيم رقمية قابلة للتحليل في الحقل المطلوب.',evidence:ranking.map(item=>({kind:'metric',label:item.label,value:formatNumber(item.value),source}))};
};
