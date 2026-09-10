import AppShell from '@/components/AppShell';
import AssistantSpotlight from '@/components/AssistantSpotlight';
import {activeWorkspace,requireUser} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,Database,FileSpreadsheet,LayoutDashboard,Search,Workflow} from 'lucide-react';

export default async function Dashboard(){
 let user;try{user=await requireUser()}catch{redirect('/login')}
 const ws=await activeWorkspace();if(!ws)redirect('/register');
 const [collections,records,imports,automations,latest,activity]=await Promise.all([
  db.collection.count({where:{workspaceId:ws.id}}),
  db.dataRecord.count({where:{collection:{workspaceId:ws.id}}}),
  db.importJob.count({where:{workspaceId:ws.id}}),
  db.automationRule.count({where:{workspaceId:ws.id,status:'ACTIVE'}}),
  db.collection.findMany({where:{workspaceId:ws.id},include:{_count:{select:{records:true,fields:true}}},take:5,orderBy:{updatedAt:'desc'}}),
  db.auditLog.findMany({where:{workspaceId:ws.id},take:5,orderBy:{createdAt:'desc'}})
 ]);
 const max=Math.max(1,...latest.map(c=>c._count.records));
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow">{ws.name}</span><h1>هلا {user.name||'فيك'} 👋</h1><p>كل بياناتك، تحليلاتك، لوحاتك وأتمتتك في مكان واحد. وإذا ما تعرف من وين تبدأ، اسأل ORBIT.</p></div><Link href="/dashboard/imports" className="primaryAction"><FileSpreadsheet size={17}/> أضف بيانات</Link></header>

  <AssistantSpotlight collections={collections} records={records}/>

  <section className="statGrid"><div className="surface statCard"><span>مجموعات البيانات</span><strong>{collections}</strong><small>مصادر مرتبة وقابلة للبحث</small></div><div className="surface statCard"><span>السجلات</span><strong>{records.toLocaleString('ar-SA')}</strong><small>إجمالي الصفوف والمعلومات</small></div><div className="surface statCard"><span>الملفات المستوردة</span><strong>{imports}</strong><small>عمليات تمت داخل المساحة</small></div><div className="surface statCard"><span>الأتمتة الفعالة</span><strong>{automations}</strong><small>قواعد تعمل الآن</small></div></section>

  <section className="twoCol">
   <article className="surface panel"><div className="sectionHead"><div><small>بياناتك</small><h2>وين تتركز معلوماتك؟</h2></div><Link href="/dashboard/collections">فتح الكل <ArrowLeft size={13}/></Link></div>{latest.length?<div className="progressList">{latest.map(c=><div className="progressItem" key={c.id}><div><b>{c.name}</b><small>{c._count.records.toLocaleString('ar-SA')} سجل · {c._count.fields} أعمدة</small></div><div className="progressTrack"><div className="progressFill" style={{width:`${Math.max(4,c._count.records/max*100)}%`}}/></div></div>)}</div>:<Empty title="ما عندك بيانات للحين" body="ارفع ملف Excel أو CSV أو JSON، وأوربت يرتبه ويبدأ يفهمه معك." href="/dashboard/imports" action="أضف أول ملف"/>}</article>
   <article className="surface panel"><div className="sectionHead"><div><small>آخر النشاط</small><h2>وش صار مؤخرًا؟</h2></div></div>{activity.length?<div className="activityList">{activity.map(a=><div className="activityItem" key={a.id}><span className="activityDot"/><div><b>{humanize(a.action)}</b><small>{a.createdAt.toLocaleString('ar-SA')}</small></div></div>)}</div>:<p className="muted">أول نشاط في مساحة العمل بيظهر هنا.</p>}</article>
  </section>

  <section style={{marginTop:12}} className="surface panel"><div className="sectionHead"><div><small>اختصارات</small><h2>وش تبغى تسوي الآن؟</h2></div></div><div className="quickGrid"><Action href="/dashboard/collections" icon={<Database size={19}/>} title="افتح بياناتي" text="تصفح الملفات والجداول بعد تنظيمها"/><Action href="/dashboard/search" icon={<Search size={19}/>} title="ابحث في كل شيء" text="دور عن معلومة بدون ما تفتح كل ملف"/><Action href="/dashboard/builder" icon={<LayoutDashboard size={19}/>} title="ابنِ لوحة" text="حوّل البيانات إلى مؤشرات ورسوم واضحة"/><Action href="/dashboard/automations" icon={<Workflow size={19}/>} title="شغّل خطوة تلقائيًا" text="خل أوربت ينفذ الشغل المتكرر عنك"/></div></section>
 </div></AppShell>
}

function Action({href,icon,title,text}:{href:string;icon:React.ReactNode;title:string;text:string}){return <Link className="surface quickCard" href={href}><span className="quickIcon">{icon}</span><div><b>{title}</b><small>{text}</small></div></Link>}
function Empty({title,body,href,action}:{title:string;body:string;href:string;action:string}){return <div className="emptyState"><h2>{title}</h2><p>{body}</p><Link href={href} className="textLink">{action}</Link></div>}
function humanize(action:string){const map:Record<string,string>={IMPORT_COMPLETED:'تم تجهيز ملف جديد',RECORD_CREATED:'تمت إضافة سجل',COLLECTION_CREATED:'تم إنشاء مجموعة بيانات',LOGIN:'تم تسجيل الدخول',AUTOMATION_RUN:'اشتغلت أتمتة'};return map[action.toUpperCase()]||action.replaceAll('_',' ').toLowerCase()}
