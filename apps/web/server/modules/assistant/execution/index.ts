import {AppError} from '@/server/core/errors';
import {executeAutomationAction} from './automation';
import {executeDashboardAction} from './dashboard';
import {executeRelationAction} from './relation';
import type {ActionExecutionContext,ActionExecutionResult} from './types';
import {executeViewAction} from './view';

export async function dispatchAssistantAction(context:ActionExecutionContext):Promise<ActionExecutionResult>{
  if(!context.action.requiresConfirmation)throw new AppError('ACTION_NOT_EXECUTABLE',400,'هذا الإجراء لا يحتاج تنفيذ من الخادم.');
  switch(context.action.type){
    case 'create_dashboard':return executeDashboardAction(context);
    case 'create_automation':return executeAutomationAction(context);
    case 'create_view':return executeViewAction(context);
    case 'create_relation':return executeRelationAction(context);
    default:throw new AppError('UNSUPPORTED_ACTION',400,'الإجراء المطلوب غير مدعوم للتنفيذ.');
  }
}
