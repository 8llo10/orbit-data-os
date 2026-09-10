'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {Activity,Bell,Braces,Code2,Database,Home,Import,Languages,LayoutDashboard,Menu,Network,Orbit,Search,Settings,Share2,Sparkles,Workflow,X} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import CommandPalette from './CommandPalette';

const mainNav=[
  [Home,'الرئيسية','Home','/dashboard'],
  [Sparkles,'اسأل ORBIT','Ask ORBIT','/dashboard/assistant'],
  [Import,'أضف بيانات','Add data','/dashboard/imports'],
  [Database,'بياناتي','My data','/dashboard/collections'],
  [Search,'ابحث','Search','/dashboard/search'],
  [LayoutDashboard,'لوحاتي','Dashboards','/dashboard/builder'],
  [Workflow,'الأتمتة','Automations','/dashboard/automations']
] as const;

const advancedNav=[
  [Share2,'العلاقات','Relations','/dashboard/graph'],
  [Braces,'API والتكاملات','API & integrations','/dashboard/developer'],
  [Network,'مخطط البيانات','Schema','/dashboard/developer/schema'],
  [Code2,'مختبر API','API playground','/dashboard/developer/playground'],
  [Activity,'سجل التغييرات','Activity','/dashboard/activity'],
  [Settings,'الإعدادات','Settings','/dashboard/settings']
] as const;

export default function AppShell({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const [lang,setLang]=useState<'ar'|'en'>('ar');
  const [notifications,setNotifications]=useState(false);
  const [advanced,setAdvanced]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);

  useEffect(()=>{const saved=localStorage.getItem('orbit-lang');if(saved==='en'||saved==='ar')setLang(saved);},[]);
  useEffect(()=>setMobileOpen(false),[pathname]);

  const rtl=lang==='ar';
  const isActive=(url:string)=>url==='/dashboard'?pathname===url:pathname.startsWith(url);
  const toggleLang=()=>{const next=rtl?'en':'ar';setLang(next);localStorage.setItem('orbit-lang',next);document.documentElement.lang=next;document.documentElement.dir=next==='ar'?'rtl':'ltr';};

  const navContent=<>
    <div className="sideGroupLabel">{rtl?'مساحة العمل':'WORKSPACE'}</div>
    <nav className="nav mainNav">{mainNav.map(([Icon,ar,en,url])=><Link key={url} href={url} className={`${isActive(url)?'active ':''}${url==='/dashboard/assistant'?'assistantNav':''}`}><Icon size={18}/><span>{rtl?ar:en}</span>{url==='/dashboard/assistant'&&<i>AI</i>}</Link>)}</nav>
    <button className="advancedToggle" onClick={()=>setAdvanced(v=>!v)}>{rtl?(advanced?'إخفاء الأدوات التقنية':'الأدوات التقنية'):(advanced?'Hide technical tools':'Technical tools')}<span>{advanced?'−':'+'}</span></button>
    {advanced&&<nav className="nav advancedNav">{advancedNav.map(([Icon,ar,en,url])=><Link key={url} href={url} className={isActive(url)?'active':''}><Icon size={17}/><span>{rtl?ar:en}</span></Link>)}</nav>}
  </>;

  return <div className="shell" dir={rtl?'rtl':'ltr'}>
    <aside className="sidebar desktopSidebar">
      <Link href="/dashboard" className="brandWrap"><div className="orb mini"><Orbit size={18}/></div><div><div className="brand">ORBIT<span className="brandDot">.</span></div><div className="brandSub">PERSONAL DATA OS</div></div></Link>
      <div className="navScroll">{navContent}</div>
      <div className="sidebarBottom"><form method="post" action="/api/auth/logout"><button className="ghostBtn">{rtl?'تسجيل الخروج':'Sign out'}</button></form></div>
    </aside>

    <div className="mobileHeader">
      <Link href="/dashboard" className="mobileBrand"><div className="orb mini"><Orbit size={17}/></div><b>ORBIT.</b></Link>
      <div className="mobileActions"><ThemeToggle/><button className="mobileMenuBtn" onClick={()=>setMobileOpen(true)} aria-label="Open menu"><Menu size={20}/></button></div>
    </div>

    {mobileOpen&&<div className="mobileDrawerLayer" onClick={()=>setMobileOpen(false)}><aside className="mobileDrawer" onClick={e=>e.stopPropagation()}><div className="mobileDrawerHead"><Link href="/dashboard" className="brandWrap"><div className="orb mini"><Orbit size={18}/></div><div className="brand">ORBIT.</div></Link><button onClick={()=>setMobileOpen(false)}><X size={19}/></button></div><div className="navScroll">{navContent}</div><form method="post" action="/api/auth/logout"><button className="ghostBtn">{rtl?'تسجيل الخروج':'Sign out'}</button></form></aside></div>}

    <main className="main">
      <div className="appToolbar"><div className="toolbarSearch"><CommandPalette/></div><div className="toolbarActions"><button className="toolbarIcon" onClick={toggleLang} title="Language"><Languages size={16}/><span>{rtl?'EN':'ع'}</span></button><button className="toolbarIcon notificationButton" onClick={()=>setNotifications(v=>!v)}><Bell size={16}/><i/></button><ThemeToggle/></div></div>
      {notifications&&<div className="notificationPanel"><div className="notificationHead"><div><b>{rtl?'الإشعارات':'Notifications'}</b><span>{rtl?'آخر الأحداث داخل ORBIT':'Latest ORBIT activity'}</span></div><button onClick={()=>setNotifications(false)}><X size={16}/></button></div><div className="notificationItem"><span className="noticeDot"/><div><b>{rtl?'تحليل البيانات جاهز':'Data analysis ready'}</b><p>{rtl?'تم تجهيز آخر تحليل ويمكنك مراجعته الآن.':'Your latest analysis is ready to review.'}</p><small>{rtl?'الآن':'Now'}</small></div></div></div>}
      <div className="pageStage">{children}</div>
    </main>
  </div>;
}
