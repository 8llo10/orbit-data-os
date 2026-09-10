import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import Link from 'next/link';
import {Search,Database} from 'lucide-react';

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const q=(await searchParams).q?.trim()||'';
 const collections=await db.collection.findMany({where:{workspaceId:ws.id},include:{fields:true,records:{take:1000}}});
 const hits=q?collections.flatMap(c=>c.records.filter(r=>JSON.stringify(r.data).toLowerCase().includes(q.toLowerCase())).slice(0,30).map(r=>({collection:c,id:r.id,data:r.data as Record<string,unknown>}))).slice(0,100):[];
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><Search size={14}/> البحث الشامل</span><h1>دور في كل بياناتك من مكان واحد.</h1><p>ابحث داخل كل الملفات والمجموعات والحقول بدون ما تفتح كل مصدر لحاله. النتائج ترجع لك ومعها المصدر اللي جاءت منه.</p></div></header>
  <form className="surface searchBar"><input autoFocus name="q" defaultValue={q} placeholder="مثال: Asset-204 أو مكة أو Critical…"/><button>ابحث في ORBIT</button></form>
  {q&&<div className="sectionHead sectionGap"><div><small>النتائج</small><h2>{hits.length.toLocaleString('ar-SA')} نتيجة لـ «{q}»</h2></div></div>}
  <div className="resultGrid">{hits.map(h=><Link className="surface resultCard" href={`/dashboard/collections/${h.collection.id}`} key={h.id}><div className="resultMeta"><span>{h.collection.name}</span><Database size={15}/></div><div className="resultRows">{Object.entries(h.data).slice(0,5).map(([k,v])=><p key={k}><b>{k}</b><span>{String(v??'—')}</span></p>)}</div></Link>)}
  {q&&!hits.length&&<div className="surface emptyState"><h2>ما لقيت سجل مطابق.</h2><p>جرّب كلمة أوسع أو اسم حقل/رقم تعرف إنه موجود داخل أحد الملفات.</p></div>}</div>
 </div></AppShell>
}
