import type {AssistantIntent,Evidence,SourceRef,WorkspaceSnapshot} from './types';

type ComposeInput={intent:AssistantIntent;answer:string;evidence:Evidence[];sources:SourceRef[];snapshot:WorkspaceSnapshot};

export function composeNaturalResponse(input:ComposeInput){
 const {intent,answer,evidence,sources,snapshot}=input;
 if(intent==='WORKSPACE_SUMMARY'){
  const files=[...snapshot.collections].sort((a,b)=>b.recordCount-a.recordCount);
  if(!files.length)return 'ما عندك ملفات مرفوعة للحين. ارفع أول ملف، وبعدها أقدر أقرأه وأحلله لك.';
  const inventory=files.map(c=>`«${c.name}» (${c.recordCount.toLocaleString('ar-SA')} سجل)`).join('، ');
  return `عندك ${files.length.toLocaleString('ar-SA')} مجموعات بيانات بإجمالي ${snapshot.recordCount.toLocaleString('ar-SA')} سجل: ${inventory}. ${snapshot.relationCount?`وفيه ${snapshot.relationCount.toLocaleString('ar-SA')} علاقات محفوظة بينها.`:'حالياً ما فيه علاقات محفوظة بينها.'}`;
 }
 if(!sources.length)return answer;
 const sourceNames=[...new Set(sources.map(s=>s.collectionName))];
 const scan=sources.every(s=>s.examinedRows>=s.totalRows)?'فحصت السجلات كاملة':'فحصت السجلات المتاحة للمحرك';
 if(intent==='DATA_QUALITY'){
  const warnings=evidence.filter(e=>e.kind==='warning');
  if(!warnings.length)return `${answer} المصدر: ${sourceNames.map(n=>`«${n}»`).join(' و')}، و${scan}.`;
  const top=warnings.slice(0,4).map(e=>`${e.label}: ${e.value}`).join('؛ ');
  return `${answer} أبرز اللي لقيته: ${top}. المصدر: ${sourceNames.map(n=>`«${n}»`).join(' و')}، و${scan}.`;
 }
 return `${answer} المصدر اللي اعتمدت عليه: ${sourceNames.map(n=>`«${n}»`).join(' و')}.`;
}
