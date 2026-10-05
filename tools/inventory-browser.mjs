import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parse} from 'parse5';
import {nativeControllerOutputs,controllerManifest} from './native-controllers.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const routes=JSON.parse(await readFile('golden/routes.json')),files=JSON.parse(await readFile('golden/files.json'));
const native=await nativeControllerOutputs(),entry=new Set(controllerManifest.controllers.map(r=>r.asset));
const inline=new Map(),references=new Map(),islands=[];
for(const row of routes){
 function visit(node){
  if(node.tagName==='astro-island')islands.push({route:row.route,attrs:node.attrs});
  if(node.tagName==='script'){
   const attrs=Object.fromEntries(node.attrs.map(a=>[a.name,a.value]));
   if(attrs.src){const old=references.get(attrs.src)??{url:attrs.src,routes:[],type:attrs.type??'classic'};old.routes.push(row.route);references.set(attrs.src,old)}
   else if(!attrs.type||attrs.type==='module'||attrs.type==='text/javascript'){
    const code=(node.childNodes??[]).filter(n=>n.nodeName==='#text').map(n=>n.value).join('');if(code.trim()){
     const key=hash(code),old=inline.get(key)??{sha256:key,bytes:Buffer.byteLength(code),sample:code.slice(0,180),routes:[],classification:1,implementation:'Maintained vanilla JavaScript/data initializer within Nift HTML includes; no framework hydration'};
     old.routes.push(row.route);inline.set(key,old);
    }
   }
  }
  for(const child of node.childNodes??[])visit(child);
 }
 visit(parse(await readFile('public/'+row.file,'utf8')));
}
const retained=files.filter(r=>r.path.endsWith('.js')&&!entry.has(r.path)).map(r=>({...r,classification:3,implementation:'Reference artifact pending reachability/pruning audit; rebuilt entry controllers do not depend on these old library chunks'}));
const external=[...references.values()].filter(r=>!r.url.startsWith('/')).map(r=>({...r,classification:3,implementation:'External service script retained for behavioral parity; provider availability/credentials remain runtime dependencies'}));
const rebuilt=[...native].map(([path,bytes])=>{const inputs=Object.keys(native.metafile.outputs['public/'+path]?.inputs??{});const reactive=inputs.some(input=>/node_modules\/(preact|@docsearch)/.test(input));const library=inputs.some(input=>input.startsWith('node_modules/'));return {path,bytes:bytes.length,sha256:hash(bytes),entry:entry.has(path),classification:reactive?4:library?3:1,implementation:reactive?'Isolated DocSearch library widget':library?'Pinned third-party browser library':'Maintained vanilla JavaScript',inputs};});
const report={reference:controllerManifest.reference,frameworkHydrationElements:islands,maintainedEntryControllers:controllerManifest.controllers,generatedBrowserAssets:rebuilt,retainedReferenceJavaScript:retained,inlineVanilla:[...inline.values()],externalServices:external,scriptReferences:[...references.values()],summary:{routes:routes.length,entryControllers:entry.size,generatedAssets:rebuilt.length,generatedBytes:rebuilt.reduce((s,r)=>s+r.bytes,0),retainedReferenceAssets:retained.length,retainedReferenceBytes:retained.reduce((s,r)=>s+r.bytes,0),distinctInlineControllers:inline.size,frameworkHydrationElements:islands.length},reactiveException:{component:'Algolia DocSearch 3.9.0',runtime:'Preact compatibility layer',boundary:'Docs sl-doc-search custom element only; asynchronously imported',classification:4,reason:'Ranked hierarchical search, recent/favorite history, autocomplete keyboard selection, modal focus lifecycle and internationalized accessibility remain the standard library widget; rebuilding all this duplicates a substantial accessibility-sensitive state machine.'}};
await mkdir('evidence/runtime',{recursive:true});await writeFile('evidence/runtime/browser-inventory.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary));
