"""Dependency-free built HTML/SEO/accessibility regression checks."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import json, xml.etree.ElementTree as ET, gzip

root=Path(__file__).resolve().parents[1]
dist=root/'dist'
class Page(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True);self.ids=[];self.labels=[];self.controls=[];self.links=[];self.canon=[];self.description=[];self.h1=0;self.title='';self.in_title=False;self.jsons=[];self.in_json=False;self.noindex=False
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if t=='h1':self.h1+=1
  if t=='title':self.in_title=True
  if t=='label' and 'for' in a:self.labels.append(a['for'])
  if t in ('input','select','textarea') and a.get('type')!='hidden' and a.get('aria-hidden')!='true':self.controls.append(a)
  if t=='a' and 'href' in a:self.links.append(a['href'])
  if t=='link' and a.get('rel')=='canonical':self.canon.append(a.get('href'))
  if t=='meta' and a.get('name')=='description':self.description.append(a.get('content',''))
  if t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content',''):self.noindex=True
  if t=='script' and a.get('type')=='application/ld+json':self.in_json=True
 def handle_endtag(self,t):
  if t=='title':self.in_title=False
  if t=='script':self.in_json=False
 def handle_data(self,d):
  if self.in_title:self.title+=d
  if self.in_json:self.jsons.append(d)

errors=[];warnings=[];pages={};titles={};descriptions={}
for f in sorted(dist.rglob('*.html')):
 path='/'+f.relative_to(dist).as_posix().removesuffix('index.html')
 p=Page();p.feed(f.read_text(encoding='utf-8'));pages[path]=p
 if p.canon!=['https://buildbymath.com'+path]:errors.append(f'{path}: canonical {p.canon}')
 if p.h1!=1:errors.append(f'{path}: {p.h1} h1s')
 if not p.title or not p.description or not p.description[0]:errors.append(f'{path}: missing title/description')
 for value,count in Counter(p.ids).items():
  if count>1:errors.append(f'{path}: duplicate id {value}')
 for a in p.controls:
  if not(a.get('aria-label') or a.get('aria-labelledby') or a.get('id') in p.labels):errors.append(f'{path}: unlabeled {a.get("id",a.get("name"))}')
 for text in p.jsons:
  try:json.loads(text)
  except ValueError:errors.append(f'{path}: malformed JSON-LD')
 if not p.noindex:
  titles.setdefault(p.title,[]).append(path);descriptions.setdefault(tuple(p.description),[]).append(path)

for path,p in pages.items():
 for link in p.links:
  url=urlsplit(link)
  if url.scheme or url.netloc or not url.path.startswith('/'):continue
  target=unquote(url.path)
  if target not in pages and not (dist/target.lstrip('/')).exists():errors.append(f'{path}: broken link {link}')

sitemap=ET.parse(dist/'sitemap.xml')
urls=[el.text for el in sitemap.findall('.//{*}loc')]
for u in urls:
 path=urlsplit(u).path
 if path not in pages:errors.append(f'sitemap missing route: {u}')
 elif pages[path].noindex:errors.append(f'sitemap noindex: {u}')
if len(urls)!=len(set(urls)):errors.append('duplicate sitemap URLs')
for path,p in pages.items():
 if not p.noindex and 'https://buildbymath.com'+path not in urls:errors.append(f'indexable route absent from sitemap: {path}')
for collection,label in [(titles,'title'),(descriptions,'description')]:
 for value,paths in collection.items():
  if len(paths)>1:errors.append(f'duplicate {label}: {paths}')

assets=[{'path':f.relative_to(dist).as_posix(),'bytes':f.stat().st_size,'gzip_bytes':len(gzip.compress(f.read_bytes()))} for f in dist.rglob('*') if f.suffix in ('.js','.css')]
report={'html_pages':len(pages),'sitemap_urls':len(urls),'variant_pages':len([p for p in pages if p.startswith('/calculators/') and len(p.strip('/').split('/'))==3]),'errors':errors,'warnings':warnings,'assets':sorted(assets,key=lambda a:-a['bytes'])}
(root/'audit/site-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='assets'},indent=2))
raise SystemExit(bool(errors))
