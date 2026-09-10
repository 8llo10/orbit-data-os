import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {Network} from 'lucide-react';

export default async function SchemaExplorer(){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 const collections=await db.collection.findMany({where:{workspaceId:ws.id},include:{fields:{orderBy:{position:'asc'}},outgoingRelations:true,incomingRelations:true,_count:{select:{records:true}}},orderBy:{updatedAt:'desc'}});
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><Network size={14}/> Schema Explorer</span><h1>مخطط البيانات.</h1><p>شوف البنية التقنية الحقيقية لكل Collection: الحقول، الأنواع، العلاقات وعدد السجلات قبل ما تبني تكامل أو واجهة خارجية.</p></div></header>
  {collections.map(c=><section className="surface panel schemaCollection" key={c.id}>
   <div className="sectionHead"><div><small>COLLECTION</small><h2>{c.name}</h2><p className="schemaMeta"><code>{c.slug}</code> · {c._count.records.toLocaleString('ar-SA')} سجل · {c.fields.length} حقل</p></div><span className="badge">{c.outgoingRelations.length+c.incomingRelations.length} RELATIONS</span></div>
   <div className="endpointList"><div className="endpointRow"><span className="endpointMethod">GET</span><code>/api/v1/collections/{c.slug}/records</code><p>قراءة السجلات</p></div></div>
   <div className="schemaTableWrap"><table className="schemaTable"><thead><tr><th>Field</th><th>Key</th><th>Type</th><th>Required</th><th>Formula</th></tr></thead><tbody>{c.fields.map(f=><tr key={f.id}><td>{f.label}</td><td><code>{f.key}</code></td><td><code>{f.type}</code></td><td>{f.required?'yes':'no'}</td><td>{f.formula?<code>{f.formula}</code>:'—'}</td></tr>)}</tbody></table></div>
  </section>)}
  {!collections.length&&<div className="surface emptyState"><h2>ما عندك بيانات للحين.</h2><p>ارفع ملف أول، وبعدها ORBIT يبني الـschema تلقائيًا ويظهر هنا.</p></div>}
 </div></AppShell>
}
