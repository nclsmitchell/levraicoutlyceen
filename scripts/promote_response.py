"""Promote a sanitized, approved bundle into the local application only.
Original email attachments and metadata never enter the public catalog."""
import argparse,json
from pathlib import Path
from datetime import datetime,timezone
from collect import ROOT,digest,archive,save

def promote(validated_path,approval_path):
 path=Path(validated_path).resolve()
 if not path.is_relative_to((ROOT/'data/private').resolve()):raise ValueError('Validated bundle must be in private staging')
 validated=json.loads(path.read_text());approval=json.loads(Path(approval_path).read_text())
 if approval.get('validated_sha256')!=digest(path.read_bytes()) or not approval.get('reviewer') or not approval.get('redaction_verified') or not approval.get('reuse_verified'):raise ValueError('Publication review must pin the validated bundle and confirm redaction and reuse')
 # Explicitly allow-list public fields. No signatures, contact columns, original attachment or private path.
 allowed=['uai','year','amount','nature','population','unit','currency','tax','quality','post','source_row','mapping_sha256','ratio_eligibility','page','table','column']
 rows=[{k:r.get(k) for k in allowed} for r in validated['observations']]
 raw=json.dumps(rows,ensure_ascii=False,indent=2).encode();stored=archive(raw);source_id='administrative-'+stored['sha256'][:16]
 now=datetime.now(timezone.utc).isoformat()
 for field in ['public_title','public_producer','public_reuse_regime']:
  if not approval.get(field):raise ValueError('Public metadata required: '+field)
 entry={'id':source_id,'title':approval['public_title'],'producer':approval['public_producer'],'url':'/api/source/'+stored['sha256'],'download_url':'/api/source/'+stored['sha256'],'published':None,'modified':None,'collected':now,'license':approval['public_reuse_regime'],'scope':'Réponse administrative ; extraits expurgés validés ; ratios bloqués avant consolidation','mode':'administrative','row_count':len(rows),**stored}
 save(entry)
 registry=ROOT/'data/admin-approved.json';imports=json.loads(registry.read_text()) if registry.exists() else []
 if not any(r['source']==source_id for r in imports):imports.append({'source':source_id,'version':stored['sha256'],'reviewer':approval['reviewer'],'approved_at':approval.get('approved_at',now),'rows':rows})
 registry.write_text(json.dumps(imports,ensure_ascii=False,indent=2));print(source_id,'available for npm run recalculate; no external publication')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('validated');p.add_argument('--approval',required=True);a=p.parse_args();promote(a.validated,a.approval)
