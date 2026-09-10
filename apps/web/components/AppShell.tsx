'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Activity,Bell,Braces,Database,Home,Import,Languages,LayoutDashboard,Orbit,Search,Settings,Share2,Workflow,X,Network,Code2,Sparkles} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

const mainNav=[
  [Home,'الرئيسية','Home','/dashboard','ملخص كل بياناتك وما صار عليها'],
  [Sparkles,'اسأل ORBIT','Ask ORBIT','/dashboard/assistant','اسأل بياناتك وخذ إجابات وخطوات عملية'],
  [Import,'أضف بيانات','Add data','/dashboard/imports','ارفع Excel أو CSV أو JSON'],
  [Database,'بياناتي','My data','/dashboard/collections','شوف الجداول والملفات اللي دخلتها'],
  [Search,'ابحث','Search','/dashboard/search','دور في كل بياناتك من مكان واحد'],
  [LayoutDashboard,'لوحاتي','Dashboards','/dashboard/builder','رتب أرقامك ورسومك بالشكل اللي يعجبك'],
  [Workflow,'شغّل تلقائيًا','Automate','/dashboard/automations','خل أوربت ينفذ خطوات عنك تلقائيًا']
] as const;

const advancedNav=[
  [Share2,'اربط البيانات','Connect data','/dashboard/graph','اربط الملفات والجداول ببعض'],
  [Braces,'API والتكاملات','API & integrations','/dashboard/developer','API Keys وREST API وWebhooks'],
  [Network,'مخطط البيانات','Schema explorer','/dashboard/developer/schema','شوف الحقول والأنواع والعلاقات التقنية'],
  [Code2,'مختبر API','API playground','/dashboard/developer/playground','جرّب REST API مباشرة من أوربت'],
  [Activity,'سجل التغييرات','Activity log','/dashboard/activity','اعرف وش صار ومتى'],
  [Settings,'الإعدادات','Settings','/dashboard/settings','الحساب ومساحة العمل والصلاحيات']
] as const;

