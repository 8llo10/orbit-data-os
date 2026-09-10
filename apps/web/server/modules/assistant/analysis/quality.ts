import type {Evidence} from '../types';
import type {AnalysisStrategy} from './types';

export const analyzeQuality:AnalysisStrategy=context=>{
  if(!/جود|quality|ناقص|missing|مكرر|duplicate|شاذ|anomal/i.test(context.query))return null;
  const evidence:Evidence[]=[];const used:string[]=[];
  for(const field of context.collection.fields){
    let missing=0;let duplicate=0;const seen=new Set<string>();
    for(const record of context.records){
      const value=record[field.key];
      if(value===null||value===undefined||String(value).trim()===''){missing++;continue;}
      if(/id|email|serial|code/i.test(field.key)){
        const key=String(value).trim().toLowerCase();
        if(seen.has(key))duplicate++;
        seen.add(key);
      }
    }
    if(missing||duplicate){used.push(field.key);evidence.push({kind:'warning',label:field.label||field.key,value:`مفقود ${missing} · تكرار مشتبه ${duplicate}`});}
  }
  const source=context.source(used.length?used:context.collection.fields.slice(0,5).map(f=>f.key));
  return {
    hasSource:true,collectionId:context.collection.id,sources:[source],
    answer:evidence.length?`لقيت ${evidence.length} أعمدة فيها مؤشرات جودة تستحق المراجعة داخل «${context.collection.name}». الحساب مبني على ${context.records.length.toLocaleString('ar-SA')} سجل، مو على عينة.`:`فحصت ${context.records.length.toLocaleString('ar-SA')} سجل في «${context.collection.name}» وما لقيت missing/duplicate indicators واضحة بالقواعد الحالية.`,
    evidence:evidence.slice(0,12).map(item=>({...item,source}))
  };
};
