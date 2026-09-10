import {db} from '@orbit/db';
import {AppError} from '@/server/core/errors';
import {can} from '@/server/core/permissions';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {payloadString} from './types';

export async function executeRelationAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
  const {action,workspaceId,userId,role}=context;
  if(!can(role,'data:write'))throw new AppError('FORBIDDEN',403,'ما عندك صلاحية إنشاء علاقة بين البيانات.');
  const fromCollectionId=payloadString(action,'fromCollectionId');
  const toCollectionId=payloadString(action,'toCollectionId');
  const fromFieldKey=payloadString(action,'fromFieldKey');
  const toFieldKey=payloadString(action,'toFieldKey');
  if(!fromCollectionId||!toCollectionId||!fromFieldKey||!toFieldKey)throw new AppError('INVALID_RELATION',400,'بيانات العلاقة ناقصة.');
  if(fromCollectionId===toCollectionId)throw new AppError('INVALID_RELATION',400,'لا يمكن ربط المجموعة بنفسها من هذا الإجراء.');

  const [from,to]=await Promise.all([
    db.collection.findFirst({where:{id:fromCollectionId,workspaceId},include:{fields:true}}),
    db.collection.findFirst({where:{id:toCollectionId,workspaceId},include:{fields:true}})
  ]);
  if(!from||!to)throw new AppError('SOURCE_NOT_FOUND',404,'ما لقيت أحد مصادر العلاقة داخل مساحة العمل.');
  if(!from.fields.some(f=>f.key===fromFieldKey)||!to.fields.some(f=>f.key===toFieldKey))throw new AppError('FIELD_NOT_FOUND',404,'أحد حقول الربط غير موجود في المصدر المحدد.');

  const existing=await db.collectionRelation.findFirst({where:{fromCollectionId,toCollectionId,fromFieldKey,toFieldKey}});
  if(existing)return {ok:true,message:`العلاقة بين «${from.name}» و«${to.name}» موجودة أصلًا.`,href:'/dashboard/graph',entityId:existing.id};

  const relation=await db.collectionRelation.create({data:{fromCollectionId,toCollectionId,fromFieldKey,toFieldKey,name:(payloadString(action,'name')||`${from.name} ↔ ${to.name}`).slice(0,120)}});
  await db.auditLog.create({data:{workspaceId,userId,action:'ASSISTANT_RELATION_CREATED',entityType:'CollectionRelation',entityId:relation.id,metadata:{assistantActionId:action.id,fromCollectionId,toCollectionId,fromFieldKey,toFieldKey}}});
  return {ok:true,message:`تم ربط «${from.name}.${fromFieldKey}» مع «${to.name}.${toFieldKey}».`,href:'/dashboard/graph',entityId:relation.id};
}
