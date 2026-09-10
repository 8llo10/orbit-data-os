import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {Activity as ActivityIcon} from 'lucide-react';

export default async function Activity(){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const logs=await db.auditLog.findMany({where:{workspaceId:ws.id},include:{user:true},take:100,orderBy:{createdAt:'desc'}});
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><ActivityIcon size={14}/> سجل التغييرات</span><h1>كل شيء صار داخل مساحة العمل.</h1><p>سجل تشغيلي واضح للاستيراد، التغييرات، الأتمتة، والإجراءات المهمة داخل ORBIT.</p></div></header>
  <section className="activityTimeline">{logs.map(l=><article key={l.id}><i/><div className="surface timelineCard"><div className="timelineHead"><b>{human(l.action)}</b><span>{l.createdAt.toLocaleString('ar-SA')}</span></div><p>{l.entityType}{l.entityId?` · ${l.entityId.slice(0,8)}`:''} · {l.user?.email||'system'}</p></div></article>)}{!logs.length&&<div className="surface emptyState"><h2>السجل فاضي للحين.</h2><p>أول استيراد أو تعديل أو تشغيل أتمتة بيظهر هنا.</p></div>}</section>
 </div></AppShell>
}

function human(s:string){const map:Record<string,string>={IMPORT_COMPLETED:'تم تجهيز ملف',RECORD_CREATED:'تمت إضافة سجل',COLLECTION_CREATED:'تم إنشاء مجموعة بيانات',AUTOMATION_RUN:'تم تشغيل أتمتة',ASSISTANT_DASHBOARD_CREATED:'أنشأ ORBIT Dashboard',ASSISTANT_AUTOMATION_CREATED:'أنشأ ORBIT Automation',ASSISTANT_VIEW_CREATED:'أنشأ ORBIT View'};return map[s.toUpperCase()]||s.replaceAll('_',' ').toLowerCase()}
