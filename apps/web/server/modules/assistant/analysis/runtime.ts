import {db} from '@orbit/db';
import {resolveCollection} from '../semantic';
import type {SourceRef,WorkspaceSnapshot} from '../types';
import {analyzeFallback} from './fallback';
import {analyzeQuality} from './quality';
import {analyzeRanking} from './ranking';
import {analyzeSla} from './sla';
import type {AnalysisContext,AnalysisStrategy,DataAnalysis,DynamicRecord} from './types';

const strategies:AnalysisStrategy[]=[analyzeSla,analyzeQuality,analyzeRanking,analyzeFallback];

export async function runDeterministicAnalysis(message:string,snapshot:WorkspaceSnapshot):Promise<DataAnalysis>{
  const collection=resolveCollection(message,snapshot);
  if(!collection)return {answer:'ما لقيت مصدر داخل الملفات الحالية يثبت إجابة لهذا الطلب. إذا كنت تقصد ملفًا معيّنًا اذكر اسمه أو اسم أحد أعمدته، وأنا أبحث فيه مباشرة.',evidence:[],sources:[],hasSource:false};

  const rows=await db.dataRecord.findMany({where:{collectionId:collection.id},select:{id:true,data:true},take:20000});
  const records:DynamicRecord[]=rows.map(row=>({id:row.id,...((row.data&&typeof row.data==='object'&&!Array.isArray(row.data)?row.data:{}) as Record<string,unknown>)}));
  const source=(fields:string[]):SourceRef=>({collectionId:collection.id,collectionName:collection.name,fields:Array.from(new Set(fields)),examinedRows:records.length,totalRows:collection.recordCount,href:`/dashboard/collections/${collection.id}`});
  const context:AnalysisContext={message,query:message.toLowerCase(),collection,records,source};

  for(const strategy of strategies){const result=strategy(context);if(result)return result;}
  return {answer:'لقيت المصدر، لكن ما قدرت أبني تحليل موثوق لهذا الطلب.',evidence:[],sources:[source([])],collectionId:collection.id,hasSource:true};
}
