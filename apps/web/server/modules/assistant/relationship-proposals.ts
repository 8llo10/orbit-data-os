import {randomUUID} from 'crypto';
import type {AssistantAction,CollectionSnapshot,FieldSnapshot,WorkspaceSnapshot} from './types';
const joinKey=/(^id$|_id$|id$|email|serial|code|number|no$)/i;
const norm=(v:unknown)=>String(v??'').trim().toLowerCase();
function overlap(a:CollectionSnapshot,fa:FieldSnapshot,b:CollectionSnapshot,fb:FieldSnapshot){const av=new Set(a.sampleRows.map(r=>norm(r[fa.key])).filter(Boolean));const bv=new Set(b.sampleRows.map(r=>norm(r[fb.key])).filter(Boolean));if(!av.size||!bv.size)return 0;let hits=0;for(const x of av)if(bv.has(x))hits++;return hits/Math.min(av.size,bv.size)}
function mentioned(q:string,c:CollectionSnapshot){const n=norm(c.name);const slug=norm(c.slug);return q.includes(n)||q.includes(slug)}
function action(a:CollectionSnapshot,fa:FieldSnapshot,b:CollectionSnapshot,fb:FieldSnapshot):AssistantAction{return{id:randomUUID(),type:'create_relation',requiresConfirmation:true,label:`اربط ${a.name}.${fa.key} مع ${b.name}.${fb.key}`,payload:{name:`${a.name} ↔ ${b.name}`,fromCollectionId:a.id,toCollectionId:b.id,fromFieldKey:fa.key,toFieldKey:fb.key}}}
function explicitPair(snapshot:WorkspaceSnapshot,message:string){
 const hits:Array<{collection:CollectionSnapshot;field:FieldSnapshot;index:number}>=[];const q=norm(message);
 for(const c of snapshot.collections){for(const f of c.fields){for(const collectionName of [c.name,c.slug]){const token=`${norm(collectionName)}.${norm(f.key)}`;const index=q.indexOf(token);if(index>=0)hits.push({collection:c,field:f,index});}}}
 hits.sort((a,b)=>a.index-b.index);const first=hits[0];const second=hits.find(x=>first&&x.collection.id!==first.collection.id);return first&&second?{first,second}:null;
}
export function proposeRelationshipAction(snapshot:WorkspaceSnapshot,message=''):AssistantAction|null{
 const direct=explicitPair(snapshot,message);if(direct)return action(direct.first.collection,direct.first.field,direct.second.collection,direct.second.field);
 const q=norm(message);let best:{a:CollectionSnapshot;b:CollectionSnapshot;fa:FieldSnapshot;fb:FieldSnapshot;score:number}|null=null;
 for(let i=0;i<snapshot.collections.length;i++)for(let j=i+1;j<snapshot.collections.length;j++){
  const a=snapshot.collections[i],b=snapshot.collections[j];
  for(const fa of a.fields)for(const fb of b.fields){
   if(!joinKey.test(fa.key)||!joinKey.test(fb.key))continue;
   const ak=norm(fa.key),bk=norm(fb.key);const exact=ak===bk;const astem=ak.replace(/_?id$/,'');const bstem=bk.replace(/_?id$/,'');const stem=Boolean(astem&&bstem&&astem===bstem);
   if(!exact&&!stem)continue;
   const dataOverlap=overlap(a,fa,b,fb);let score=(exact?6:3)+(dataOverlap*12)+(fa.required?1:0)+(fb.required?1:0);
   if(ak==='id'&&bk==='id')score-=5;if(mentioned(q,a))score+=6;if(mentioned(q,b))score+=6;
   if(q.includes(ak))score+=3;if(q.includes(bk))score+=3;
   if(!best||score>best.score)best={a,b,fa,fb,score};
  }
 }
 if(!best||best.score<4)return null;return action(best.a,best.fa,best.b,best.fb);
}
