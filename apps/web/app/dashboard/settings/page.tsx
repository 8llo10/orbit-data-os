import AppShell from '@/components/AppShell';
import {activeWorkspace,requireUser} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {LockKeyhole,Settings as SettingsIcon,Users} from 'lucide-react';

export default async function Settings({searchParams}:{searchParams:Promise<{team?:string}>}){
 let user,ws;try{user=await requireUser();ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const q=await searchParams;
 const members=await db.workspaceMember.findMany({where:{workspaceId:ws.id},include:{user:true},orderBy:{role:'asc'}});

 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><SettingsIcon size={14}/> الإعدادات</span><h1>إعدادات مساحة ORBIT.</h1><p>الحساب، مساحة العمل، أعضاء الفريق، والصلاحيات — كلها في مكان واضح واحد.</p></div></header>
  {q.team==='not-found'&&<div className="errorBanner">هذا البريد ما عنده حساب ORBIT للحين. لازم يسجل أولًا قبل إضافته لمساحة العمل.</div>}

  <section className="settingsGrid sectionGap">
   <article className="surface panel"><div className="sectionHead"><div><small>PROFILE</small><h2>الحساب</h2></div></div><form className="form" method="post" action="/api/settings"><input type="hidden" name="type" value="profile"/><label>الاسم<input className="input" name="name" defaultValue={user.name||''}/></label><label>البريد<input className="input" value={user.email} disabled/></label><button className="btn">حفظ الحساب</button></form></article>
   <article className="surface panel"><div className="sectionHead"><div><small>WORKSPACE</small><h2>مساحة العمل</h2></div></div><form className="form" method="post" action="/api/settings"><input type="hidden" name="type" value="workspace"/><label>اسم المساحة<input className="input" name="name" defaultValue={ws.name}/></label><label>Slug<input className="input" value={ws.slug} disabled/></label><button className="btn">حفظ مساحة العمل</button></form></article>
   <article className="surface panel fullSpan"><div className="sectionHead"><div><small><Users size={11}/> ACCESS CONTROL</small><h2>أعضاء مساحة العمل</h2></div><span className="badge">{members.length} USERS</span></div><form className="inlineForm" method="post" action="/api/settings/members"><input className="input" type="email" name="email" placeholder="بريد مستخدم ORBIT موجود" required/><select className="input compact" name="role"><option value="MEMBER">Member</option><option value="VIEWER">Viewer</option><option value="ADMIN">Admin</option></select><button className="btn">إضافة عضو</button></form><div className="memberTable">{members.map(m=><div className="settingRow" key={m.id}><div className="memberIdentity"><div className="avatar">{(m.user.name||m.user.email).slice(0,1).toUpperCase()}</div><div><b>{m.user.name||'مستخدم بدون اسم'}</b><p>{m.user.email}</p></div></div>{m.role==='OWNER'?<span className="badge">OWNER</span>:<form className="inlineForm small" method="post" action={`/api/settings/members/${m.id}/role`}><select className="input compact" name="role" defaultValue={m.role}><option value="ADMIN">Admin</option><option value="MEMBER">Member</option><option value="VIEWER">Viewer</option></select><button className="btn secondary">تحديث</button></form>}</div>)}</div></article>
  </section>

  <section className="settingsIntroGrid sectionGap">
   <article className="surface panel"><div className="sectionHead"><div><small>ARCHITECTURE</small><h2>بنية ORBIT</h2></div></div><div className="specList"><span>PostgreSQL + Prisma</span><span>RBAC workspaces</span><span>Dynamic JSONB records</span><span>Schema inference</span><span>REST API + webhooks</span><span>Audit logging</span></div></article>
   <article className="surface panel"><div className="sectionHead"><div><small><LockKeyhole size={11}/> PRIVACY</small><h2>الخصوصية</h2></div></div><p className="privacyCopy">محرك البيانات الأساسي في ORBIT يشتغل بدون اعتماد إجباري على API ذكاء اصطناعي مدفوع، وبيانات كل Workspace معزولة بصلاحياتها.</p></article>
  </section>
 </div></AppShell>
}
