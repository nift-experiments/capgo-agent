import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {load} from './deps.mjs';
const {createProcessor}=await load('@mdx-js/mdx'),gfm=(await load('remark-gfm')).default;
const hash=x=>createHash('sha256').update(x).digest('hex');
const root=process.cwd(),manifest=JSON.parse(await readFile('data/corpus-manifest.json')),imageModules=JSON.parse(await readFile('data/image-modules.json')),pluginCount=JSON.parse(await readFile('data/plugins.json')).plugins.length;
const known=new Set(['Steps','Aside','Card','CardGrid','LinkCard','Tabs','TabItem','Code','FileTree','PackageManagers','MermaidGraph','YouTubeEmbed','BuildCredentialsQuestionnaire','ConditionalQuestionnaire','BlogMidArticleCta','PluginSetupSteps','PluginsDirectory']);
function value(node,env){
 if(!node)return undefined;
 if(node.type==='Literal')return node.value;
 if(node.type==='Identifier'){if(Object.hasOwn(env,node.name))return env[node.name];throw new Error('Unknown data binding '+node.name);}
 if(node.type==='ArrayExpression')return node.elements.map(n=>value(n,env));
 if(node.type==='ObjectExpression')return Object.fromEntries(node.properties.map(p=>{if(p.type!=='Property'||p.computed||p.kind!=='init')throw new Error('Unsupported object expression');return [p.key.name??p.key.value,value(p.value,env)];}));
 if(node.type==='MemberExpression'){const object=value(node.object,env),key=node.computed?value(node.property,env):node.property.name;if(key==='__proto__'||key==='constructor'||key==='prototype')throw new Error('Unsafe data member');return object[key];}
 if(node.type==='TemplateLiteral')return node.quasis.map((q,i)=>q.value.cooked+(i<node.expressions.length?String(value(node.expressions[i],env)):'')).join('');
 if(node.type==='UnaryExpression'&&node.operator==='-')return -value(node.argument,env);
 throw new Error('Unsupported executable expression: '+node.type);
}
function strip(source){const found=/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(source);return found?source.slice(found[0].length):source;}
function convert(node,env){
 const location=node.position?{line:node.position.start.line,column:node.position.start.column}:undefined;
 if(node.type==='mdxjsEsm'){
  for(const statement of node.data.estree.body){
   if(statement.type==='ImportDeclaration'){
    const spec=statement.source.value;
    for(const binding of statement.specifiers){
     const component=binding.type==='ImportDefaultSpecifier'?spec.split('/').at(-1).replace(/\.astro$/,''):binding.imported?.name;
     if(known.has(component)||spec==='@astrojs/starlight/components')env[binding.local.name]={component};
     else if(spec==='@/config/plugins'&&binding.imported?.name==='pluginCountLabel')env[binding.local.name]=pluginCount+'+';
     else if(Object.hasOwn(imageModules,spec))env[binding.local.name]={src:imageModules[spec]};
     else throw new Error('Unmapped import '+spec+' '+binding.local.name);
    }
   }else if(statement.type==='ExportNamedDeclaration'&&statement.declaration?.type==='VariableDeclaration'){
    for(const d of statement.declaration.declarations){if(d.id.type!=='Identifier')throw new Error('Unsupported export binding');env[d.id.name]=value(d.init,env);}
   }else throw new Error('Unsupported module declaration '+statement.type);
  }return null;
 }
 if(node.type==='mdxFlowExpression'||node.type==='mdxTextExpression'){
  const statements=node.data?.estree?.body??[];if(!statements.length)return null;if(statements.length===1&&statements[0].type==='ExpressionStatement')return {type:'text',text:String(value(statements[0].expression,env)),location};throw new Error('Unsupported expression block');
 }
 if(node.type==='mdxJsxFlowElement'||node.type==='mdxJsxTextElement'){
  if(!node.name)return {type:'group',blocks:(node.children??[]).map(n=>convert(n,env)).filter(Boolean)};
  const name=env[node.name]?.component??node.name;const props={};
  for(const a of node.attributes??[]){if(a.type!=='mdxJsxAttribute')throw new Error('Unsupported spread attribute');props[a.name]=a.value===null?true:typeof a.value==='string'?a.value:value(a.value.data.estree.body[0].expression,env);}
  if(/^[A-Z]/.test(name)&&!known.has(name))throw new Error('Unknown component '+name);
  return {type:/^[A-Z]/.test(name)?'component':'element',name,props,blocks:(node.children??[]).map(n=>convert(n,env)).filter(Boolean),location};
 }
 const accepted=new Set(['root','text','paragraph','heading','strong','emphasis','delete','inlineCode','code','list','listItem','link','image','blockquote','thematicBreak','break','table','tableRow','tableCell','html','definition','linkReference','imageReference']);if(!accepted.has(node.type))throw new Error('Unknown semantic block '+node.type);
 const block={type:node.type,location};for(const key of ['depth','ordered','start','spread','checked','url','title','alt','lang','meta','align','identifier','referenceType'])if(node[key]!==undefined)block[key]=node[key];if(node.value!==undefined)block.text=node.value;if(node.children)block.blocks=node.children.map(n=>convert(n,env)).filter(Boolean);return block;
}
let state={version:1,pages:{}};try{state=JSON.parse(await readFile('data/import-state.json'));}catch(error){if(error.code!=='ENOENT')throw error;}
let imported=0,preserved=0;await mkdir('data/pages',{recursive:true});
for(const row of manifest.records.filter(x=>['docs','blog','plugin'].includes(x.family))){
 const sourcePath='corpus/source/'+row.source,source=await readFile(sourcePath,'utf8'),sourceHash=hash(source);if(sourceHash!==row.sourceSha256)throw new Error('Source differs from pinned manifest: '+sourcePath);
 const file='data/pages/'+encodeURIComponent(row.route)+'.json';let existing;try{existing=await readFile(file,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}
 const previous=state.pages[row.route];if(existing&&previous&&hash(existing)!==previous.recordSha256){if(previous.sourceSha256!==sourceHash)throw new Error('Import conflict with maintained record: '+row.route);preserved++;continue;}
 const processor=createProcessor({format:extname(sourcePath)==='.md'?'md':'mdx',remarkPlugins:[gfm]});const tree=processor.parse(strip(source));const env={};const blocks=tree.children.map(n=>convert(n,env)).filter(Boolean);const record={version:1,route:row.route,source:sourcePath,sourceSha256:sourceHash,metadata:row.metadata,blocks};const text=JSON.stringify(record,null,2)+'\n';if(text!==existing)await writeFile(file,text);state.pages[row.route]={sourceSha256:sourceHash,recordSha256:hash(text)};imported++;
}
await writeFile('data/import-state.json',JSON.stringify(state,null,2)+'\n');console.log(JSON.stringify({imported,preserved,unknownDropped:0}));
