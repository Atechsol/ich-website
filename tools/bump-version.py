#!/usr/bin/env python3
"""Add a content-hash version to the CSS/JS links in every page.

Browsers cache style/script files for days (see .htaccess), so an edited file can
be served stale next to fresh HTML. Appending ?v=<hash of the file> makes the URL
change exactly when the file does. Safe to re-run: unchanged files keep their hash.

Run from anywhere:  python3 tools/bump-version.py
Run it after editing style.css / script.js (and rebuilding the .min files),
before committing.
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
# href="style.css" / src="script.min.js", with or without an existing ?v=...
LINK = re.compile(r'((?:href|src)=")((?:style|script)(?:\.min)?\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')


def short_hash(name: str) -> str:
    return hashlib.md5((ROOT / name).read_bytes()).hexdigest()[:8]


changed = 0
for page in sorted(ROOT.glob('*.html')):
    text = page.read_text()
    new = LINK.sub(lambda m: f'{m.group(1)}{m.group(2)}?v={short_hash(m.group(2))}{m.group(3)}', text)
    if new != text:
        page.write_text(new)
        changed += 1
    refs = sorted(set(m.group(2) for m in LINK.finditer(new)))
    print(f'{page.name:16} {", ".join(f"{r}?v={short_hash(r)}" for r in refs)}')

print(f'\nUpdated {changed} page(s).')
