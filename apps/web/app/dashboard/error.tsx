'use client';
import {useEffect} from 'react';
export default function DashboardError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error('[ORBIT dashboard error]',error)},[error]);
 return <div style={{minHeight:'60vh',display:'grid',placeItems:'center',padding:24}}><div style={{maxWidth:620,width:'100%',border:'1px solid var(--border)',background:'var(--panel)',borderRadius:20,padding:24}}><div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>ORBIT RECOVERY</div><h2 style={{margin:'0 0 10px'}}>صار خطأ في الواجهة، مو في بياناتك.</h2><p style={{color:'var(--muted)',lineHeight:1.8}}>سجلنا الخطأ في Console. جربي إعادة تحميل هذا الجزء؛ إذا تكرر، رقم الخطأ بالأسفل يساعدنا نحدد مكانه بدل صفحة Application error العامة.</p><code style={{display:'block',fontSize:11,wordBreak:'break-all',padding:'10px 12px',border:'1px solid var(--border)',borderRadius:10,margin:'14px 0'}}>{error.digest||error.message||'CLIENT_RUNTIME_ERROR'}</code><button onClick={reset} style={{border:0,borderRadius:10,padding:'10px 14px',background:'#d6afe0',color:'#241729',fontWeight:800,cursor:'pointer'}}>إعادة المحاولة</button></div></div>
}
