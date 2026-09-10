'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,BarChart3,Bell,Braces,Database,FileSpreadsheet,Languages,Layers3,LockKeyhole,Moon,Network,Search,ShieldCheck,Sun,UploadCloud,Workflow,Zap} from 'lucide-react';

type Lang='ar'|'en';

const copy={
 ar:{
  nav:['كيف يعمل','المزايا','البنية'],signin:'تسجيل الدخول',open:'افتح مساحة العمل',
  eyebrow:'نظام تشغيل لبياناتك',title1:'ملفاتك المبعثرة.',title2:'نحوّلها إلى نظام يفهمها.',
  body:'ارفع Excel وCSV وJSON. ORBIT يفهم البنية، يرتب البيانات، يحلل جودتها، يربطها، ويحوّلها إلى مساحة تشغيل تقدر تسألها وتبني عليها لوحات وأتمتة.',
  cta:'ابدأ مساحة عملك',explore:'شوف كيف يشتغل',how:'من ملف خام إلى نظام عامل',howBody:'بدل التنقل بين جداول ونسخ مختلفة، ORBIT يبني طبقة بيانات واحدة قابلة للبحث والتحليل والتشغيل.',
  value:'بياناتك تتحول إلى مساحة عمل.',valueBody:'ملفات موظفين أو أصول أو صيانة أو مبيعات؟ نفس ORBIT يفهم المجال ويبني لك الأدوات المناسبة فوق البيانات بدل تبدأ نظام جديد من الصفر.',
  secure:'قوي من الداخل، بسيط من الخارج.',secureBody:'Authentication وSessions وWorkspace Isolation وRBAC وImports وAnalytics وAutomations وREST API وAudit Logging كلها جزء من المنصة.',
  footer:'بياناتك. نظامك. قرارك.'
 },
 en:{
  nav:['How it works','Capabilities','Architecture'],signin:'Sign in',open:'Open workspace',
  eyebrow:'PERSONAL DATA OPERATING SYSTEM',title1:'Your scattered files.',title2:'Turned into a working system.',
  body:'Upload Excel, CSV and JSON. ORBIT understands structure, organizes records, profiles quality, connects sources, and turns your data into an operational workspace you can query and automate.',
  cta:'Launch your workspace',explore:'See how it works',how:'From raw file to working system',howBody:'Stop jumping between spreadsheets and stale copies. ORBIT creates one searchable, analytical and operational data layer.',
  value:'Your data becomes a workspace.',valueBody:'Employees, assets, maintenance or sales: ORBIT adapts the workspace to the data instead of making you rebuild a new system for every use case.',
  secure:'Powerful inside. Simple outside.',secureBody:'Authentication, sessions, workspace isolation, RBAC, imports, analytics, automations, REST APIs and audit logging are built into the platform.',
  footer:'Your data. Your system. Your orbit.'
 }
};

const capabilities={
 ar:[['محرك الاستيراد','CSV وExcel وJSON إلى بيانات منظمة مع استنتاج تلقائي للبنية.'],['صحة البيانات','اكتشاف القيم الناقصة والتكرار والتوزيعات والمؤشرات الأساسية.'],['ORBIT Copilot','اسأل ملفاتك، شوف المصدر المستخدم، وحوّل الإجابة إلى إجراء.'],['خريطة العلاقات','اربط المجموعات وحوّل الملفات المنفصلة إلى نموذج مترابط.'],['محرك الأتمتة','Triggers وActions وWebhooks فوق أحداث البيانات.'],['واجهة المطورين','REST API وAPI Keys وSchema Explorer وAudit Trail.']],
 en:[['Ingestion engine','Turn CSV, Excel and JSON into structured collections with inferred schemas.'],['Data health','Detect missing values, duplicates, distributions and key quality signals.'],['ORBIT Copilot','Ask your files, inspect the source, and turn answers into actions.'],['Relationship graph','Connect collections and evolve isolated files into one model.'],['Automation engine','Triggers, actions and webhooks built on data events.'],['Developer platform','REST APIs, API keys, schema explorer and audit trail.']]
};

