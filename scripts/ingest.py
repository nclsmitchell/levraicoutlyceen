"""Rebuild a versioned public snapshot from preserved official bytes. Stdlib only."""
import json,re,hashlib,csv,argparse
from collections import Counter,defaultdict
from decimal import Decimal
from pathlib import Path
from datetime import datetime,timezone
from collect import ROOT,decode,digest,main as collect_all
from domain import year,department
VERSION='ingest-1.1.0'
DEPTS={'75':'Paris','77':'Seine-et-Marne','78':'Yvelines','91':'Essonne','92':'Hauts-de-Seine','93':'Seine-Saint-Denis','94':'Val-de-Marne','95':"Val-d’Oise"}
POSTS=['personnel_etat','personnel_region','fonctionnement','investissement','restauration_internat','support_mutualise']
def dump(path,value):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,indent=2))
def build():
 catalog=json.loads((ROOT/'data/catalog.json').read_text()); latest={s['id']:s for s in catalog}
 establishments={};enrollments=[];financial=[];relations=[];evidence=[];quarantine=[];residual=[];matches=[]
 def read(ds):
  s=latest[ds]; b=(ROOT/s['path']).read_bytes()
  assert digest(b)==s['sha256'], 'Source hash mismatch'
  return s,json.loads(decode(b),parse_float=str)
 def proof(s,r,i,column,rule):
  rid=digest(json.dumps(r,sort_keys=True,ensure_ascii=False).encode());id=digest(f'{s["sha256"]}:{i}:{column}:{VERSION}'.encode())[:24]
  evidence.append({'id':id,'source':s['id'],'version':s['sha256'],'row':i+1,'row_id':rid,'column':column,'page':None,'table':None,'rule':rule,'transform_version':VERSION})
  return id
 s,rows=read('fr-en-annuaire-education')
 for i,r in enumerate(rows):
  uai=r['identifiant_de_l_etablissement']; dep=department(r['code_departement']);nat=r['libelle_nature'];mother=r.get('etablissement_mere'); geo=r['code_commune']
  cat='section' if 'SECTION' in nat else 'erea' if 'ADAPTE' in nat else 'other' if r['ministere_tutelle']!="MINISTERE DE L'EDUCATION NATIONALE" else 'attached' if mother else 'principal'
  ev=proof(s,r,i,'identifiant_de_l_etablissement','Annuaire actuel ; codes chaînes ; Paris 75056, arrondissement conservé ; aucune fusion par nom')
  if uai in establishments:
   quarantine.append({'source':s['id'],'row':i+1,'uai':uai,'reason':'UAI multi-sites : identité principale conservée, site supplémentaire à qualifier','evidence':ev});continue
  establishments[uai]={'uai':uai,'name':r['nom_etablissement'],'department':dep,'city':'Paris' if dep=='75' else r['nom_commune'],'commune':'75056' if dep=='75' else geo,'arrondissement':geo if dep=='75' and re.fullmatch(r'751(?:0[1-9]|1[0-9]|20)',str(geo)) else None,'source_commune':geo,'address':r['adresse_1'],'nature':nat,'authority':r['ministere_tutelle'],'category':cat,'parent':mother,'valid_from':r['date_ouverture'],'valid_to':None,'historical':False,'post_bac':r['post_bac']=='1','tracks':[label for key,label in [('voie_generale','Générale'),('voie_technologique','Technologique'),('voie_professionnelle','Professionnelle')] if r[key]=='1'],'evidence':ev}
  if mother:relations.append({'source':uai,'target':mother,'kind':r['type_rattachement_etablissement_mere'],'valid_from':None,'valid_to':None,'observed_at':s['collected'],'status':'observed','evidence':ev,'note':'Relation observée dans l’annuaire actuel ; validité historique non établie.'})
 for pop,ds in [('GT','fr-en-lycee_gt-effectifs-niveau-sexe-lv'),('PRO','fr-en-lycee_pro-effectifs-niveau-sexe-lv')]:
  s,rows=read(ds);seen=set()
  for i,r in enumerate(rows):
   uai=r['numero_lycee'];yr=year(r['rentree_scolaire']);n=r.get('nombre_d_eleves');ev=proof(s,r,i,'nombre_d_eleves',f'Total publié {pop} uniquement ; aucune somme sexe/langue ; null conservé masqué ou indisponible')
   if not re.fullmatch(r'\d{7}[A-Z]',uai) or (uai,yr) in seen or (n is not None and (not isinstance(n,int) or n<0)):
    quarantine.append({'source':ds,'row':i+1,'uai':uai,'reason':'Clé dupliquée, UAI ou effectif invalide','evidence':ev});continue
   seen.add((uai,yr))
   if uai not in establishments:
    dep=department(r.get('code_departement_pays') or r.get('code_departement'));geo=r['code_commune']
    establishments[uai]={'uai':uai,'name':f'{r["denomination_principale"]} {r.get("patronyme") or ""}'.strip(),'department':dep,'city':'Paris' if dep=='75' else r['commune'],'commune':'75056' if dep=='75' else geo,'arrondissement':geo if dep=='75' and re.fullmatch(r'751(?:0[1-9]|1[0-9]|20)',str(geo)) else None,'source_commune':geo,'address':None,'nature':r['denomination_principale'],'authority':'Éducation nationale (source DEPP)','category':'historical','parent':None,'valid_from':None,'valid_to':None,'historical':True,'post_bac':None,'tracks':[],'evidence':ev}
   if establishments[uai]['department']=='75' and establishments[uai]['historical'] and not re.fullmatch(r'751(?:0[1-9]|1[0-9]|20)|75056',str(r['code_commune'])) and not any(q.get('uai')==uai and q.get('reason')=='Code arrondissement non conforme au COG : valeur brute conservée, arrondissement non attribué' for q in quarantine):
    quarantine.append({'source':ds,'row':i+1,'uai':uai,'reason':'Code arrondissement non conforme au COG : valeur brute conservée, arrondissement non attribué','evidence':ev})
   enrollments.append({'id':ev,'uai':uai,'year':yr,'population':pop,'value':n,'unit':'élèves','status':'observed' if n is not None else 'suppressed','coverage':'complete_declared_scope' if n is not None else 'not_comparable','evidence':ev,'note':'PRO : ajout des autres formations professionnelles en 2025.' if pop=='PRO' else 'Voie générale et technologique ; post-bac exclu.'})
 s,rows=read('donnees-budgetaires-lycees-operations-directes');seen=set()
 for i,r in enumerate(rows):
  raw_uai=r.get('code_uai_ex_rne');uai=str(raw_uai).strip().upper() if raw_uai else None
  ev=proof(s,r,i,'montant_vote','Decimal depuis représentation JSON ; montant affecté voté, jamais réalisé ; aucun cumul sans qualification des révisions')
  rowid=evidence[-1]['row_id']
  if rowid in seen:quarantine.append({'source':s['id'],'row':i+1,'reason':'Doublon exact','evidence':ev});continue
  seen.add(rowid)
  if r['montant_vote'] is None:quarantine.append({'source':s['id'],'row':i+1,'reason':'Montant absent','evidence':ev});continue
  amount=str(Decimal(str(r['montant_vote'])).quantize(Decimal('0.01')))
  matched=uai if uai in establishments else None
  o={'id':ev,'uai':matched,'raw_uai':raw_uai,'year':year(r['annee_de_la_decision']),'date':r['date_deliberation'],'title':r['dossier'],'object':r['objet_de_l_operation'],'beneficiary':r['tiers'],'decision':r['num_deliberation'],'decision_type':r['type_de_decision'],'amount':amount,'currency':'EUR','unit':'EUR','tax':'unknown','nature':'authorization','status':'observed','coverage':'partial','evidence':ev,'payer':r['nom_de_lattribuant'],'operation':digest(str(r['dossier']).encode())[:16],'aggregation':'blocked_revision_semantics','scope':'Affectation régionale ; périmètre des élèves non ventilé'}
  financial.append(o)
  if matched:matches.append({'observation':ev,'uai':matched,'method':'exact_uai','source_uai':raw_uai})
  else:residual.append({'observation':ev,'source_uai':raw_uai,'amount':amount,'reason':'UAI absent' if not uai else 'UAI hors référentiel ; rattachement non confirmé'})
 # PDF rows can enter only through the explicitly reviewed extraction manifest.
 pdf_file=ROOT/'data/pdf-reviewed.json'
 if pdf_file.exists():
  for r in json.loads(pdf_file.read_text()):
   s=latest[r['source']];assert r['version']==s['sha256'] and r['visual_checked']
   ev=digest(json.dumps(r,sort_keys=True).encode())[:24];evidence.append({'id':ev,'source':s['id'],'version':s['sha256'],'row':r['row'],'row_id':ev,'column':r['column'],'page':r['page'],'table':r['table'],'rule':'Extraction de tableau vérifiée visuellement ; montant proposé dans un rapport, adoption non confirmée','transform_version':VERSION})
   financial.append({'id':ev,'uai':r['uai'] if r['uai'] in establishments else None,'raw_uai':r['uai'],'year':r['year'],'date':None,'title':f'{r["post"]} {r["year"]}','object':None,'beneficiary':r['name'],'decision':r['report'],'decision_type':'Proposition dans un rapport','amount':r['amount'],'currency':'EUR','unit':'EUR','tax':'unknown','nature':'proposed_budget','status':'observed','coverage':'partial','evidence':ev,'payer':'Région Île-de-France','operation':None,'aggregation':'blocked_adoption_unverified','scope':f'{r["post"]} ; groupe {r["scope"]} ; ni versement ni coût complet'})
 admin_file=ROOT/'data/admin-approved.json'
 if admin_file.exists():
  for batch in json.loads(admin_file.read_text()):
   s=next(x for x in catalog if x['id']==batch['source'] and x['sha256']==batch['version'])
   assert digest((ROOT/s['path']).read_bytes())==s['sha256']
   for i,r in enumerate(batch['rows']):
    ev=proof(s,r,i,'amount',f'Mapping humain validé {r["mapping_sha256"]} ; version publiable expurgée ; consolidation et ratio bloqués')
    if r.get('page'):
     evidence[-1].update(page=r['page'],table=r['table'],column=r['column'])
    financial.append({'id':ev,'uai':r['uai'] if r['uai'] in establishments else None,'raw_uai':r['uai'],'year':r['year'],'date':None,'title':r['post'],'object':None,'beneficiary':r['uai'],'decision':'Réponse administrative validée','decision_type':'Observation administrative','amount':r['amount'],'currency':r['currency'],'unit':r['unit'],'tax':r['tax'],'nature':r['nature'],'status':r['quality'],'coverage':'partial','evidence':ev,'payer':s['producer'],'operation':None,'aggregation':'blocked_pending_consolidation','scope':r['population']})
 legacy=[]
 legacy_ds='operations-de-construction-et-de-renovation-dans-les-lycees-francilens'
 if latest.get(legacy_ds,{}).get('mode')=='full':
  s,rows=read(legacy_ds)
  for i,r in enumerate(rows):
   ev=proof(s,r,i,'titreoperation','Opération ancienne non exhaustive ; UAI exact ; M EUR convertis exactement en EUR ; état historique conservé, sans déduction de l’état actuel ni addition aux décisions récentes')
   uai=r['codeuai'] if r['codeuai'] in establishments else None
   legacy.append({'id':ev,'uai':uai,'raw_uai':r['codeuai'],'title':r['titreoperation'],'name':r['lycee'],'city':r['ville'],'state':r['etat_d_avancement'],'delivery_year':r['annee_de_livraison'],'delivery_kind':'reported_actual' if r['etat_d_avancement']=='Opération livrée' else 'unspecified','notification':r['notification_du_marche'],'ap':str(Decimal(str(r['montant_des_ap_votes_en_meur']))*1000000) if r['montant_des_ap_votes_en_meur'] is not None else None,'forecast':str(Decimal(str(r['enveloppe_prev_en_meur']))*1000000) if r['enveloppe_prev_en_meur'] is not None else None,'agent':r['mandataire'],'ppi':r['ppi'],'evidence':ev,'source_modified':s['modified']})
 main=[e for e in establishments.values() if e['category']=='principal']; coverage=[]
 for e in establishments.values():
  for yr in range(2019,2026):
   for pop in ['GT','PRO']:
    obs=next((r for r in enrollments if r['uai']==e['uai'] and r['year']==yr and r['population']==pop),None)
    coverage.append({'uai':e['uai'],'year':yr,'population':pop,'post':'enrollment','status':obs['status'] if obs else 'missing','evidence':obs['evidence'] if obs else None})
   if yr>=2020:
    for post in POSTS:coverage.append({'uai':e['uai'],'year':yr,'population':'non_ventile','post':post,'status':'missing','evidence':None})
 for e in establishments.values():
  for yr in range(2020,2027):
   for nature in ['authorization','proposed_budget']:
    observations=[r for r in financial if r['uai']==e['uai'] and r['year']==yr and r['nature']==nature]
    coverage.append({'uai':e['uai'],'year':yr,'population':'non_ventile','post':nature,'status':'observed' if observations else 'missing','evidence':','.join(r['evidence'] for r in observations) if observations else None})
   for indicator in ['diagnostic_material','teaching_hours']:
    coverage.append({'uai':e['uai'],'year':yr,'population':'site_non_qualifie','post':indicator,'status':'missing','evidence':None})
 summary=[]
 for yr in range(2019,2026):
  summary.append({'year':yr,**{pop:{'rows':len([r for r in enrollments if r['year']==yr and r['population']==pop]),'observed':len([r for r in enrollments if r['year']==yr and r['population']==pop and r['status']=='observed'])} for pop in ['GT','PRO']},'financial_observations':len([r for r in financial if r['year']==yr]),'executed':'missing','conditions':'missing'})
 data={'version':VERSION,'generated':datetime.now(timezone.utc).isoformat(),'departments':DEPTS,'establishments':sorted(establishments.values(),key=lambda e:e['name']),'relations':relations,'enrollments':enrollments,'financial':financial,'legacy_operations':legacy,'evidence':evidence,'sources':catalog,'summary':summary,'quality':{'principal':len(main),'categories':dict(Counter(e['category'] for e in establishments.values())),'residual':len(residual),'quarantine':len(quarantine),'matches':len(matches)},'requests':[{'recipient':r,'sent':'2026-10-02','status':'sent_no_response_integrated'} for r in ['Région Île-de-France','Rectorat de Paris','Rectorat de Créteil','Rectorat de Versailles','Ministère de l’Éducation nationale']]}
 status_file=ROOT/'data/budget-status.json'
 data['budget_status']=json.loads(status_file.read_text()) if status_file.exists() else []
 # A calculation revision is keyed by all inputs, mapping code and version, not wall-clock time.
 codehash=digest(Path(__file__).read_bytes()+ (ROOT/'scripts/domain.py').read_bytes()+ (status_file.read_bytes() if status_file.exists() else b''))
 revision=digest(json.dumps({'sources':[(s['id'],s['sha256']) for s in catalog],'version':VERSION,'code':codehash,'pdf':json.loads(pdf_file.read_text()) if pdf_file.exists() else [],'admin':json.loads(admin_file.read_text()) if admin_file.exists() else []},sort_keys=True).encode())
 data['revision']=revision;out=ROOT/'data/derived'/f'{revision}.json'
 if out.exists():data=json.loads(out.read_text())
 else:dump(out,data)
 dump(ROOT/'data/derived/current.json',data)
 for name,rows in [('coverage',coverage),('quarantine',quarantine),('residual',residual),('matches',matches)]:
  dump(ROOT/f'data/reports/{name}.json',rows)
  if rows:
   with (ROOT/f'data/reports/{name}.csv').open('w') as f:
    w=csv.DictWriter(f,fieldnames=list(dict.fromkeys(k for row in rows for k in row)));w.writeheader();w.writerows(rows)
 dump(ROOT/'data/reports/summary.json',summary)
 dump(ROOT/'data/reports/pdf-unmatched.json',[r for r in financial if r['nature']=='proposed_budget' and r['uai'] is None])
 print(json.dumps({'revision':revision,**data['quality'],'enrollments':len(enrollments),'financial':len(financial)},ensure_ascii=False))
 return data
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--offline',action='store_true');a=p.parse_args()
 if not a.offline:collect_all()
 build()
