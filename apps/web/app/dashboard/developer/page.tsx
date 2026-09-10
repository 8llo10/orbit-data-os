import Link from 'next/link';
import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';

export default async function Developer({searchParams}:{searchParams:Promise<{key?:string}>}){
  let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
  const q=await searchParams;
  const [keys,hooks,collections]=await Promise.all([
    db.apiKey.findMany({where:{workspaceId:ws.id},orderBy:{createdAt:'desc'}}),
    db.webhook.findMany({where:{workspaceId:ws.id},orderBy:{createdAt:'desc'}}),
    db.collection.count({where:{workspaceId:ws.id}})
  ]);
  return <AppShell>
    <div className="eyebrow">TECHNICAL WORKSPACE</div>
    <h1 className="h1">أدوات المطورين والتكاملات</h1>
    <p className="lead">إذا كنت تقنيًا، استخدم ORBIT كطبقة بيانات جاهزة: APIs، مفاتيح وصول، Webhooks، فحص Schema، وتجربة مباشرة للـ endpoints بدون ما تبني كل شيء من الصفر.</p>

    <div className="developerGrid section">
      <Link className="card techService" href="/dashboard/developer/schema"><div className="eyebrow">SCHEMA EXPLORER</div><h2>افهم هيكل بياناتك</h2><p className="muted">استعرض Collections والحقول والأنواع التقنية والعلاقات. عندك الآن {collections} مجموعة بيانات.</p><span className="textLink">فتح مخطط البيانات ←</span></Link>
      <Link className="card techService" href="/dashboard/developer/playground"><div className="eyebrow">API PLAYGROUND</div><h2>جرّب الـ API من المتصفح</h2><p className="muted">اختبر GET وPOST، الصق API Key، وشاهد status والـ JSON response مباشرة.</p><span className="textLink">فتح المختبر ←</span></Link>
    </div>

    {q.key&&<div className="secretBox"><b>انسخ المفتاح الآن — لن يظهر كاملًا مرة ثانية.</b><code>{q.key}</code></div>}
    <div className="developerGrid">
      <section className="card"><div className="eyebrow">API KEYS</div><h2>وصول برمجي آمن</h2><p className="muted">أنشئ مفتاحًا لأي تطبيق أو سكربت يحتاج قراءة أو إنشاء سجلات عبر ORBIT.</p><form className="inlineForm" method="post" action="/api/developer/keys"><input className="input" name="name" placeholder="مثال: تطبيق المخزون" required/><button className="btn">إنشاء مفتاح</button></form><div className="keyList">{keys.map(k=><div className="settingRow" key={k.id}><div><b>{k.name}</b><p className="muted"><code>{k.prefix}••••••••</code> · {k.lastUsedAt?`آخر استخدام ${k.lastUsedAt.toLocaleDateString()}`:'لم يستخدم بعد'}</p></div><form method="post" action={`/api/developer/keys/${k.id}`}><button className="dangerLink">إلغاء</button></form></div>)}</div></section>
      <section className="card"><div className="eyebrow">WEBHOOKS</div><h2>خل ORBIT يرسل الأحداث لأنظمتك</h2><p className="muted">اربط Slack، خدمة داخلية، Backend ثاني، أو أي endpoint يستقبل HTTP.</p><form className="form" method="post" action="/api/developer/webhooks"><input className="input" name="name" placeholder="اسم التكامل" required/><input className="input" type="url" name="url" placeholder="https://example.com/hook" required/><button className="btn">إضافة Webhook</button></form>{hooks.map(h=><div className="settingRow" key={h.id}><div><b>{h.name}</b><p className="muted">{h.url}</p></div><form method="post" action={`/api/developer/webhooks/${h.id}/toggle`}><button className={`statusToggle ${h.active?'on':''}`}>{h.active?'ACTIVE':'PAUSED'}</button></form></div>)}</section>
    </div>

    <section className="card section"><div className="eyebrow">REST API</div><h2>Endpoints جاهزة</h2><p className="muted">استخدم ORBIT كـ backend للبيانات من أي تطبيق ويب، موبايل، سكربت أو أداة داخلية.</p><div className="endpoint"><span className="method">GET</span><code>/api/v1/collections</code><p>استعراض مجموعات البيانات</p></div><div className="endpoint"><span className="method">GET</span><code>/api/v1/collections/:slug/records</code><p>قراءة السجلات مع pagination</p></div><div className="endpoint"><span className="method">POST</span><code>/api/v1/collections/:slug/records</code><p>إنشاء سجل وتشغيل الأتمتة المرتبطة به</p></div><p className="muted">أرسل المفتاح في header باسم <code>x-api-key</code>.</p></section>

    <section className="card section"><div className="eyebrow">TECHNICAL SERVICES</div><h2>وش يعطي المطور فعليًا؟</h2><div className="collectionMiniGrid"><div><b>Headless data layer</b><span>استخدم ORBIT بدون الواجهة الأمامية.</span></div><div><b>Schema discovery</b><span>اعرف الحقول وأنواعها قبل التكامل.</span></div><div><b>Event delivery</b><span>Webhooks للأحداث والتغييرات.</span></div><div><b>Automation hooks</b><span>POST requests تشغل قواعدك تلقائيًا.</span></div><div><b>Audit trail</b><span>تتبع من فعل ماذا ومتى.</span></div><div><b>Workspace isolation</b><span>كل مساحة عمل معزولة بصلاحياتها.</span></div></div></section>
  </AppShell>
}
