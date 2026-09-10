import type {WorkspaceRole} from '@prisma/client';
import {dispatchAssistantAction} from './execution';
import type {AssistantAction} from './types';

export async function executeAssistantAction(input:{action:AssistantAction;workspaceId:string;userId:string;role:WorkspaceRole}){
  return dispatchAssistantAction(input);
}
