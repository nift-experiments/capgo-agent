import {components} from '../components/index.mjs';
const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const voids=new Set(['img','br','hr','input','meta','link','source','wbr']);
class HTML {constructor(value){this.value=value;}toString(){return this.value;}}
const safe=value=>new HTML(value);
export function element(tag,props={},...children){if(typeof tag==='function')return tag({...props,children:children.flat(Infinity)});let inner=props.dangerouslySetInnerHTML?.__html;const attrs=Object.entries(props).filter(([k,v])=>!['children','key','dangerouslySetInnerHTML'].includes(k)&&v!==null&&v!==undefined&&v!==false).map(([key,value])=>{key={className:'class',htmlFor:'for',allowFullScreen:'allowfullscreen',autoPlay:'autoplay',playsInline:'playsinline'}[key]??key;if(key.startsWith('on'))throw new Error('Executable native event prop is unsupported');if(key==='style'&&typeof value==='object')value=Object.entries(value).map(([k,v])=>k.replace(/[A-Z]/g,x=>'-'+x.toLowerCase())+':'+v).join(';');return value===true?' '+key:' '+key+'="'+escape(value)+'"';}).join('');return safe('<'+tag+attrs+'>'+(voids.has(tag)?'':(inner??children.flat(Infinity).filter(x=>x!==null&&x!==undefined&&x!==false).map(x=>x instanceof HTML?String(x):escape(x)).join(''))+'</'+tag+'>'));}
export function render(record){const adapters=components({element});const used=new Map(),definitions=new Map();function collect(block){if(block.type==='definition')definitions.set(block.identifier,block);for(const c of block.blocks??[])collect(c);}record.blocks.forEach(collect);
 function blocks(list){return safe((list??[]).map(block).join(''));}
 function headingId(text){const base=text.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu,'').replace(/\s/g,'-');const n=used.get(base)??0;used.set(base,n+1);return base+(n?'-'+n:'');}
 function plain(n){return n.text??(n.blocks??[]).map(plain).join('');}
 function block(n){const content=blocks(n.blocks);switch(n.type){
 case 'text':return escape(n.text);case 'html':return n.text;case 'paragraph':return element('p',{},content);case 'root':case 'group':return content;
 case 'heading':return element('h'+n.depth,{id:headingId(plain(n))},content);
 case 'strong':return element('strong',{},content);case 'emphasis':return element('em',{},content);case 'delete':return element('del',{},content);case 'inlineCode':return element('code',{},n.text);
 case 'code':return element('pre',{},element('code',{'data-language':n.lang??''},n.text+'\n'));
 case 'list':return element(n.ordered?'ol':'ul',{start:n.ordered&&n.start!==1?n.start:undefined},content);case 'listItem':return element('li',{},n.checked!==undefined?element('input',{type:'checkbox',checked:n.checked,disabled:true}):'',content);
 case 'link':return element('a',{href:n.url,title:n.title},content);case 'image':return element('img',{src:n.url,alt:n.alt,title:n.title,loading:'lazy'});
 case 'blockquote':return element('blockquote',{},content);case 'thematicBreak':return '<hr>';case 'break':return '<br>';case 'definition':return '';
 case 'linkReference':{const d=definitions.get(n.identifier);if(!d)throw new Error('Missing link definition '+n.identifier);return element('a',{href:d.url,title:d.title},content);}
 case 'imageReference':{const d=definitions.get(n.identifier);if(!d)throw new Error('Missing image definition');return element('img',{src:d.url,alt:n.alt,title:d.title});}
 case 'table': {const rows=n.blocks.map((r,i)=>element('tr',{},r.blocks.map(c=>element(i?'td':'th',{},blocks(c.blocks)))));return element('table',{},element('thead',{},rows[0]),element('tbody',{},rows.slice(1)));}
 case 'tableRow':return element('tr',{},content);case 'tableCell':return element('td',{},content);
 case 'element':return element(n.name,n.props,content);
 case 'component':{const adapter=adapters[n.name];if(!adapter)throw new Error('Unknown component '+n.name);return adapter({...n.props,children:content});}
 default:throw new Error('Unsupported normalized block '+n.type);
 }}return String(blocks(record.blocks));}
