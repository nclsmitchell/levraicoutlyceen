"""Private staging and human-approved mappings for future replies. No web endpoint.
Produces normalized review bundles; publication is a separate deliberate step."""
import argparse,csv,json,re,hashlib,shutil
from decimal import Decimal, InvalidOperation
from pathlib import Path
from datetime import datetime,timezone
from collect import ROOT,digest
FIELDS=['uai','year','amount','nature','population','unit','currency','tax','quality','post','page','table','column']
NATURES={'proposed_budget','voted_budget','authorization','commitment','mandate_net','payment_net','expense','depreciation','transfer','contract'}

def read_rows(path):
 if path.suffix.lower()=='.csv':
  with path.open(encoding='utf-8-sig',newline='') as f:
   sample=f.read(4096);f.seek(0);dialect=csv.Sniffer().sniff(sample,delimiters=',;\t');return list(csv.DictReader(f,dialect=dialect))
 if path.suffix.lower()=='.xlsx':
  from openpyxl import load_workbook
  wb=load_workbook(path,data_only=True,read_only=True);ws=wb.active;iterator=iter(ws.values);headers=next(iterator);return [dict(zip(headers,row)) for row in iterator]
 if path.suffix.lower()=='.pdf':
  from pdfplumber import open as pdf_open
  with pdf_open(path) as pdf:return [{'page':i+1,'text':page.extract_text(),'tables':page.extract_tables()} for i,page in enumerate(pdf.pages)]
 raise ValueError('Only CSV/XLSX/PDF supported')

def validate(rows,mapping,source_sha,approval):
 mapping_sha=digest(json.dumps(mapping,sort_keys=True,ensure_ascii=False).encode())
 if approval.get('mapping_sha256')!=mapping_sha or approval.get('source_sha256')!=source_sha or not approval.get('reviewer') or not approval.get('approved_at'):raise ValueError('Human mapping approval must identify source and mapping hashes, reviewer and date')
 output=[];rejected=[]
 for idx,row in enumerate(rows,start=1):
  try:
   result={k:row.get(mapping['columns'].get(k)) if k in mapping.get('columns',{}) else mapping.get('constants',{}).get(k) for k in FIELDS}
   if not re.fullmatch(r'\d{7}[A-Z]',str(result['uai'])):raise ValueError('UAI invalid')
   result['year']=int(str(result['year'])[:4])
   if not 2020<=result['year']<=2026:raise ValueError('Year outside target scope')
   amount=Decimal(str(result['amount']).replace(' ','').replace('\u00a0','').replace(',','.'))
   if not amount.is_finite() or amount!=amount.quantize(Decimal('.01')):raise ValueError('Invalid amount precision')
   result['amount']=str(amount.quantize(Decimal('.01')))
   if result['nature'] not in NATURES:raise ValueError('Accounting nature unqualified')
   if result['unit']!='EUR' or result['currency']!='EUR' or result['tax'] not in {'HT','TTC','unknown','not_applicable'}:raise ValueError('Unit/currency/tax unqualified')
   if result['quality'] not in {'observed','allocated','estimated'}:raise ValueError('Invalid quality')
   if not result['population'] or not result['post']:raise ValueError('Scope/post required')
   output.append({**result,'source_row':idx,'source_sha256':source_sha,'mapping_sha256':mapping_sha,'source_record_sha256':digest(json.dumps(row,sort_keys=True,default=str).encode()),'reviewer':approval['reviewer'],'ratio_eligibility':'blocked_pending_consolidation_and_population_validation'})
  except (ValueError,InvalidOperation) as e:rejected.append({'row':idx,'reason':str(e)})
 return {'observations':output,'quarantine':rejected,'mapping_sha256':mapping_sha,'approval':approval,'publication':'not_published','original_visibility':'private'}

def main():
 p=argparse.ArgumentParser();sub=p.add_subparsers(dest='action',required=True)
 stage=sub.add_parser('stage');stage.add_argument('file');stage.add_argument('--metadata',required=True)
 check=sub.add_parser('validate');check.add_argument('bundle');check.add_argument('--mapping',required=True);check.add_argument('--approval',required=True);check.add_argument('--reviewed-rows')
 hash_command=sub.add_parser('mapping-hash');hash_command.add_argument('mapping')
 a=p.parse_args()
 if a.action=='mapping-hash':
  mapping=json.loads(Path(a.mapping).read_text());print(digest(json.dumps(mapping,sort_keys=True,ensure_ascii=False).encode()));return
 if a.action=='stage':
  path=Path(a.file);raw=path.read_bytes();sha=digest(raw);directory=ROOT/'data/private'/sha;directory.mkdir(parents=True,exist_ok=True)
  original=directory/('original'+path.suffix.lower());original.write_bytes(raw);meta=json.loads(Path(a.metadata).read_text());rows=read_rows(original)
  for key in ['producer','title','received_at','reuse_regime']:
   if not meta.get(key):raise ValueError('Metadata required: '+key)
  bundle={'source_sha256':sha,'original':str(original),'metadata':meta,'collected_at':datetime.now(timezone.utc).isoformat(),'rows':rows,'visibility':'private','mapping_state':'pending_human_review'}
  (directory/'bundle.json').write_text(json.dumps(bundle,ensure_ascii=False,indent=2,default=str));print(directory/'bundle.json')
 else:
  path=Path(a.bundle).resolve()
  if not path.is_relative_to((ROOT/'data/private').resolve()):raise ValueError('Bundle must remain inside private staging')
  bundle=json.loads(path.read_text());assert digest(Path(bundle['original']).read_bytes())==bundle['source_sha256']
  approval=json.loads(Path(a.approval).read_text());rows=bundle['rows']
  if str(bundle['original']).endswith('.pdf'):
   if not a.reviewed_rows or not approval.get('visual_review_verified'):raise ValueError('PDF requires visually reviewed per-table rows')
   extracted=Path(a.reviewed_rows).read_bytes()
   if approval.get('reviewed_rows_sha256')!=digest(extracted):raise ValueError('Reviewed PDF rows hash mismatch')
   rows=json.loads(extracted)
   if any(not r.get('page') or not r.get('table') or not r.get('column') for r in rows):raise ValueError('Page, table and column are required for every PDF row')
  result=validate(rows,json.loads(Path(a.mapping).read_text()),bundle['source_sha256'],approval)
  (path.parent/'validated.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(path.parent/'validated.json')
if __name__=='__main__':main()
