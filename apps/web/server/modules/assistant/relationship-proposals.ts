import {randomUUID} from 'crypto';
import type {AssistantAction,CollectionSnapshot,FieldSnapshot,WorkspaceSnapshot} from './types';
const joinKey=/(^id$|_id$|id$|email|serial|code|number|no$)/i;
const norm=(v:unknown)=>String(v??'').trim().toLowerCase();
function overlap(a:CollectionSnapshot,fa:FieldSnapshot,b:CollectionSnapshot,fb:FieldSnapshot){const av=new Set(a.sampleRows.map(r=>norm(r[fa.key])).filter(Boolean));const bv=new Set(b.sampleRows.map(r=>norm(r[fb.key])).filter(Boolean));if(!av.size||!bv.size)return 0;let hits=0;for(const x of av)if(bv.has(x))hits++;return hits/Math.min(av.size,bv.size)}
function mentioned(q:string,c:CollectionSnapshot){const n=norm(c.name);const slug=norm(c.slug);return q.includes(n)||q.includes(slug)}
export function proposeRelationshipAction(snapshot:WorkspaceSnapshot,message=''):AssistantAction|null{
 const q=norm(message);let best:{a:CollectionSnapshot;b:CollectionSnapshot;fa:FieldSnapshot;fb:FieldSnapshot;score:number}|null=null;
 for(let i=0;i<snapshot.collections.length;i++)for(let j=i+1;j<snapshot.collections.length;j++){
  const a=snapshot.collections[i],b=snapshot.collections[j];
  for(const fa of a.fields)for(const fb of b.fields){
   if(!joinKey.test(fa.key)||!joinKey.test(fb.key))continue;
   const ak=norm(fa.key),bk=norm(fb.key);const exact=ak===bk;const stem=ak.replace(/_?id$/,'')&&ak.replace(/_?id$/,'')===bk.replace(/_?id$/,'');
   if(!exact&&!stem)continue;
   const dataOverlap=overlap(a,fa,b,fb);let score=(exact?6:3)+(dataOverlap*12)+(fa.required?1:0)+(fb.required?1:0);
   if(ak==='id'&&bk==='id')score-=5;if(mentioned(q,a))score+=6;if(mentioned(q,b))score+=6;
   if(!best||score>best.score)best={a,b,fa,fb,score};
  }
 }
 if(!best||best.score<4)return null;
 return {id:randomUUID(),type:'create_relation',requiresConfirmation:true,label:`اربط ${best.a.name} مع ${best.b.name} عبر ${best.fa.key} ↔ ${best.fb.key}`,payload:{name:`${best.a.name} ↔ ${best.b.name}`,fromCollectionId:best.a.id,toCollectionId:best.b.id,fromFieldKey:best.fa.key,toFieldKey:best.fb.key}};
}
