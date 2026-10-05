import {readFile,writeFile} from 'node:fs/promises';
import {basename} from 'node:path';
import {createHash} from 'node:crypto';
import {nativeControllerOutputs,controllerManifest} from './native-controllers.mjs';
const inventory=JSON.parse(await readFile('golden/files.json'));
const entries=new Set(controllerManifest.controllers.map(x=>x.asset));
const candidates=inventory.filter(x=>x.path.endsWith('.js')&&!entries.has(x.path));
const native=await nativeControllerOutputs();
const roots=inventory.filter(x=>/\.(html|css|json|txt|xml|svg|webmanifest)$/.test(x.path));
const texts=[];for(const row of roots)texts.push([row.path,await readFile('public/'+row.path,'utf8')]);
for(const [path,bytes]of native)texts.push([path,Buffer.from(bytes).toString('utf8')]);
const retired=[],retained=[];
for(const row of candidates){const needle=basename(row.path);const references=texts.filter(([,text])=>text.includes(needle)).map(([path])=>path);(references.length?retained:retired).push({...row,references,reason:references.length?'Reachable from rendered root or rebuilt browser asset':'No reference in rendered HTML, text assets or rebuilt module graph'});}
const policy={reference:controllerManifest.reference,retired:retired.map(x=>x.path)};
const report={rootCount:texts.length,rootDigest:createHash('sha256').update(texts.map(([p,t])=>p+createHash('sha256').update(t).digest('hex')).join('\n')).digest('hex'),retired,retained,retiredBytes:retired.reduce((s,r)=>s+r.bytes,0)};
await writeFile('migration/retired-assets.json',JSON.stringify(policy,null,2)+'\n');await writeFile('evidence/runtime/retired-assets-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({retired:retired.length,retained:retained.length,retiredBytes:report.retiredBytes}));
