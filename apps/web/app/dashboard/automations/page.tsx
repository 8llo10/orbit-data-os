import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {ArrowLeft,PlayCircle,Sparkles,Workflow} from 'lucide-react';

export default async function Automations(){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const [rules,collections]=await Promise.all([db.automationRule.findMany({where:{workspaceId:ws.id},orderBy:{updatedAt:'desc'}}),db.collection.findMany({where:{workspaceId:ws.id},select:{id:true,name:true}})]);
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><Workflow size={14}/> الأتمتة</span><h1>خل الشغل المتكرر يصير لحاله.</h1><p>حدد الحدث، المصدر، والإجراء. ORBIT يحفظ القاعدة ويشغلها على السيرفر بدون ما تحتاج تكتب كود.</p></div></header>
  <div className="equalCols">
   <form method="post" action="/api/automations" className="surface panel formPanel"><div className="sectionHead"><div><small><Sparkles size={11}/> قاعدة جديدة</small><h2>لما يصير كذا → سوِّ كذا</h2></div></div><label>اسم القاعدة<input name="name" required placeholder="مثال: سجّل أي سجل جديد"/></label><label>مصدر البيانات<select name="collectionId" required>{collections.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><div className="logicGrid"><div className="logicNode"><span>لما</span><select name="trigger"><option value="RECORD_CREATED">ينضاف سجل جديد</option><option value="IMPORT_COMPLETED">يكتمل رفع ملف</option></select></div><ArrowLeft size={18}/><div className="logicNode"><span>سوِّ</span><select name="action"><option value="AUDIT_LOG">سجل الحدث في النشاط</option><option value="WEBHOOK">أرسل الحدث لنظام ثاني</option></select></div></div><button disabled={!collections.length}><PlayCircle size={15}/> أنشئ القاعدة</button>{!collections.length&&<p className="muted">أضف بيانات أولًا عشان تبني عليها أتمتة.</p>}</form>
   <section className="surface panel"><div className="sectionHead"><div><small>القواعد الحالية</small><h2>{rules.length} قاعدة</h2></div><Workflow size={18}/></div><div className="ruleList">{rules.map(r=>{const t=r.trigger as Record<string,unknown>;const a=Array.isArray(r.actions)?r.actions as Record<string,unknown>[]:[];return <article className="surface ruleCard" key={r.id}><div className="ruleHead"><b>{r.name}</b><form method="post" action={`/api/automations/${r.id}/toggle`}><button className={`statusToggle ${r.status==='ACTIVE'?'on':''}`}>{r.status==='ACTIVE'?'شغالة':'متوقفة'}</button></form></div><div className="ruleFlow"><span>لما: {triggerLabel(String(t.type||''))}</span><i>→</i><span>سوِّ: {actionLabel(String(a[0]?.type||''))}</span></div><small className="muted">{r.runCount} مرات تنفيذ {r.lastRunAt?`· آخر مرة ${r.lastRunAt.toLocaleDateString('ar-SA')}`:'· ما اشتغلت للحين'}</small></article>})}{!rules.length&&<div className="emptyState"><h2>ما عندك أتمتة للحين.</h2><p>أنشئ أول قاعدة من النموذج اللي جنبك.</p></div>}</div></section>
  </div>
 </div></AppShell>
}
function triggerLabel(v:string){return v==='RECORD_CREATED'?'ينضاف سجل جديد':v==='IMPORT_COMPLETED'?'يكتمل رفع ملف':v||'حدث'}
function actionLabel(v:string){return v==='AUDIT_LOG'?'سجل الحدث':v==='WEBHOOK'?'أرسل Webhook':v||'إجراء'}
