import {db} from '@orbit/db';
import {slugify} from '@orbit/core';
import {computeFormula} from '@/lib/formula';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {payloadString} from './types';

const refs=(expression:string)=>Array.from(expression.matchAll(/\{([a-zA-Z0-9_\-\u0600-\u06ff]+)\}/g)).map(x=>x[1]);

export async function executeFormulaAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
 const {action,workspaceId,userId,role}=context;
 if(!can(role,'data:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية تعديل البيانات.');
 const collectionId=payloadString(action,'collectionId');
 const label=payloadString(action,'label').trim().slice(0,120);
 const formula=payloadString(action,'formula').trim().slice(0,500);
 if(!collectionId||!label||!formula)throw new AppError('INVALID_FORMULA',400,'اسم الحقل أو المعادلة ناقصة.');
 const collection=await db.collection.findFirst({where:{id:collectionId,workspaceId},include:{fields:true,records:true}});
 if(!collection)throw new AppError('SOURCE_NOT_FOUND',404,'ما لقيت مجموعة البيانات المطلوبة.');
 const available=new Set(collection.fields.map(f=>f.key));
 const missing=refs(formula).filter(key=>!available.has(key));
 if(missing.length)throw new AppError('FIELD_NOT_FOUND',404,`المعادلة تشير لحقول غير موجودة: ${missing.join('، ')}.`);
 let key=slugify(label).replace(/-/g,'_')||'formula';let n=1;const existing=new Set(collection.fields.map(f=>f.key));while(existing.has(key))key=`${slugify(label).replace(/-/g,'_')||'formula'}_${n++}`;
 try{computeFormula(formula,Object.fromEntries(collection.fields.map(f=>[f.key,1])))}catch{throw new AppError('INVALID_FORMULA',400,'المعادلة غير صالحة أو تحتوي صياغة غير مدعومة.');}
 const updates=collection.records.map(record=>{const row=record.data&&typeof record.data==='object'&&!Array.isArray(record.data)?record.data as Record<string,unknown>:{};let value:unknown=null;try{value=computeFormula(formula,row)}catch{}return {id:record.id,data:JSON.parse(JSON.stringify({...row,[key]:value}))};});
 await db.collectionField.create({data:{collectionId,key,label,type:'TEXT',formula,position:collection.fields.length}});
 try{
  for(let i=0;i<updates.length;i+=50){const batch=updates.slice(i,i+50);await db.$transaction(batch.map(item=>db.dataRecord.update({where:{id:item.id},data:{data:item.data}})));}
  await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_FORMULA_FIELD_CREATED',entityType:'Collection',entityId:collectionId,metadata:{assistantActionId:action.id,label,key,formula,updatedRecords:collection.records.length}}});
 }catch(error){
  await db.collectionField.deleteMany({where:{collectionId,key}}).catch(()=>{});
  throw new AppError('FORMULA_EXECUTION_FAILED',500,'بدأت العملية لكن تعذر إكمال حساب الحقل، فتراجعت عن إنشاء تعريف الحقل حتى ما يظل النظام بحالة ناقصة.');
 }
 return {ok:true,message:`تم إنشاء الحقل «${label}» وحسابه على ${collection.records.length.toLocaleString('ar-SA')} سجل في «${collection.name}».`,href:`/dashboard/collections/${collectionId}`,entityId:collectionId};
}
