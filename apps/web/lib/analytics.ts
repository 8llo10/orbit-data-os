export type FieldLike={key:string;label:string;type:string};
export function buildOverview(fields:FieldLike[], records:{data:unknown}[]){
 const rows=records.map(r=>(r.data??{}) as Record<string,unknown>);
 return fields.map(f=>{
   const vals=rows.map(r=>r[f.key]);
   const present=vals.filter(v=>v!==null&&v!==undefined&&String(v).trim()!=="");
   const unique=new Set(present.map(v=>JSON.stringify(v))).size;
   const numbers=present.map(Number).filter(v=>Number.isFinite(v));
   return {key:f.key,label:f.label,type:f.type,count:present.length,missing:vals.length-present.length,unique,
     min:numbers.length?Math.min(...numbers):null,max:numbers.length?Math.max(...numbers):null,
     avg:numbers.length?numbers.reduce((a,b)=>a+b,0)/numbers.length:null,
     top:topValues(present)};
 });
}
function topValues(values:unknown[]){
 const m=new Map<string,number>(); for(const v of values){const k=String(v);m.set(k,(m.get(k)||0)+1)}
 return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([value,count])=>({value,count}));
}
