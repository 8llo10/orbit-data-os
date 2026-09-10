import type {AssistantIntent} from './types';

const rules:{intent:AssistantIntent;patterns:RegExp[];weight:number}[]=[
 {intent:'DATA_QUALITY',weight:4,patterns:[/(جود|quality|ناقص|missing|مكرر|duplicate|شاذ|anomal|غلط|invalid|null)/i]},
 {intent:'AUTOMATION',weight:5,patterns:[/(أتمت|اتمت|automation|نبه|تنبيه|alert|تلقائي|trigger|webhook)/i]},
 {intent:'DASHBOARD',weight:5,patterns:[/(dashboard|داشبورد|لوحة|chart|مخطط|widget|kpi)/i]},
 {intent:'RANKING',weight:3,patterns:[/(أكثر|اكثر|أعلى|اعلى|أكبر|اكبر|top|highest|most|اقل|أقل|lowest|rank)/i]},
 {intent:'SEARCH',weight:3,patterns:[/(ابحث|دور|find|search|وين|where is)/i]},
 {intent:'WORKSPACE_SUMMARY',weight:4,patterns:[/(لخص|ملخص|summary|overview|وش عندي|ما الموجود|what do i have)/i]},
 {intent:'ANALYSIS',weight:4,patterns:[/(حلل|تحليل|قارن|compare|analy|احسب|calculate|متوسط|average|sum|مجموع|trend|اتجاه)/i]},
 {intent:'RELATIONSHIPS',weight:3,patterns:[/(اربط|علاق|relation|join|connect|foreign key|مفتاح)/i]}
];

export function detectIntent(text:string):AssistantIntent{
 const scores=new Map<AssistantIntent,number>();
 for(const rule of rules){
  let score=0;for(const pattern of rule.patterns)if(pattern.test(text))score+=rule.weight;
  if(score)scores.set(rule.intent,(scores.get(rule.intent)||0)+score);
 }
 const relational=scores.get('RELATIONSHIPS')||0;
 const analytical=(scores.get('ANALYSIS')||0)+(scores.get('RANKING')||0)+(scores.get('DATA_QUALITY')||0);
 if(relational&&analytical)scores.set('ANALYSIS',Math.max(scores.get('ANALYSIS')||0,relational+analytical+2));
 const ranked=[...scores.entries()].sort((a,b)=>b[1]-a[1]);
 return ranked[0]?.[0]||'GENERAL';
}
