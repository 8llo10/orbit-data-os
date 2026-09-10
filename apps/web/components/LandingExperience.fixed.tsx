'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, Bell, Braces, Database, FileSpreadsheet, Languages, Layers3, LockKeyhole, Moon, Network, Search, ShieldCheck, Sun, UploadCloud, Workflow, Zap } from 'lucide-react';

type Lang = 'ar' | 'en';

const ar = {
  nav: ['كيف يعمل', 'المزايا', 'البنية'],
  signin: 'تسجيل الدخول', open: 'افتح مساحة العمل',
  eyebrow: 'نظام تشغيل مفتوح المصدر لبياناتك',
  title1: 'ملفاتك المبعثرة.', title2: 'نحوّلها إلى نظام يفهمها.',
  body: 'ارفع Excel وCSV وJSON. أوربت يكتشف البنية، ينظّم البيانات، يحلل جودتها، يربطها، يحولها إلى لوحات قابلة للبحث، ثم يشغّل الأتمتة عليها — بدون اشتراك ذكاء اصطناعي مدفوع.',
  cta: 'ابدأ مساحة عملك', explore: 'شوف كيف يشتغل',
  how: 'من ملف خام إلى نظام عامل', howBody: 'بدل ما تضيع بين جداول ونسخ مختلفة، أوربت يبني طبقة بيانات واحدة قابلة للتشغيل.',
  value: 'وش يفيدك أوربت فعليًا؟', valueBody: 'لو عندك بيانات مبيعات أو عملاء أو وظائف أو أصول أو عمليات، أوربت يحوّلها إلى نظام موحّد للبحث والتحليل والربط والأتمتة بدل بناء Backend وDashboard جديد لكل حالة.',
  secure: 'الباك اند جزء أساسي من المنتج', secureBody: 'Authentication وSessions وWorkspace Isolation وRBAC وValidation وImports وAnalytics وAutomations وNotifications وAudit Logging كلها Server-side ومربوطة بـ PostgreSQL.',
  footer: 'بياناتك. نظامك. قرارك.'
};

const en = {
  nav: ['How it works', 'Capabilities', 'Architecture'],
  signin: 'Sign in', open: 'Open workspace',
  eyebrow: 'OPEN-SOURCE PERSONAL DATA OPERATING SYSTEM',
  title1: 'Your scattered files.', title2: 'Turned into an operating system.',
  body: 'Upload Excel, CSV and JSON. ORBIT infers structure, profiles quality, connects datasets, turns them into searchable views and runs automations on top — without a paid AI dependency.',
  cta: 'Launch your workspace', explore: 'See how it works',
  how: 'From raw file to working system', howBody: 'Stop juggling spreadsheets and stale copies. ORBIT creates one operational data layer.',
  value: 'What does ORBIT actually do for you?', valueBody: 'For sales, jobs, customers, assets or operations, ORBIT becomes the reusable operational layer instead of rebuilding a backend and dashboard for every dataset.',
  secure: 'The backend is part of the product', secureBody: 'Authentication, sessions, workspace isolation, RBAC, validation, imports, analytics, automations, notifications and audit logging run server-side on PostgreSQL.',
  footer: 'Your data. Your system. Your orbit.'
};

const capabilities = {
  ar: [
    ['محرك الاستيراد', 'CSV وExcel وJSON إلى Collections منظمة مع استنتاج تلقائي للـ schema.'],
    ['صحة البيانات', 'Missing values وuniqueness وdistributions وملخصات رقمية بدون API مدفوع.'],
    ['البحث الشامل', 'بحث على مستوى مساحة العمل داخل جميع Collections والسجلات.'],
    ['خريطة العلاقات', 'ربط مجموعات البيانات وتحويل الملفات المنفصلة إلى نموذج مترابط.'],
    ['محرك الأتمتة', 'Triggers + Conditions + Actions + Webhooks مرتبطة بأحداث البيانات.'],
    ['واجهة المطورين', 'REST API وAPI Keys وAudit Trail وصلاحيات Workspace.']
  ],
  en: [
    ['Ingestion engine', 'Turn CSV, Excel and JSON into structured collections with inferred schemas.'],
    ['Data health', 'Missing values, uniqueness, distributions and numeric summaries with no paid API.'],
    ['Universal search', 'Search every collection and record from one workspace surface.'],
    ['Relationship graph', 'Connect datasets and evolve isolated files into a navigable model.'],
    ['Automation engine', 'Triggers, conditions, actions and webhooks for data events.'],
    ['Developer platform', 'REST API, API keys, audit trail and workspace permissions.']
  ]
};

