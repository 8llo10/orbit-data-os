import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import {Database,Plus} from 'lucide-react';

export default async function Collections(){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const data=await db.collection.findMany({where:{workspaceId:ws.id},include:{fields:true,_count:{select:{records:true,savedViews:true}},outgoingRelations:true,incomingRelations:true},orderBy:{updatedAt:'desc'}});
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><Database size={14}/> طبقة البيانات</span><h1>بياناتك، مرتبة وواضحة.</h1><p>كل ملف ترفعه يتحول إلى مجموعة بيانات منظمة تقدر تبحث فيها، تربطها بغيرها، وتحللها من ORBIT Copilot.</p></div><Link className="primaryAction" href="/dashboard/imports"><Plus size={16}/> أضف بيانات</Link></header>
  <section className="collectionCards">{data.map(c=><Link href={`/dashboard/collections/${c.id}`} className="surface collectionTile" key={c.id}><div className="collectionGlyph">◈</div><div><h2>{c.name}</h2><p>{c.description||`${c.fields.length} حقول جاهزة للاستكشاف والتحليل.`}</p></div><div className="collectionStats"><span><b>{c._count.records.toLocaleString('ar-SA')}</b>سجل</span><span><b>{c.fields.length}</b>حقل</span><span><b>{c._count.savedViews}</b>View</span><span><b>{c.outgoingRelations.length+c.incomingRelations.length}</b>رابط</span></div><div className="tagRow">{c.fields.slice(0,5).map(f=><span key={f.id}>{f.label} · {f.type}</span>)}</div></Link>)}{!data.length&&<div className="surface emptyState"><h2>ما عندك بيانات للحين.</h2><p>ارفع CSV أو Excel أو JSON، وORBIT بيجهز البنية تلقائيًا.</p><Link className="textLink" href="/dashboard/imports">أضف أول ملف</Link></div>}</section>
 </div></AppShell>
}
