import {resolveFields} from '../semantic';
import type {Evidence} from '../types';
import type {AnalysisStrategy} from './types';
import {display} from './utils';

const searchWords=/(ابحث|دور|طلع لي|ورني|ورّني|find|search|show me|records?|سجلات)/i;
const stop=new Set(['ابحث','دور','طلع','لي','ورني','ورّني','find','search','show','me','record','records','سجل','سجلات','في','عن','من','the','a','an','الموظفين','موظفين','الأجهزة','الاجهزة','اجهزة','البيانات','data']);
function terms(q:string){return q.toLowerCase().replace(/[.,:;!?()[\]{}]/g,' ').split(/\s+/).map(x=>x.trim()).filter(x=>x.length>1&&!stop.has(x)).slice(0,8)}

export const analyzeSearch:AnalysisStrategy=context=>{
 if(!searchWords.test(context.query))return null;
 const fields=resolveFields(context.message,context.collection,10);const searchable=(fields.length?fields:context.collection.fields).slice(0,12);const needles=terms(context.message).filter(t=>t!==context.collection.name.toLowerCase()&&t!==context.collection.slug.toLowerCase());
 if(!needles.length)return null;
 const scored=context.records.map(row=>{let score=0;for(const t of needles)if(searchable.some(f=>String(row[f.key]??'').toLowerCase().includes(t)))score++;return{row,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
 const source=context.source(searchable.map(f=>f.key));
 if(!scored.length)return {hasSource:true,collectionId:context.collection.id,sources:[source],answer:`بحثت داخل «${context.collection.name}» وما لقيت سجلات تطابق الكلمات المطلوبة بالقواعد الحالية.`,evidence:[]};
 const evidence:Evidence[]=scored.map(({row,score},i)=>({kind:'sample',label:`نتيجة ${i+1} · تطابق ${score}/${needles.length}`,value:searchable.slice(0,4).map(f=>`${f.label||f.key}: ${display(row[f.key])}`).join(' · '),source}));
 return {hasSource:true,collectionId:context.collection.id,sources:[source],answer:`لقيت ${scored.length.toLocaleString('ar-SA')} نتائج أقرب لطلبك داخل «${context.collection.name}»، ورتبتها حسب قوة التطابق.`,evidence};
};
