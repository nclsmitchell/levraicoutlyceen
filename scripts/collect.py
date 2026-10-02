"""Official Opendatasoft exports, immutable byte storage and count checks."""
import json, gzip, hashlib, urllib.request, urllib.parse, time
from pathlib import Path
from datetime import datetime, timezone
ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'data/raw'; RAW.mkdir(parents=True,exist_ok=True)
CATALOG=ROOT/'data/catalog.json'
def digest(b): return hashlib.sha256(b).hexdigest()
def decode(b): return gzip.decompress(b) if b[:2]==b'\x1f\x8b' else b
def fetch(url):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'LeVraiCoutLyceen-research/0.1','Accept-Encoding':'identity'}),timeout=120) as r: return r.read()
        except Exception:
            if attempt==2: raise
            time.sleep(2)
def archive(raw,extension='json'):
    sha=digest(raw); p=RAW/f'{sha}.{extension}'
    if not p.exists(): p.write_bytes(raw)
    return {'sha256':sha,'path':str(p.relative_to(ROOT)),'bytes':len(raw)}
def save(entry):
    catalog=json.loads(CATALOG.read_text()) if CATALOG.exists() else []
    if not any(x['id']==entry['id'] and x['sha256']==entry['sha256'] for x in catalog): catalog.append(entry)
    CATALOG.write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
    with (ROOT/'data/collection-log.jsonl').open('a') as log:
        log.write(json.dumps({'event':'collected','source':entry['id'],'collected':entry['collected'],'url':entry.get('download_url',entry['url']),'sha256':entry['sha256'],'schema':entry.get('schema'),'count_check':entry.get('count_check'),'row_count':entry.get('row_count'),'expected_count':entry.get('expected_count'),'mode':entry['mode']},ensure_ascii=False)+'\n')
def collect(host,ds,where=None,full=True):
    base=f'{host}/api/explore/v2.1/catalog/datasets/{ds}'
    schema_raw=fetch(base); schema=json.loads(decode(schema_raw)); meta=schema.get('metas',{}).get('default',{})
    entry={'id':ds,'title':meta.get('title',ds),'producer':meta.get('publisher') or host,'url':f'{host}/explore/dataset/{ds}/','api_url':base,'published':schema.get('metas',{}).get('dcat',{}).get('issued'),'modified':meta.get('modified'),'collected':datetime.now(timezone.utc).isoformat(),'license':meta.get('license') or 'Régime à vérifier','schema':archive(schema_raw),'where':where,'scope':'Île-de-France, public, 2019–2025' if where else 'Périmètre décrit par le producteur','mode':'full' if full else 'inspection'}
    query=urllib.parse.urlencode({'where':where} if where else {})
    probe_url=base+'/records?limit=1'+('&'+query if query else '')
    probe_raw=fetch(probe_url); probe=json.loads(decode(probe_raw)); entry['count_check']=archive(probe_raw);entry['expected_count']=probe['total_count']
    url=base+'/exports/json'+('?' +query if query else '') if full else probe_url
    raw=fetch(url) if full else probe_raw
    rows=json.loads(decode(raw)) if full else probe['results']
    if full and len(rows)!=probe['total_count']: raise ValueError(f'{ds}: {len(rows)} != {probe["total_count"]}')
    entry.update(archive(raw));entry.update(download_url=url,row_count=len(rows));save(entry)
    print(ds,len(rows),'/',entry['expected_count'],flush=True)
    return entry
SOURCES=[
 ('https://data.education.gouv.fr','fr-en-annuaire-education',"code_region='11' AND statut_public_prive='Public' AND (type_etablissement='Lycée' OR type_etablissement='EREA' OR type_etablissement='ERPD')"),
 ('https://data.education.gouv.fr','fr-en-lycee_gt-effectifs-niveau-sexe-lv',"code_region_insee='11' AND secteur='PUBLIC' AND rentree_scolaire >= date'2019-01-01' AND rentree_scolaire < date'2026-01-01'"),
 ('https://data.education.gouv.fr','fr-en-lycee_pro-effectifs-niveau-sexe-lv',"code_region_insee='11' AND secteur='PUBLIC' AND rentree_scolaire >= date'2019-01-01' AND rentree_scolaire < date'2026-01-01'"),
 ('https://data.iledefrance.fr','donnees-budgetaires-lycees-operations-directes',None)]
def main():
    for s in SOURCES: collect(*s)
if __name__=='__main__':main()
