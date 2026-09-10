import {orchestrateAssistant} from './orchestrator';
import type {AssistantResult,ChatTurn,WorkspaceSnapshot} from './types';

export async function runAssistant(message:string,snapshot:WorkspaceSnapshot,history:ChatTurn[]=[]):Promise<AssistantResult>{
  return orchestrateAssistant({message,snapshot,history});
}
