import type {Evidence} from '../types';
import type {AnalysisStrategy} from './types';

function isPotentialUniqueField(key:string){
  return /(^id$|^uuid$|email$|serial(_number)?$|serialno$|code$|number$|_number$)/i.test(key);
}

export const analyzeQuality:AnalysisStrategy=context=>{
  if(!/جود|quality|ناقص|missing|مكرر|duplicate|شاذ|anomal/i.test(context.query))return null;
  const evidence:Evidence[]=[];
  const used:string[]=[];

  for(const field of context.collection.fields){
    let missing=0;
    const values:string[]=[];

    for(const record of context.records){
      const value=record[field.key];
      if(value===null||value===undefined||String(value).trim()===''){
        missing++;
        continue;
      }
      values.push(String(value).trim().toLowerCase());
    }

    let duplicate=0;
    if(isPotentialUniqueField(field.key)&&values.length){
      const distinct=new Set(values);
      const distinctRatio=distinct.size/values.length;
      // Only treat duplicate values as a data-quality signal when the field
      // actually behaves like an identifier. This prevents foreign keys such
      // as location_id or manager_id from being incorrectly flagged.
      if(distinctRatio>=0.7)duplicate=values.length-distinct.size;
    }

    if(missing||duplicate){
      used.push(field.key);
      const details=[missing?`مفقود ${missing}`:'',duplicate?`تكرار مشتبه ${duplicate}`:''].filter(Boolean).join(' · ');
      evidence.push({kind:'warning',label:field.label||field.key,value:details});
    }
  }

  const source=context.source(used.length?used:context.collection.fields.slice(0,5).map(f=>f.key));
  return {
    hasSource:true,
    collectionId:context.collection.id,
    sources:[source],
    answer:evidence.length
      ?`لقيت ${evidence.length} أعمدة فيها مؤشرات جودة تستحق المراجعة داخل «${context.collection.name}». الحساب مبني على ${context.records.length.toLocaleString('ar-SA')} سجل، والتكرار ما ينحسب إلا للحقول اللي تتصرف فعليًا كمعرّفات.`
      :`فحصت ${context.records.length.toLocaleString('ar-SA')} سجل في «${context.collection.name}» وما لقيت مؤشرات missing/duplicate واضحة بالقواعد الحالية.`,
    evidence:evidence.slice(0,12).map(item=>({...item,source}))
  };
};
