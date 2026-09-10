import AppShell from '@/components/AppShell';
import DashboardBuilder from '@/components/DashboardBuilder';
import {activeWorkspace} from '@/lib/auth';
import {db} from '@orbit/db';
import {redirect} from 'next/navigation';
import {LayoutDashboard} from 'lucide-react';

export default async function Builder(){
 let ws;try{ws=await activeWorkspace()}catch{redirect('/login')}if(!ws)redirect('/login');
 let dashboard=await db.dashboard.findFirst({where:{workspaceId:ws.id},orderBy:{createdAt:'asc'}});
 if(!dashboard)dashboard=await db.dashboard.create({data:{workspaceId:ws.id,name:'Main dashboard',layout:['stats','collections','activity','system']}});
 const [collectionsCount,records,imports,automations,cols,activity]=await Promise.all([
  db.collection.count({where:{workspaceId:ws.id}}),
  db.dataRecord.count({where:{collection:{workspaceId:ws.id}}}),
  db.importJob.count({where:{workspaceId:ws.id}}),
  db.automationRule.count({where:{workspaceId:ws.id,status:'ACTIVE'}}),
  db.collection.findMany({where:{workspaceId:ws.id},include:{_count:{select:{records:true}}},take:6,orderBy:{records:{_count:'desc'}}}),
  db.auditLog.findMany({where:{workspaceId:ws.id},take:6,orderBy:{createdAt:'desc'}})
 ]);
 const layout=Array.isArray(dashboard.layout)?dashboard.layout.filter((x):x is string=>typeof x==='string'):[];
 return <AppShell><div className="productPage">
  <header className="productHero"><div className="productHeroCopy"><span className="productEyebrow"><LayoutDashboard size={14}/> لوحاتك</span><h1>ابنِ لوحة تشغيلية من بياناتك.</h1><p>رتب الويدجت، شيل اللي ما تحتاجه، ورجع أي جزء في أي وقت. كل الأرقام مربوطة مباشرة ببيانات مساحة العمل.</p></div></header>
  <DashboardBuilder dashboardId={dashboard.id} initial={layout} stats={{collections:collectionsCount,records,imports,automations}} collections={cols.map(c=>({name:c.name,records:c._count.records}))} activity={activity.map(a=>({action:a.action,at:a.createdAt.toISOString()}))}/>
 </div></AppShell>
}
