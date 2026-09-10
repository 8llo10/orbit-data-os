import type {CollectionSnapshot,FieldSnapshot,WorkspaceSnapshot} from './types';

const aliases:Record<string,string[]>={
  sla:['sla','breach','breached','متأخر','متاخر','تجاوز','مهلة'],
  cost:['cost','price','amount','total','تكلفة','تكلفه','سعر','مبلغ'],
  status:['status','state','حالة','الحالة'],
  asset:['asset','device','equipment','جهاز','أصل','اصل','معدات'],
  location:['location','site','city','branch','zone','موقع','مدينة','مدينه','فرع','منطقة'],
  maintenance:['maintenance','repair','service','صيانة','صيانه','عطل','اعطال'],
  vendor:['vendor','supplier','مورد'],
  employee:['employee','staff','user','موظف','موظفين'],
  temperature:['temperature','temp','heat','حرارة','حراره'],
  latency:['latency','delay','ping','تأخير','تاخير'],
  priority:['priority','severity','urgency','أولوية','اولوية','خطورة'],
  date:['date','time','created','opened','closed','due','resolved','تاريخ','وقت','موعد'],
};
const clean=(s:string)=>s.toLowerCase().replace(/[_\-.]/g,' ').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').trim();
export function tokens(text:string){return Array.from(new Set(clean(text).split(/\s+/).filter(x=>x.length>1)))}
export function expand(text:string){const out=new Set(tokens(text));for(const [concept,words] of Object.entries(aliases)){if(words.some(w=>clean(text).includes(clean(w)))){out.add(concept);for(const w of words)out.add(clean(w))}}return [...out]}
function scoreName(text:string,name:string){const q=expand(text),n=clean(name);let score=0;for(const t of q){if(n===t)score+=6;else if(n.includes(t)||t.includes(n))score+=3}return score}
export function resolveCollection(text:string,s:WorkspaceSnapshot):CollectionSnapshot|null{let best:{c:CollectionSnapshot;score:number}|null=null;for(const c of s.collections){let score=scoreName(text,c.name)+scoreName(text,c.slug);for(const f of c.fields)score+=Math.min(2,scoreName(text,f.key)+scoreName(text,f.label));if(!best||score>best.score)best={c,score}}return best&&best.score>0?best.c:null}
export function resolveFields(text:string,c:CollectionSnapshot,limit=5):FieldSnapshot[]{return c.fields.map(f=>({f,score:scoreName(text,f.key)+scoreName(text,f.label)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.f)}
export function likelyGroupField(text:string,c:CollectionSnapshot){const matches=resolveFields(text,c,8);return matches.find(f=>/(location|site|city|branch|zone|vendor|status|priority|type|category|department)/i.test(f.key))||matches[0]||c.fields.find(f=>/(location|site|city|branch|zone|status|priority|type|category)/i.test(f.key))||null}
export function likelyNumericField(text:string,c:CollectionSnapshot){const matches=resolveFields(text,c,8);return matches.find(f=>f.type==='NUMBER')||c.fields.find(f=>f.type==='NUMBER'&&/(cost|amount|score|hours|latency|temperature|count|percent)/i.test(f.key))||c.fields.find(f=>f.type==='NUMBER')||null}
