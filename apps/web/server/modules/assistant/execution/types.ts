import type {WorkspaceRole} from '@prisma/client';
import type {AssistantAction} from '../types';

export type ActionExecutionContext={
  action:AssistantAction;
  workspaceId:string;
  userId:string;
  role:WorkspaceRole;
};

export type ActionExecutionResult={
  ok:true;
  message:string;
  href:string;
  entityId:string;
};

export const payloadString=(action:AssistantAction,key:string)=>typeof action.payload?.[key]==='string'?String(action.payload[key]):'';
