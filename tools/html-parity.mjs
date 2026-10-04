import {parse as parseCss,generate as generateCss} from '../vendor/css-tree.mjs';
import {parse} from 'parse5';
export function canonicalStyle(value){const ast=parseCss(value,{context:'declarationList'});ast.children.forEach(d=>{if(d.type==='Declaration'&&d.value.type==='Raw')d.value.value=d.value.value.trim()});return generateCss(ast)}
export function semantic(html){let rows=[];function visit(n){if(n.tagName)rows.push([n.tagName,(n.attrs??[]).map(a=>[a.name,a.name==='style'?canonicalStyle(a.value):a.value]).sort((a,b)=>a[0].localeCompare(b[0]))]);if(n.nodeName==='#text'&&n.value.trim())rows.push(['text',n.value.replace(/\s+/g,' ').trim()]);for(const c of n.childNodes??[])visit(c);if(n.tagName)rows.push(['end',n.tagName]);}visit(parse(html));return JSON.stringify(rows)}
export function markdownBody(html){let found=[];function visit(n){if(n.attrs?.some(a=>a.name==='class'&&a.value.split(' ').includes('sl-markdown-content')))found.push(n);for(const c of n.childNodes??[])visit(c)}visit(parse(html,{sourceCodeLocationInfo:true}));if(found.length!==1)throw Error('Expected one markdown content container');const loc=found[0].sourceCodeLocation;return {html:html.slice(loc.startTag.endOffset,loc.endTag.startOffset),start:loc.startTag.endOffset,end:loc.endTag.startOffset};}

// React SSR emits image hints before the authored body; Astro does not.
export function faithfulBody(html){return html.replace(/^(?:<link rel="preload" as="image"[^>]*\/>)+/,'')}
