import {resolveFields} from '../semantic';
import type {AnalysisStrategy} from './types';

export const analyzeFallback:AnalysisStrategy=context=>{
  const fields=resolveFields(context.message,context.collection,8);
  const used=fields.length?fields:context.collection.fields.slice(0,6);
  const source=context.source(used.map(f=>f.key));
  return {
    hasSource:true,
    collectionId:context.collection.id,
    sources:[source],
    answer:`لقيت مصدر مناسب في «${context.collection.name}» وفحصت ${context.records.length.toLocaleString('ar-SA')} من أصل ${context.collection.recordCount.toLocaleString('ar-SA')} سجل. الأعمدة الأقرب لسؤالك: ${used.map(f=>`«${f.label||f.key}»`).join('، ')}. ما عندي قاعدة حساب أكثر تحديدًا لهذا السؤال بدون افتراض؛ لذلك ما راح أخترع نتيجة.`,
    evidence:used.slice(0,8).map(f=>({kind:'field',label:f.label||f.key,value:f.type,source}))
  };
};
