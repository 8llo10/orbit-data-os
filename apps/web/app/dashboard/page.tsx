import AppShell from '@/components/AppShell';
import {activeWorkspace,requireUser} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,Database,FileSpreadsheet,LayoutDashboard,Search,Workflow} from 'lucide-react';

export default async function Dashboard(){
  let user;
  try{user=await requireUser()}catch{redirect('/login')}
  const ws=await activeWorkspace();
  if(!ws)redirect('/register');
  const [collections,records,imports,automations,latest,activity]=await Promise.all([
    db.collection.count({where:{workspaceId:ws.id}}),
    db.dataRecord.count({where:{collection:{workspaceId:ws.id}}}),
    db.importJob.count({where:{workspaceId:ws.id}}),
    db.automationRule.count({where:{workspaceId:ws.id,status:'ACTIVE'}}),
    db.collection.findMany({where:{workspaceId:ws.id},include:{_count:{select:{records:true,fields:true}}},take:6,orderBy:{updatedAt:'desc'}}),
    db.auditLog.findMany({where:{workspaceId:ws.id},take:5,orderBy:{createdAt:'desc'}})
  ]);
  const max=Math.max(1,...latest.map(c=>c._count.records));
  const firstTime=collections===0;

  return <AppShell>
    <div className="friendlyDashboard">
      <section className="welcomeHero">
        <div><span className="welcomeTag">مساحة العمل · {ws.name}</span><h1>هلا {user.name||'فيك'} 👋</h1><p>أوربت يجمع ملفاتك في مكان واحد، يرتبها لك، يوضح لك مشاكلها، ويساعدك تبحث فيها وتسوي منها لوحات وأتمتة بدون ما تكون تقني.</p></div>
        <Link className="primaryAction" href="/dashboard/imports"><FileSpreadsheet size={18}/> أضف أول ملف</Link>
      </section>

      {firstTime&&<section className="startCard"><div className="startCopy"><span>أول مرة هنا؟</span><h2>ابدأ بثلاث خطوات بس</h2><p>ما تحتاج تعرف قواعد بيانات ولا API. ارفع ملفك وأوربت يكمل الباقي معك.</p></div><div className="startSteps"><Link href="/dashboard/imports"><b>1</b><div><strong>ارفع ملفك</strong><span>Excel أو CSV أو JSON</span></div><ArrowLeft size={18}/></Link><div><b>2</b><div><strong>أوربت يفهمه</strong><span>يكتشف الأعمدة والأنواع والمشاكل تلقائيًا</span></div></div><div><b>3</b><div><strong>استخدم بياناتك</strong><span>ابحث، اعرضها، اربطها أو سوِّ لها أتمتة</span></div></div></div></section>}

      <section className="quickActions"><Link href="/dashboard/imports"><FileSpreadsheet size={22}/><div><b>أضف بيانات</b><span>ارفع ملف جديد وخله يصير جزء من نظامك</span></div></Link><Link href="/dashboard/collections"><Database size={22}/><div><b>شوف بياناتي</b><span>كل الملفات والجداول اللي أضفتها</span></div></Link><Link href="/dashboard/search"><Search size={22}/><div><b>ابحث في كل شيء</b><span>دور عن أي معلومة بدون ما تفتح كل ملف</span></div></Link><Link href="/dashboard/builder"><LayoutDashboard size={22}/><div><b>سوِّ لوحة</b><span>حوّل أرقامك ومعلوماتك إلى لوحة مرتبة</span></div></Link><Link href="/dashboard/automations"><Workflow size={22}/><div><b>خلها تشتغل لحالها</b><span>سوِّ قواعد تنفذ إجراءات تلقائيًا</span></div></Link></section>

      <section className="simpleStats"><div><span>ملفات / مجموعات بيانات</span><b>{collections}</b><small>مصادر بيانات مرتبة داخل أوربت</small></div><div><span>إجمالي السجلات</span><b>{records.toLocaleString()}</b><small>صفوف ومعلومات تقدر تبحث فيها</small></div><div><span>مرات رفع الملفات</span><b>{imports}</b><small>عمليات الاستيراد اللي تمت</small></div><div><span>أشياء تشتغل تلقائيًا</span><b>{automations}</b><small>قواعد مفعلة الآن</small></div></section>

      <section className="contentGrid">
        <article className="panel wide"><div className="panelHead"><div><span>بياناتك بشكل مبسط</span><h2>وش أكبر مجموعات البيانات عندك؟</h2></div><Link href="/dashboard/collections">فتح بياناتي ←</Link></div><div className="bigBars">{latest.map(c=><div key={c.id}><span><b>{c.name}</b><small>{c._count.records} سجل</small></span><i><em style={{width:`${Math.max(3,c._count.records/max*100)}%`}}/></i></div>)}{!latest.length&&<div className="emptyState"><Database size={28}/><b>ما عندك بيانات للحين</b><span>أضف ملف واحد، وبيظهر لك هنا ملخص واضح عنه.</span><Link href="/dashboard/imports">أضف ملف الآن</Link></div>}</div></article>

        <article className="panel side"><div className="panelHead"><div><span>آخر المستجدات</span><h2>وش صار مؤخرًا؟</h2></div></div>{activity.map(a=><div className="activityRow" key={a.id}><i/><div><b>{humanize(a.action)}</b><span>{a.createdAt.toLocaleString('ar-SA')}</span></div></div>)}{!activity.length&&<div className="smallEmpty">لسه ما صار أي نشاط. أول رفع لملف بيظهر هنا.</div>}</article>

        <article className="panel wide"><div className="panelHead"><div><span>آخر بيانات أضفتها</span><h2>ارجع لها بسرعة</h2></div></div><div className="recentGrid">{latest.map(c=><Link href={`/dashboard/collections/${c.id}`} key={c.id}><div className="collectionIcon">◈</div><b>{c.name}</b><span>{c._count.records} سجل · {c._count.fields} أعمدة</span><small>فتح البيانات ←</small></Link>)}{!latest.length&&<div className="smallEmpty">بعد ما ترفع أول ملف، بيطلع لك هنا عشان تفتحه بضغطة.</div>}</div></article>

        <article className="panel side guideCard"><span>اقتراح أوربت</span><h2>{collections?'رتّب بياناتك بشكل أوضح':'ابدأ بملف تعرفه زين'}</h2><p>{collections?'بعد ما تضيف أكثر من ملف، تقدر تربط المعلومات المتشابهة ببعض وتطلع لك صورة أشمل.':'جرّب ملف Excel بسيط تعرف محتواه، عشان تشوف كيف أوربت يرتبه ويحلله لك.'}</p><Link href={collections?'/dashboard/graph':'/dashboard/imports'}>{collections?'اربط بياناتي':'أضف ملف'} ←</Link></article>
      </section>
    </div>
    <style>{`
      .friendlyDashboard{padding:12px 0 70px}.welcomeHero{display:flex;justify-content:space-between;gap:28px;align-items:end;padding:28px 0 30px}.welcomeHero h1{font-size:42px;margin:7px 0 8px}.welcomeHero p{max-width:780px;color:var(--muted);line-height:1.9;margin:0}.welcomeTag{font-size:11px;color:#c995d7;font-weight:800}.primaryAction{display:flex;align-items:center;gap:9px;background:#d6afe0;color:#241729;padding:13px 17px;border-radius:13px;text-decoration:none;font-weight:900;white-space:nowrap}.startCard{border:1px solid var(--border);background:linear-gradient(120deg,rgba(201,149,215,.09),var(--panel));border-radius:22px;padding:24px;margin-bottom:18px}.startCopy span,.panelHead span,.guideCard>span{font-size:10px;color:#c995d7;font-weight:800}.startCopy h2{font-size:24px;margin:6px 0}.startCopy p{color:var(--muted);margin:0}.startSteps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}.startSteps>a,.startSteps>div{border:1px solid var(--border);border-radius:15px;padding:15px;display:flex;align-items:center;gap:12px;color:var(--text);text-decoration:none;background:rgba(255,255,255,.02)}.startSteps b{width:28px;height:28px;border-radius:9px;background:rgba(201,149,215,.14);display:grid;place-items:center;color:#d6afe0}.startSteps div div,.startSteps a div{display:flex;flex-direction:column;gap:3px;flex:1}.startSteps span{font-size:10px;color:var(--muted)}.quickActions{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:18px}.quickActions a{border:1px solid var(--border);background:var(--panel);border-radius:16px;padding:16px;color:var(--text);text-decoration:none;display:flex;gap:12px;align-items:flex-start;transition:.2s}.quickActions a:hover{transform:translateY(-3px);border-color:rgba(201,149,215,.45)}.quickActions b{display:block;font-size:13px}.quickActions span{display:block;color:var(--muted);font-size:10px;line-height:1.5;margin-top:4px}.simpleStats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}.simpleStats>div{border:1px solid var(--border);background:var(--panel);border-radius:16px;padding:17px}.simpleStats span{display:block;font-size:11px;color:var(--muted)}.simpleStats b{display:block;font-size:30px;margin:8px 0}.simpleStats small{color:var(--muted);font-size:9px}.contentGrid{display:grid;grid-template-columns:2fr 1fr;gap:12px}.panel{border:1px solid var(--border);background:var(--panel);border-radius:18px;padding:20px}.panelHead{display:flex;justify-content:space-between;gap:15px;align-items:start;margin-bottom:18px}.panelHead h2{font-size:20px;margin:4px 0 0}.panelHead a,.guideCard a,.emptyState a{color:#d6afe0;text-decoration:none;font-size:11px}.bigBars>div:not(.emptyState){margin:14px 0}.bigBars span{display:flex;justify-content:space-between;font-size:11px}.bigBars small{color:var(--muted)}.bigBars i{height:8px;background:rgba(255,255,255,.05);display:block;border-radius:99px;margin-top:7px}.bigBars em{display:block;height:100%;background:linear-gradient(90deg,#755481,#d6afe0);border-radius:99px}.emptyState{display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px;color:var(--muted);padding:40px 10px}.emptyState b{color:var(--text);font-size:15px}.activityRow{display:flex;gap:10px;padding:12px 0;border-bottom:1px solid var(--border)}.activityRow i{width:7px;height:7px;border-radius:50%;background:#c995d7;margin-top:6px}.activityRow div{display:flex;flex-direction:column;gap:4px}.activityRow b{font-size:11px}.activityRow span,.smallEmpty{font-size:9px;color:var(--muted)}.recentGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.recentGrid a{border:1px solid var(--border);border-radius:14px;padding:14px;color:var(--text);text-decoration:none;display:flex;flex-direction:column;gap:6px}.recentGrid span,.recentGrid small{font-size:9px;color:var(--muted)}.collectionIcon{color:#c995d7}.guideCard{background:linear-gradient(160deg,rgba(201,149,215,.12),var(--panel))}.guideCard h2{font-size:24px;margin:8px 0}.guideCard p{color:var(--muted);line-height:1.8;font-size:12px}@media(max-width:1050px){.quickActions{grid-template-columns:repeat(2,1fr)}.simpleStats{grid-template-columns:repeat(2,1fr)}.contentGrid{grid-template-columns:1fr}.startSteps{grid-template-columns:1fr}}@media(max-width:650px){.welcomeHero{align-items:stretch;flex-direction:column}.welcomeHero h1{font-size:34px}.primaryAction{justify-content:center}.quickActions,.simpleStats,.recentGrid{grid-template-columns:1fr}}
    `}</style>
  </AppShell>
}

function humanize(action:string){
  const key=action.toUpperCase();
  const map:Record<string,string>={IMPORT_COMPLETED:'تم رفع ملف وتجهيزه',RECORD_CREATED:'تمت إضافة سجل جديد',COLLECTION_CREATED:'تم إنشاء مجموعة بيانات',LOGIN:'تم تسجيل الدخول',AUTOMATION_RUN:'اشتغلت أتمتة'};
  return map[key]||action.replaceAll('_',' ').toLowerCase();
}
