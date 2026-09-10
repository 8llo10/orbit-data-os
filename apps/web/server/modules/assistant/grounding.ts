import type {SourceRef} from './types';

const numericTokens=(text:string)=>new Set((text.match(/-?\d+(?:[.,]\d+)?%?/g)||[]).map(x=>x.replace(/,/g,'')));

export function buildGroundTruth(answer:string,sources:SourceRef[]){
  const sourceText=sources.length?sources.map(s=>`${s.collectionName} fields=[${s.fields.join(', ')}] scanned=${s.examinedRows}/${s.totalRows}`).join(' | '):'NO_FILE_SOURCE';
  return `${answer}\nSOURCES=${sourceText}`;
}

export function providerAnswerIsGrounded(candidate:string,groundTruth:string){
  if(!candidate.trim())return false;
  const allowed=numericTokens(groundTruth);
  for(const token of numericTokens(candidate)){
    if(!allowed.has(token))return false;
  }
  return true;
}
