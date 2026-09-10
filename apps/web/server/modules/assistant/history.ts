import type {ChatTurn} from './types';

const referentialFollowUp=/^(طيب|تمام|زين|اوكي|وكمان|وبرضو|نفس|هذا|هذي|ذا|ذي|هم|هو|هي|سوها|نفذها|الثاني|الاول|الأول|اعلى|أعلى|اكثر|أكثر|قارنهم|حللها|ليش|كيف كذا)/i;
const explicitStandalone=/(لخص|ملخص|summary|overview|وش الملفات|ايش الملفات|ما هي الملفات|الملفات الموجودة|حلل جودة|جودة البيانات|quality|اربط|join|relationship|automation|أتمت|اتمت|dashboard|داشبورد|ابحث|search|أي موقع|اي موقع|وش أعلى|وش اعلى|أعلى تكلفة|اعلى تكلفة)/i;

export function normalizeHistory(history:ChatTurn[]|undefined,max=12):ChatTurn[]{
  if(!Array.isArray(history))return [];
  return history
    .filter(x=>x&&(x.role==='user'||x.role==='assistant')&&typeof x.content==='string'&&x.content.trim())
    .slice(-max)
    .map(x=>({role:x.role,content:x.content.trim().slice(0,1800)}));
}

export function contextualizeMessage(message:string,history:ChatTurn[]){
  const clean=message.trim();
  if(!history.length||explicitStandalone.test(clean))return clean;
  const isFollowUp=referentialFollowUp.test(clean)||(clean.length<45&&/^(و|طيب|بعدها|بعده|بعد كذا|كمان|برضو)/i.test(clean));
  if(!isFollowUp)return clean;
  const recent=history.slice(-4).map(x=>`${x.role==='user'?'USER':'ORBIT'}: ${x.content}`).join('\n');
  return `${clean}\n\nRECENT CONVERSATION CONTEXT:\n${recent}`;
}
