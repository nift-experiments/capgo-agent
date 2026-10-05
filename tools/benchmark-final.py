#!/usr/bin/env python3
"""Repeated ordinary Nift builds after architecture freeze; never changes architecture."""
import hashlib,json,os,platform,re,shutil,statistics,subprocess
from pathlib import Path
root=Path.cwd(); dest=root/'evidence/final-benchmarks';dest.mkdir(parents=True,exist_ok=True)
config=json.loads((root/'.nift/config.json').read_text())['config'];assert config['build-threads']==-1
nift=shutil.which('nift');assert nift
revision=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
metadata={'architectureRevision':'fbc7bb5021097631eb43a6ca4b56ac96a348210f','measurementRevision':revision,'niftExecutable':nift,'niftVersion':subprocess.check_output([nift,'--version'],text=True).strip(),'niftSourceRevision':None,'niftSourceRevisionReason':'Installed executable does not expose its source commit; binary hash is the exact identity.','niftSha256':hashlib.sha256(Path(nift).read_bytes()).hexdigest(),'nodeVersion':subprocess.check_output(['node','--version'],text=True).strip(),'os':platform.platform(),'cpu':subprocess.check_output(['lscpu'],text=True),'threads':-1,'lockSha256':hashlib.sha256((root/'package-lock.json').read_bytes()).hexdigest(),'directDependencies':json.loads((root/'package.json').read_text())['devDependencies'],'mdx':'Not used; bodies remain converted HTML','cacheState':'Warm output/assets/dependencies and normal Nift hash state. Native esbuild preparation executes on every build; no benchmark-specific cache.','memoryMethod':'GNU time -v maximum process RSS (KiB), not aggregate concurrent process memory.','order':'Unmeasured full prime, three full, three no-op, three real edits for each content family. Restore source and output unmeasured after each edit.','installation':'Excluded','systemPageCache':'Not flushed; ordinary warm local working-copy builds.'}
(dest/'methodology.json').write_text(json.dumps(metadata,indent=2)+'\n')
def call(args,log):
 with log.open('w')as stream:subprocess.run(args,stdout=stream,stderr=subprocess.STDOUT,check=True)
def measure(case,sample,args):
 prefix=dest/f'{case}-{sample}';call(['/usr/bin/time','-v','-o',str(prefix)+'.time',nift,*args],Path(str(prefix)+'.log'))
 text=Path(str(prefix)+'.time').read_text();elapsed=re.search(r'Elapsed \(wall clock\) time \(h:mm:ss or m:ss\):\s*([\d:.]+)',text).group(1)
 seconds=0
 for part in elapsed.split(':'):seconds=seconds*60+float(part)
 rss=int(re.search(r'Maximum resident set size \(kbytes\):\s*(\d+)',text).group(1))
 result={'case':case,'sample':sample,'command':['nift',*args],'seconds':seconds,'peakRssKiB':rss};print(json.dumps(result),flush=True);return result
samples=[];call([nift,'build','--all'],dest/'prime.log')
for case,args in [('full',['build','--all']),('noop',['build'])]:
 for sample in range(1,4):samples.append(measure(case,sample,args))
edits=[('docs','migration/fragments/docs/getting-started/quickstart/index.html.2.html.after-sidebar.html','>Overview</h1>','docs/getting-started/quickstart/index.html'),('rich','migration/fragments/docs/builder/getting-started/index.html.2.html.after-sidebar.html','>Getting Started</h1>','docs/builder/getting-started/index.html'),('marketing','migration/fragments/native-build/index.html.2.html','>Ship without the Mac</span>','native-build/index.html'),('blog','migration/fragments/blog/yarn-clear-cache/index.html.2.html','How to Yarn Clear Cache: A Guide for V1, Berry, and CI/CD','blog/yarn-clear-cache/index.html')]
for case,path,needle,output in edits:
 source=root/path;original=source.read_bytes();text=original.decode();assert needle in text
 try:
  for sample in range(1,4):
   marker=f' benchmark sample {sample}'
   replacement=needle.replace('</',marker+'</',1)if'</'in needle else needle+marker
   source.write_text(text.replace(needle,replacement,1))
   row=measure(case,sample,['build']);assert marker in(root/'public'/output).read_text(),'Edit did not reach rendered output';row.update({'source':path,'output':output,'edit':replacement,'outputMarkerVerified':True});samples.append(row)
   source.write_bytes(original);call([nift,'build'],dest/f'{case}-{sample}-restore.log')
 finally:
  source.write_bytes(original);call([nift,'build'],dest/f'{case}-final-restore.log')
summary={case:{'samples':len(rows),'medianSeconds':statistics.median(r['seconds']for r in rows),'minSeconds':min(r['seconds']for r in rows),'maxSeconds':max(r['seconds']for r in rows),'maxPeakRssKiB':max(r['peakRssKiB']for r in rows)}for case in sorted(set(r['case']for r in samples))for rows in [[r for r in samples if r['case']==case]]}
(dest/'samples.json').write_text(json.dumps(samples,indent=2)+'\n');(dest/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2),flush=True)