const icons=[UploadCloud,BarChart3,Zap,Network,Workflow,Braces];
const chartHeights=[52,78,61,94,73,88,66,96,84];
const healthRows:[string,number][]=[['asset_id',98],['status',86],['location',92],['cost',81]];

export default function LandingExperience({signedIn}:{signedIn:boolean}){
 const [lang,setLang]=useState<Lang>('ar');
 const [light,setLight]=useState(false);
 const t=copy[lang];
 const Arrow=lang==='ar'?ArrowLeft:ArrowRight;

 useEffect(()=>{
  const savedLang=(localStorage.getItem('orbit-lang') as Lang|null)??'ar';
  const savedTheme=localStorage.getItem('orbit-theme');
  const useLight=savedTheme?savedTheme==='light':!matchMedia('(prefers-color-scheme: dark)').matches;
  setLang(savedLang);setLight(useLight);
  document.documentElement.lang=savedLang;document.documentElement.dir=savedLang==='ar'?'rtl':'ltr';document.documentElement.dataset.theme=useLight?'light':'dark';
 },[]);

 function toggleLang(){const next:Lang=lang==='ar'?'en':'ar';setLang(next);localStorage.setItem('orbit-lang',next);document.documentElement.lang=next;document.documentElement.dir=next==='ar'?'rtl':'ltr'}
 function toggleTheme(){const next=!light;setLight(next);localStorage.setItem('orbit-theme',next?'light':'dark');document.documentElement.dataset.theme=next?'light':'dark'}

 return <main className="orbitLanding" dir={lang==='ar'?'rtl':'ltr'}>
  <nav className="landingNav">
   <Link href="/" className="landingBrand"><span className="landingBrandMark"><Layers3 size={16}/></span><span><b>ORBIT</b><small>DATA OS</small></span></Link>
   <div className="landingNavLinks"><a href="#how">{t.nav[0]}</a><a href="#caps">{t.nav[1]}</a><a href="#arch">{t.nav[2]}</a></div>
   <div className="landingNavActions"><button onClick={toggleLang}><Languages size={15}/>{lang==='ar'?'EN':'ع'}</button><button onClick={toggleTheme} aria-label="Toggle theme">{light?<Moon size={15}/>:<Sun size={15}/>}</button><Link className="landingPrimary" href={signedIn?'/dashboard':'/login'}>{signedIn?t.open:t.signin}</Link></div>
  </nav>

  <section className="landingHero">
   <div className="landingHeroCopy">
    <span className="landingKicker"><i/>{t.eyebrow}</span>
    <h1>{t.title1}<br/><em>{t.title2}</em></h1>
    <p>{t.body}</p>
    <div className="landingHeroActions"><Link href={signedIn?'/dashboard':'/register'} className="landingPrimary">{t.cta}<Arrow size={17}/></Link><a href="#how">{t.explore}</a></div>
    <div className="landingProof"><span><ShieldCheck size={13}/>Source-grounded</span><span><LockKeyhole size={13}/>Workspace isolation</span><span><Zap size={13}/>Action-ready</span></div>
   </div>

   <div className="landingWindow">
    <div className="landingWindowTop"><div className="landingWindowDots"><i/><i/><i/></div><span>workspace / command-center</span><Bell size={14}/></div>
    <div className="landingWindowBody">
     <aside className="landingMiniSidebar"><b>O.</b>{[Layers3,Database,Search,Workflow,Braces].map((Icon,i)=><span key={i} className={i===1?'active':''}><Icon size={15}/></span>)}</aside>
     <div className="landingCanvas">
      <div className="landingCanvasHead"><div><small>{lang==='ar'?'مساحة العمل':'WORKSPACE'}</small><strong>{lang==='ar'?'مركز البيانات':'Data command center'}</strong></div><button>+ Import</button></div>
      <div className="landingStats"><article><small>{lang==='ar'?'السجلات':'Records'}</small><b>12,840</b><span>+18.4%</span></article><article><small>{lang==='ar'?'جودة البيانات':'Data health'}</small><b>96%</b><span>Healthy</span></article><article><small>{lang==='ar'?'الأتمتة':'Automations'}</small><b>18</b><span>14 active</span></article></div>
      <div className="landingVisualGrid"><article className="landingChart"><small>{lang==='ar'?'تدفّق البيانات':'Data flow'}</small><div className="landingBars">{chartHeights.map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div></article><article className="landingHealth"><small>{lang==='ar'?'صحة الحقول':'Field health'}</small>{healthRows.map(([name,value])=><div className="landingHealthRow" key={name}><span>{name}</span><div className="landingHealthTrack"><div className="landingHealthFill" style={{width:`${value}%`}}/></div><b>{value}%</b></div>)}</article></div>
      <div className="landingTable"><div className="landingTableHead"><b>{lang==='ar'?'الأصول':'Assets'}</b><span>Filter</span><span>Sort</span><span>View</span></div>{[['AS-204','Makkah','Active','42,800'],['AS-205','Jeddah','Review','18,200'],['AS-206','Riyadh','Active','31,900']].map(row=><div key={row[0]}>{row.map(cell=><span key={cell}>{cell}</span>)}</div>)}</div>
     </div>
    </div>
   </div>
  </section>

  <section id="how" className="landingSection"><span className="landingSectionKicker">01 / FLOW</span><div className="landingSectionHead"><h2>{t.how}</h2><p>{t.howBody}</p></div><div className="landingFlow">{(lang==='ar'?[['01','ارفع','CSV · XLSX · JSON'],['02','افهم','Schema · Quality · Relations'],['03','شغّل','Copilot · Views · Automations']]:[['01','Import','CSV · XLSX · JSON'],['02','Understand','Schema · Quality · Relations'],['03','Operate','Copilot · Views · Automations']]).map(([n,title,body],i)=><article key={n}><div><span>{n}</span>{i<2&&<ArrowRight size={16}/>}</div><FileSpreadsheet size={23}/><h3>{title}</h3><p>{body}</p></article>)}</div></section>

  <section id="caps" className="landingSection"><span className="landingSectionKicker">02 / PLATFORM</span><div className="landingSectionHead"><h2>{lang==='ar'?'منصة بيانات كاملة، مو Dashboard بس.':'A data platform, not another dashboard.'}</h2><p>{lang==='ar'?'كل جزء يشتغل فوق بيانات فعلية داخل مساحة العمل.':'Every capability operates on real workspace data.'}</p></div><div className="landingCaps">{capabilities[lang].map((item,i)=>{const Icon=icons[i];return <article key={item[0]}><span className="landingCapIcon"><Icon size={20}/></span><h3>{item[0]}</h3><p>{item[1]}</p></article>})}</div></section>

  <section className="landingValue"><div><span className="landingSectionKicker">03 / VALUE</span><h2>{t.value}</h2><p>{t.valueBody}</p><div className="landingChips">{['CSV','XLSX','JSON','PostgreSQL','RBAC','API Keys','Audit Logs','Webhooks','Dark / Light','عربي / English'].map(x=><span key={x}>{x}</span>)}</div></div><div className="landingOrbitMap"><div className="landingCore">ORBIT<small>DATA LAYER</small></div>{['CSV','XLSX','JSON','API','SQL','WEBHOOK'].map((x,i)=><span key={x} className={`landingNode n${i+1}`}>{x}</span>)}<div className="landingRing one"/><div className="landingRing two"/></div></section>

  <section id="arch" className="landingArchitecture"><div><span className="landingSectionKicker">04 / ARCHITECTURE</span><h2>{t.secure}</h2><p>{t.secureBody}</p></div><div className="landingStack"><span>Next.js Web</span><Arrow size={16}/><span>Server API</span><Arrow size={16}/><span>Prisma</span><Arrow size={16}/><span>PostgreSQL</span></div></section>

  <section className="landingFinal"><span className="landingFinalIcon"><Database size={24}/></span><h2>{t.footer}</h2><Link href={signedIn?'/dashboard':'/register'} className="landingPrimary">{t.cta}<Arrow size={17}/></Link></section>
 </main>
}
