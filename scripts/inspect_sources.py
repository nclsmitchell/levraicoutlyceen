from collect import *
EXTRA=[('https://data.education.gouv.fr',s) for s in ['fr-en-lycee_pro-effectifs-niveau-sexe-mef','fr-en-effectifs-etudiants-cpge-par-annee-et-par-sexe','fr-en-mode-hebergement-eleves-etablissements-2d','fr-en-ips-lycees-ap2022']]+[('https://data.iledefrance.fr',s) for s in ['operations-de-construction-et-de-renovation-dans-les-lycees-francilens','marches-publics-decp-region-ile-de-france','liste-des-marches-conclus-depuis-2018']]+[('https://data.normandie.education.gouv.fr','fr-en-normandie-masse-salariale-des-etablissements-scolaires')]
PDFS=[
 (2020,'https://www.iledefrance.fr/espace-media/applis_js/rapports_cp-cr/2019-09-19/CR-2019-041.pdf'),
 (2021,'https://www.iledefrance.fr/actes/deliberations/CP2021-034RAP.pdf'),
 (2022,'https://www.iledefrance.fr/actes/deliberations/CR2021-071RAP.pdf'),
 (2023,'https://www.iledefrance.fr/actes/deliberations/CR2022-045RAP.pdf'),
 (2024,'https://www.iledefrance.fr/actes/deliberations/CR2023-032RAP.pdf'),
 (2025,'https://www.iledefrance.fr/sites/default/files/2024-09/cr2024-041.pdf'),
 (2026,'https://www.iledefrance.fr/sites/default/files/2025-09/cr2025-030rap.pdf')]
ACTS=[
 (2025,'https://www.iledefrance.fr/actes/deliberations/CR2024-041DEL.pdf'),
 (2026,'https://lycees.iledefrance.fr/documents/39707/85179/D%C3%A9lib%C3%A9ration%2Bfinale%2BDGFL%2B2026.pdf/dbc6f2e7-1d38-8961-d950-76489ca9ffb9?download=true&t=1761651936592&version=1.0')]
def collect_act(year,url):
 b=fetch(url);entry={'id':f'acte-dotation-{year}','title':f'Délibération adoptée relative aux dotations {year}','producer':'Région Île-de-France','url':url,'download_url':url,'published':None,'modified':None,'collected':datetime.now(timezone.utc).isoformat(),'license':'Document administratif public ; régime de réutilisation à vérifier','scope':f'Acte adopté ; annexes individuelles à rapprocher du rapport {year} ; aucun paiement attesté','mode':'pdf','row_count':None,**archive(b,'pdf')};save(entry);print(year,'acte',entry['path'],flush=True)
def collect_pdf(year,url):
 b=fetch(url)
 entry={'id':f'dotation-{year}','title':f'Rapport relatif aux dotations {year}'+(' · affectations complémentaires' if year==2021 else ''),'producer':'Région Île-de-France','url':url,'download_url':url,'published':None,'modified':None,'collected':datetime.now(timezone.utc).isoformat(),'license':'Document administratif public ; régime de réutilisation à vérifier','scope':f'Dotations {year} proposées, acte adopté à rapprocher'+(' ; rapport complémentaire CP2021-034, pas le rapport annuel complet' if year==2021 else ''),'mode':'pdf','row_count':None,**archive(b,'pdf')}
 save(entry);print(year,entry['path'],flush=True)
def main():
 failed=[]
 for host,ds in EXTRA:
  try: collect(host,ds,full=ds=='operations-de-construction-et-de-renovation-dans-les-lycees-francilens')
  except Exception as e: failed.append(ds);print(ds,str(e),flush=True)
 for year,url in PDFS:
  try: collect_pdf(year,url)
  except Exception as e: failed.append(str(year));print(year,str(e),flush=True)
 for year,url in ACTS:
  try: collect_act(year,url)
  except Exception as e: failed.append('acte-'+str(year));print(year,str(e),flush=True)
 if failed:raise SystemExit('Collectes incomplètes, versions antérieures conservées : '+', '.join(failed))
if __name__=='__main__':main()
