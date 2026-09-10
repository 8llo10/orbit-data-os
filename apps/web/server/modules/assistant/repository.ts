import {db} from '@orbit/db';
import type {WorkspaceSnapshot} from './types';
export async function loadWorkspaceSnapshot(workspaceId:string,role:string):Promise<WorkspaceSnapshot>{
 const [collections,relationCount,automationCount,importCount]=await Promise.all([
  db.collection.findMany({where:{workspaceId},orderBy:{updatedAt:'desc'},take:30,include:{fields:{orderBy:{position:'asc'}},_count:{select:{records:true}},records:{take:25,orderBy:{createdAt:'desc'},select:{data:true}}}}),
  db.collectionRelation.count({where:{fromCollection:{workspaceId}}}),db.automationRule.count({where:{workspaceId,status:'ACTIVE'}}),db.importJob.count({where:{workspaceId}})
 ]);
 const workspace=await db.workspace.findUniqueOrThrow({where:{id:workspaceId},select:{id:true,name:true}});
 return {id:workspace.id,name:workspace.name,role,collectionCount:collections.length,recordCount:collections.reduce((n,c)=>n+c._count.records,0),relationCount,automationCount,importCount,collections:collections.map(c=>({id:c.id,name:c.name,slug:c.slug,recordCount:c._count.records,fields:c.fields.map(f=>({key:f.key,label:f.label,type:f.type,required:f.required})),sampleRows:c.records.map(r=>(r.data&&typeof r.data==='object'&&!Array.isArray(r.data)?r.data:{} as Record<string,unknown>) as Record<string,unknown>)}))};
}
