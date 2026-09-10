import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {Network} from 'lucide-react';

export default async function Graph(){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const collections=await db.collection.findMany({where:{workspaceId:ws.id},include:{fields:true,_count:{select:{records:true}},outgoingRelations:{include:{toCollection:true}}}});
 const relations=collections.flatMap(c=>c.outgoingRelations.map(r=>({id:r.id,name:r.name,from:c.name,to:r.toCollection.name,fromField:r.fromFieldKey,toField:r.toFieldKey})));
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><Network size={14}/> ربط البيانات</span><h1>حوّل الملفات المنفصلة إلى نموذج واحد.</h1><p>اربط المفاتيح بين المجموعات عشان ORBIT يقدر يفهم السياق بين الملفات ويحلل أكثر من مصدر بدون تخمين.</p></div></header>
  <section className="graphBoard">{collections.map(c=><article className="surface graphNodeUnified" key={c.id}><span>COLLECTION</span><h3>{c.name}</h3><p>{c._count.records.toLocaleString('ar-SA')} سجل · {c.fields.length} حقل</p></article>)}{!collections.length&&<div className="surface emptyState"><h2>ما عندك بيانات تربطها للحين.</h2><p>ارفع مجموعتين أو أكثر وارجع هنا.</p></div>}</section>
  <div className="equalCols sectionGap">
   <section className="surface panel formPanel"><div className="sectionHead"><div><small>علاقة جديدة</small><h2>اربط مجموعتين</h2></div></div>{collections.length>=2?<form method="post" action="/api/relations"><label>اسم العلاقة<input name="name" placeholder="مثال: الأصل عنده أوامر صيانة" required/></label><label>من مجموعة<select name="fromCollectionId">{collections.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>الحقل المصدر<input name="fromFieldKey" placeholder="مثال: asset_id" required/></label><label>إلى مجموعة<select name="toCollectionId">{collections.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>الحقل الهدف<input name="toFieldKey" placeholder="مثال: id" required/></label><button>أنشئ العلاقة</button></form>:<p className="muted">تحتاج مجموعتين بيانات على الأقل.</p>}</section>
   <section className="surface panel"><div className="sectionHead"><div><small>العلاقات الحالية</small><h2>{relations.length} علاقة</h2></div></div><div className="relationList">{relations.map(r=><article className="relationItem" key={r.id}><b>{r.from} → {r.to}</b><span>{r.fromField} → {r.toField}</span><small>{r.name}</small></article>)}{!relations.length&&<div className="emptyState"><h2>ما فيه علاقات محفوظة.</h2><p>ORBIT يقدر يقترح علاقات من Copilot، لكن ما يعتمدها كحقيقة إلا بعد التأكيد.</p></div>}</div></section>
  </div>
 </div></AppShell>
}
