import {randomUUID} from 'crypto';
import type {AssistantAction,WorkspaceSnapshot} from './types';

const joinKey=/(^id$|_id$|id$|email|serial|code|number|no$)/i;

export function proposeRelationshipAction(snapshot:WorkspaceSnapshot):AssistantAction|null{
  let best:{fromId:string;toId:string;fromName:string;toName:string;field:string;score:number}|null=null;
  for(let i=0;i<snapshot.collections.length;i++){
    for(let j=i+1;j<snapshot.collections.length;j++){
      const a=snapshot.collections[i];const b=snapshot.collections[j];
      for(const fa of a.fields){
        const fb=b.fields.find(x=>x.key.toLowerCase()===fa.key.toLowerCase());
        if(!fb||!joinKey.test(fa.key))continue;
        const score=(fa.key.toLowerCase()==='id'?2:6)+(fa.required?1:0)+(fb.required?1:0);
        if(!best||score>best.score)best={fromId:a.id,toId:b.id,fromName:a.name,toName:b.name,field:fa.key,score};
      }
    }
  }
  if(!best)return null;
  return {
    id:randomUUID(),type:'create_relation',requiresConfirmation:true,
    label:`اربط ${best.fromName} مع ${best.toName} عبر ${best.field}`,
    payload:{name:`${best.fromName} ↔ ${best.toName}`,fromCollectionId:best.fromId,toCollectionId:best.toId,fromFieldKey:best.field,toFieldKey:best.field}
  };
}
