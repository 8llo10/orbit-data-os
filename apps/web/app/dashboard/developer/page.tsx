import Link from 'next/link';
import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {Braces,Code2,Network} from 'lucide-react';

export default async function Developer({searchParams}:{searchParams:Promise<{key?:string}>}){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const q=await searchParams;
 const [keys,hooks,collections]=await Promise.all([
  db.apiKey.findMany({where:{workspaceId:ws.id},orderBy:{createdAt:'desc'}}),
  db.webhook.findMany({where:{workspaceId:ws.id},orderBy:{createdAt:'desc'}}),
  db.collection.count({where:{workspaceId:ws.id}})
 ]);
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><Braces size={14}/> الأدوات التقنية</span><h1>استخدم ORBIT كطبقة بيانات جاهزة.</h1><p>API Keys، Webhooks، Schema Explorer، ومختبر API داخل نفس مساحة العمل. الأدوات التقنية موجودة بدون ما تطغى على الاستخدام اليومي.</p></div></header>
  <div className="serviceGrid">
   <Link className="surface serviceCard" href="/dashboard/developer/schema"><span className="productEyebrow"><Network size={13}/> Schema Explorer</span><h2>افهم هيكل بياناتك</h2><p>شوف الحقول، أنواعها، والعلاقات التقنية. عندك الآن {collections.toLocaleString('ar-SA')} مجموعة بيانات.</p><span className="textLink">فتح المخطط ←</span></Link>
   <Link className="surface serviceCard" href="/dashboard/developer/playground"><span className="productEyebrow"><Code2 size={13}/> API Playground</span><h2>جرّب الـ API مباشرة</h2><p>اختبر GET وPOST والصق API Key وشوف الـstatus والـJSON response من المتصفح.</p><span className="textLink">فتح المختبر ←</span></Link>
  </div>
  {q.key&&<div className="secretBox sectionGap"><b>انسخ المفتاح الآن — لن يظهر كاملًا مرة ثانية.</b><code>{q.key}</code></div>}
  <div className="equalCols sectionGap">
   <section className="surface panel formPanel"><div className="sectionHead"><div><small>API KEYS</small><h2>وصول برمجي</h2></div></div><p className="muted">أنشئ مفتاحًا لأي تطبيق أو سكربت يحتاج يتعامل مع بيانات ORBIT.</p><form className="inlineForm" method="post" action="/api/developer/keys"><input className="input" name="name" placeholder="مثال: تطبيق المخزون" required/><button className="btn">إنشاء مفتاح</button></form><div className="settingsList">{keys.map(k=><div className="settingLine" key={k.id}><div><b>{k.name}</b><p><code>{k.prefix}••••••••</code> · {k.lastUsedAt?`آخر استخدام ${k.lastUsedAt.toLocaleDateString('ar-SA')}`:'لم يستخدم بعد'}</p></div><form method="post" action={`/api/developer/keys/${k.id}`}><button className="dangerLink">إلغاء</button></form></div>)}</div></section>
   <section className="surface panel formPanel"><div className="sectionHead"><div><small>WEBHOOKS</small><h2>اربط أنظمتك</h2></div></div><p className="muted">خل ORBIT يرسل الأحداث إلى خدمة داخلية أو Backend ثاني.</p><form className="stack" method="post" action="/api/developer/webhooks"><input name="name" placeholder="اسم التكامل" required/><input type="url" name="url" placeholder="https://example.com/hook" required/><button>إضافة Webhook</button></form><div className="settingsList">{hooks.map(h=><div className="settingLine" key={h.id}><div><b>{h.name}</b><p>{h.url}</p></div><form method="post" action={`/api/developer/webhooks/${h.id}/toggle`}><button className={`statusToggle ${h.active?'on':''}`}>{h.active?'ACTIVE':'PAUSED'}</button></form></div>)}</div></section>
  </div>
  <section className="surface panel sectionGap"><div className="sectionHead"><div><small>REST API</small><h2>Endpoints جاهزة</h2></div></div><div className="endpointList"><div className="endpointRow"><span className="endpointMethod">GET</span><code>/api/v1/collections</code><p>استعراض مجموعات البيانات</p></div><div className="endpointRow"><span className="endpointMethod">GET</span><code>/api/v1/collections/:slug/records</code><p>قراءة السجلات مع pagination</p></div><div className="endpointRow"><span className="endpointMethod">POST</span><code>/api/v1/collections/:slug/records</code><p>إنشاء سجل وتشغيل الأتمتة المرتبطة</p></div></div><p className="muted">أرسل المفتاح في header باسم <code>x-api-key</code>.</p></section>
 </div></AppShell>
}
