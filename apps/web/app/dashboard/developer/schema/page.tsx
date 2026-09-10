import AppShell from '@/components/AppShell';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';

export default async function SchemaExplorer(){
  let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
  const collections=await db.collection.findMany({
    where:{workspaceId:ws.id},
    include:{fields:{orderBy:{position:'asc'}},outgoingRelations:true,incomingRelations:true,_count:{select:{records:true}}},
    orderBy:{updatedAt:'desc'}
  });
  return <AppShell>
    <div className="eyebrow">SCHEMA EXPLORER</div>
    <h1 className="h1">مخطط البيانات</h1>
    <p className="lead">هنا تشوف البنية التقنية الحقيقية لكل Collection: أسماء الحقول، أنواعها، العلاقات وعدد السجلات. مفيد قبل بناء API integration أو frontend خارجي.</p>
    <div className="section">
      {collections.map(c=><section className="card section" key={c.id}>
        <div className="sectionTitle"><div><div className="eyebrow">COLLECTION</div><h2>{c.name}</h2><p className="muted"><code>{c.slug}</code> · {c._count.records} records · {c.fields.length} fields</p></div></div>
        <div className="endpoint"><span className="method">GET</span><code>/api/v1/collections/{c.slug}/records</code><p>Read records</p></div>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',marginTop:18}}><thead><tr><th style={{textAlign:'start',padding:10}}>Field</th><th style={{textAlign:'start',padding:10}}>Key</th><th style={{textAlign:'start',padding:10}}>Type</th><th style={{textAlign:'start',padding:10}}>Required</th><th style={{textAlign:'start',padding:10}}>Formula</th></tr></thead><tbody>{c.fields.map(f=><tr key={f.id}><td style={{padding:10,borderTop:'1px solid var(--border)'}}>{f.label}</td><td style={{padding:10,borderTop:'1px solid var(--border)'}}><code>{f.key}</code></td><td style={{padding:10,borderTop:'1px solid var(--border)'}}><code>{f.type}</code></td><td style={{padding:10,borderTop:'1px solid var(--border)'}}>{f.required?'yes':'no'}</td><td style={{padding:10,borderTop:'1px solid var(--border)'}}>{f.formula?<code>{f.formula}</code>:'—'}</td></tr>)}</tbody></table></div>
        <p className="muted" style={{marginTop:16}}>Relations: {c.outgoingRelations.length+c.incomingRelations.length}</p>
      </section>)}
      {!collections.length&&<div className="card"><h2>ما عندك بيانات للحين</h2><p className="muted">ارفع ملف أول، وبعدها ORBIT يبني الـschema تلقائيًا ويظهر هنا.</p></div>}
    </div>
  </AppShell>
}
