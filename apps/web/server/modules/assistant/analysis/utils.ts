export const truthy=(value:unknown)=>value===true||['true','1','yes','breached','critical','حرج'].includes(String(value??'').trim().toLowerCase());
export const numeric=(value:unknown)=>{const n=typeof value==='number'?value:Number(String(value??'').replace(/,/g,''));return Number.isFinite(n)?n:null};
export const display=(value:unknown)=>value===null||value===undefined||value===''?'(فارغ)':String(value);
export const formatNumber=(value:number)=>value.toLocaleString('ar-SA',{maximumFractionDigits:2});
