export type CopilotToolName='inspect_workspace'|'inspect_collection'|'run_query'|'profile_data'|'find_relationships'|'export_csv'|'export_json'|'create_view'|'create_dashboard'|'create_automation'|'create_relation'|'execute_plan';

export type CopilotTool={name:CopilotToolName;kind:'read'|'action';description:string;requiresConfirmation:boolean};

export const copilotTools:CopilotTool[]=[
 {name:'inspect_workspace',kind:'read',description:'List collections, record counts, relations and active automations.',requiresConfirmation:false},
 {name:'inspect_collection',kind:'read',description:'Inspect one collection schema and available records.',requiresConfirmation:false},
 {name:'run_query',kind:'read',description:'Run a validated deterministic aggregate/filter query.',requiresConfirmation:false},
 {name:'profile_data',kind:'read',description:'Check missing values, suspicious duplicates and quality signals.',requiresConfirmation:false},
 {name:'find_relationships',kind:'read',description:'Inspect saved relations and safe relationship proposals.',requiresConfirmation:false},
 {name:'export_csv',kind:'read',description:'Export a collection as CSV.',requiresConfirmation:false},
 {name:'export_json',kind:'read',description:'Export a collection as JSON.',requiresConfirmation:false},
 {name:'create_view',kind:'action',description:'Create a saved data view from a source/result.',requiresConfirmation:true},
 {name:'create_dashboard',kind:'action',description:'Create a dashboard from an analysis result.',requiresConfirmation:true},
 {name:'create_automation',kind:'action',description:'Create a paused automation proposal for review.',requiresConfirmation:true},
 {name:'create_relation',kind:'action',description:'Create a validated relation between collection fields.',requiresConfirmation:true},
 {name:'execute_plan',kind:'action',description:'Execute a bounded sequence of confirmed mutations.',requiresConfirmation:true}
];

export function publicToolManifest(){return copilotTools.map(({name,kind,description,requiresConfirmation})=>({name,kind,description,requiresConfirmation}));}
