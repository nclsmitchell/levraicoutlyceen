# Première version locale — 2 octobre 2026

Le parcours complet est utilisable : recherche d’un lycée, fiche et effectifs historiques, comparaison de deux entités de même niveau, consultation des observations et des preuves, téléchargement des fichiers originaux et export avec provenance. Navigation département → commune → lycée, trois dimensions de lecture, panel constant et URL conservant les filtres.

## Collecte réelle intégrée

- Annuaire officiel : 658 lignes conservées. Après traitement des huit lignes supplémentaires d’UAI multi-sites et ajout des UAI historiques : 661 unités administratives consultables. Le périmètre principal actuel comporte **454 lycées autonomes** : Paris 93, Seine-et-Marne 52, Yvelines 49, Essonne 45, Hauts-de-Seine 54, Seine-Saint-Denis 68, Val-de-Marne 47 et Val-d’Oise 46.
- Catégories séparées : 167 sections, 10 autres unités rattachées, 14 EREA, 5 unités sous autres tutelles et 11 UAI historiques. Les sections ne deviennent pas des établissements supplémentaires. Le regroupement indique le lieu d’implantation, pas le domicile des élèves.
- Effectifs : **4 436 observations** aux rentrées 2019–2025, dont 2 392 GT et 2 044 PRO. Dix cellules sont supprimées ou non publiées : aucune reconstitution. Les décomptes d’exports complets correspondent aux nombres annoncés par l’API.
- Décisions régionales d’opérations directes : **1 567 observations** en 2021–2023. 803 rapprochements par UAI exact ; **764 dans le résiduel**, sans bénéficiaire inventé. Affectation, revalorisation et désaffectation restent des lignes individuelles. Aucun cumul de révisions n’est présenté.
- Annexes 2025–2026 : **2 016 observations** DGFL nette, internat et CEO/CTO, avec pages, tables, colonnes et cellules brutes. **14 contrôles exacts** de sous-totaux et totaux. 1 009 montants pour 2025, 1 007 pour 2026. Les cellules « - » d’internat ne deviennent pas des zéros. Vingt observations ne sont pas rapprochées d’un UAI du référentiel et restent identifiées séparément.
- Travaux : **331 opérations historiques** d’une source régionale ancienne et explicitement non exhaustive. Les enveloppes prévisionnelles et AP ne sont pas des paiements. L’état « livré » n’est présenté que comme une déclaration historique du producteur, avec précision à l’année ; aucun diagnostic actuel n’en est déduit.
- Catalogue : **22 versions conservées**, dont les schémas/échantillons des sources complémentaires, les rapports antérieurs retrouvés et les actes adoptés de 2025 et 2026. La masse salariale normande sert uniquement à la méthode. Ses montants ne figurent dans aucune observation francilienne.

Les montants extraits des rapports restent des **propositions**, car le rapprochement individuel avec les annexes des actes adoptés et les notifications n’est pas terminé. La délibération adoptée est accessible depuis les sources et les observations correspondantes. Aucun de ces documents ne prouve un paiement annuel. Les données 2026 sont séparées du périmètre annuel 2020–2025.

## Contrôles et anomalies

Les fichiers sont nommés par SHA-256, leur intégrité est vérifiée et les versions ne sont pas écrasées. Les observations portent une preuve, une règle et une version de transformation. Le recalcul hors ligne donne le même résultat à entrées et code identiques. Le chargement PostgreSQL conserve les versions et l’appartenance des preuves à chaque calcul.

**Treize anomalies sont conservées en quarantaine** : huit lignes supplémentaires d’UAI multi-sites et cinq codes parisiens historiques ne permettant pas de qualifier un arrondissement officiel. Le code communal de Paris est 75056 ; les arrondissements sont un niveau distinct. L’UAI « 0952173w » d’une annexe est normalisé uniquement en majuscules et sa ligne brute reste conservée.

Les rapports exhaustifs livrés sont `data/reports/coverage.json` et `.csv` (51 558 lignes de disponibilité), `matches`, `residual`, `quarantine`, `pdf-unmatched.json` et `pdf-controls.json`. La couverture distingue UAI, année, population et poste. Les postes absents ne valent pas zéro. Aucun pourcentage de « coût couvert » n’est affiché lorsque le coût total est inconnu.

## Validation

- 36 tests Python passent : les 18 risques métier demandés, bases comptables, signes, cellules manquantes, intégrité des sources, traçabilité, imports idempotents, contrôles PDF et validation humaine du mapping administratif.
- TypeScript, formatage et compilation Next.js vérifiés.
- PostgreSQL 18 : migrations appliquées ; double chargement sans doublons ; instantané et 9 008 preuves de la révision contrôlés. Allocation 60/30 sur 100 acceptée avec reliquat 10 ; allocation 60/50 refusée. Toutes les données synthétiques de ce test sont annulées par transaction.
- Parcours sur 20 combinaisons page/écran, en 1440 × 1000 et 390 × 844 : aucune erreur de navigateur, aucun débordement de page, aucune violation détectée par axe sur WCAG 2 A/AA et 2.1 AA. Recherche → fiche → identité/source, filtres du comparateur, URL partageable, exports CSV/JSON, provenance, rejet des chemins de téléchargement non autorisés et lien d’évitement au clavier vérifiés.
- Échantillon réel : Agora (0920144G, GT), Belliard (0752608C, professionnel), Coulommiers (0770924L, polyvalent et post-bac), Lamartine (0750670W, périmètre documentaire de cité scolaire), Paul Éluard (0930125F, opération historique de restauration). Le rapprochement du périmètre d’une cité scolaire et de son collège reste bloqué pour les coûts.

