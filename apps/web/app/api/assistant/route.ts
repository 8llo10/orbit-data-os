import {NextResponse} from 'next/server';
import {activeWorkspace,requireUser} from '@/lib/auth';
import {db} from '@orbit/db';

type Action={label:string;href:string};

export async function POST(req:Request){
 try{
  await requireUser();
  const ws=await activeWorkspace();if(!ws)return NextResponse.json({error:'ما لقينا مساحة العمل.'},{status:404});
  const body=await req.json().catch(()=>({}));const message=String(body.message||'').trim();
  if(!message)return NextResponse.json({error:'اكتب سؤالك أولًا.'},{status:400});
  const [collections,totalRecords,imports,automations,relations]=await Promise.all([
   db.collection.findMany({where:{workspaceId:ws.id},include:{fields:true,_count:{select:{records:true}}},orderBy:{updatedAt:'desc'},take:20}),
   db.dataRecord.count({where:{collection:{workspaceId:ws.id}}}),
   db.importJob.count({where:{workspaceId:ws.id}}),
   db.automationRule.count({where:{workspaceId:ws.id,status:'ACTIVE'}}),
   db.collectionRelation.count({where:{workspaceId:ws.id}})
  ]);
  const context={workspace:ws.name,collectionCount:collections.length,totalRecords,imports,automations,relations,collections:collections.map(c=>({name:c.name,records:c._count.records,fields:c.fields.map(f=>({name:f.name,label:f.label,type:f.type,required:f.required}))}))};
  const local=answerLocally(message,context);
  // Optional provider layer: set AI_API_URL, AI_API_KEY and AI_MODEL to any OpenAI-compatible endpoint.
  if(process.env.AI_API_URL&&process.env.AI_API_KEY&&process.env.AI_MODEL){
   try{
    const r=await fetch(process.env.AI_API_URL,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${process.env.AI_API_KEY}`},body:JSON.stringify({model:process.env.AI_MODEL,temperature:0.2,messages:[{role:'system',content:`You are ORBIT Assistant. Answer in Arabic unless the user writes English. You must only use the supplied workspace facts for factual claims. Never invent counts or rows. If the user asks to change data, explain the intended action but do not claim it was executed. Workspace facts: ${JSON.stringify(context)}`},{role:'user',content:message}]})});
    if(r.ok){const data=await r.json();const content=data?.choices?.[0]?.message?.content;if(content)return NextResponse.json({answer:String(content),facts:local.facts,actions:local.actions,mode:'ai-grounded'});}
   }catch{}
  }
  return NextResponse.json({...local,mode:'data-intelligence'});
 }catch{return NextResponse.json({error:'جلسة الدخول انتهت أو تعذر الوصول للبيانات.'},{status:401})}
}

function answerLocally(message:string,ctx:{workspace:string;collectionCount:number;totalRecords:number;imports:number;automations:number;relations:number;collections:{name:string;records:number;fields:{name:string;label:string;type:string;required:boolean}[]}[]}){
 const q=message.toLowerCase();const largest=[...ctx.collections].sort((a,b)=>b.records-a.records)[0];
 const facts=[`${ctx.collectionCount} مجموعات بيانات`,`${ctx.totalRecords.toLocaleString('ar-SA')} سجل`,`${ctx.relations} علاقات`,`${ctx.automations} أتمتة فعالة`];
 let answer='أقدر أساعدك أفهم وش موجود في مساحة العمل وأقترح لك الخطوة التالية بناءً على بياناتك الحالية.';let actions:Action[]=[{label:'فتح بياناتي',href:'/dashboard/collections'},{label:'إنشاء لوحة',href:'/dashboard/builder'}];
 if(ctx.collectionCount===0){answer='مساحة العمل فاضية حاليًا. ارفع Excel أو CSV أو JSON أولًا، وبعدها أقدر ألخص لك البيانات وأقارن المجموعات وأقترح لوحات وأتمتة عليها.';actions=[{label:'أضف أول ملف',href:'/dashboard/imports'}];}
 else if(q.includes('لخص')||q.includes('ملخص')||q.includes('summar')){answer=`عندك ${ctx.collectionCount} مجموعات بيانات بإجمالي ${ctx.totalRecords.toLocaleString('ar-SA')} سجل. ${largest?`أكبر مجموعة حاليًا هي «${largest.name}» وفيها ${largest.records.toLocaleString('ar-SA')} سجل.`:''} عندك أيضًا ${ctx.relations} علاقات بين البيانات و${ctx.automations} أتمتة فعالة.`;}
 else if(q.includes('أكبر')||q.includes('اكثر')||q.includes('أكثر')||q.includes('largest')){answer=largest?`أكبر مجموعة بيانات عندك هي «${largest.name}» وفيها ${largest.records.toLocaleString('ar-SA')} سجل و${largest.fields.length} حقول. هذا يجعلها مرشح ممتاز تبدأ منها بلوحة أو تحليل أعمق.`:'ما عندك مجموعات بيانات للحين.';actions=largest?[{label:`فتح ${largest.name}`,href:'/dashboard/collections'},{label:'سوِّ لوحة',href:'/dashboard/builder'}]:[{label:'أضف بيانات',href:'/dashboard/imports'}];}
 else if(q.includes('انتبه')||q.includes('مشك')||q.includes('جودة')||q.includes('quality')){const weak=ctx.collections.find(c=>c.fields.some(f=>!f.required));answer=weak?`أول شيء يستاهل المراجعة هو جودة الحقول في «${weak.name}». عندها حقول غير إلزامية، فالأفضل تراجع القيم الناقصة والتكرار قبل ما تعتمد عليها في تقارير أو أتمتة. بعد ذلك راجع العلاقات: عندك ${ctx.relations} روابط معرفة حاليًا.`:`بياناتك منظمة من ناحية البنية الأساسية. الخطوة التالية الأفضل هي فتح ملف صحة البيانات ومراجعة القيم الناقصة والتكرار قبل بناء قرارات عليها.`;actions=[{label:'راجع بياناتي',href:'/dashboard/collections'},{label:'اربط البيانات',href:'/dashboard/graph'}];}
 else if(q.includes('استفيد')||q.includes('وش اسوي')||q.includes('what can')){answer=`بناءً على الموجود عندك، تقدر تبدأ بثلاثة أشياء: لوحة تلخص ${ctx.totalRecords.toLocaleString('ar-SA')} سجل، بحث موحد بين ${ctx.collectionCount} مجموعات، ثم أتمتة للخطوات المتكررة. ${ctx.relations===0&&ctx.collectionCount>1?'وعندك أكثر من مجموعة بدون علاقات معرفة؛ ربطها ممكن يعطيك صورة أشمل.':''}`;actions=[{label:'ابنِ لوحة',href:'/dashboard/builder'},{label:'شغّل تلقائيًا',href:'/dashboard/automations'},{label:'اربط البيانات',href:'/dashboard/graph'}];}
 return {answer,facts,actions};
}