export default function AppShell({children}:{children:React.ReactNode}){
  const [lang,setLang]=useState<'ar'|'en'>('ar');
  const [open,setOpen]=useState(false);
  const [advanced,setAdvanced]=useState(false);
  useEffect(()=>{const saved=localStorage.getItem('orbit-lang');if(saved==='en'||saved==='ar')setLang(saved);},[]);
  const rtl=lang==='ar';
  function toggleLang(){const next=rtl?'en':'ar';setLang(next);localStorage.setItem('orbit-lang',next);document.documentElement.lang=next;document.documentElement.dir=next==='ar'?'rtl':'ltr';}
  return <div className="shell" dir={rtl?'rtl':'ltr'}>
    <aside className="sidebar">
      <Link href="/dashboard" className="brandWrap"><div className="orb mini"><Orbit size={19}/></div><div className="brand">ORBIT<span className="brandDot">.</span></div></Link>
      <div className="sideCaption">{rtl?'خل بياناتك مرتبة وتشتغل معك':'MAKE YOUR DATA WORK FOR YOU'}</div>
      <div className="sideGroupLabel">{rtl?'ابدأ من هنا':'START HERE'}</div>
      <nav className="nav">{mainNav.map(([Icon,ar,en,url,hint])=><Link key={url} href={url} title={hint} className={url==='/dashboard/assistant'?'assistantNav':''}><Icon size={17}/><span>{rtl?ar:en}</span>{url==='/dashboard/assistant'&&<i>AI</i>}</Link>)}</nav>
      <button className="advancedToggle" onClick={()=>setAdvanced(v=>!v)}>{rtl?(advanced?'إخفاء الأدوات المتقدمة':'أدوات للمستخدم التقني'):(advanced?'Hide technical tools':'Technical tools')}</button>
      {advanced&&<><div className="advancedHint">{rtl?'واجهات API، تكاملات، مخطط البيانات وأدوات اختبار للمطورين':'APIs, integrations, schema and testing tools for developers'}</div><nav className="nav advancedNav">{advancedNav.map(([Icon,ar,en,url,hint])=><Link key={url} href={url} title={hint}><Icon size={17}/><span>{rtl?ar:en}</span></Link>)}</nav></>}
      <div className="sidebarBottom"><form method="post" action="/api/auth/logout"><button className="ghostBtn">{rtl?'تسجيل الخروج':'Sign out'}</button></form></div>
    </aside>
    <main className="main">
      <div className="appToolbar"><CommandPalette/><button className="toolbarIcon" onClick={toggleLang} title="Language"><Languages size={17}/><span>{rtl?'EN':'ع'}</span></button><button className="toolbarIcon notificationButton" onClick={()=>setOpen(v=>!v)} title={rtl?'الإشعارات':'Notifications'}><Bell size={17}/><i/></button><ThemeToggle/></div>
      {open&&<div className="notificationPanel"><div className="notificationHead"><div><b>{rtl?'الإشعارات':'Notifications'}</b><span>{rtl?'أوربت يقول لك وش صار بدون ما تدور':'ORBIT keeps you updated automatically'}</span></div><button onClick={()=>setOpen(false)}><X size={16}/></button></div><div className="notificationItem"><span className="noticeDot"/><div><b>{rtl?'خلص تحليل آخر ملف':'Latest file is ready'}</b><p>{rtl?'حللنا جودة البيانات وحددنا الحقول الناقصة والتكرار.':'Data quality and missing fields are ready to review.'}</p><small>{rtl?'الآن':'Now'}</small></div></div><div className="notificationItem"><span className="noticeDot dim"/><div><b>{rtl?'الأتمتة شغالة':'Automation is running'}</b><p>{rtl?'القواعد اللي فعلتيها تشتغل بدون أخطاء.':'Your active rules are running normally.'}</p><small>12 min</small></div></div></div>}
      {children}
      <style jsx>{`.sideGroupLabel{margin:18px 12px 8px;font-size:9px;letter-spacing:.12em;color:var(--muted);font-weight:800}.assistantNav{background:linear-gradient(90deg,rgba(201,149,215,.14),rgba(201,149,215,.04))!important;border:1px solid rgba(201,149,215,.18)}.assistantNav i{margin-inline-start:auto;font-style:normal;font-size:8px;font-weight:900;color:#241729;background:#d6afe0;padding:3px 5px;border-radius:6px}.advancedToggle{margin:12px 10px 2px;border:1px dashed var(--border);background:transparent;color:var(--muted);border-radius:10px;padding:9px 11px;text-align:start;cursor:pointer;font-size:11px}.advancedToggle:hover{color:var(--text);border-style:solid}.advancedHint{margin:8px 12px 4px;color:var(--muted);font-size:9px;line-height:1.5}.advancedNav{margin-top:5px}.toolbarIcon{height:36px;border:1px solid var(--border);background:var(--panel);color:var(--text);border-radius:10px;padding:0 10px;display:flex;align-items:center;gap:6px;cursor:pointer}.notificationButton{position:relative}.notificationButton i{position:absolute;width:6px;height:6px;border-radius:50%;background:#c995d7;top:7px;right:7px;box-shadow:0 0 0 3px rgba(201,149,215,.12)}.notificationPanel{position:fixed;z-index:80;top:64px;right:24px;width:min(390px,calc(100vw - 32px));border:1px solid var(--border);background:var(--panel);box-shadow:0 24px 70px rgba(0,0,0,.34);border-radius:18px;padding:10px;backdrop-filter:blur(22px)}.notificationHead{display:flex;justify-content:space-between;gap:14px;padding:10px 10px 14px;border-bottom:1px solid var(--border)}.notificationHead>div{display:flex;flex-direction:column;gap:3px}.notificationHead b{font-size:14px}.notificationHead span{font-size:10px;color:var(--muted)}.notificationHead button{border:0;background:transparent;color:var(--muted);cursor:pointer}.notificationItem{display:grid;grid-template-columns:10px 1fr;gap:10px;padding:14px 10px;border-bottom:1px solid var(--border)}.notificationItem:last-child{border-bottom:0}.noticeDot{width:8px;height:8px;border-radius:50%;background:#c995d7;margin-top:5px}.noticeDot.dim{opacity:.35}.notificationItem b{font-size:12px}.notificationItem p{margin:4px 0;color:var(--muted);font-size:10px;line-height:1.6}.notificationItem small{color:var(--muted);font-size:9px}@media(max-width:700px){.notificationPanel{right:16px;top:58px}.toolbarIcon span{display:none}}`}</style>
    </main>
  </div>
}