Le dernier passage a été effectué sur la version compilée connectée à PostgreSQL, accessible à l’adresse locale `http://127.0.0.1:3000`. Le rapport automatisé daté est `docs/ui-validation.json`. Les huit captures complètes figurent dans `docs/screenshots/` ; les écrans de fiche et comparaison ont aussi été examinés visuellement à leur taille mobile réelle. Ces contrôles automatisés et visuels ne remplacent pas un audit RGAA complet ni des essais avec tous les lecteurs d’écran.

## Limites visibles et prochaines données

**Aucun coût complet ni ratio financier n’est encore calculable.** Les dépenses exécutées annuelles de personnel, de fonctionnement et d’investissement, leurs éliminations internes et leurs populations bénéficiaires restent à obtenir. L’application n’assimile jamais les dotations ou montants votés à ces dépenses.

Les diagnostics de vétusté/sécurité, surfaces et capacités, locaux fermés/provisoires, réceptions de travaux et heures agrégées d’enseignement ne sont pas intégrés. Leur absence est affichée comme « non documenté », sans score ou conclusion sur les conditions d’étude.

À traiter ensuite, avec validation documentaire :

1. Réponses aux cinq demandes déjà envoyées le 2 octobre 2026. Original privé, mapping validé par une personne, version expurgée et régime de réutilisation vérifiés avant promotion locale. Le connecteur CSV/XLSX/PDF financier est prêt ; aucun import public anonyme, aucun renvoi de demande.
2. Annexes adoptées et notifications de dotations ; rapports 2020–2024 archivés à contrôler visuellement avant extraction. Le document 2021 retrouvé est complémentaire : le rapport annuel complet reste à retrouver.
3. Périmètres historiques EPLE/UAI/sites/cités, dates de fusion et rattachements, et rattachement des lignes multi-sites mises en quarantaine. L’annuaire actuel n’est pas appliqué rétroactivement aux sections.
4. Effectifs post-bac complets par établissement et populations partagées. Les jeux CPGE inspectés ne garantissent pas ce dénominateur ; les séries GT et PRO ne sont pas réunies automatiquement. La rupture du champ PRO en 2025 reste explicitée.
5. Rapprochement des marchés, décisions, paiements et jalons, avec liens documentaires ; leurs montants ne doivent pas être additionnés comme des dépenses indépendantes. Les marchés restent au stade de l’inspection de schéma.
6. Mapping spécifique des diagnostics et relevés agrégés vers les tables de conditions. Actifs et amortissements documentés avant toute activation du coût économique ; recettes et transferts rapprochés avant le financement public net. Aucun déflateur ni durée uniforme d’amortissement n’est choisi arbitrairement.

Le code, les migrations, les sources, les rapports et les commandes d’installation/import/recalcul sont livrés dans le dépôt. Le fichier documentaire fourni par Nicolas est conservé intact.

## Déploiement demandé après la livraison locale

Le 2 octobre 2026, le site a été publié par Terraform dans le projet GCP `levraicoutlyceen`, en `europe-west1` : <https://levraicoutlyceen-fe6jzy2diq-ew.a.run.app>. Cloud Run utilise 0 instance minimale, 1 maximale, 1 vCPU, 512 Mio et la facturation par requête. Les données publiques immuables et leurs archives sont embarquées ; PostgreSQL et l’ingestion contrôlée restent locaux. Aucun DNS n’a été modifié ; l’activation du domaine reste non vérifiée.

Les 20 pages de contrôle en ligne passent sur ordinateur et mobile, avec zéro violation axe et zéro erreur JavaScript. Les 22 téléchargements de documents correspondent aux empreintes archivées. Huit exports complets de couverture simultanés passent avec les limites prévues. Les fichiers `cloud-ui-validation.json`, `cloud-integrity.json`, `cloud-deployment.json` et les captures dans `screenshots-cloud/` documentent la livraison. La mesure locale du conteneur atteint 437 137 408 octets au pic, sans arrêt mémoire ; elle ne constitue pas une mesure du service distant.

Les instructions et les limites de coûts sont dans [deploiement-gcp.md](deploiement-gcp.md).

## Mise à jour des parcours et graphiques

Les sélecteurs de l’accueil, de l’annuaire, des fiches et du comparateur sont recherchables par libellé ou code. Les communes dépendent immédiatement du département choisi ; le partage conserve les filtres appliqués. Le comparateur présente les effectifs publiés et la couverture des établissements, avec choix de rentrée et accès aux preuves. Les années manquantes, changements de panel et rupture PRO de 2025 interrompent les segments concernés ; la fiche lycée respecte aussi cette rupture.

Les 36 tests métier restent valides. Les 20 contrôles d’écrans et les 10 scénarios UX passent sur la version Cloud Run publiée, avec zéro violation axe détectée. Les nouvelles captures comprennent les graphiques et une recherche de valeur sur ordinateur et mobile. La revue des parcours et ses règles sont décrites dans [ux.md](ux.md).
