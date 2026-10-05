"""Analysis-only temporary edits. Sequential warm explicit-target builds; restore each edit."""
import json,hashlib,subprocess,re,statistics,shutil,os
from pathlib import Path
base=Path(__file__).resolve().parents[3];dest=base/'capgo-agent/evidence/targeted-builds';nift=shutil.which('nift');env=os.environ.copy();env['LC_ALL']='C'
projects={'faithful':base/'capgo','agent':base/'capgo-agent'}
agent=[('docs','migration/fragments/docs/getting-started/quickstart/index.html.2.html.after-sidebar.html','>Overview</h1>','docs/getting-started/quickstart/'),('rich','migration/fragments/docs/builder/getting-started/index.html.2.html.after-sidebar.html','>Getting Started</h1>','docs/builder/getting-started/'),('marketing','migration/fragments/native-build/index.html.2.html','>Ship without the Mac</span>','native-build/'),('blog','migration/fragments/blog/yarn-clear-cache/index.html.2.html','How to Yarn Clear Cache: A Guide for V1, Berry, and CI/CD','blog/yarn-clear-cache/')]
faithful=[('docs','corpus/authored/apps/docs/src/content/docs/docs/getting-started/quickstart.mdx',None,'docs/getting-started/quickstart/'),('rich','corpus/authored/apps/docs/src/content/docs/docs/builder/getting-started.mdx',None,'docs/builder/getting-started/'),('marketing','corpus/authored/apps/web/src/pages/native-build.astro','const title = `','native-build/'),('blog','corpus/authored/apps/web/src/content/blog/en/yarn-clear-cache.md',None,'blog/yarn-clear-cache/')]
def run(root,args,path):
 with path.open('w') as f:subprocess.run(args,cwd=root,stdout=f,stderr=subprocess.STDOUT,env=env,check=True)
def fingerprints(root):return {str(p.relative_to(root/'public')):hashlib.sha256(p.read_bytes()).hexdigest() for p in(root/'public').rglob('*') if p.is_file() and p.suffix in ['.html','.js']}
meta={'projects':{k:subprocess.check_output(['git','rev-parse','HEAD'],cwd=v,text=True).strip() for k,v in projects.items()},'niftVersion':subprocess.check_output([nift,'--version'],text=True).strip(),'niftBinarySha256':hashlib.sha256(Path(nift).read_bytes()).hexdigest(),'threads':-1,'nodeVersion':subprocess.check_output(['node','--version'],text=True).strip(),'hardware':'Intel i7-12700H, 20 logical CPUs; Ubuntu 26.04.1 / Linux 7.0.0-29','cache':'Warm prepared content/assets/output/dependencies, unmeasured full prime; OS page cache not flushed. Normal hooks run.','method':'3 real edits per family per implementation; /usr/bin/time -v elapsed, maximum process RSS KiB, not sum. Serial. Installation/restoration/output verification excluded. Hash all HTML/JS before/after, record byte changes; not complete runtime validation.','workflow':'Explicit-target agent-oriented workflow, not default ordinary build. Target does not rebuild all consumers of a shared source.','mdxPackage':'Faithful 22bb53653f47c22defff863e3465e8df9a11da99; Agent not applicable.'}
(dest/'methodology.json').write_text(json.dumps(meta,indent=2)+'\n');samples=[]
for name,root in projects.items():
 assert json.loads((root/'.nift/config.json').read_text())['config']['build-threads']==-1
 run(root,[nift,'build','--all'],dest/f'{name}-prime.log')
 for family,path,needle,target in faithful if name=='faithful' else agent:
  source=root/path;original=source.read_bytes();text=original.decode()
  try:
   for i in range(1,4):
    marker=f'Targeted benchmark {i}'
    if name=='faithful':edited=text.replace(needle,needle+marker+' ',1) if needle else text+'\n\n'+marker+'.\n'
    else:edited=text.replace(needle,needle.replace('</',' '+marker+'</',1) if '</' in needle else needle+' '+marker,1)
    assert edited!=text;source.write_text(edited);before=fingerprints(root);stem=dest/f'{name}-{family}-{i}'
    run(root,['/usr/bin/time','-v','-o',str(stem)+'.time',nift,'build',target],Path(str(stem)+'.log'))
    output=root/'public'/target/'index.html';assert marker in output.read_text(),f'Edit did not reach {output}'
    timing=Path(str(stem)+'.time').read_text();raw=re.search(r'Elapsed .*?:\s*([\d:.]+)',timing)[1];seconds=0
    for part in raw.split(':'):seconds=seconds*60+float(part)
    rss=int(re.search(r'Maximum resident set size \(kbytes\):\s*(\d+)',timing)[1]);after=fingerprints(root);changed=sorted(k for k,v in after.items() if before.get(k)!=v)
    row={'implementation':name,'family':family,'sample':i,'command':['nift','build',target],'source':path,'seconds':seconds,'peakRssKiB':rss,'markerVerified':True,'changedHtmlJs':changed};samples.append(row);(dest/'samples.json').write_text(json.dumps(samples,indent=2)+'\n');print(json.dumps(row),flush=True)
    obs=root/'build/faithful/preparation-observation.json'
    if name=='faithful' and obs.exists():shutil.copyfile(obs,Path(str(stem)+'.preparation.json'))
    source.write_bytes(original);run(root,[nift,'build'],dest/f'{name}-{family}-{i}-restore.log')
  finally:
   source.write_bytes(original);run(root,[nift,'build'],dest/f'{name}-{family}-restore-final.log')
# Faithful targeted output can outlive a reverted source when ordinary hash state skips restoration.
run(projects['faithful'],[nift,'build','--all'],dest/'faithful-final-full-restore.log')
summary={name:{family:{'runs':len(rows),'medianSeconds':statistics.median(x['seconds'] for x in rows),'minSeconds':min(x['seconds'] for x in rows),'maxSeconds':max(x['seconds'] for x in rows),'maxPeakRssKiB':max(x['peakRssKiB'] for x in rows),'changedHtmlJs':sorted(set(p for x in rows for p in x['changedHtmlJs']))} for family in ['docs','rich','marketing','blog'] for rows in [[x for x in samples if x['implementation']==name and x['family']==family]]} for name in projects}
(dest/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2),flush=True)
