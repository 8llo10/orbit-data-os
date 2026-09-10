import Papa from 'papaparse';import * as XLSX from 'xlsx';import {inferSchema,slugify} from '@orbit/core';
export async function parseUpload(file:File){const lower=file.name.toLowerCase();let rows:Record<string,unknown>[]=[];
 if(lower.endsWith('.json')){const parsed=JSON.parse(await file.text());rows=Array.isArray(parsed)?parsed:[parsed]}
 else if(lower.endsWith('.csv')||lower.endsWith('.tsv')){const parsed=Papa.parse<Record<string,unknown>>(await file.text(),{header:true,skipEmptyLines:true,dynamicTyping:true,delimiter:lower.endsWith('.tsv')?'\t':''});if(parsed.errors.length)throw new Error(parsed.errors[0].message);rows=parsed.data}
 else if(lower.endsWith('.xlsx')||lower.endsWith('.xls')){const wb=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});const sheet=wb.Sheets[wb.SheetNames[0]];rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet,{defval:null,raw:true})}
 else throw new Error('Supported formats: CSV, TSV, JSON, XLSX and XLS.');
 if(!rows.length)throw new Error('No rows found in file.');if(rows.length>10000)throw new Error('Import limit is 10,000 rows per upload.');
 const schema=inferSchema(rows);const normalized=rows.map(row=>Object.fromEntries(schema.map(f=>[f.key,normalize(row[f.label])])));return {rows:normalized,schema,name:slugify(file.name.replace(/\.[^.]+$/,''))};}
function normalize(v:unknown){if(v instanceof Date)return v.toISOString();if(typeof v==='number'&&!Number.isFinite(v))return null;if(v===undefined)return null;return v}
