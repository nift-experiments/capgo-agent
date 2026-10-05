import {readFile,writeFile,stat,readdir} from 'node:fs/promises';
import {posix} from 'node:path';
import {nativeControllerOutputs,controllerManifest,retiredAssets} from './native-controllers.mjs';
if(!process.argv.includes('--stdin'))throw Error('Pipe git ls-files -z into this audit with --stdin');
let listing='';for await(const chunk of process.stdin)listing+=chunk;
const tracked=listing.split('\0').filter(Boolean);if(!tracked.length)throw Error('Empty tracked file inventory');
const files=JSON.parse(await readFile('golden/files.json'));
async function summary(paths){let bytes=0;for(const p of paths)bytes+=(await stat(p)).size;return {files:paths.length,bytes};}
async function tree(root){let files=[];for(const x of await readdir(root,{withFileTypes:true})){const path=posix.join(root,x.name);if(x.isDirectory())files.push(...await tree(path));else if(x.isFile())files.push(path)}return files}
const native=await nativeControllerOutputs();
function reach(path,lazy=true,seen=new Set()){
 if(seen.has(path))return seen;seen.add(path);
 const row=native.metafile.outputs['public/'+path];
 for(const imp of row?.imports??[]){if(imp.external||(!lazy&&imp.kind==='dynamic-import'))continue;const target=imp.path.replace(/^public\//,'');if(native.has(target))reach(target,lazy,seen)}return seen;
}
const entryCosts=controllerManifest.controllers.map(row=>{const initial=reach(row.asset,false),possible=reach(row.asset,true);const bytes=set=>[...set].reduce((s,p)=>s+(native.get(p)?.length??0),0);return {source:row.source,asset:row.asset,initialUncompressedJsBytes:bytes(initial),includingReachableLazyJsBytes:bytes(possible),initialAssets:[...initial],allAssets:[...possible]};});
const lock=JSON.parse(await readFile('package-lock.json'));
const report={routeCount:JSON.parse(await readFile('golden/routes.json')).length,maintainedWrappers:await summary(tracked.filter(x=>x.startsWith('migration/pages/')&&x.endsWith('.html'))),maintainedIncludes:await summary(tracked.filter(x=>x.startsWith('migration/includes/')&&x.endsWith('.html'))),authoredHtmlFragments:await summary(tracked.filter(x=>x.startsWith('migration/fragments/')&&x.endsWith('.html'))),templates:await summary(tracked.filter(x=>x.startsWith('migration/templates/'))),frontendSources:await summary(await tree('frontend').then(x=>x.filter(p=>p.endsWith('.js')))),generatedBrowserAssets:{files:native.size,bytes:[...native.values()].reduce((s,b)=>s+b.length,0)},retiredOriginalJs:{files:retiredAssets.size,bytes:files.filter(x=>retiredAssets.has(x.path)).reduce((s,r)=>s+r.bytes,0)},retainedCss:{files:files.filter(x=>x.path.endsWith('.css')).length,bytes:files.filter(x=>x.path.endsWith('.css')).reduce((s,r)=>s+r.bytes,0)},lockPackages:Object.keys(lock.packages).length-1,installedNodeModules:await summary(await tree('node_modules')),frameworkPackages:Object.keys(lock.packages).filter(x=>/node_modules\/(astro|react|react-dom|preact)$/.test(x)),entryCosts,normalBuild:'Nift wrappers/includes + independently bundled native JS; no MDX parse/render, Astro or upstream checkout required',cache:'Nift ignored hash state and ignored .nift/native-outputs.json; output writes are stable. Esbuild bundles all native entries on each pre-build invocation. No bespoke frozen-benchmark cache.'};
await writeFile('evidence/runtime/architecture-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,entryCosts:entryCosts.map(({source,initialUncompressedJsBytes,includingReachableLazyJsBytes})=>({source,initialUncompressedJsBytes,includingReachableLazyJsBytes}))}));
