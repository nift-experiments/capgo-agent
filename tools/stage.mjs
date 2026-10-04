import {inspect,highlight} from './indexing.mjs';
import {load as yaml} from '../vendor/js-yaml.mjs';
import {readFile,writeFile,mkdir,stat,readdir,copyFile} from 'node:fs/promises';import {resolve,dirname,join,extname} from 'node:path';import {createHash} from 'node:crypto';import {performance} from 'node:perf_hooks';
const root=process.cwd(),agent=root.endsWith('capgo-agent'),prefix=agent?'corpus/source/':'corpus/authored/';
const manifest=JSON.parse(await readFile('data/corpus-manifest.json')),options=JSON.parse(await readFile('.nift/mdx-render.json'));
async function stable(path,text){await mkdir(dirname(path),{recursive:true});try{if(await readFile(path,'utf8')===text)return;}catch(error){if(error.code!=='ENOENT')throw error;}await writeFile(path,text);}
const start=performance.now();let prepared=0,cached=0;
if(!agent){const {preparePaths}=await import('../.nift/packages/mdx/renderer/prepare.mjs');const paths=manifest.records.filter(x=>['docs','blog','plugin'].includes(x.family)).map(x=>prefix+x.source);for(let i=0;i<paths.length;i+=900){const report=await preparePaths(paths.slice(i,i+900),options);prepared+=report.prepared;cached+=report.cached;}}
const {render}=agent?await import('./render.mjs'):{render:null};
const metadata=[],search=[];
for(const row of manifest.records){const id=createHash('sha256').update(row.route).digest('hex').slice(0,16),sourcePath=row.source?prefix+row.source:null,record='data/pages/'+encodeURIComponent(row.route)+'.json',fragment='build/fragments/'+id+'.html';
 let currentMetadata=row.metadata,body;if(agent){const data=JSON.parse(await readFile(record));currentMetadata=data.metadata;body=render(data);await stable(fragment,highlight(body));}else if(['docs','blog','plugin'].includes(row.family)){const source=await readFile(sourcePath,'utf8'),front=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);if(front)currentMetadata=yaml(front[1])??{};body=JSON.parse(await readFile('.nift/mdx-prepared/'+sourcePath+'.json')).html;}else body=await readFile('content/marketing/'+id+'.html','utf8');
 const semantic=inspect(body);const m={...row,metadata:currentMetadata,headings:semantic.headings,id,sourcePath,record,fragment:agent?fragment:'content/marketing/'+id+'.html'};metadata.push(m);search.push({route:row.route,title:currentMetadata.title??row.title,text:semantic.text});

}
await stable('public/search-index.json',JSON.stringify(search));
await stable('build/pages.json',JSON.stringify(metadata));console.log(JSON.stringify({stageMilliseconds:performance.now()-start,prepared,cached,pages:metadata.length}));
