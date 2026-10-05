// One-time source recovery; ordinary builds use only tracked frontend sources.
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {resolve,dirname,relative,posix} from 'node:path';
import {transform} from 'esbuild';
const upstream=resolve(process.argv[2]??'');
if(!process.argv[2])throw Error('Pass pinned Capgo checkout path');
const base=resolve(upstream,'apps/web/src');
const manifest=JSON.parse(await readFile('migration/native-controllers.json'));
const assets=JSON.parse(await readFile('golden/files.json')).map(row=>'/'+row.path).filter(path=>path.startsWith('/_astro/')&&path.endsWith('.js'));
const definitions=[
 ['pricing','components/pricing/PricingCalculator.astro',0,'PricingCalculator.'],
 ['webmcp','components/WebMcpTools.astro',0,'WebMcpTools.'],
 ['builder-data','pages/builder-data.astro',0,'builder-data.'],
 ['live-data','pages/data.astro',0,'/data.'],
 ['android-keystore','pages/tools/android-keystore-generator/index.astro',0,'index.astro_astro_type_script_index_0_lang.Dmd'],
 ['ios-csr','pages/tools/ios-certificate-generator/index.astro',0,'index.astro_astro_type_script_index_0_lang.Doe'],
 ['ios-converter','pages/tools/ios-certificate-generator/index.astro',1,'index.astro_astro_type_script_index_1'],
 ['register','pages/register.astro',1,'register.'],
 ['semver-tester','pages/semver_tester.astro',0,'semver_tester.'],
];
const recovered=new Set();
async function sourceFile(path){for(const candidate of [path,path+'.ts',path+'.js',resolve(path,'index.ts')]){try{if((await stat(candidate)).isFile())return candidate}catch{}}throw Error('Unresolved source '+path)}
async function recoverHelper(path){
 path=await sourceFile(path);const rel=relative(base,path);if(rel.startsWith('..'))throw Error('Unexpected external source '+path);
 const dest='frontend/recovered/'+rel.replace(/\.ts$/,'.js');
 if(rel==='config/app.ts')return 'frontend/runtime-config.js';
 if(recovered.has(path))return dest;recovered.add(path);
 // Runtime config is a native browser module; build-only SEO/date helpers do not belong here.
 const source=await readFile(path,'utf8');await writeSource(source,path,dest);return dest;
}
async function writeSource(source,sourcePath,dest){
 let code=(await transform(source,{loader:'ts',format:'esm',target:'es2022',minify:false})).code;
 const imports=[...code.matchAll(/(?:\bfrom\s*|\bimport\s*\(|\bimport\s*)(["'])([^"']+)\1/g)];
 for(const match of imports.reverse()){
  const spec=match[2];if(!spec.startsWith('@/')&&!spec.startsWith('.'))continue;
  const helper=await recoverHelper(spec.startsWith('@/')?resolve(base,spec.slice(2)):resolve(dirname(sourcePath),spec));
  let replacement=posix.relative(posix.dirname(dest),helper);if(!replacement.startsWith('.'))replacement='./'+replacement;
  const start=match.index+match[0].lastIndexOf(spec);code=code.slice(0,start)+replacement+code.slice(start+spec.length);
 }
 await mkdir(dirname(dest),{recursive:true});await writeFile(dest,'// Cap-go/website 7d5b69d, AGPL-3.0. Maintained vanilla browser source.\n'+code);
}
for(const [name,source,index,assetMatch] of definitions){
 const sourcePath=resolve(base,source),text=await readFile(sourcePath,'utf8');
 const scripts=[...text.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('is:inline'));
 if(!scripts[index])throw Error('Missing script '+source);
 const dest='frontend/'+name+'.js';await writeSource(scripts[index][2],sourcePath,dest);
 if(name==='pricing'){const code=await readFile(dest,'utf8');await writeFile(dest,code.replace('setupPricingCalculator(config)', 'setupPricingCalculator({...config,apiBaseUrl:import.meta.env.PUBLIC_BASE_API_URL || config.apiBaseUrl})'));}
 const matches=assets.filter(a=>a.includes(assetMatch));if(matches.length!==1)throw Error('Asset mapping ambiguous '+name);
 if(!manifest.controllers.some(r=>r.source===dest))manifest.controllers.push({source:dest,upstream:'apps/web/src/'+source,asset:matches[0].slice(1)});
}
await writeFile('migration/native-controllers.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({controllers:manifest.controllers.length,helpers:recovered.size}));
