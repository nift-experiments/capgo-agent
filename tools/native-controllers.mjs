import {build} from 'esbuild';
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {dirname,relative,resolve} from 'node:path';
export const controllerManifest=JSON.parse(await readFile(new URL('../migration/native-controllers.json',import.meta.url)));
export async function nativeControllerOutputs(){
 let config={};try{config=JSON.parse(await readFile('config/public.json','utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 const entryPoints=Object.fromEntries(controllerManifest.controllers.map(row=>[row.asset.replace(/\.js$/,''),row.source]));
 const result=await build({entryPoints,bundle:true,splitting:true,write:false,outdir:'public',chunkNames:'native/chunks/[name]-[hash]',format:'esm',target:'es2022',minify:true,metafile:true,legalComments:'inline',define:{'import.meta.env':JSON.stringify(config)},alias:{react:'preact/compat','react-dom':'preact/compat'},banner:{js:'// Independently built maintained vanilla controllers and declared browser libraries. See migration/native-controllers.json and frontend/licenses.'}});
 const outputs=new Map(result.outputFiles.map(file=>[relative(resolve('public'),file.path).replaceAll('\\','/'),file.contents]));
 outputs.metafile=result.metafile;return outputs;
}
export async function prepareNativeControllers(){
 const outputs=await nativeControllerOutputs();let prior=[];try{prior=JSON.parse(await readFile('.nift/native-outputs.json','utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 for(const asset of prior)if(asset.startsWith('native/chunks/')&&!outputs.has(asset)){try{await unlink('public/'+asset)}catch(error){if(error.code!=='ENOENT')throw error}}
 for(const [asset,bytes] of outputs){
  const path='public/'+asset;await mkdir(dirname(path),{recursive:true});
  try{if(Buffer.compare(await readFile(path),bytes)===0)continue}catch(error){if(error.code!=='ENOENT')throw error}
  await writeFile(path,bytes);
 }
 await mkdir('.nift',{recursive:true});await writeFile('.nift/native-outputs.json',JSON.stringify([...outputs.keys()])+'\n');
}
if(process.argv[1]?.endsWith('/native-controllers.mjs'))await prepareNativeControllers();
