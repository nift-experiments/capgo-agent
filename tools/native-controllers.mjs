import {build} from 'esbuild';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
export const controllerManifest=JSON.parse(await readFile(new URL('../migration/native-controllers.json',import.meta.url)));
export async function nativeControllerOutputs(){
 const outputs=new Map();
 for(const row of controllerManifest.controllers){
  const result=await build({entryPoints:[row.source],bundle:true,write:false,format:'esm',target:'es2022',minify:false,legalComments:'inline',banner:{js:'// Cap-go/website 7d5b69d, AGPL-3.0. Independently built maintained vanilla controller.'}});
  outputs.set(row.asset,result.outputFiles[0].contents);
 }
 return outputs;
}
export async function prepareNativeControllers(){
 for(const [asset,bytes] of await nativeControllerOutputs()){
  const path='public/'+asset;await mkdir(dirname(path),{recursive:true});
  try{if(Buffer.compare(await readFile(path),bytes)===0)continue}catch(error){if(error.code!=='ENOENT')throw error}
  await writeFile(path,bytes);
 }
}

if(process.argv[1]?.endsWith('/native-controllers.mjs'))await prepareNativeControllers();
