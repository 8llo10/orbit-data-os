'use client';

import {useState} from 'react';
import AppShell from '@/components/AppShell';

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

  return <AppShell>
    <div className="eyebrow">API PLAYGROUND</div>
    <h1 className="h1">مختبر API</h1>
    <p className="lead">جرّب REST API مباشرة من داخل ORBIT. المفتاح يبقى في المتصفح ولا نحفظه في هذه الصفحة.</p>
    <div className="developerGrid section">
      <section className="card form">
        <label>API Key</label><input className="input" value={key} onChange={e=>setKey(e.target.value)} placeholder="orb_..." type="password"/>
        <label>Method</label><select className="input" value={method} onChange={e=>setMethod(e.target.value as 'GET'|'POST')}><option>GET</option><option>POST</option></select>
        <label>Endpoint</label><input className="input" value={path} onChange={e=>setPath(e.target.value)} placeholder="/api/v1/collections"/>
        {method==='POST'&&<><label>JSON Body</label><textarea className="input" rows={10} value={body} onChange={e=>setBody(e.target.value)} style={{fontFamily:'monospace'}}/></>}
        <button className="btn" onClick={run} disabled={loading}>{loading?'جارٍ الإرسال...':'تشغيل الطلب'}</button>
      </section>
      <section className="card"><div className="eyebrow">RESPONSE</div><h2>{status||'بانتظار الطلب'}</h2><pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',minHeight:280,overflow:'auto',fontSize:12,lineHeight:1.7}}>{result||'{\n  "tip": "أنشئ API Key ثم جرّب GET /api/v1/collections"\n}'}</pre></section>
    </div>
    <section className="card section"><div className="eyebrow">QUICK START</div><h2>طلبات جاهزة للتجربة</h2><div className="endpoint"><span className="method">GET</span><code>/api/v1/collections</code><p>قائمة كل Collections</p></div><div className="endpoint"><span className="method">GET</span><code>/api/v1/collections/:slug/records?limit=20&offset=0</code><p>قراءة البيانات مع pagination</p></div><div className="endpoint"><span className="method">POST</span><code>/api/v1/collections/:slug/records</code><p>إضافة سجل جديد وتشغيل automations</p></div></section>
  </AppShell>
}
