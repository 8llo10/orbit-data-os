import type {CollectionSnapshot,Evidence,SourceRef} from '../types';

export type DynamicRecord=Record<string,unknown>&{id:string};
export type SourceFactory=(fields:string[])=>SourceRef;
export type AnalysisContext={
  message:string;
  query:string;
  collection:CollectionSnapshot;
  records:DynamicRecord[];
  source:SourceFactory;
};
export type DataAnalysis={answer:string;evidence:Evidence[];sources:SourceRef[];collectionId?:string;hasSource:boolean};
export type AnalysisStrategy=(context:AnalysisContext)=>DataAnalysis|null;
