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
  db.collectionRelation.count({where:{workspaceId:ws.id}}),
  db.automationRule.count({where:{workspaceId:ws.id,status:'ACTIVE'}})
 ]);
 return <AppShell><div className="assistantPage">
  <section className="assistantIntro"><div><span className="assistantKicker"><Sparkles size={14}/> الميزة الرئيسية في ORBIT</span><h1>اسأل بياناتك. مو مجرد Chatbot.</h1><p>ORBIT Assistant يقرأ بنية مساحة العمل، يستخرج الأرقام من بياناتك أولًا، ثم يشرحها لك بلغة بسيطة. ومن نفس المحادثة يقدر يقترح لوحة، فلتر، علاقة أو أتمتة بدل ما يكتفي بإجابة نصية.</p></div><div className="contextCard"><span>السياق المتاح الآن</span><div><b>{collections}</b><small>مجموعات بيانات</small></div><div><b>{records.toLocaleString('ar-SA')}</b><small>سجل</small></div><div><b>{relations}</b><small>علاقات</small></div><div><b>{automations}</b><small>أتمتة فعالة</small></div></div></section>
  <div className="assistantLayout"><OrbitAssistant/><aside className="assistantSide"><article><Database size={18}/><div><b>يعتمد على بياناتك</b><p>الإجابة تتكوّن من schema وإحصائيات وسجلات مساحة العمل، مو من تخمين النموذج.</p></div></article><article><ShieldCheck size={18}/><div><b>تنفيذ آمن</b><p>أي إجراء يغيّر بياناتك أو ينشئ أتمتة يحتاج تأكيد واضح منك.</p></div></article><article><Workflow size={18}/><div><b>من سؤال إلى إجراء</b><p>حوّل النتيجة إلى Dashboard أو View أو Automation بدل ما تنسخ الرد يدويًا.</p></div></article><article><Link2 size={18}/><div><b>يفهم العلاقات</b><p>كلما ربطت مجموعات أكثر، يقدر ORBIT يعطيك إجابات أشمل عبر أكثر من مصدر.</p></div></article></aside></div>
  <style>{`.assistantPage{padding:12px 0 70px}.assistantIntro{display:grid;grid-template-columns:1.5fr .8fr;gap:30px;align-items:end;padding:28px 0}.assistantKicker{display:inline-flex;align-items:center;gap:7px;color:#d6afe0;font-size:10px;font-weight:900}.assistantIntro h1{font-size:48px;line-height:1.08;margin:10px 0 14px;max-width:850px}.assistantIntro p{color:var(--muted);line-height:1.9;max-width:850px;margin:0}.contextCard{border:1px solid var(--border);background:var(--panel);border-radius:20px;padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.contextCard>span{grid-column:1/-1;font-size:9px;color:var(--muted);margin-bottom:3px}.contextCard div{border:1px solid var(--border);border-radius:12px;padding:11px;background:rgba(255,255,255,.02)}.contextCard b{display:block;font-size:20px}.contextCard small{font-size:9px;color:var(--muted)}.assistantLayout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:12px}.assistantSide{display:flex;flex-direction:column;gap:10px}.assistantSide article{border:1px solid var(--border);background:var(--panel);border-radius:16px;padding:15px;display:flex;gap:11px}.assistantSide article>svg{color:#d6afe0;flex:0 0 auto}.assistantSide b{font-size:11px}.assistantSide p{font-size:9px;color:var(--muted);line-height:1.7;margin:5px 0 0}@media(max-width:950px){.assistantIntro,.assistantLayout{grid-template-columns:1fr}.assistantSide{display:grid;grid-template-columns:1fr 1fr}}@media(max-width:650px){.assistantIntro h1{font-size:36px}.assistantSide{grid-template-columns:1fr}.contextCard{grid-template-columns:1fr 1fr}}`}</style>
 </div></AppShell>
}
