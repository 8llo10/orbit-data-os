import type {CollectionSnapshot,FieldSnapshot,WorkspaceSnapshot} from './types';

const aliases:Record<string,string[]>={
 id:['id','identifier','number','no','code','رقم','معرف','كود'],
 sla:['sla','breach','breached','deadline','overdue','متأخر','متاخر','تجاوز','مهلة','استحقاق'],
 cost:['cost','price','amount','total','expense','spend','تكلفة','تكلفه','سعر','مبلغ','مصروف'],
 status:['status','state','condition','حالة','الحالة','وضع'],
 asset:['asset','device','equipment','machine','جهاز','أصل','اصل','معدات','معدة'],
 location:['location','site','city','branch','zone','region','موقع','مدينة','مدينه','فرع','منطقة','منطقه'],
 maintenance:['maintenance','repair','service','failure','downtime','صيانة','صيانه','عطل','اعطال','توقف'],
 vendor:['vendor','supplier','provider','مورد','مزود'],
 employee:['employee','staff','worker','personnel','user','موظف','موظفين','عامل'],
 department:['department','team','division','dept','قسم','ادارة','إدارة','فريق'],
 temperature:['temperature','temp','heat','حرارة','حراره'],
 latency:['latency','delay','ping','response time','تأخير','تاخير','استجابة'],
 priority:['priority','severity','urgency','critical','أولوية','اولوية','خطورة','حرج'],
 date:['date','time','created','opened','closed','due','resolved','timestamp','تاريخ','وقت','موعد'],
 email:['email','mail','بريد','ايميل'],
 phone:['phone','mobile','telephone','جوال','هاتف'],
 quantity:['quantity','qty','count','units','stock','كمية','كميه','عدد','مخزون'],
 revenue:['revenue','sales','income','profit','مبيعات','ايراد','إيراد','ربح']
};

const clean=(s:string)=>s.toLowerCase().replace(/[_\-.\/]+/g,' ').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
export function tokens(text:string){return Array.from(new Set(clean(text).split(/\s+/).filter(x=>x.length>1)))}

export function concepts(text:string){
 const normalized=clean(text);const found=new Set<string>();
 for(const [concept,words] of Object.entries(aliases))if(words.some(w=>normalized.includes(clean(w))))found.add(concept);
 return [...found];
}

export function expand(text:string){
 const out=new Set(tokens(text));
 for(const concept of concepts(text)){out.add(concept);for(const word of aliases[concept])out.add(clean(word))}
 return [...out];
}

function scoreName(text:string,name:string){
 const query=expand(text);const normalized=clean(name);if(!normalized)return 0;let score=0;
 for(const token of query){if(normalized===token)score+=10;else if(normalized.startsWith(token)||token.startsWith(normalized))score+=5;else if(normalized.includes(token)||token.includes(normalized))score+=3}
 return score;
}

function fieldScore(text:string,f:FieldSnapshot){
 let score=scoreName(text,f.key)*1.35+scoreName(text,f.label);
 const requested=concepts(text);const fieldConcepts=new Set([...concepts(f.key),...concepts(f.label)]);
 for(const concept of requested)if(fieldConcepts.has(concept))score+=8;
 if(f.type==='NUMBER'&&/(اعلى|أعلى|اكثر|أكثر|average|avg|sum|total|قارن|متوسط|مجموع)/i.test(text))score+=2;
 if((f.type==='DATE'||f.type==='DATETIME')&&/(متى|تاريخ|موعد|date|when|period|فتر)/i.test(text))score+=2;
 return score;
}

export function resolveCollection(text:string,s:WorkspaceSnapshot):CollectionSnapshot|null{
 let best:{collection:CollectionSnapshot;score:number}|null=null;
 for(const collection of s.collections){
  let score=scoreName(text,collection.name)*2+scoreName(text,collection.slug)*2;
  const fieldScores=collection.fields.map(f=>fieldScore(text,f)).sort((a,b)=>b-a);
  score+=(fieldScores[0]||0)+(fieldScores[1]||0)*.45+(fieldScores[2]||0)*.2;
  if(!best||score>best.score)best={collection,score};
 }
 return best&&best.score>=3?best.collection:null;
}

export function resolveFields(text:string,c:CollectionSnapshot,limit=5):FieldSnapshot[]{
 return c.fields.map(field=>({field,score:fieldScore(text,field)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.field);
}

export function likelyGroupField(text:string,c:CollectionSnapshot){
 const matches=resolveFields(text,c,10);
 return matches.find(f=>concepts(`${f.key} ${f.label}`).some(x=>['location','vendor','status','priority','department','asset','employee'].includes(x)))||matches.find(f=>f.type==='TEXT')||c.fields.find(f=>/(location|site|city|branch|zone|status|priority|type|category|department|vendor)/i.test(f.key))||null;
}

export function likelyNumericField(text:string,c:CollectionSnapshot){
 const matches=resolveFields(text,c,10);
 return matches.find(f=>f.type==='NUMBER')||c.fields.find(f=>f.type==='NUMBER'&&concepts(`${f.key} ${f.label}`).some(x=>['cost','temperature','latency','quantity','revenue'].includes(x)))||c.fields.find(f=>f.type==='NUMBER')||null;
}
