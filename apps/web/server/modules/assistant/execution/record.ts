import {db} from '@orbit/db';
import {runAutomations} from '@/lib/automation';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {payloadString} from './types';

export async function executeCreateRecordAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
 const {action,workspaceId,userId,role}=context;
 if(!can(role,'data:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إضافة سجلات.');
 const collectionId=payloadString(action,'collectionId');
 const raw=action.payload?.values;
 if(!collectionId||!raw||typeof raw!=='object'||Array.isArray(raw))throw new AppError('INVALID_RECORD',400,'بيانات السجل غير صالحة.');
 const collection=await db.collection.findFirst({where:{id:collectionId,workspaceId},include:{fields:true}});
 if(!collection)throw new AppError('SOURCE_NOT_FOUND',404,'ما لقيت مجموعة البيانات المطلوبة.');
 const values=raw as Record<string,unknown>;const allowed=new Set(collection.fields.map(f=>f.key));
 const unknown=Object.keys(values).filter(k=>!allowed.has(k));
 if(unknown.length)throw new AppError('FIELD_NOT_FOUND',404,`فيه حقول غير موجودة في «${collection.name}»: ${unknown.join('، ')}.`);
 const data=Object.fromEntries(collection.fields.map(f=>[f.key,values[f.key]??null]));
 const missingRequired=collection.fields.filter(f=>f.required&&(data[f.key]===null||data[f.key]==='')).map(f=>f.label||f.key);
 if(missingRequired.length)throw new AppError('REQUIRED_FIELDS_MISSING',400,`ناقص حقول مطلوبة: ${missingRequired.join('، ')}.`);
 const record=await db.dataRecord.create({data:{collectionId,data:data as any}});
 await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_RECORD_CREATED',entityType:'DataRecord',entityId:record.id,metadata:{assistantActionId:action.id,collection:collection.slug,fields:Object.keys(values)}}});
 await runAutomations(workspaceId,{type:'RECORD_CREATED',collectionId,entityId:record.id,payload:{collection:collection.slug}});
 return {ok:true,message:`تمت إضافة سجل جديد إلى «${collection.name}».`,href:`/dashboard/collections/${collectionId}`,entityId:record.id};
}
