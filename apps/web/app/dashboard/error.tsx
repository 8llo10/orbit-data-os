'use client';
import {useEffect} from 'react';

export default function DashboardError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
 useEffect(()=>{console.error('[ORBIT dashboard error]',error)},[error]);
 return <div className="errorState"><div className="errorCard"><div className="errorKicker">ORBIT RECOVERY</div><h2>صار خطأ في الواجهة.</h2><p>جربي إعادة تحميل هذا الجزء. إذا تكرر، رقم الخطأ بالأسفل يساعدنا نحدد مكان المشكلة بدل صفحة Application error العامة.</p><code className="errorCode">{error.digest||error.message||'CLIENT_RUNTIME_ERROR'}</code><button className="errorRetry" onClick={reset}>إعادة المحاولة</button></div></div>
}
