import type {WorkspaceRole} from '@prisma/client';
export type Capability='workspace:read'|'data:read'|'data:write'|'automation:write'|'dashboard:write'|'assistant:use'|'admin:manage';
const matrix:Record<WorkspaceRole,Capability[]>={OWNER:['workspace:read','data:read','data:write','automation:write','dashboard:write','assistant:use','admin:manage'],ADMIN:['workspace:read','data:read','data:write','automation:write','dashboard:write','assistant:use','admin:manage'],MEMBER:['workspace:read','data:read','data:write','automation:write','dashboard:write','assistant:use'],VIEWER:['workspace:read','data:read','assistant:use']};
export const can=(role:WorkspaceRole,capability:Capability)=>matrix[role].includes(capability);
