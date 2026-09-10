import {NextResponse} from 'next/server';
import {db} from '@orbit/db';
import bcrypt from 'bcryptjs';
import {createSession} from '@/lib/auth';
import {slugify} from '@orbit/core';

export async function POST(req:Request){
  const form=await req.formData();
  const name=String(form.get('name')||'').trim();
  const email=String(form.get('email')||'').trim().toLowerCase();
  const password=String(form.get('password')||'');
  if(!email||password.length<8)return NextResponse.redirect(new URL('/register?error=invalid',req.url),303);
  const exists=await db.user.findUnique({where:{email}});
  if(exists)return NextResponse.redirect(new URL('/login?error=exists',req.url),303);
  const passwordHash=await bcrypt.hash(password,12);
  const base=slugify(name||email.split('@')[0]||'workspace');
  let slug=base;let i=1;
  while(await db.workspace.findUnique({where:{slug}}))slug=`${base}-${i++}`;
  const workspace=await db.workspace.create({data:{name:name?`${name}'s Orbit`:'My Orbit',slug}});
  const user=await db.user.create({
    data:{
      email,
      name:name||null,
      passwordHash,
      memberships:{create:{role:'OWNER',workspaceId:workspace.id}}
    }
  });
  await db.auditLog.create({data:{workspaceId:workspace.id,userId:user.id,action:'WORKSPACE_CREATED',entityType:'Workspace',entityId:workspace.id,metadata:{name:workspace.name}}});
  await createSession(user.id);
  return NextResponse.redirect(new URL('/dashboard',req.url),303);
}
