"""Extract only hash-pinned visually reviewed tables; adoption remains unverified.
Run using requirements-ingest.txt in a venv (pdfplumber)."""
import json,re
from decimal import Decimal
from pathlib import Path
import pdfplumber
from collect import ROOT,digest

def money(value):
 if value in (None,'','-'):return None
 return Decimal(value.replace('€','').replace(' ','').replace('\n','').replace('\u00a0','').replace(',','.'))
def main():
 catalog=json.loads((ROOT/'data/catalog.json').read_text()); review=json.loads((ROOT/'docs/pdf-review.json').read_text());output=[];checks=[]
 for config in review:
  s=next(s for s in reversed(catalog) if s['id']==config['source']);assert s['sha256']==config['sha256'],'New PDF version requires fresh visual review'
  sums={'EPLE':Decimal(0),'CMR':Decimal(0),'CMD':Decimal(0)};bucket='EPLE';seen=set();count=0
  with pdfplumber.open(ROOT/s['path']) as pdf:
   for page_n in config['pages']:
    tables=pdf.pages[page_n-1].extract_tables();table=tables[0];net_index=config.get('net_index',6 if config['year']==2025 else 7)
    if config['year']==2026 and config.get('kind','DGFL')=='DGFL':
     assert len(tables)==2 and len(table)==len(tables[1]),'Internat table alignment ambiguous'
    for row_n,row in enumerate(table[1:],start=2):
     if re.fullmatch(r'\d{7}[A-Z]',(row[0] or '').strip().upper()):
      uai=row[0].strip().upper();assert uai not in seen,'Duplicate UAI in annex';seen.add(uai);n=money(row[net_index]);assert n is not None and n>=0
      sums[bucket]+=n;count+=1
      base={'source':s['id'],'version':s['sha256'],'uai':uai,'name':row[1].replace('\n',' '),'year':config['year'],'report':config['report'],'page':page_n,'row':row_n,'table':config.get('table','Annexe 2 · DGFL'),'column':row[net_index] and table[0][net_index].replace('\n',' '),'amount':str(n),'visual_checked':True,'review':config['review'],'scope':bucket,'post':config.get('post','DGFL nette proposée'),'row_cells':row}
      output.append(base)
      internat=money(row[7] if config['year']==2025 else tables[1][row_n-1][0]) if config.get('kind','DGFL')=='DGFL' else None
      if internat is not None:
       output.append({**base,'column':f'DOTATION INTERNAT {config["year"]}','amount':str(internat),'post':'Dotation internat proposée'})
     elif 'TOTAL' in str(row[0]).upper():
      key='GENERAL' if 'GENERAL' in str(row[0]).upper() or 'GÉNÉRAL' in str(row[0]).upper() else 'EPLE' if 'EPLE' in str(row[0]).upper() else 'CMR' if 'CMR' in str(row[0]).upper() else 'CMD'
      observed=money(row[net_index]);calculated=sum(sums.values()) if key=='GENERAL' else sums[key]
      checks.append({'source':s['id'],'page':page_n,'scope':key,'reported':str(observed),'calculated':str(calculated),'passed':observed==calculated})
      assert observed==calculated,f'Subtotal mismatch {key}: {observed} != {calculated}'
      if key=='EPLE':bucket='CMR'
      if key=='CMR':bucket='CMD'
  assert count==config['expected_establishments'],f'Unexpected PDF row count {count}'
 (ROOT/'data/pdf-reviewed.json').write_text(json.dumps(output,ensure_ascii=False,indent=2));(ROOT/'data/reports/pdf-controls.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2))
 print(len(output),'observations ;',len(checks),'subtotals checked')
if __name__=='__main__':main()
