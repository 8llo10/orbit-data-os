import AppShell from '@/components/AppShell';
import OrbitAssistant from '@/components/OrbitAssistant';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {Database,Link2,ShieldCheck,Sparkles,Workflow} from 'lucide-react';

export default async function AssistantPage(){
 const ws=await activeWorkspace().catch(()=>null);if(!ws)redirect('/login');
 const [collections,records,relations,automations]=await Promise.all([
  db.collection.count({where:{workspaceId:ws.id}}),
  db.dataRecord.count({where:{collection:{workspaceId:ws.id}}}),
  db.collectionRelation.count({where:{fromCollection:{workspaceId:ws.id}}}),
  db.automationRule.count({where:{workspaceId:ws.id,status:'ACTIVE'}})
 ]);
 return <AppShell><div className="productPage">
  <section className="assistantHero"><div className="productHeroCopy"><span className="productEyebrow"><Sparkles size={14}/> ORBIT Copilot</span><h1>اسأل بياناتك، وخله يشتغل عليها.</h1><p>الإجابة لازم ترتبط بمصدر واضح داخل ملفاتك. وإذا طلبت إجراء، ORBIT يعرضه لك قبل التنفيذ ثم ينفذه بعد تأكيدك.</p></div><div className="surface assistantContext"><span>السياق المتاح الآن</span><div><b>{collections}</b><small>مجموعات بيانات</small></div><div><b>{records.toLocaleString('ar-SA')}</b><small>سجل</small></div><div><b>{relations}</b><small>علاقات</small></div><div><b>{automations}</b><small>أتمتة فعالة</small></div></div></section>
  <div className="assistantMainGrid"><OrbitAssistant/><aside className="assistantBenefits"><article className="surface miniCard"><Database size={18}/><div><b>مصدر قبل الإجابة</b><p>كل نتيجة عن ملفاتك تعرض مصدرها والحقول وعدد السجلات المفحوصة.</p></div></article><article className="surface miniCard"><ShieldCheck size={18}/><div><b>تنفيذ بعد التأكيد</b><p>أي Dashboard أو View أو Automation يحتاج موافقتك قبل الحفظ.</p></div></article><article className="surface miniCard"><Workflow size={18}/><div><b>من سؤال إلى إجراء</b><p>حوّل التحليل إلى خطوة فعلية بدل ما توقف عند الرد النصي.</p></div></article><article className="surface miniCard"><Link2 size={18}/><div><b>يفهم العلاقات</b><p>كل ما زادت العلاقات بين البيانات، قدر ORBIT يربط أكثر من مصدر مع بعض.</p></div></article></aside></div>
 </div></AppShell>
}
