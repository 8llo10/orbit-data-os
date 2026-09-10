'use client';

import {useState} from 'react';
import AppShell from '@/components/AppShell';
import {Code2} from 'lucide-react';

export default function ApiPlayground(){
 const [key,setKey]=useState('');
 const [path,setPath]=useState('/api/v1/collections');
 const [method,setMethod]=useState<'GET'|'POST'>('GET');
 const [body,setBody]=useState('{\n  "name": "Example"\n}');
 const [result,setResult]=useState('');
 const [status,setStatus]=useState('');
 const [loading,setLoading]=useState(false);

 async function run(){
  setLoading(true);setResult('');setStatus('');
  try{
   const res=await fetch(path,{method,headers:{'x-api-key':key,'content-type':'application/json'},body:method==='POST'?body:undefined});
   setStatus(`${res.status} ${res.statusText}`);
   const text=await res.text();
   try{setResult(JSON.stringify(JSON.parse(text),null,2))}catch{setResult(text)}
  }catch(e){setStatus('REQUEST FAILED');setResult(e instanceof Error?e.message:String(e))}
  finally{setLoading(false)}
 }

 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><Code2 size={14}/> API Playground</span><h1>مختبر API.</h1><p>جرّب REST API مباشرة من داخل ORBIT. المفتاح يبقى في المتصفح ولا نحفظه في هذه الصفحة.</p></div></header>
  <section className="playgroundGrid">
   <article className="surface panel formPanel"><div className="sectionHead"><div><small>REQUEST</small><h2>جهّز الطلب</h2></div></div><label>API Key<input value={key} onChange={e=>setKey(e.target.value)} placeholder="orb_..." type="password"/></label><label>Method<select value={method} onChange={e=>setMethod(e.target.value as 'GET'|'POST')}><option>GET</option><option>POST</option></select></label><label>Endpoint<input value={path} onChange={e=>setPath(e.target.value)} placeholder="/api/v1/collections"/></label>{method==='POST'&&<label>JSON Body<textarea className="codeArea" rows={10} value={body} onChange={e=>setBody(e.target.value)}/></label>}<button onClick={run} disabled={loading}>{loading?'جارٍ الإرسال...':'تشغيل الطلب'}</button></article>
   <article className="surface panel"><div className="sectionHead"><div><small>RESPONSE</small><h2>{status||'بانتظار الطلب'}</h2></div></div><pre className="responseBox">{result||'{\n  "tip": "أنشئ API Key ثم جرّب GET /api/v1/collections"\n}'}</pre></article>
  </section>
  <section className="surface panel sectionGap"><div className="sectionHead"><div><small>QUICK START</small><h2>طلبات جاهزة للتجربة</h2></div></div><div className="endpointList"><div className="endpointRow"><span className="endpointMethod">GET</span><code>/api/v1/collections</code><p>قائمة كل Collections</p></div><div className="endpointRow"><span className="endpointMethod">GET</span><code>/api/v1/collections/:slug/records?limit=20&offset=0</code><p>قراءة البيانات مع pagination</p></div><div className="endpointRow"><span className="endpointMethod">POST</span><code>/api/v1/collections/:slug/records</code><p>إضافة سجل جديد وتشغيل automations</p></div></div></section>
 </div></AppShell>
}
