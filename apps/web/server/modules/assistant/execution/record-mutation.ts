import {db} from '@orbit/db';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {payloadString} from './types';

type Row={id:string;data:unknown};
const norm=(v:unknown)=>String(v??'').trim().toLowerCase();

async function resolveOne(context:ActionExecutionContext){
 const {action,workspaceId}=context;
 const collectionId=payloadString(action,'collectionId');
 if(!collectionId)throw new AppError('INVALID_RECORD_TARGET',400,'مصدر السجل غير محدد.');
 const collection=await db.collection.findFirst({where:{id:collectionId,workspaceId},include:{fields:true}});
 if(!collection)throw new AppError('SOURCE_NOT_FOUND',404,'ما لقيت مجموعة البيانات المطلوبة.');
 const recordId=payloadString(action,'recordId');
 if(recordId){const row=await db.dataRecord.findFirst({where:{id:recordId,collectionId}});if(!row)throw new AppError('RECORD_NOT_FOUND',404,'ما لقيت السجل المطلوب.');return {collection,row};}
 const selector=action.payload?.selector;
 if(!selector||typeof selector!=='object'||Array.isArray(selector))throw new AppError('INVALID_RECORD_TARGET',400,'حدد السجل بمعرفه أو بحقل وقيمة.');
 const field=String((selector as Record<string,unknown>).field??'').trim();
 const value=(selector as Record<string,unknown>).value;
 if(!field||!collection.fields.some(f=>f.key===field||f.label===field))throw new AppError('FIELD_NOT_FOUND',404,'حقل تحديد السجل غير موجود.');
 const key=collection.fields.find(f=>f.key===field||f.label===field)!.key;
 const rows=await db.dataRecord.findMany({where:{collectionId},select:{id:true,data:true},take:20001});
 if(rows.length>20000)throw new AppError('TARGET_TOO_LARGE',409,'المصدر كبير جدًا للتحديد الآمن بهذه الطريقة. استخدم معرف سجل أو فلتر أدق.');
 const matches=(rows as Row[]).filter(r=>{const d=r.data&&typeof r.data==='object'&&!Array.isArray(r.data)?r.data as Record<string,unknown>:{};return norm(d[key])===norm(value)});
 if(!matches.length)throw new AppError('RECORD_NOT_FOUND',404,'ما لقيت سجل يطابق الشرط المطلوب.');
 if(matches.length>1)throw new AppError('AMBIGUOUS_RECORD',409,`لقيت ${matches.length} سجلات تطابق الشرط. ما راح أعدلها بدون تحديد أدق.`);
 return {collection,row:matches[0]};
}

export async function executeUpdateRecordAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
 if(!can(context.role,'data:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية تعديل السجلات.');
 const {collection,row}=await resolveOne(context);
 const raw=context.action.payload?.values;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new AppError('INVALID_RECORD',400,'قيم التعديل غير صالحة.');
 const values=raw as Record<string,unknown>;const allowed=new Set(collection.fields.map(f=>f.key));const unknown=Object.keys(values).filter(k=>!allowed.has(k));
 if(unknown.length)throw new AppError('FIELD_NOT_FOUND',404,`فيه حقول غير موجودة: ${unknown.join('، ')}.`);
 const current=row.data&&typeof row.data==='object'&&!Array.isArray(row.data)?row.data as Record<string,unknown>:{};const next={...current,...values};
 const missing=collection.fields.filter(f=>f.required&&(next[f.key]===null||next[f.key]===undefined||next[f.key]==='')).map(f=>f.label||f.key);
 if(missing.length)throw new AppError('REQUIRED_FIELDS_MISSING',400,`التعديل يخلي حقول مطلوبة فارغة: ${missing.join('، ')}.`);
 await db.$transaction([db.dataRecord.update({where:{id:row.id},data:{data:next as any}}),db.auditLog.create({data:{workspaceId:context.workspaceId,userId:context.userId,action:'ASSISTANT_RECORD_UPDATED',entityType:'DataRecord',entityId:row.id,metadata:{assistantActionId:context.action.id,collection:collection.slug,fields:Object.keys(values)}}})]);
 return {ok:true,message:`تم تعديل السجل في «${collection.name}».`,href:`/dashboard/collections/${collection.id}`,entityId:row.id};
}

export async function executeDeleteRecordAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
 if(!can(context.role,'data:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية حذف السجلات.');
 const {collection,row}=await resolveOne(context);
 await db.$transaction([db.dataRecord.delete({where:{id:row.id}}),db.auditLog.create({data:{workspaceId:context.workspaceId,userId:context.userId,action:'ASSISTANT_RECORD_DELETED',entityType:'DataRecord',entityId:row.id,metadata:{assistantActionId:context.action.id,collection:collection.slug}}})]);
 return {ok:true,message:`تم حذف السجل من «${collection.name}».`,href:`/dashboard/collections/${collection.id}`,entityId:row.id};
}
