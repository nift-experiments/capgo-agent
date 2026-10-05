// Run serially after build; corrupt and restore one entry and one lazy library chunk.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {nativeControllerOutputs} from '../tools/native-controllers.mjs';
import {verifyOutput} from '../tools/verify-output.mjs';
const outputs=await nativeControllerOutputs();
const assets=[...outputs.keys()];
for(const asset of [assets.find(p=>p.startsWith('_astro/')),assets.find(p=>p.startsWith('native/chunks/'))]){
 const path='public/'+asset,original=await readFile(path);
 try{await writeFile(path,'// invalid generated asset\n');const result=await verifyOutput();assert(result.errors.some(error=>error.path===asset&&error.reason==='Native controller differs from maintained source'));}
 finally{await writeFile(path,original)}
}
console.log('Entry and lazy chunk corruption rejected; original assets restored.');
