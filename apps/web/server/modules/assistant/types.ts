export type AssistantIntent='WORKSPACE_SUMMARY'|'DATA_QUALITY'|'RANKING'|'ANALYSIS'|'RELATIONSHIPS'|'AUTOMATION'|'DASHBOARD'|'SEARCH'|'GENERAL';

export type ChatTurn={role:'user'|'assistant';content:string};

export type SourceRef={
  collectionId:string;
  collectionName:string;
  fields:string[];
  examinedRows:number;
  totalRows:number;
  href:string;
};

export type Evidence={
  kind:'metric'|'collection'|'field'|'sample'|'warning';
  label:string;
  value:string;
  collectionId?:string;
  source?:SourceRef;
};

export type AssistantAction={
  id:string;
  type:'navigate'|'create_dashboard'|'create_automation'|'create_view'|'inspect_collection';
  label:string;
  href?:string;
  requiresConfirmation:boolean;
  payload?:Record<string,unknown>;
};

export type AssistantResult={
  answer:string;
  intent:AssistantIntent;
  confidence:number;
  evidence:Evidence[];
  sources:SourceRef[];
  actions:AssistantAction[];
  followUps:string[];
  mode:'deterministic'|'ai-orchestrated';
  requestId:string;
};

export type FieldSnapshot={key:string;label:string;type:string;required:boolean};
export type CollectionSnapshot={id:string;name:string;slug:string;recordCount:number;fields:FieldSnapshot[];sampleRows:Record<string,unknown>[]};
export type WorkspaceSnapshot={id:string;name:string;role:string;collectionCount:number;recordCount:number;relationCount:number;automationCount:number;importCount:number;collections:CollectionSnapshot[]};

export type AssistantRunInput={
  message:string;
  snapshot:WorkspaceSnapshot;
  history?:ChatTurn[];
};
