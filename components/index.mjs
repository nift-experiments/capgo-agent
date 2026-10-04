import {plugins,credentialFlow,conditionalFlow} from './project-data.mjs';
export function components({element:h}){
 const tag=(name,props,children)=>h(name,props,children),link=(href,text)=>h('a',{href},text);let sequence=0;
 const Code=({code='',lang,language,title,children})=>h('figure',{className:'code-example'},title?h('figcaption',{},title):null,h('pre',{},h('code',{'data-language':lang??language??''},code||children)));
 const TabItem=({label,children})=>h('section',{'data-tab-panel':true,'data-tab-label':label??'Example'},h('h3',{className:'tab-label'},label),children);
 const Tabs=({children})=>h('div',{'data-tabs':true},children);
 const PackageManagers=({pkg,type='install',args='',pkgManagers=['npm','pnpm','yarn','bun']})=>Tabs({children:pkgManagers.map(pm=>{const prefixes=type==='exec'?{npm:'npx',pnpm:'pnpm exec',yarn:'yarn',bun:'bunx'}:{npm:'npm install',pnpm:'pnpm add',yarn:'yarn add',bun:'bun add'};if(!prefixes[pm])throw new Error('Unknown package manager '+pm);return TabItem({label:pm,children:Code({code:[prefixes[pm],pkg,args].filter(Boolean).join(' '),lang:'sh'})});})});
 function Questionnaire({flow,start,label}) {
  const id='questionnaire-'+sequence++;
  const sections=Object.entries(flow).map(([key,q])=>{
   const answers=q.answers??q.frameworks??(q.type==='framework_selector'?[{id:'js',name:'JavaScript'},{id:'ts',name:'TypeScript'},{id:'react',name:'React'},{id:'angular',name:'Angular'},{id:'vue',name:'Vue'},{id:'svelte',name:'Svelte'},{id:'qwik',name:'Qwik'}]:[]);
   const buttons=answers.map(a=>h('button',{type:'button','data-next':a.next??(typeof q.next==='object'?q.next[a.id]:q.next)??'','data-answer':a.id},h('span',{dangerouslySetInnerHTML:{__html:a.text??a.name??a.id}})));
   const code=q.code?(typeof q.code==='string'?Code({code:q.code}):Tabs({children:Object.entries(q.code).map(([lang,code])=>TabItem({label:lang,children:Code({code,lang})}))})):null;
   return h('section',{'data-question':key,'data-final':q.type==='final'||undefined},h('h3',{dangerouslySetInnerHTML:{__html:q.question??''}}),q.text?h('div',{dangerouslySetInnerHTML:{__html:q.text}}):null,q.description?h('p',{dangerouslySetInnerHTML:{__html:q.description}}):null,q.warning?h('aside',{className:'callout',dangerouslySetInnerHTML:{__html:q.warning}}):null,code,q.cta?link(q.cta.href,q.cta.text):null,...buttons);
  });
  return h('section',{className:'questionnaire','data-questionnaire':true,'data-start':start},h('h2',{},label),h('p',{className:'questionnaire-help'},'Choose an option to follow the guide. All outcomes remain readable without JavaScript.'),...sections,h('button',{type:'button','data-restart':true},'Start again'));
 }
 const Card=({title,icon,children})=>h('section',{className:'card'},h('h3',{},title),children);
 const LinkCard=({title,description,href})=>h('article',{className:'card link-card'},h('h3',{},link(href,title)),description?h('p',{},description):null);
 const CardGrid=({children})=>h('div',{className:'card-grid'},children);
 const Aside=({type='note',title,children})=>h('aside',{className:'callout callout-'+type},h('strong',{},title??({caution:'Caution',danger:'Danger',tip:'Tip',note:'Note'}[type]??type)),children);
 const Steps=({children})=>h('section',{className:'steps','aria-label':'Steps'},children);
 const FileTree=({children})=>h('div',{className:'file-tree','aria-label':'File tree'},children);
 const MermaidGraph=({graph,ariaLabel='Diagram',fullWidth=true})=>h('figure',{className:'diagram','data-diagram':true},h('figcaption',{},ariaLabel),h('pre',{className:'mermaid','data-mermaid':true,'aria-label':ariaLabel},graph));
 const YouTubeEmbed=({id,title='YouTube video'})=>{if(!/^[\w-]+$/.test(id))throw new Error('Invalid YouTube video id');return h('div',{className:'video-embed'},h('iframe',{src:'https://www.youtube-nocookie.com/embed/'+id,title,loading:'lazy',allowFullScreen:true}));};
 const BuildCredentialsQuestionnaire=()=>Questionnaire({flow:credentialFlow,start:'q_platform',label:'Configure your signing credentials'});
 const ConditionalQuestionnaire=()=>Questionnaire({flow:conditionalFlow,start:'q1',label:'Choose your notifyAppReady setup'});
 const BlogMidArticleCta=({docsPath='docs/live-updates/china-configuration/'})=>h('aside',{className:'blog-cta'},h('h3',{},'Ship a China compliance hotfix without a store resubmit'),h('p',{},'Capgo live updates let Capacitor apps push encrypted OTA fixes while you work through ICP, CSL, and PIPL requirements.'),link('/'+docsPath.replace(/^\//,''),'Live updates docs'),link('/pricing/','Pricing'),h('p',{},'Native store submissions still apply when you change binaries or permissions.'));
 const PluginSetupSteps=({installLabel='plugin',pkg,stepTitle,children})=>h('ol',{className:'steps'},h('li',{},h('strong',{},'Install the '+installLabel),PackageManagers({pkg})),h('li',{},h('strong',{},'Sync native platforms'),PackageManagers({type:'exec',pkg:'cap',args:'sync'})),h('li',{},h('strong',{},stepTitle),children));
 const PluginsDirectory=()=>h('section',{'data-filter-list':true},h('label',{},'Filter plugins ',h('input',{type:'search','data-filter-input':true,placeholder:'Plugin name or capability'})),h('p',{},plugins.length+' plugins in the pinned Capgo registry.'),CardGrid({children:plugins.map(p=>h('article',{className:'card','data-filter-item':true},h('h3',{},link(p.docsUrl??p.urls?.docs??'/plugins/'+p.slug+'/',p.title)),h('p',{},p.description)))}));
 return {Steps,Aside,Card,CardGrid,LinkCard,Tabs,TabItem,Code,FileTree,PackageManagers,MermaidGraph,YouTubeEmbed,BuildCredentialsQuestionnaire,ConditionalQuestionnaire,BlogMidArticleCta,PluginSetupSteps,PluginsDirectory};
}
