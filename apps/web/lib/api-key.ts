import {createHash,randomBytes} from 'crypto';import {db} from '@orbit/db';
const hash=(v:string)=>createHash('sha256').update(v).digest('hex');
export function generateApiKey(){const raw='orb_'+randomBytes(24).toString('hex');return {raw,hash:hash(raw),prefix:raw.slice(0,12)}}
export async function workspaceFromApiKey(req:Request){const key=req.headers.get('x-api-key');if(!key)return null;const found=await db.apiKey.findUnique({where:{keyHash:hash(key)},include:{workspace:true}});if(!found)return null;await db.apiKey.update({where:{id:found.id},data:{lastUsedAt:new Date()}});return found.workspace}
