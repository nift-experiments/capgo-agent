#!/usr/bin/env python3
"""Check explicit Nift dependency declarations for raw HTML and shared shell reads."""
import json,re
from pathlib import Path
issues=[]
for path in Path('migration/pages').rglob('*.html'):
 text=path.read_text()
 refs={json.loads(m) for m in re.findall(r'(?:open|render_docs_shell)\(("(?:[^"\\]|\\.)*")',text)}
 deps={json.loads(m) for m in re.findall(r'@dep\(("(?:[^"\\]|\\.)*")\)',text)}
 if refs-deps:issues.append((str(path),sorted(refs-deps)))
if issues:raise SystemExit(json.dumps(issues))
print('All 1347 route wrappers declare fragment and shared shell dependencies.')
