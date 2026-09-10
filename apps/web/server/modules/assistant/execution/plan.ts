import {AppError} from '@/server/core/errors';
import type {AssistantAction} from '../types';
import {executeAutomationAction} from './automation';
import {executeDashboardAction} from './dashboard';
import {executeRelationAction} from './relation';
import {executeViewAction} from './view';
import type {ActionExecutionContext,ActionExecutionResult} from './types';

const executable=new Set(['create_dashboard','create_automation','create_view','create_relation']);

export async function executePlanAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
 const raw=context.action.payload?.steps;
 if(!Array.isArray(raw)||!raw.length)throw new AppError('INVALID_PLAN',400,'خطة التنفيذ فارغة.');
 if(raw.length>8)throw new AppError('PLAN_TOO_LARGE',400,'خطة التنفيذ أكبر من الحد الآمن.');
 const results:ActionExecutionResult[]=[];
 for(const value of raw){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new AppError('INVALID_PLAN_STEP',400,'فيه خطوة غير صالحة داخل الخطة.');
  const step=value as AssistantAction;
  if(!executable.has(step.type)||step.type==='execute_plan')throw new AppError('UNSUPPORTED_PLAN_STEP',400,'الخطة تحتوي إجراء غير مدعوم.');
  const child={...step,requiresConfirmation:true};
  let result:ActionExecutionResult;
  if(child.type==='create_relation')result=await executeRelationAction({...context,action:child});
  else if(child.type==='create_view')result=await executeViewAction({...context,action:child});
  else if(child.type==='create_dashboard')result=await executeDashboardAction({...context,action:child});
  else result=await executeAutomationAction({...context,action:child});
  results.push(result);
 }
 return {ok:true,message:`تم تنفيذ الخطة كاملة: ${results.map(r=>r.message).join(' ')}`,href:results.at(-1)?.href||'/dashboard',entityId:results.at(-1)?.entityId||context.action.id};
}
