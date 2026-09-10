import Link from 'next/link';
import {ArrowLeft,Database,Sparkles,WandSparkles} from 'lucide-react';

export default function AssistantSpotlight({collections,records}:{collections:number;records:number}){
 return <section className="assistantSpotlight">
  <div className="assistantGlow"/>
  <div className="assistantCopy">
   <span><Sparkles size={14}/> ORBIT Copilot</span>
   <h2>اسأل بياناتك بدل ما تدور بينها.</h2>
   <p>اكتب سؤالك بلغتك، وORBIT يحدد المصدر أولًا ثم يحسب النتيجة من بيانات مساحة العمل. وإذا احتجت خطوة فعلية يحول التحليل إلى إجراء قابل للتنفيذ.</p>
   <div className="assistantMeta"><b><Database size={14}/>{collections} مجموعات</b><b>{records.toLocaleString('ar-SA')} سجل متاح للتحليل</b></div>
   <Link href="/dashboard/assistant">افتح ORBIT Copilot <ArrowLeft size={16}/></Link>
  </div>
  <div className="assistantDemo">
   <div className="demoUser">وش أهم شيء لازم أنتبه له؟</div>
   <div className="demoOrbit"><i><WandSparkles size={14}/></i><div><b>ORBIT</b><p>{collections?'أحدد المصدر المناسب، أفحص السجلات، وبعدها أعطيك النتيجة مع الدليل المستخدم.':'ارفع أول ملف، وبعدها أقدر أحلله لك مباشرة.'}</p><span>Source-grounded analysis</span></div></div>
  </div>
 </section>
}
