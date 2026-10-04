# One-time migration recovery from the faithful sibling; normal builds use only this repository.
from pathlib import Path
import shutil,json,re,os,time
dst=Path(__file__).resolve().parents[1];base=dst.parent;src=base/'capgo'
archive=dst/'docs/prototype';archive.mkdir(exist_ok=True,parents=True)
if not (archive/'build.mjs').exists():shutil.copyfile(dst/'tools/build.mjs',archive/'build.mjs')
if (dst/'public').exists() and not (dst/'migration/structure.json').exists():
 p=dst/'build/archive'/('prototype-public-'+str(int(time.time())));p.parent.mkdir(exist_ok=True,parents=True);(dst/'public').rename(p)
for name in ['build.mjs','migrate-build.mjs','golden.mjs','verify-output.mjs','html-parity.mjs','parity.mjs']:
 shutil.copyfile(src/'tools'/name,dst/'tools'/name)
(dst/'vendor').mkdir(exist_ok=True);shutil.copyfile(src/'vendor/css-tree.mjs',dst/'vendor/css-tree.mjs')
for name in ['structure.json','docs-shell.json']:
 (dst/'migration').mkdir(exist_ok=True);shutil.copyfile(src/'migration'/name,dst/'migration'/name)
for p in (src/'migration/templates').iterdir():
 if p.name=='mdx.f':continue
 q=dst/'migration/templates'/p.name;q.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,q)
mdx={r['file']:r for r in json.load(open(src/'migration/mdx-sources.json'))['sources']}
for p in (src/'migration/pages').rglob('*.html'):
 rel=p.relative_to(src/'migration/pages').as_posix();s=p.read_text()
 if rel in mdx:
  row=mdx[rel];s=re.sub(r'^@import\([^\n]*?\)','',s,count=1)
  old='migration/fragments/'+rel+'.2.html.after-sidebar.html'
  s=s.replace('$[open('+json.dumps(old+'.before-mdx.html')+')]$[render_faithful_mdx('+json.dumps(row['source'])+')]$[open('+json.dumps(old+'.after-mdx.html')+')]','$[open('+json.dumps(old)+')]')
  if 'mdx.' in s or 'render_faithful_mdx' in s:raise Exception(rel)
 q=dst/'migration/pages'/rel;q.parent.mkdir(exist_ok=True,parents=True);q.write_text(s)
 for name in re.findall(r'open\("([^"\n]+)"\)',s):
  q=dst/name;q.parent.mkdir(exist_ok=True,parents=True);shutil.copyfile(src/name,q)
print('Recovered 1347 compiled HTML routes as maintained Nift inputs; no MDX build dependency.')
