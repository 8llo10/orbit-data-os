import http from 'node:http';
import {randomUUID} from 'node:crypto';

const PORT=Number(process.env.PORT||4000);
const startedAt=new Date().toISOString();

function json(res,status,body){
  res.writeHead(status,{
    'content-type':'application/json; charset=utf-8',
    'access-control-allow-origin':'*',
    'access-control-allow-headers':'content-type, authorization, x-api-key',
    'access-control-allow-methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'x-orbit-request-id':randomUUID()
  });
  res.end(JSON.stringify(body));
}

const server=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS') return json(res,204,{});
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);

  if(url.pathname==='/health'){
    return json(res,200,{service:'orbit-api',status:'healthy',version:'0.1.0',startedAt,now:new Date().toISOString()});
  }

  if(url.pathname==='/v1'){
    return json(res,200,{
      name:'ORBIT API',
      purpose:'Operational data layer for imports, collections, analytics, automations and integrations.',
      modules:['auth','workspaces','collections','records','imports','analytics','automations','notifications','api-keys','webhooks','audit']
    });
  }

  if(url.pathname==='/v1/capabilities'){
    return json(res,200,{
      authentication:['session','api-key'],
      ingestion:['csv','tsv','xlsx','json'],
      data:['collections','typed-fields','records','relations','saved-views'],
      intelligence:['schema-inference','data-profiling','quality-metrics'],
      operations:['automations','webhooks','audit-log','notifications']
    });
  }

  return json(res,404,{error:'route_not_found',message:'ORBIT API route not found.'});
});

server.listen(PORT,()=>console.log(`[ORBIT API] listening on :${PORT}`));
