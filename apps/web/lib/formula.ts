export function computeFormula(expression:string,row:Record<string,unknown>){
 const replaced=expression.replace(/\{([a-zA-Z0-9_\-\u0600-\u06ff]+)\}/g,(_,key)=>{const v=row[key];if(typeof v==='number')return String(v);const n=Number(v);return Number.isFinite(n)?String(n):JSON.stringify(String(v??''))});
 if(!/^[\d\s+\-*/().,'"A-Za-z_\u0600-\u06ff]+$/.test(replaced))throw new Error('Unsafe formula');
 // Arithmetic-only expressions are evaluated. Text formulas support CONCAT(a,b).
 if(/^\s*CONCAT\(/i.test(replaced)){const body=replaced.replace(/^\s*CONCAT\(/i,'').replace(/\)\s*$/,'');return body.split(',').map(x=>x.trim().replace(/^['"]|['"]$/g,'')).join('')}
 if(/^[\d\s+\-*/().]+$/.test(replaced)){return Function(`"use strict";return (${replaced})`)()}
 return replaced.replace(/^['"]|['"]$/g,'');
}
