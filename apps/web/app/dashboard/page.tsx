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
 return <AppShell><div className="dashboardV2">
  <header className="dashWelcome"><div><span>{ws.name}</span><h1>هلا {user.name||'فيك'} 👋</h1><p>كل بياناتك، تحليلاتك، لوحاتك وأتمتتك في مكان واحد. وإذا ما تعرف من وين تبدأ، اسأل ORBIT.</p></div><Link href="/dashboard/imports"><FileSpreadsheet size={17}/> أضف بيانات</Link></header>

  <AssistantSpotlight collections={collections} records={records}/>

  <section className="overviewRow"><div><span>مجموعات البيانات</span><b>{collections}</b><small>مصادر مرتبة وقابلة للبحث</small></div><div><span>السجلات</span><b>{records.toLocaleString('ar-SA')}</b><small>إجمالي الصفوف والمعلومات</small></div><div><span>الملفات المستوردة</span><b>{imports}</b><small>عمليات تمت داخل المساحة</small></div><div><span>الأتمتة الفعالة</span><b>{automations}</b><small>قواعد تعمل الآن</small></div></section>

  <section className="workspaceGrid">
   <article className="dashPanel dataPanel"><div className="panelTitle"><div><span>بياناتك</span><h2>وين تتركز معلوماتك؟</h2></div><Link href="/dashboard/collections">فتح الكل <ArrowLeft size={14}/></Link></div>{latest.length?<div className="distribution">{latest.map(c=><div key={c.id}><div><b>{c.name}</b><small>{c._count.records.toLocaleString('ar-SA')} سجل · {c._count.fields} أعمدة</small></div><i><em style={{width:`${Math.max(4,c._count.records/max*100)}%`}}/></i></div>)}</div>:<Empty title="ما عندك بيانات للحين" body="ارفع ملف Excel أو CSV أو JSON، وأوربت يرتبه ويبدأ يفهمه معك." href="/dashboard/imports" action="أضف أول ملف"/>}</article>
   <article className="dashPanel activityPanel"><div className="panelTitle"><div><span>آخر النشاط</span><h2>وش صار مؤخرًا؟</h2></div></div>{activity.length?activity.map(a=><div className="event" key={a.id}><i/><div><b>{humanize(a.action)}</b><small>{a.createdAt.toLocaleString('ar-SA')}</small></div></div>):<p className="mutedEmpty">أول نشاط في مساحة العمل بيظهر هنا.</p>}</article>
  </section>

  <section className="actionsSection"><div className="panelTitle"><div><span>اختصارات</span><h2>وش تبغى تسوي الآن؟</h2></div></div><div className="actionGrid"><Action href="/dashboard/collections" icon={<Database size={20}/>} title="افتح بياناتي" text="تصفح الملفات والجداول بعد تنظيمها"/><Action href="/dashboard/search" icon={<Search size={20}/>} title="ابحث في كل شيء" text="دور عن معلومة بدون ما تفتح كل ملف"/><Action href="/dashboard/builder" icon={<LayoutDashboard size={20}/>} title="ابنِ لوحة" text="حوّل البيانات إلى مؤشرات ورسوم واضحة"/><Action href="/dashboard/automations" icon={<Workflow size={20}/>} title="شغّل خطوة تلقائيًا" text="خل أوربت ينفذ الشغل المتكرر عنك"/></div></section>

  <style>{`.dashboardV2{padding:18px 0 70px}.dashWelcome{display:flex;align-items:end;justify-content:space-between;gap:26px;padding:16px 0 28px}.dashWelcome>div>span,.panelTitle span{font-size:10px;color:#c995d7;font-weight:900}.dashWelcome h1{font-size:40px;margin:7px 0}.dashWelcome p{color:var(--muted);line-height:1.8;max-width:760px;margin:0}.dashWelcome>a{display:flex;align-items:center;gap:8px;text-decoration:none;background:#d6afe0;color:#241729;padding:12px 15px;border-radius:12px;font-weight:900;font-size:11px}.overviewRow{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}.overviewRow>div,.dashPanel{border:1px solid var(--border);background:var(--panel);border-radius:17px}.overviewRow>div{padding:17px}.overviewRow span{display:block;font-size:10px;color:var(--muted)}.overviewRow b{display:block;font-size:29px;margin:8px 0}.overviewRow small{font-size:9px;color:var(--muted)}.workspaceGrid{display:grid;grid-template-columns:1.6fr .8fr;gap:12px}.dashPanel{padding:20px}.panelTitle{display:flex;align-items:start;justify-content:space-between;gap:12px;margin-bottom:18px}.panelTitle h2{font-size:19px;margin:4px 0 0}.panelTitle a{display:flex;align-items:center;gap:6px;color:#d6afe0;text-decoration:none;font-size:10px}.distribution>div{display:grid;grid-template-columns:190px 1fr;align-items:center;gap:15px;margin:15px 0}.distribution>div>div{display:flex;flex-direction:column;gap:3px}.distribution b{font-size:11px}.distribution small{font-size:9px;color:var(--muted)}.distribution i{height:8px;background:rgba(255,255,255,.05);border-radius:99px;overflow:hidden}.distribution em{display:block;height:100%;background:linear-gradient(90deg,#76517f,#d6afe0);border-radius:99px}.event{display:flex;gap:9px;padding:11px 0;border-bottom:1px solid var(--border)}.event>i{width:7px;height:7px;border-radius:50%;background:#c995d7;margin-top:5px}.event>div{display:flex;flex-direction:column;gap:4px}.event b{font-size:10px}.event small,.mutedEmpty{font-size:9px;color:var(--muted)}.actionsSection{margin-top:12px;border:1px solid var(--border);background:var(--panel);border-radius:18px;padding:20px}.actionGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.actionCard{border:1px solid var(--border);border-radius:14px;padding:15px;color:var(--text);text-decoration:none;display:flex;gap:11px;transition:.2s}.actionCard:hover{transform:translateY(-3px);border-color:rgba(201,149,215,.4)}.actionCard>span{width:38px;height:38px;border-radius:11px;background:rgba(201,149,215,.11);color:#d6afe0;display:grid;place-items:center;flex:0 0 auto}.actionCard b{display:block;font-size:11px}.actionCard small{display:block;font-size:9px;color:var(--muted);line-height:1.55;margin-top:4px}.emptyBox{text-align:center;padding:34px 10px;color:var(--muted)}.emptyBox b{display:block;color:var(--text);font-size:14px}.emptyBox p{font-size:10px}.emptyBox a{color:#d6afe0;text-decoration:none;font-size:10px}@media(max-width:980px){.overviewRow{grid-template-columns:1fr 1fr}.workspaceGrid{grid-template-columns:1fr}.actionGrid{grid-template-columns:1fr 1fr}}@media(max-width:650px){.dashWelcome{align-items:stretch;flex-direction:column}.dashWelcome h1{font-size:34px}.overviewRow,.actionGrid{grid-template-columns:1fr}.distribution>div{grid-template-columns:1fr;gap:6px}}`}</style>
 </div></AppShell>
}

function Action({href,icon,title,text}:{href:string;icon:React.ReactNode;title:string;text:string}){return <Link className="actionCard" href={href}><span>{icon}</span><div><b>{title}</b><small>{text}</small></div></Link>}
function Empty({title,body,href,action}:{title:string;body:string;href:string;action:string}){return <div className="emptyBox"><b>{title}</b><p>{body}</p><Link href={href}>{action}</Link></div>}
function humanize(action:string){const map:Record<string,string>={IMPORT_COMPLETED:'تم تجهيز ملف جديد',RECORD_CREATED:'تمت إضافة سجل',COLLECTION_CREATED:'تم إنشاء مجموعة بيانات',LOGIN:'تم تسجيل الدخول',AUTOMATION_RUN:'اشتغلت أتمتة'};return map[action.toUpperCase()]||action.replaceAll('_',' ').toLowerCase()}
