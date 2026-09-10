import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {CheckCircle2,FileSpreadsheet,Search,Sparkles,UploadCloud} from 'lucide-react';

export default async function Imports({searchParams}:{searchParams:Promise<{error?:string}>}){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const jobs=await db.importJob.findMany({where:{workspaceId:ws.id},orderBy:{createdAt:'desc'},take:20});
 const q=await searchParams;
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow">إضافة بيانات</span><h1>ارفع ملفك، والباقي على ORBIT.</h1><p>ما تحتاج تضبط قاعدة بيانات أو تعرف أنواع الأعمدة. ارفع الملف، وأوربت يقرأه ويجهزه لك عشان تبحث فيه وتحلله وتبني عليه.</p></div></header>
  {q.error&&<div className="errorBanner">{q.error}</div>}
  <section className="uploadLayout">
   <form className="surface uploadSurface" action="/api/imports" method="post" encType="multipart/form-data"><div className="uploadOrb"><UploadCloud size={28}/></div><h2>اختر ملف من جهازك</h2><p>Excel أو CSV أو JSON — حتى 10,000 صف في العملية الواحدة.</p><input name="file" type="file" accept=".csv,.tsv,.json,.xlsx,.xls" required/><button>حلل الملف وأضفه</button><small>بياناتك تبقى داخل مساحة العمل الخاصة فيك.</small></form>
   <aside className="surface stepsPanel"><h3>وش بيصير بعد الرفع؟</h3><div className="step"><Search size={18}/><span><b>1. نفهم الملف</b><small>نكتشف الأعمدة والأنواع والقيم الناقصة.</small></span></div><div className="step"><Sparkles size={18}/><span><b>2. نرتبه لك</b><small>يتحول إلى بيانات منظمة وقابلة للبحث.</small></span></div><div className="step"><CheckCircle2 size={18}/><span><b>3. يصير جاهز للاستخدام</b><small>تقدر تسأل ORBIT عنه أو تبني لوحة وأتمتة.</small></span></div></aside>
  </section>
  <section className="surface historyPanel"><div className="sectionHead"><div><small>آخر الملفات</small><h2>عمليات الرفع السابقة</h2></div><strong>{jobs.length}</strong></div>{jobs.length?jobs.map(j=><div className="jobRow" key={j.id}><span className="jobIcon"><FileSpreadsheet size={17}/></span><div><b>{j.filename}</b><small>{j.rowCount.toLocaleString('ar-SA')} صف · {j.createdAt.toLocaleString('ar-SA')}</small>{j.error&&<small className="errorText">{j.error}</small>}</div><span className={j.status==='FAILED'?'statusPill bad':'statusPill'}>{j.status==='FAILED'?'فيه مشكلة':j.status==='COMPLETED'?'جاهز':'جاري التجهيز'}</span></div>):<div className="emptyState"><h2>ما رفعت أي ملف للحين.</h2><p>أول ملف ترفعه بيظهر هنا مع حالته وعدد الصفوف.</p></div>}</section>
 </div></AppShell>
}
