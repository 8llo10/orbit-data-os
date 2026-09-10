import {detectIntent} from './intent';
import {contextualizeMessage,normalizeHistory} from './history';
import type {AssistantIntent,ChatTurn} from './types';

export type AssistantPlan={
  intent:AssistantIntent;
  originalMessage:string;
  effectiveMessage:string;
  history:ChatTurn[];
  needsDatasetQuery:boolean;
  canOfferMutation:boolean;
};

export function planAssistantRequest(message:string,history?:ChatTurn[]):AssistantPlan{
  const normalizedHistory=normalizeHistory(history);
  const effectiveMessage=contextualizeMessage(message,normalizedHistory);
  const intent=detectIntent(effectiveMessage);
  return {
    intent,
    originalMessage:message.trim(),
    effectiveMessage,
    history:normalizedHistory,
    needsDatasetQuery:!['WORKSPACE_SUMMARY','RELATIONSHIPS'].includes(intent),
    canOfferMutation:['AUTOMATION','DASHBOARD','ANALYSIS','RANKING','SEARCH'].includes(intent)
  };
}
