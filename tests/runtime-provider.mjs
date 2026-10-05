import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {handler} from '../runtime/server.mjs';
const observed=[];
let invalid=false;
const provider=createServer(async(req,res)=>{
 let body='';for await(const part of req)body+=part;
 observed.push({path:req.url,method:req.method,authorization:req.headers.authorization,body});
 res.setHeader('Content-Type','application/json');
 res.end(JSON.stringify(invalid?{unexpected:true}:req.url==='/private/credits'?{total_cost:2}:{files:[{fileName:'test-only.txt',mimeType:'text/plain',content:'fixture',encoding:'utf8'}],subject:{}}));
});
const site=createServer(handler);provider.listen(0,'127.0.0.1');site.listen(0,'127.0.0.1');await Promise.all([once(provider,'listening'),once(site,'listening')]);
const origin='http://127.0.0.1:'+site.address().port;
const prior=Object.fromEntries(['CAPGO_API_MODE','CAPGO_PROVIDER_URL','CAPGO_PROVIDER_TOKEN'].map(k=>[k,process.env[k]]));
try{
 process.env.CAPGO_API_MODE='snapshot';delete process.env.CAPGO_PROVIDER_URL;
 const unavailable=await fetch(origin+'/api/tools/ios-certificate-generator',{method:'POST',body:'{}'});assert.equal(unavailable.status,503);assert.equal((await unavailable.json()).setupRequired,true);
 process.env.CAPGO_API_MODE='live';process.env.CAPGO_PROVIDER_URL='http://127.0.0.1:'+provider.address().port;process.env.CAPGO_PROVIDER_TOKEN='test-only-server-token';
 const credits=await fetch(origin+'/private/credits',{method:'POST',body:JSON.stringify({mau:100000}),headers:{'Content-Type':'application/json'}});assert.equal(credits.status,200);assert.deepEqual(await credits.json(),{total_cost:2});assert.equal(observed.at(-1).authorization,'Bearer test-only-server-token');assert.deepEqual(JSON.parse(observed.at(-1).body),{mau:100000});
 const tool=await fetch(origin+'/api/tools/ios-certificate-generator',{method:'POST',body:'{}'});assert.equal(tool.status,200);assert.equal((await tool.json()).files[0].content,'fixture');
 assert.equal((await fetch(origin+'/api/tools/ios-certificate-generator')).status,405);
 assert.equal((await fetch(origin+'/api/unknown')).status,404);
 invalid=true;assert.equal((await fetch(origin+'/private/credits',{method:'POST',body:'{}'})).status,502);
 console.log('Own-provider forwarding, setup state, method allowlist and invalid response rejection pass. Fixtures are not signing certificates.');
}finally{
 for(const [k,v]of Object.entries(prior))if(v===undefined)delete process.env[k];else process.env[k]=v;
 site.closeAllConnections();provider.closeAllConnections();await Promise.all([new Promise(r=>site.close(r)),new Promise(r=>provider.close(r))]);
}
