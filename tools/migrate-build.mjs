import {verifyOutput} from './verify-output.mjs';
// Phase 3 bootstrap. Nift renders every HTML route; byte-identical production assets are retained.
import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';import {dirname} from 'node:path';import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';import {verify} from './golden.mjs';
const started=performance.now(),timings={};let checkpoint=started;function mark(name){const now=performance.now();timings[name]=Number(((now-checkpoint)/1000).toFixed(3));checkpoint=now;}
const buildThreads=Number(process.env.NIFT_BUILD_THREADS??-1);if(!Number.isInteger(buildThreads)||(buildThreads!==-1&&buildThreads<1))throw Error('NIFT_BUILD_THREADS must be -1 or a positive integer');
const nift=process.env.NIFT??'nift',routes=JSON.parse(await readFile('golden/routes.json')),files=JSON.parse(await readFile('golden/files.json'));
const result=await verify();if(result.errors.length)throw Error('Golden reference changed: '+JSON.stringify(result.errors));
mark('referenceVerification');
async function stable(path,text){await mkdir(dirname(path),{recursive:true});try{if(await readFile(path,'utf8')===text)return}catch(error){if(error.code!=='ENOENT')throw error}await writeFile(path,text)}
let structured=false;try{structured=(await stat('migration/structure.json')).isFile()}catch{}
const tracked=[];await stable('migration/templates/raw.html','@content');for(const row of routes){const content='migration/pages/'+row.file;if(!structured)await stable(content,'$[open('+JSON.stringify('golden/site/'+row.file)+')]');tracked.push({name:row.route==='/'?'/':row.route.endsWith('/')?row.route.slice(1):row.route.slice(1).replace(/\.html$/,''),title:row.title??'',template:'migration/templates/raw.html'})}
await stable('.nift/config.json',JSON.stringify({config:{'content-dir':'migration/pages/','content-ext':'.html','output-dir':'public/','output-ext':'.html','default-template':'migration/templates/raw.html','build-threads':buildThreads,'incremental-mode':'hash'}},null,2)+'\n');await stable('.nift/tracked.json',JSON.stringify({tracked},null,2)+'\n');
mark('configuration');
for(const row of files){if(row.path.endsWith('.html'))continue;const dest='public/'+row.path;await mkdir(dirname(dest),{recursive:true});let unchanged=false;try{unchanged=createHash('sha256').update(await readFile(dest)).digest('hex')===row.sha256}catch{}if(!unchanged)await copyFile('golden/site/'+row.path,dest)}
mark('assetVerification');
try{await stat('migration/mdx-sources.json');if(JSON.parse(await readFile('.nift/mdx-render.json')).rehypePlugins.some(p=>p.path==='components/faithful/code-blocks.mjs')){const code=spawnSync(process.execPath,['tools/prepare-code-cohort.mjs'],{stdio:'inherit'});if(code.status!==0)process.exit(code.status??1);}const prepared=spawnSync(process.execPath,['tools/prepare-faithful.mjs'],{stdio:'inherit'});if(prepared.status!==0)process.exit(prepared.status??1);}catch(error){if(error.code!=='ENOENT')throw error}
mark('mdxPreparation');
const build=spawnSync(nift,['build',...process.argv.slice(2)],{stdio:'inherit'});if(build.status!==0)process.exit(build.status??1);mark('niftBuild');const parity=await verifyOutput('public');await mkdir('evidence/parity',{recursive:true});await writeFile('evidence/parity/bootstrap-files.json',JSON.stringify(parity,null,2)+'\n');console.log(JSON.stringify({htmlRoutes:routes.length,files:files.length,parityErrors:parity.errors.length,mdxSemanticMatches:parity.semanticMatches.length}));if(parity.errors.length)process.exitCode=1;

mark('outputVerification');if(process.env.BUILD_PROFILE)console.log(JSON.stringify({buildThreads,timings,totalSeconds:Number(((performance.now()-started)/1000).toFixed(3))}));
