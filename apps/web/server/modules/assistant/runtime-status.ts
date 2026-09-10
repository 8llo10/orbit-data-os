import {providerConfigured} from './config';
import {publicToolManifest} from './tool-registry';

export function assistantRuntimeStatus(){
 const configured=providerConfigured();
 return {
  provider:{configured,model:configured?(process.env.AI_MODEL||'configured'):null,mode:configured?'ai-orchestrated':'deterministic'},
  tools:publicToolManifest(),
  guarantees:{sourceGrounded:true,confirmedMutations:true,auditLoggedMutations:true,directSqlFromModel:false}
 } as const;
}
