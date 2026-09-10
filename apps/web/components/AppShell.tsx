'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Activity,Bell,Braces,Database,Home,Import,Languages,LayoutDashboard,Orbit,Search,Settings,Share2,Workflow,X} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

const nav=[
  [Home,'نظرة عامة','Overview','/dashboard'],
  [Database,'مجموعات البيانات','Collections','/dashboard/collections'],
  [Import,'الاستيراد','Imports','/dashboard/imports'],
  [Search,'البحث الشامل','Search','/dashboard/search'],
  [Share2,'خريطة العلاقات','Graph','/dashboard/graph'],
  [LayoutDashboard,'منشئ اللوحات','Builder','/dashboard/builder'],
  [Workflow,'الأتمتة','Automations','/dashboard/automations'],
  [Braces,'المطورون','Developer','/dashboard/developer'],
  [Activity,'سجل النشاط','Activity','/dashboard/activity'],
  [Settings,'الإعدادات','Settings','/dashboard/settings']
] as const;

export default function AppShell({children}:{children:React.ReactNode}){
  const [lang,setLang]=useState<'ar'|'en'>('ar');
  const [open,setOpen]=useState(false);
  useEffect(()=>{const saved=localStorage.getItem('orbit-lang');if(saved==='en'||saved==='ar')setLang(saved);},[]);
  const rtl=lang==='ar';
  function toggleLang(){const next=rtl?'en':'ar';setLang(next);localStorage.setItem('orbit-lang',next);document.documentElement.lang=next;document.documentElement.dir=next==='ar'?'rtl':'ltr';}
  return <div className="shell" dir={rtl?'rtl':'ltr'}>
    <aside className="sidebar">
      <Link href="/dashboard" className="brandWrap"><div className="orb mini"><Orbit size={19}/></div><div className="brand">ORBIT<span className="brandDot">.</span></div></Link>
      <div className="sideCaption">{rtl?'نظام تشغيل بياناتك':'PERSONAL DATA OS'}</div>
      <nav className="nav">{nav.map(([Icon,ar,en,url])=><Link key={url} href={url}><Icon size={17}/><span>{rtl?ar:en}</span></Link>)}</nav>
      <div className="sidebarBottom"><form method="post" action="/api/auth/logout"><button className="ghostBtn">{rtl?'تسجيل الخروج':'Sign out'}</button></form></div>
    </aside>
    <main className="main">
      <div className="appToolbar">
        <CommandPalette/>
        <button className="toolbarIcon" onClick={toggleLang} title="Language"><Languages size={17}/><span>{rtl?'EN':'ع'}</span></button>
        <button className="toolbarIcon notificationButton" onClick={()=>setOpen(v=>!v)} title={rtl?'الإشعارات':'Notifications'}><Bell size={17}/><i/></button>
        <ThemeToggle/>
      </div>
      {open&&<div className="notificationPanel">
        <div className="notificationHead"><div><b>{rtl?'الإشعارات':'Notifications'}</b><span>{rtl?'آخر نشاط في مساحة العمل':'Latest workspace activity'}</span></div><button onClick={()=>setOpen(false)}><X size={16}/></button></div>
        <div className="notificationItem"><span className="noticeDot"/><div><b>{rtl?'اكتمل تحليل البيانات':'Data profiling complete'}</b><p>{rtl?'تم تحليل جودة آخر ملف تم استيراده.':'Your latest import has been profiled successfully.'}</p><small>{rtl?'الآن':'Now'}</small></div></div>
        <div className="notificationItem"><span className="noticeDot dim"/><div><b>{rtl?'الأتمتة تعمل':'Automation is active'}</b><p>{rtl?'تم تشغيل قواعد مساحة العمل بدون أخطاء.':'Workspace automation rules are running normally.'}</p><small>12 min</small></div></div>
      </div>}
      {children}
      <style jsx>{`
        .toolbarIcon{height:36px;border:1px solid var(--border);background:var(--panel);color:var(--text);border-radius:10px;padding:0 10px;display:flex;align-items:center;gap:6px;cursor:pointer}.notificationButton{position:relative}.notificationButton i{position:absolute;width:6px;height:6px;border-radius:50%;background:#c995d7;top:7px;right:7px;box-shadow:0 0 0 3px rgba(201,149,215,.12)}.notificationPanel{position:fixed;z-index:80;top:64px;right:24px;width:min(390px,calc(100vw - 32px));border:1px solid var(--border);background:var(--panel);box-shadow:0 24px 70px rgba(0,0,0,.34);border-radius:18px;padding:10px;backdrop-filter:blur(22px)}.notificationHead{display:flex;justify-content:space-between;gap:14px;padding:10px 10px 14px;border-bottom:1px solid var(--border)}.notificationHead>div{display:flex;flex-direction:column;gap:3px}.notificationHead b{font-size:14px}.notificationHead span{font-size:10px;color:var(--muted)}.notificationHead button{border:0;background:transparent;color:var(--muted);cursor:pointer}.notificationItem{display:grid;grid-template-columns:10px 1fr;gap:10px;padding:14px 10px;border-bottom:1px solid var(--border)}.notificationItem:last-child{border-bottom:0}.noticeDot{width:8px;height:8px;border-radius:50%;background:#c995d7;margin-top:5px}.noticeDot.dim{opacity:.35}.notificationItem b{font-size:12px}.notificationItem p{margin:4px 0;color:var(--muted);font-size:10px;line-height:1.6}.notificationItem small{color:var(--muted);font-size:9px}@media(max-width:700px){.notificationPanel{right:16px;top:58px}.toolbarIcon span{display:none}}
      `}</style>
    </main>
  </div>
}