const icons = [UploadCloud, BarChart3, Search, Network, Workflow, Braces];

export default function LandingExperience({ signedIn }: { signedIn: boolean }) {
  const [lang, setLang] = useState<Lang>('ar');
  const [light, setLight] = useState(false);
  const t = lang === 'ar' ? ar : en;
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const l = (localStorage.getItem('orbit-lang') as Lang | null) ?? 'ar';
    const isLight = localStorage.getItem('orbit-theme') === 'light';
    setLang(l); setLight(isLight);
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === 'ar' ? 'en' : 'ar';
    setLang(next); localStorage.setItem('orbit-lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleTheme = () => {
    const next = !light;
    setLight(next); localStorage.setItem('orbit-theme', next ? 'light' : 'dark');
    document.documentElement.dataset.theme = next ? 'light' : 'dark';
  };

  return (
    <main className="orbit-landing" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="orb-glow g1" /><div className="orb-glow g2" />
      <nav className="orbit-nav">
        <Link href="/" className="orbit-brand"><span className="planet"><span /></span><b>ORBIT</b><small>DATA OS</small></Link>
        <div className="nav-center"><a href="#how">{t.nav[0]}</a><a href="#caps">{t.nav[1]}</a><a href="#arch">{t.nav[2]}</a></div>
        <div className="nav-actions"><button onClick={toggleLang}><Languages size={17} />{lang === 'ar' ? 'EN' : 'ع'}</button><button onClick={toggleTheme}>{light ? <Moon size={17} /> : <Sun size={17} />}</button><Link href={signedIn ? '/dashboard' : '/login'}>{signedIn ? t.open : t.signin}</Link></div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><i />{t.eyebrow}</span>
          <h1>{t.title1}<br /><em>{t.title2}</em></h1>
          <p>{t.body}</p>
          <div className="hero-actions"><Link href={signedIn ? '/dashboard' : '/register'} className="cta">{t.cta}<Arrow size={18} /></Link><a href="#how" className="ghost">{t.explore}</a></div>
          <div className="proof"><span><ShieldCheck size={14} />Open Source</span><span><LockKeyhole size={14} />PostgreSQL</span><span><Zap size={14} />Zero paid AI</span></div>
        </div>

        <div className="product-window">
          <div className="window-top"><div className="dots"><i /><i /><i /></div><span>workspace / command-center</span><Bell size={15} /></div>
          <div className="window-body">
            <aside><b>O.</b>{[Layers3, Database, Search, Workflow, Braces].map((I, i) => <span key={i} className={i === 1 ? 'active' : ''}><I size={16} /></span>)}</aside>
            <div className="canvas">
              <div className="canvas-head"><div><small>{lang === 'ar' ? 'مساحة العمل' : 'WORKSPACE'}</small><strong>{lang === 'ar' ? 'مركز البيانات' : 'Data command center'}</strong></div><button>+ Import</button></div>
              <div className="stats"><article><small>{lang === 'ar' ? 'السجلات' : 'Records'}</small><b>12,840</b><span>+18.4%</span></article><article><small>{lang === 'ar' ? 'جودة البيانات' : 'Data health'}</small><b>96%</b><span>Healthy</span></article><article><small>{lang === 'ar' ? 'الأتمتة' : 'Automations'}</small><b>18</b><span>14 active</span></article></div>
              <div className="visual-grid"><article className="chart"><small>{lang === 'ar' ? 'تدفّق البيانات' : 'Data flow'}</small><div>{[52, 78, 61, 94, 73, 88, 66, 96, 84].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div></article><article className="health"><small>{lang === 'ar' ? 'صحة الحقول' : 'Field health'}</small>{[['customer_id', 98], ['status', 86], ['region', 72], ['revenue', 91]].map(([n, v]) => <div className="health-row" key={String(n)}><span>{n}</span><div><i style={{ width: `${v}%` }} /></div><b>{v}%</b></div>)}</article></div>
              <div className="mini-table"><div><b>{lang === 'ar' ? 'العملاء' : 'Customers'}</b><span>Filter</span><span>Sort</span><span>View</span></div>{[['GH-1042', 'Riyadh', 'Active', '42,800'], ['GH-1043', 'Jeddah', 'Review', '18,200'], ['GH-1044', 'Makkah', 'Active', '31,900']].map(r => <div key={r[0]}>{r.map((c, i) => <span key={c} className={i === 2 ? 'status' : ''}>{c}</span>)}</div>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="section"><span className="section-kicker">01 / FLOW</span><div className="section-head"><h2>{t.how}</h2><p>{t.howBody}</p></div><div className="flow">{(lang === 'ar' ? [['01', 'ارفع', 'CSV · XLSX · JSON'], ['02', 'افهم', 'Schema · Data Health'], ['03', 'شغّل', 'Views · Automations']] : [['01', 'Import', 'CSV · XLSX · JSON'], ['02', 'Understand', 'Schema · Data Health'], ['03', 'Operate', 'Views · Automations']]).map((s, i) => <article key={s[0]}><div><span>{s[0]}</span>{i < 2 && <ArrowRight size={18} />}</div><FileSpreadsheet size={25} /><h3>{s[1]}</h3><p>{s[2]}</p></article>)}</div></section>

      <section id="caps" className="section"><span className="section-kicker">02 / PLATFORM</span><div className="section-head"><h2>{lang === 'ar' ? 'منصة بيانات كاملة، مو Dashboard بس' : 'A data platform, not another dashboard'}</h2><p>{lang === 'ar' ? 'كل جزء مصمم ليشتغل على بيانات حقيقية من أول يوم.' : 'Every capability works on real records from day one.'}</p></div><div className="caps">{capabilities[lang].map((f, i) => { const I = icons[i]; return <article key={f[0]}><span className="icon"><I size={21} /></span><h3>{f[0]}</h3><p>{f[1]}</p></article>; })}</div></section>

      <section className="value"><div><span className="section-kicker">03 / VALUE</span><h2>{t.value}</h2><p>{t.valueBody}</p><div className="chips">{['CSV', 'XLSX', 'JSON', 'PostgreSQL', 'RBAC', 'API Keys', 'Audit Logs', 'Webhooks', 'Dark / Light', 'عربي / English'].map(x => <span key={x}>{x}</span>)}</div></div><div className="orbit-map"><div className="core">ORBIT<small>DATA LAYER</small></div>{['CSV', 'XLSX', 'JSON', 'API', 'SQL', 'WEBHOOK'].map((x, i) => <span key={x} className={`node n${i + 1}`}>{x}</span>)}<div className="ring r1" /><div className="ring r2" /></div></section>

      <section id="arch" className="architecture"><div><span className="section-kicker">04 / BACKEND</span><h2>{t.secure}</h2><p>{t.secureBody}</p></div><div className="stack"><span>Next.js Web</span><Arrow size={17} /><span>Server API</span><Arrow size={17} /><span>Prisma</span><Arrow size={17} /><span>PostgreSQL</span></div></section>

      <section className="final"><span className="planet big"><span /></span><h2>{t.footer}</h2><Link href={signedIn ? '/dashboard' : '/register'} className="cta">{t.cta}<Arrow size={18} /></Link></section>

      <style jsx>{`
        .orbit-landing{--bg:#0c0910;--panel:#151019;--panel2:#1d1522;--text:#f7f0f8;--muted:#a99eaf;--line:rgba(255,255,255,.09);--accent:#b883c7;--accent2:#e0b9e8;min-height:100vh;background:var(--bg);color:var(--text);position:relative;overflow:hidden;font-family:"IBM Plex Sans Arabic","Noto Kufi Arabic",Tahoma,"Segoe UI",Arial,sans-serif;transition:.3s}:global(html[data-theme='light']) .orbit-landing{--bg:#f8f3f8;--panel:#fffafd;--panel2:#f1e8f3;--text:#251d28;--muted:#756d79;--line:rgba(50,24,58,.12);--accent:#875594;--accent2:#a86fb7}.orb-glow{position:absolute;border-radius:50%;filter:blur(110px);opacity:.18;pointer-events:none}.g1{width:520px;height:520px;background:#8a4c9c;top:80px;right:-210px}.g2{width:400px;height:400px;background:#5f385f;top:760px;left:-220px}.orbit-nav{height:82px;display:flex;align-items:center;justify-content:space-between;padding:0 max(24px,5vw);border-bottom:1px solid var(--line);position:relative;z-index:10;backdrop-filter:blur(18px)}.orbit-brand{display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none}.orbit-brand b{letter-spacing:.16em}.orbit-brand small{font-size:9px;color:var(--muted);letter-spacing:.14em}.planet{width:32px;height:32px;border:1px solid var(--accent);border-radius:50%;display:grid;place-items:center;position:relative;animation:float 5s ease-in-out infinite}.planet:before{content:"";position:absolute;width:42px;height:13px;border:1px solid var(--accent);border-radius:50%;transform:rotate(-25deg)}.planet span{width:7px;height:7px;border-radius:50%;background:var(--accent2);box-shadow:0 0 24px var(--accent)}.nav-center{display:flex;gap:26px}.nav-center a{color:var(--muted);text-decoration:none;font-size:13px}.nav-actions{display:flex;gap:8px;align-items:center}.nav-actions button,.nav-actions a{height:38px;border:1px solid var(--line);background:rgba(255,255,255,.02);color:var(--text);border-radius:12px;padding:0 12px;display:flex;align-items:center;gap:6px;text-decoration:none;cursor:pointer}.nav-actions a{background:var(--text);color:var(--bg);font-weight:800}.hero{min-height:760px;display:grid;grid-template-columns:minmax(0,1fr) minmax(470px,.95fr);gap:50px;align-items:center;padding:80px max(28px,6vw) 100px;position:relative;z-index:2}.hero-copy{max-width:760px}.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid var(--line);border-radius:999px;color:var(--accent2);font-size:11px}.eyebrow i{width:6px;height:6px;border-radius:50%;background:var(--accent2);animation:pulse 2s infinite}.hero h1{font-size:clamp(48px,6vw,94px);line-height:1.02;letter-spacing:-.055em;margin:24px 0 28px}.hero h1 em{font-style:normal;color:var(--accent2);font-weight:450}.hero p{font-size:17px;line-height:1.95;color:var(--muted)}.hero-actions{display:flex;gap:10px;margin-top:34px}.cta,.ghost{height:52px;padding:0 20px;border-radius:14px;display:inline-flex;align-items:center;gap:12px;text-decoration:none;font-weight:800;font-size:14px}.cta{background:var(--accent2);color:#211625;transition:.25s}.cta:hover{transform:translateY(-2px)}.ghost{border:1px solid var(--line);color:var(--text)}.proof{display:flex;gap:16px;flex-wrap:wrap;margin-top:26px;color:var(--muted);font-size:11px}.proof span{display:flex;align-items:center;gap:6px}.product-window{border:1px solid var(--line);background:var(--panel);border-radius:24px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,.36);transform:rotateY(-3deg) rotateX(1deg);animation:stage 8s ease-in-out infinite}.window-top{height:44px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 14px;color:var(--muted);font-size:10px}.dots{display:flex;gap:5px}.dots i{width:7px;height:7px;border-radius:50%;background:var(--accent)}.window-body{display:grid;grid-template-columns:52px 1fr;min-height:490px}.window-body aside{border-inline-end:1px solid var(--line);padding:14px 8px;display:flex;flex-direction:column;align-items:center;gap:10px}.window-body aside b,.window-body aside span{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;color:var(--muted)}.window-body aside span.active{background:rgba(184,131,199,.14);color:var(--accent2)}.window-body aside b{color:var(--accent2);margin-bottom:8px}.canvas{padding:22px;min-width:0}.canvas-head{display:flex;justify-content:space-between;align-items:center}.canvas-head div{display:flex;flex-direction:column;gap:4px}.canvas-head small{font-size:9px;color:var(--muted)}.canvas-head button{border:0;background:var(--accent2);color:#211625;border-radius:9px;padding:9px 12px;font-weight:800}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:20px 0}.stats article,.chart,.health,.mini-table{border:1px solid var(--line);border-radius:13px}.stats article{padding:14px}.stats small{display:block;color:var(--muted);font-size:9px}.stats b{display:block;font-size:21px;margin:6px 0}.stats span{color:var(--accent2);font-size:9px}.visual-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.chart,.health{padding:14px}.chart>small,.health>small{font-size:9px;color:var(--muted)}.chart>div{height:120px;display:flex;align-items:flex-end;gap:6px;padding-top:15px}.chart i{flex:1;background:linear-gradient(180deg,var(--accent2),var(--accent));border-radius:4px 4px 1px 1px;animation:bars 1.2s ease both}.health-row{display:grid;grid-template-columns:70px 1fr 28px;gap:7px;align-items:center;margin-top:15px;font-size:8px}.health-row>div{height:5px;background:var(--line);border-radius:99px}.health-row i{display:block;height:100%;background:var(--accent);border-radius:99px}.mini-table{margin-top:9px;overflow:hidden}.mini-table>div{display:grid;grid-template-columns:repeat(4,1fr);padding:10px 13px;border-bottom:1px solid var(--line);font-size:8px;color:var(--muted)}.mini-table>div:first-child{display:flex;gap:12px}.mini-table>div:first-child b{margin-inline-end:auto;color:var(--text)}.status{color:var(--accent2)}.section{padding:110px max(28px,7vw);border-top:1px solid var(--line)}.section-kicker{font-size:10px;letter-spacing:.18em;color:var(--accent2);font-weight:800}.section-head{display:grid;grid-template-columns:1.1fr .8fr;gap:70px;align-items:end;margin:16px 0 48px}.section-head h2,.value h2,.architecture h2,.final h2{font-size:clamp(36px,4.2vw,66px);line-height:1.08;letter-spacing:-.04em;margin:0}.section-head p,.value p,.architecture p{color:var(--muted);line-height:1.9;margin:0}.flow,.caps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.flow article,.caps article{border:1px solid var(--line);border-radius:19px;padding:24px;background:linear-gradient(180deg,rgba(255,255,255,.025),transparent);transition:.25s}.flow article:hover,.caps article:hover{transform:translateY(-5px);border-color:var(--accent)}.flow article>div{display:flex;justify-content:space-between;color:var(--muted);font-size:11px;margin-bottom:48px}.flow h3{font-size:23px;margin:18px 0 5px}.flow p,.caps p{color:var(--muted);font-size:13px;line-height:1.75}.caps article{min-height:210px}.icon{width:46px;height:46px;display:grid;place-items:center;border-radius:13px;background:rgba(184,131,199,.12);color:var(--accent2)}.caps h3{font-size:19px;margin:28px 0 10px}.value{padding:120px max(28px,7vw);display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center;border-top:1px solid var(--line)}.value h2{margin:16px 0 24px}.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:28px}.chips span{padding:8px 11px;border:1px solid var(--line);border-radius:999px;font-size:10px;color:var(--muted)}.orbit-map{height:460px;position:relative;display:grid;place-items:center}.core{width:128px;height:128px;border-radius:50%;background:var(--panel2);border:1px solid var(--accent);display:grid;place-items:center;align-content:center;gap:4px;font-weight:900;letter-spacing:.1em;z-index:3}.core small{font-size:8px;color:var(--muted)}.ring{position:absolute;border:1px solid var(--line);border-radius:50%;animation:spin 25s linear infinite}.r1{width:280px;height:280px}.r2{width:420px;height:420px;animation-direction:reverse}.node{position:absolute;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:var(--panel);font-size:9px;z-index:4}.n1{top:15%;left:28%}.n2{top:17%;right:22%}.n3{top:48%;right:4%}.n4{bottom:12%;right:26%}.n5{bottom:14%;left:20%}.n6{top:48%;left:3%}.architecture{margin:30px max(28px,7vw) 120px;border:1px solid var(--line);border-radius:26px;padding:50px;background:linear-gradient(130deg,rgba(184,131,199,.08),var(--panel));display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.architecture h2{font-size:clamp(32px,3.4vw,54px);margin:14px 0 20px}.stack{display:flex;flex-wrap:wrap;align-items:center;gap:8px}.stack span{padding:12px 15px;background:var(--bg);border:1px solid var(--line);border-radius:10px;font-size:11px}.final{padding:120px 20px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:30px;border-top:1px solid var(--line)}.big{width:72px;height:72px}.big:before{width:96px;height:28px}@keyframes float{50%{transform:translateY(-4px)}}@keyframes stage{50%{transform:rotateY(1deg) rotateX(-1deg) translateY(-8px)}}@keyframes pulse{70%{box-shadow:0 0 0 9px transparent}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes bars{from{height:0}}@media(max-width:1000px){.nav-center{display:none}.hero{grid-template-columns:1fr}.section-head,.value,.architecture{grid-template-columns:1fr}.caps{grid-template-columns:repeat(2,1fr)}}@media(max-width:680px){.orbit-nav{padding:0 16px}.orbit-brand small,.nav-actions a{display:none}.hero{padding:52px 18px 72px;min-height:auto}.hero h1{font-size:48px}.hero p{font-size:14px}.hero-actions{flex-direction:column}.cta,.ghost{justify-content:center}.product-window{transform:none;animation:none}.window-body{grid-template-columns:40px 1fr}.canvas{padding:12px}.stats{grid-template-columns:1fr 1fr}.stats article:last-child{display:none}.visual-grid{grid-template-columns:1fr}.health{display:none}.section,.value{padding:78px 18px}.section-head{gap:14px;margin-bottom:30px}.flow,.caps{grid-template-columns:1fr}.orbit-map{height:350px;transform:scale(.82)}.architecture{margin:0 18px 70px;padding:28px 20px;gap:30px}}
      `}</style>
    </main>
  );
}
