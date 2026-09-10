import AppShell from '@/components/AppShell';
import CollectionView from '@/components/CollectionView';
import InsightBars from '@/components/InsightBars';
import {activeWorkspace} from '@/lib/auth';
import {buildOverview} from '@/lib/analytics';
import {db} from '@orbit/db';
import {notFound,redirect} from 'next/navigation';
import Link from 'next/link';
import {Database,Download,TableProperties} from 'lucide-react';

export default async function CollectionDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{view?:string}>}){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const {id}=await params;
 const c=await db.collection.findFirst({where:{id,workspaceId:ws.id},include:{fields:{orderBy:{position:'asc'}},records:{orderBy:{createdAt:'desc'},take:1000},savedViews:true,outgoingRelations:{include:{toCollection:true}},incomingRelations:{include:{fromCollection:true}}}});
 if(!c)notFound();
 const q=await searchParams;
 const selected=c.savedViews.find(v=>v.id===q.view);
 const config=(selected?.config||{}) as Record<string,unknown>;
 const visibleRecords=config.filterField&&config.filterValue?c.records.filter(r=>String((r.data as Record<string,unknown>)[String(config.filterField)]??'').toLowerCase().includes(String(config.filterValue).toLowerCase())):c.records;
 const overview=buildOverview(c.fields,visibleRecords);
 const quality=visibleRecords.length?Math.round(100-(overview.reduce((a,f)=>a+f.missing,0)/(visibleRecords.length*Math.max(c.fields.length,1))*100)):100;

 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><Database size={14}/> {c.slug}</span><h1>{c.name}</h1><p>{c.records.length.toLocaleString('ar-SA')} سجل · {c.fields.length} حقل · جودة البيانات {quality}%</p></div><div className="collectionHeroActions"><a className="btn secondary" href={`/api/collections/${c.id}/export?format=csv`}><Download size={14}/> CSV</a><a className="btn secondary" href={`/api/collections/${c.id}/export?format=json`}><Download size={14}/> JSON</a></div></header>

  <section className="collectionMetricStrip"><div className="surface collectionMetric"><span>السجلات</span><b>{c.records.length.toLocaleString('ar-SA')}</b><small>محمّلة في المستكشف</small></div><div className="surface collectionMetric"><span>الحقول</span><b>{c.fields.length}</b><small>{c.fields.filter(f=>f.formula).length} محسوبة</small></div><div className="surface collectionMetric"><span>جودة البيانات</span><b>{quality}%</b><small>Population score</small></div><div className="surface collectionMetric"><span>Views محفوظة</span><b>{c.savedViews.length}</b><small>عدسات قابلة لإعادة الاستخدام</small></div></section>

  <section className="surface panel"><div className="sectionHead"><div><small><TableProperties size={11}/> مستكشف البيانات</small><h2>{selected?selected.name:'كل السجلات'}</h2></div><span className="badge">{selected?.type||'TABLE'}</span></div><div className="viewTabs"><Link className={!selected?'active':''} href={`/dashboard/collections/${c.id}`}>كل السجلات</Link>{c.savedViews.map(v=><Link className={selected?.id===v.id?'active':''} key={v.id} href={`/dashboard/collections/${c.id}?view=${v.id}`}>{v.name}</Link>)}</div><CollectionView type={selected?.type||'TABLE'} fields={c.fields} rows={visibleRecords.map(r=>({...r,createdAt:r.createdAt.toISOString(),data:r.data as Record<string,unknown>}))}/></section>

  <section className="sectionGap"><div className="sectionHead"><div><small>تحليل تلقائي</small><h2>ملخص بنية وجودة الحقول</h2></div><span className="badge">DETERMINISTIC</span></div><div className="profileGrid">{overview.map(f=><article className="surface profileCard" key={f.key}><div className="profileTop"><div><b>{f.label}</b><span>{f.type}</span></div><strong>{f.unique}<small> unique</small></strong></div><div className="qualityLine"><span>{f.missing} missing</span><span>{f.count} populated</span></div>{f.avg!==null?<div className="numberStats"><div><span>min</span><b>{round(f.min)}</b></div><div><span>avg</span><b>{round(f.avg)}</b></div><div><span>max</span><b>{round(f.max)}</b></div></div>:<InsightBars items={f.top}/>}</article>)}</div></section>

  <section className="collectionToolsGrid">
   <article className="surface panel"><div className="sectionHead"><div><small>COMPUTED FIELDS</small><h2>اشتق بيانات جديدة</h2></div></div><p className="muted">استخدم مفاتيح الحقول بين الأقواس. مثال: <code>{'{revenue}-{cost}'}</code></p><form className="form" method="post" action={`/api/collections/${c.id}/formula`}><input className="input" name="label" placeholder="Profit" required/><input className="input" name="formula" placeholder="{revenue}-{cost}" required/><button className="btn">أنشئ حقل محسوب</button></form>{c.fields.filter(f=>f.formula).map(f=><div className="settingRow" key={f.id}><b>{f.label}</b><code>{f.formula}</code></div>)}</article>
   <article className="surface panel"><div className="sectionHead"><div><small>SAVED VIEWS</small><h2>واجهات مخصصة للبيانات</h2></div></div><form className="form" method="post" action={`/api/collections/${c.id}/views`}><input className="input" name="name" placeholder="High priority records" required/><select className="input" name="type"><option value="TABLE">Table</option><option value="KANBAN">Kanban</option><option value="CALENDAR">Calendar</option></select><select className="input" name="filterField"><option value="">No preset filter</option>{c.fields.map(f=><option key={f.id} value={f.key}>{f.label}</option>)}</select><input className="input" name="filterValue" placeholder="Optional filter value"/><button className="btn">احفظ View</button></form>{c.savedViews.map(v=><div className="settingRow" key={v.id}><div><b>{v.name}</b><p>{v.type}</p></div><span className="badge">saved</span></div>)}</article>
  </section>
 </div></AppShell>
}

function round(v:number|null){return v===null?'—':Math.round(v*100)/100}
