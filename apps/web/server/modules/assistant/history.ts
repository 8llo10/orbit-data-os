import type {ChatTurn} from './types';

const followUp=/^(طيب|تمام|زين|اوكي|وكمان|وبرضو|نفس|هذا|هذي|ذا|ذي|هم|هو|هي|سوها|نفذها|اعلى|أعلى|اكثر|أكثر|قارن|حلل|ليش|كيف|وش)/i;

export function normalizeHistory(history:ChatTurn[]|undefined,max=12):ChatTurn[]{
  if(!Array.isArray(history))return [];
  return history.filter(x=>x&&(x.role==='user'||x.role==='assistant')&&typeof x.content==='string'&&x.content.trim()).slice(-max).map(x=>({role:x.role,content:x.content.trim().slice(0,1800)}));
}

export function contextualizeMessage(message:string,history:ChatTurn[]){
  const clean=message.trim();
  if(!history.length)return clean;
  const isFollowUp=clean.length<90||followUp.test(clean);
  if(!isFollowUp)return clean;
  const recent=history.slice(-4).map(x=>`${x.role==='user'?'USER':'ORBIT'}: ${x.content}`).join('\n');
  return `${clean}\n\nRECENT CONVERSATION CONTEXT:\n${recent}`;
}
