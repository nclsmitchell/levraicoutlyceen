# Coût public des lycées franciliens — dossier de recherche et de réalisation

Préparé pour Nicolas Mitchell — 2 octobre 2026.

Domaine choisi : `levraicoutlyceen.fr`. Nicolas a annoncé le 2 octobre 2026 qu’il le réserve ; ne pas confondre cette décision avec une vérification de son activation ou de sa configuration DNS. Nom affiché : « Le vrai coût par lycéen ». Sous-titre : « Dépenses publiques, moyens et conditions d’étude, lycée par lycée ». Utiliser une configuration unique du domaine et ne pas acheter de domaine supplémentaire.

## Intention éditoriale et priorités de cette version — mise à jour du 2 octobre 2026

Cette section complète les règles comptables et précise les priorités du premier développement. En cas de différence de cadrage avec une formulation plus ancienne du dossier, elle prévaut.

### Question directrice

**« Davantage de moyens annoncés se traduit-il par de meilleures conditions d’étude ? »**

Le point de départ de Nicolas est le débat sur les moyens attribués aux lycées de Seine-Saint-Denis et le décalage perçu avec leurs conditions matérielles. C’est une question à instruire, pas une conclusion acquise. Le site doit pouvoir montrer des écarts dans tous les sens, y compris des données qui contredisent l’hypothèse initiale.

Ne pas présenter le projet comme une démonstration que le 93 reçoit nécessairement moins, que tous ses lycées sont dégradés ou qu’un courant politique ment. Pour examiner une affirmation publique, conserver son auteur, sa date, son texte exact ou sa paraphrase clairement identifiée, sa source, son territoire, sa période, son indicateur et son périmètre. Ne jamais comparer un budget régional à un coût complet État + Région + EPLE sans le signaler.

### Trois dimensions de lecture

| Dimension | Contenu | Limite à rendre visible |
|---|---|---|
| Annoncé et voté | Déclarations publiques, programmes, délibérations et dotations | Une annonce n’est pas une décision ; un vote n’est pas un paiement. |
| Exécuté et disponible | Paiements/mandatements qualifiés, personnels affectés et moyens effectivement disponibles | Une dépense de personnel ne renseigne pas seule le nombre d’heures de cours assurées. |
| Conditions d’étude | Diagnostics datés, locaux utilisables, travaux livrés et continuité des cours | Absence de diagnostic ou de signalement ne signifie pas bon état. |

Une rénovation importante peut expliquer simultanément un investissement élevé et des conditions encore dégradées. Le site doit distinguer rattrapage d’un retard, entretien courant, extension de capacité et amélioration nouvelle lorsque les pièces permettent cette qualification. Ne pas attribuer automatiquement une relation causale à une corrélation entre dépenses et état du lycée.

Les écarts de formations, effectifs, internat, handicap, parc immobilier et ancienneté du personnel doivent être visibles. Prévoir des filtres comparables, pas une correction statistique opaque ni un score global de performance.

### Première version réalisable maintenant

Conserver les sources et la rigueur du dossier tout en livrant une tranche fonctionnelle : import réel → fiche lycée → comparaison → justificatifs.

Sans dépôt existant : Next.js/TypeScript, Tailwind et composants accessibles, PostgreSQL avec migrations et Docker Compose pour la base locale, scripts Python d’ingestion. Vérifier les versions dans les documentations officielles. Si un dépôt existe, réutiliser sa stack. Ne pas ajouter de compte pour les visiteurs ni de microservices.

Importer d’abord S01/S02/S03, puis S28 et les annexes de dotations contrôlées S06/S07. Afficher le périmètre pré-bac des effectifs connus. Les indicateurs qui exigent post-bac ou coûts complets restent indisponibles tant que les données nécessaires manquent.

Créer les trois onglets « Annoncé et voté », « Dépenses exécutées » et « Conditions d’étude ». Ils peuvent avoir des couvertures différentes. Un onglet vide explique précisément les données attendues sans afficher de faux chiffres. Éviter une jauge générale de complétude qui mélangerait les trois dimensions.

S28 permet une première vue des décisions par lycée quand le rattachement est documenté. Garder les opérations sans UAI dans un ensemble non attribué ; un simple nom approchant ne suffit pas. Dédoublonner avec les rapports PDF et les autres sources de marchés/travaux. Plusieurs décisions d’une même opération peuvent être des révisions ou des affectations supplémentaires : déterminer leur nature avant de calculer un cumul. Éviter un taux d’exécution si la base votée et les paiements ne couvrent pas exactement la même opération et la même période.

Prévoir une entrée d’exploration Seine-Saint-Denis, avec les mêmes règles et filtres que les sept autres départements. Aucun département comparateur ne doit être imposé pour produire un résultat particulier.

Ne pas faire dépendre le MVP d’une collecte d’affirmations politiques ou de témoignages. Le premier livrable doit déjà être utile pour explorer effectifs, dotations et décisions budgétaires sourcées. Les coûts complets et les conditions documentées s’ajouteront au fur et à mesure.

### Données complémentaires pour les conditions d’étude

Ces informations sont souhaitées ; elles ne sont pas considérées comme déjà obtenues et ne constituent pas de nouvelles demandes envoyées :
- diagnostics de vétusté et de sécurité datés, méthode et échelle d’évaluation ;
- surfaces, capacité d’accueil, effectifs, locaux fermés ou provisoires et périodes concernées ;
- calendrier prévu et dates effectives de livraison/réception des travaux, réserves si communicables ;
- heures d’enseignement prévues, assurées et non assurées, heures remplacées, période et définition de chaque indicateur, sous forme agrégée ;
- dates d’intervention et indicateurs documentés de chauffage, ventilation ou sanitaires si disponibles.

Ne pas collecter de motifs médicaux ni de données individuelles. Les appréciations institutionnelles, les diagnostics techniques et d’éventuels témoignages sont des catégories distinctes ; un témoignage ne devient pas une mesure vérifiée. Pas de plateforme de témoignages ouverte dans le MVP.

### Compléments au modèle de données

Ajouter `public_claims` (auteur institutionnel, date, source, texte, période, périmètre, indicateur, statut de vérifiabilité), `condition_observations` (site, date/période, indicateur, valeur/unité/échelle, méthode, source, couverture) et `operation_milestones` (opération, jalon prévu/réalisé, date, preuve). Pour les déclarations : conserver les éléments concordants et contradictoires, sans verdict automatique.

Le composant de détail d’une opération distingue son budget, ses dépenses et ses jalons de réalisation. Une date prévue ne vaut pas livraison ; un bâtiment rénové ne permet pas de qualifier tout un établissement de rénové.

### Critères d’acceptation supplémentaires

- Identité et métadonnées utilisent « Le vrai coût par lycéen » et `levraicoutlyceen.fr` ; pas de référence à l’ancien domaine dans la configuration du produit.
- S28 est toujours qualifié de montant voté/affecté ; les observations sans UAI restent visibles dans le rapport de qualité, hors agrégats par lycée non validés.
- Une annonce, une décision et un paiement concernant la même opération sont reliés, jamais additionnés.
- Une livraison prévue ne s’affiche pas comme réalisée ; un diagnostic ancien porte sa date et ne décrit pas implicitement l’état actuel.
- Pas d’indice de vétusté reconstruit à partir du seul montant des travaux.
- Aucun nombre d’heures de cours assurées déduit d’une dépense de remplacement.
- L’absence de données d’état produit « non documenté », jamais « bon état ».
- Les règles de comparaison sont identiques pour le 93 et les autres départements.

### Instruction de lancement à transmettre à Codex

> Développe la première version locale de « Le vrai coût par lycéen » pour le domaine choisi levraicoutlyceen.fr, en suivant ce dossier et en priorité sa section « Intention éditoriale et priorités de cette version ». Réalise maintenant l’annuaire, les effectifs historiques, les comparaisons, les décisions budgétaires documentées et la consultation des sources. Structure les écrans autour des moyens annoncés/votés, des dépenses exécutées et des conditions d’étude, avec des états manquants explicites. Notre point de départ est le débat sur les moyens et les conditions matérielles des lycées du 93 ; les résultats doivent rester ouverts et toutes les comparaisons suivre les mêmes règles. Les cinq demandes administratives ont été envoyées le 2 octobre 2026 : ne les renvoie pas. Livre une application fonctionnelle, des imports reproductibles, les tests métier pertinents et un rapport de couverture. N’attends pas les réponses pour réaliser les fonctionnalités déjà possibles. Pas d’achat de domaine, de modification DNS ni de publication publique dans cette étape.

## 1. Conclusion et mode d’emploi

Le projet est réalisable comme observatoire documenté, mais un coût complet effectivement constaté pour chaque lycée ne peut pas encore être établi à partir des seules sources publiques identifiées. Aucun tableau complet francilien réunissant personnel, remplacements, patrimoine et fonctionnement par établissement et par exercice n’a été trouvé dans cette recherche. Cela ne prouve pas que ces données n’existent pas en interne.

Les données immédiatement utilisables sont le référentiel des établissements, des effectifs annuels, des annexes de dotations régionales et des descriptions d’opérations et de marchés. Les dépenses finales, les coûts employeur et les clés de ventilation demandent des extractions administratives complémentaires.

Point particulièrement utile : le portail officiel de Normandie publie une masse salariale par établissement issue de l’« Application nationale Masse Salariale des EPLE et établissements privés ». Cela fournit une cible précise pour demander l’équivalent francilien. Cette publication comporte aussi des estimations : son intitulé ne garantit donc pas un coût intégralement observé. [S08]

Ce dossier contient : périmètre, registre des sources, lacunes, méthode comptable, destinataires vérifiés, courriels prêts à adapter, spécification produit et données, instructions Codex et tests d’acceptation. Les cinq courriels A, B (trois rectorats) et C ont été envoyés le 2 octobre 2026 depuis ncls.mitchell@gmail.com avec le préambule neutre validé. Aucune réponse n’a été intégrée au présent dossier. Ne pas renvoyer ces demandes automatiquement. Aucun coût total par lycée n’est présenté comme calculé. Les sources ont été recherchées et certaines API testées, mais les jeux complets et les tableaux PDF n’ont pas encore été importés dans une base.

Ordre recommandé : commencer le référentiel et le moteur de traçabilité ; suivre les réponses aux demandes déjà envoyées ; intégrer les réponses avant de publier des comparaisons de coût complet. Si seules des dotations sont disponibles, publier une comparaison explicitement limitée aux dotations, pas au coût total.

## 2. Périmètre proposé

### Territoire et établissements

Île-de-France : 75 Paris, 77 Seine-et-Marne, 78 Yvelines, 91 Essonne, 92 Hauts-de-Seine, 93 Seine-Saint-Denis, 94 Val-de-Marne, 95 Val-d’Oise. Ordre de navigation : département → commune → lycée. Le regroupement territorial mesure les établissements situés dans le territoire, pas les dépenses des élèves qui y résident.

Périmètre principal : lycées publics sous tutelle du ministère de l’Éducation nationale, généraux, technologiques, professionnels et polyvalents. Inclure les sections professionnelles rattachées dans la cartographie sans les compter deux fois. Prévoir des catégories séparées pour EREA, agricole, militaire et autres tutelles ; ne pas les intégrer silencieusement au périmètre principal. Leur extension nécessiterait notamment les données des autres ministères et de la DRIAAF pour l’agricole.

L’UAI est la clé administrative de rapprochement, mais ce n’est pas toujours l’unité immobilière ou comptable. Un lycée, une section, un EPLE, une agence comptable et une cité scolaire ne sont pas interchangeables. Créer leurs relations avec dates d’effet. Conserver les établissements fermés et fusionnés dans les séries historiques ; l’annuaire actuel des établissements ouverts ne suffit pas à reconstruire le passé.

### Période

Cible financière : exercices civils clos 2020 à 2025, soit six années. Priorité de traitement : 2023–2025 ; accepter les millésimes disponibles séparément. 2026 reste une année en cours : afficher éventuellement les dotations prévisionnelles dans un mode séparé, jamais comme une dépense annuelle complète.

Effectifs nécessaires : rentrées 2019 à 2025 pour la période cible. Les API GT et PRO contiennent bien ces sept rentrées pour le filtre Île-de-France/public au 02/10/2026. Cela vérifie la présence des millésimes, pas l’exhaustivité de chaque établissement ni leur parfaite comparabilité.

### Trois questions distinctes à traiter

1. Combien a été dépensé durant l’année pour les services rendus dans ce lycée, investissements compris ? Vue de dépense annuelle exécutée.
2. Combien coûte une année de fonctionnement en intégrant l’usage du patrimoine ? Vue économique annualisée, réalisable seulement avec inventaires et règles d’amortissement suffisamment documentés.
3. Quelle part est financée par les administrations publiques, les familles et d’autres recettes ? Vue de financement distincte de la dépense finale.

Le périmètre de collecte doit être large. Le périmètre de chaque indicateur doit rester explicite. Un total « tous frais inclus » sans inventaire de ses exclusions serait trompeur.

## 3. Sources et état réel de disponibilité

Légende : **vérifié** = page ou document officiel consulté ; **API testée** = réponse machine effectivement obtenue ; **à obtenir** = absence de fichier exploitable identifié pour le besoin exact. Les liens ci-dessous servent aussi de registre initial pour Codex. Date de consultation commune : 02/10/2026, sauf les métadonnées historiques indiquées.

| ID | Source / accès | Usage, disponibilité et limite |
|---|---|---|
| S01 | [Annuaire national de l’éducation](https://data.education.gouv.fr/explore/dataset/fr-en-annuaire-education/) | API testée. UAI, nom, commune, département, tutelle, statut, nature, rattachement, coordonnées. Photographie actuelle ; historique à demander. |
| S02 | [Effectifs en lycée GT](https://data.education.gouv.fr/explore/dataset/fr-en-lycee_gt-effectifs-niveau-sexe-lv/) | API testée : millésimes IDF/public 2019–2025. UAI via `numero_lycee`, année via `rentree_scolaire`, effectif publié `nombre_d_eleves`. Utiliser le total approprié, pas la somme des ventilations sexe/langues. Certaines petites cellules sont masquées. |
| S03 | [Effectifs en lycée professionnel](https://data.education.gouv.fr/explore/dataset/fr-en-lycee_pro-effectifs-niveau-sexe-lv/) | API testée : millésimes IDF/public 2019–2025. Recouvre des formations professionnelles, avec des UAI de sections possibles. Vérifier les périmètres avant de combiner GT/PRO. |
| S04 | [Effectifs voie professionnelle ou BTS par MEF](https://data.education.gouv.fr/explore/assets/fr-en-lycee_pro-effectifs-niveau-sexe-mef/) | Jeu identifié. Source complémentaire pour les formations ; ne garantit pas à lui seul un effectif BTS exhaustif de tous les lycées. Schéma et historique à vérifier à l’ingestion. |
| S05 | [Effectifs CPGE](https://data.education.gouv.fr/explore/assets/fr-en-effectifs-etudiants-cpge-par-annee-et-par-sexe/) | Jeu identifié ; vérifier qu’une granularité établissement est disponible avant usage. Sinon demander une extraction DEPP/SIES par UAI. Aucun effectif post-bac complet n’est certifié dans ce dossier. |
| S06 | [Rapport CR 2024-041 : dotations 2025](https://www.iledefrance.fr/sites/default/files/2024-09/cr2024-041.pdf) | PDF officiel vérifié, 25 pages. Annexes DGFL à partir de la page 12 et CEO/CTO page 18. Document de rapport avec projet de délibération : rapprocher de l’acte adopté et des notifications. Ce ne sont pas des dépenses finales. |
| S07 | [Rapport CR 2025-030 : dotations 2026](https://www.iledefrance.fr/sites/default/files/2025-09/cr2025-030rap.pdf) | PDF officiel vérifié, 35 pages. DGFL/internat page 21 et CEO/CTO page 27. Certains éléments consolidés, dont fluides et EPI, sont prévisionnels. À réserver au contexte budgétaire 2026. |
| S08 | [Masse salariale par établissement — Normandie](https://data.normandie.education.gouv.fr/explore/dataset/fr-en-normandie-masse-salariale-des-etablissements-scolaires/) | Précédent officiel et documentation d’une application nationale, pas une donnée francilienne. Imputation par jours équivalent temps plein ; certains métiers sont estimés. À citer dans les demandes aux rectorats et au ministère. |
| S09 | [Opérations de construction et rénovation franciliennes](https://data.iledefrance.fr/explore/dataset/operations-de-construction-et-de-renovation-dans-les-lycees-francilens/) | UAI, objet, enveloppes et AP, état/livraison. Liste explicitement non exhaustive et ancienne : métadonnée de modification 2018, traitement 2020. Ni registre annuel de paiements ni inventaire complet de la maintenance. |
| S10 | [Marchés publics DECP de la Région](https://data.iledefrance.fr/explore/dataset/marches-publics-decp-region-ile-de-france/) | Description de contrats, montants et références. Filtré par acheteur régional ; ne couvre pas nécessairement les marchés des EPLE ou mandataires. Un montant de marché n’est pas un paiement annuel. |
| S11 | [Marchés conclus depuis 2018](https://data.iledefrance.fr/explore/dataset/liste-des-marches-conclus-depuis-2018/) | Complément historique pour travaux/services/fournitures ; risque de recouvrement avec S10. Pas une source additive de coûts. |
| S12 | [Dotations budgétaires — portail Lycées IDF](https://lycees.iledefrance.fr/dotation-budgetaire) | Procédures et documentation des financements. Retrouver les dossiers annuels, mais demander les exports des notifications et versements réalisés. |
| S13 | [Dotations travaux](https://lycees.iledefrance.fr/dotations-travaux) | Confirme des circuits de travaux délégués aux établissements. Indispensable pour repérer les transferts Région→EPLE à éliminer lors de la consolidation. |
| S14 | [Mode d’hébergement des élèves](https://data.education.gouv.fr/explore/dataset/fr-en-mode-hebergement-eleves-etablissements-2d/) | Variables de contexte. Un élève interne peut être hébergé dans un autre établissement : ne pas imputer automatiquement les coûts d’hébergement au lycée de scolarisation. |
| S15 | [IPS des lycées depuis 2022](https://data.education.gouv.fr/explore/dataset/fr-en-ips-lycees-ap2022/) | Contexte de comparaison, pas mesure de coût ou d’efficacité. Rupture méthodologique à partir de 2022 ; pas de correction automatique du coût par IPS. |
| S16 | [L’état de l’École 2025](https://www.education.gouv.fr/sites/default/files/document/l-tat-de-l-cole-en-2025-474604.pdf) | Repères nationaux du Compte de l’éducation, à périmètre différent. Contrôle de plausibilité seulement, jamais substitution d’une moyenne nationale à un coût réel de lycée. |
| S17 | [Programme statistique 2018, BO spécial](https://www.education.gouv.fr/bo/18/Special2/MENP1804987C.htm) | Document historique attestant l’usage central des comptes financiers pour le Compte de l’éducation. Ne prouve pas l’existence d’un export actuel public exhaustif. À demander à DAF/DEPP. |
| S18 | [DAF du ministère](https://www.education.gouv.fr/direction-des-affaires-financieres-daf-3671) | Point de compétence pour comptes EPLE et masse salariale. Solliciter par la PRADA ministérielle. |
| S19 | [Code de l’éducation, L214-6](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038902139) | Fondement des compétences régionales sur les lycées, leurs bâtiments, équipement et fonctionnement. |
| S20 | [CRPA — communication des documents](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000031366350/LEGISCTA000031367694/) | L311-1, L311-2, L311-7, L311-9 ; R311-13 et R311-15 pour délais. Demander les documents existants, sous réserves légales. |
| S21 | [Avis CADA 20225451](https://cada.data.gouv.fr/20225451/) | Distingue extraction automatisée d’usage courant et création d’un document nouveau nécessitant des traitements complexes. Justifie la formulation des demandes. |
| S22 | [Quand et comment saisir la CADA](https://www.cada.fr/particulier/quand-et-comment-saisir-la-cada) | Procédure de recours, justificatifs, délai de principe de deux mois après refus exprès ou tacite. |
| S23 | [Administration régionale et PRADA](https://www.iledefrance.fr/decouvrir-le-fonctionnement-de-la-region/propos-de-la-region/ladministration-de-la-region-ile-de-france) | Contact régional vérifié. |
| S24 | [PRADA Versailles — CADA](https://www.cada.fr/rectorat-de-lacademie-de-versailles-ac-78) | Contact rectoral vérifié. |
| S25 | [PRADA Paris — CADA](https://www.cada.fr/rectorat-de-lacademie-de-paris-ac-75) | Contact rectoral vérifié. |
| S26 | [PRADA Créteil — CADA](https://www.cada.fr/rectorat-de-lacademie-de-creteil-ac-94) | Contact rectoral vérifié. L’adresse postale affichée diffère de l’annuaire courant du rectorat ; privilégier le courriel et revérifier avant tout envoi postal. |
| S27 | [PRADA ministérielle — annuaire CADA](https://www.cada.fr/administration/personnes-responsables-administration?field_classement_de_l_administra_tid=All&field_d_partement_de_l_autorit__tid=17476&p=184) | Courriel ministériel vérifié au jour de la recherche ; la pagination d’annuaire peut évoluer. |
| S28 | [Opérations directes votées des lycées](https://data.iledefrance.fr/explore/dataset/donnees-budgetaires-lycees-operations-directes/) | Page officielle vérifiée le 02/10/2026 : opérations depuis le 1er janvier 2021, délibération, bénéficiaire, dossier et objet. UAI parfois absent. Montant voté affecté, distinct du réalisé. API et couverture annuelle restent à tester. À intégrer à la vue décisions budgétaires, jamais aux paiements. |

Les millésimes DGFL antérieurs à 2025 restent à collecter. S06 cite CR 2023-032 pour les dotations 2024 : c’est une piste documentaire, pas un fichier déjà vérifié. Pour 2020–2023, demander les exports régionaux et consulter les actes annuels ; ne pas inventer leurs URL.

### Contrôles API réellement effectués

Base testée : `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/`.

Appels `/{dataset_id}/records?limit=1` réussis sur S01, S02 et S03. Requête d’agrégation réussie sur S02/S03 avec paramètres encodés :

```text
select=rentree_scolaire,count(*) as lignes
where=code_region_insee='11' AND secteur='PUBLIC'
group_by=rentree_scolaire
order_by=rentree_scolaire
limit=100
```

| Rentrée | Lignes GT IDF/public | Lignes PRO IDF/public |
|---|---:|---:|
| 2019 | 335 | 296 |
| 2020 | 349 | 294 |
| 2021 | 351 | 294 |
| 2022 | 338 | 292 |
| 2023 | 340 | 289 |
| 2024 | 339 | 288 |
| 2025 | 340 | 291 |

Ces nombres sont des lignes sources, pas un dénombrement dédoublonné des lycées. Ne pas additionner les deux colonnes comme un nombre d’établissements. Les variations exigent une analyse des UAI et du périmètre.

Différences de schéma observées : S01 utilise `identifiant_de_l_etablissement`, `statut_public_prive=Public`, `code_region` et des départements comme `092`. S02/S03 utilisent `numero_lycee`, `secteur=PUBLIC`, `code_region_insee` ; le champ département est `code_departement_pays` en GT et `code_departement` en PRO. Normaliser les codes en chaînes, ne jamais perdre les zéros de l’UAI ou des communes. L’agrégation de rentrée peut renvoyer une date ISO alors qu’une ligne source renvoie `2019` : normaliser explicitement l’année.

## 4. Matrice des frais à couvrir

| Poste | Détenteur à solliciter | Champs / contrôle essentiel |
|---|---|---|
| Enseignants titulaires et contractuels | Rectorats, ministère | Coût employeur annuel, primes, heures supplémentaires, cotisations et contribution pensions ; affectation de service et non seul rattachement administratif. |
| Remplacements courts/longs | Rectorats | Coût déjà inclus ou supplémentaire, missions réellement réalisées, HSE/Pacte le cas échéant, TZR multi-sites et périodes sans mission. Ne pas rajouter un total déjà compris dans la paie. |
| Direction, administration, documentation, CPE | Rectorats | Coûts employeur et temps partagé entre structures. |
| AED, AESH, santé, social, orientation | Rectorats, EPLE employeurs | Payeur final, parts estimées, mutualisation ; éviter d’attribuer toute une paie au lycée support d’un dispositif. |
| Agents techniques, entretien, restauration, remplaçants | Région | Coût employeur des agents régionaux, personnels temporaires, prestations externalisées ; rattachement effectif au site. |
| Fluides et fonctionnement courant | Région et EPLE | Énergie, eau, déchets, nettoyage, sécurité, contrôles, assurances, contrats, fournitures. Certains paiements sont directs régionaux, hors budget EPLE. |
| Bâtiments et terrains | Région et mandataires | Acquisition, études, construction, rénovation, accessibilité, désamiantage, maintenance, installations provisoires, frais de maîtrise d’ouvrage, dates et paiement annuel par opération. |
| Matériel et numérique | Région et EPLE | Mobilier, ateliers, laboratoire, informatique, ENT, licences, télécom, maintenance, équipements individuels ; achat direct ou dotation, investissement ou charge. |
| Restauration et internat | Région et EPLE | Charges, recettes familles, repas/nuitées, bénéficiaires extérieurs et parts de personnel/énergie déjà incluses. |
| Pédagogie, sorties, EPS, examens, formation | EPLE, rectorats, communes si prestations | Subventions, dépenses finales, location de gymnases, gratuités documentées ; distinguer les aides monétaires aux familles. |
| Fonctions support et coûts centraux | Région, rectorats, ministère | Administration, informatique, inspection, examens, formation/recrutement, locaux centraux : enveloppes dédiées et clés existantes, sinon allocations explicitement estimées. |
| Financement et immobilier particulier | Région | Loyers, crédit-bail/PPP, intérêts attribuables, valeur des actifs, amortissements. Capital d’emprunt remboursé et transfert de subvention ne sont pas un coût supplémentaire de production. |
| Autres concours publics | Région/EPLE puis collectivités concernées | Subventions locales, État, UE et mises à disposition ; distinguer financeur et payeur final. |

Aides sociales/bourses, transport scolaire et dépenses familiales : collecter séparément lorsqu’elles sont disponibles, pour une vue élargie des ressources consacrées à la scolarité. Ne pas mélanger une bourse versée à la famille avec un achat de service déjà financé par cette même bourse. Les transports financés globalement par Île-de-France Mobilités ne peuvent être imputés réellement au lycée sans données ou clé ; prévoir un poste non ventilé et une demande ciblée ultérieure si la vue élargie est retenue. Le coût d’opportunité du foncier et les externalités ne sont pas des dépenses publiques observées ; uniquement scénarios distincts éventuels.

## 5. Méthode de calcul à imposer au site

### 5.1 Ne pas confondre dépenses, financement et promesses budgétaires

Classer chaque observation : `budget_previsionnel`, `autorisation_engagement`, `autorisation_programme`, `engagement`, `mandatement_net`, `paiement_net`, `charge_comptable`, `amortissement`, `transfert_financement`, `montant_marche`.

Ne jamais sommer ces bases comme si elles étaient homogènes. Conserver les mandats et les paiements comme deux observations reliées ; choisir une base par indicateur. Si la seule donnée disponible est un mandatement, l’appeler « dépense mandatée », pas « payée ». Enregistrer annulations, remboursements et régularisations avec leur signe et leur exercice.

La Région verse 100 000 € à un EPLE qui achète pour 80 000 € : les deux flux ne représentent pas 180 000 € de services consommés. Dans une consolidation des dépenses finales, retenir l’achat exécuté et éliminer le transfert interne. Le reliquat n’est pas une dépense finale de l’année. Cet exemple est pédagogique et fictif.

Pour une opération confiée à un mandataire, ne pas additionner avances régionales et paiements aux entreprises ; utiliser les dépenses finales justifiées ou présenter les avances comme telles. Pour les marchés multi-lycées, demander les bons de commande ou ventilations. Un rapprochement textuel sur le nom du lycée ne suffit pas à répartir le montant.

### 5.2 Indicateurs

**A — Dépense annuelle exécutée documentée par élève.** Somme des dépenses finales de personnel et fonctionnement et des investissements exécutés, après élimination des transferts et des recouvrements, divisée par l’effectif de même périmètre. Afficher la base d’exécution : paiement ou mandatement. À défaut de données exhaustives, intitulé « dépenses documentées, couverture partielle » ; ne pas afficher « coût complet ».

**B — Coût annuel économique estimé.** Charges de fonctionnement/personnel en droits constatés, quote-part de fonctions support et consommation annuelle des actifs, sans réadditionner les acquisitions amorties. Les durées dépendent des actifs et des règles documentées, pas d’un forfait uniforme choisi pour améliorer la comparaison. Nécessite inventaire, date de mise en service, valeur, durée, composants et périmètre. Si les actifs anciens manquent, indicateur indisponible ou explicitement incomplet. Ne pas mélanger mécaniquement amortissements comptables, neutralisations et coûts économiques.

**C — Financement public net.** Vue séparée retraçant les contributions publiques consolidées, les autres recettes et les variations de trésorerie/fonds lorsqu’elles sont nécessaires au rapprochement. Ne pas déduire automatiquement les recettes des familles d’une dépense d’investissement pour annoncer un coût net : leurs périmètres et périodes doivent être compatibles. Ne pas compter les cofinancements UE/État/Région plusieurs fois.

Présenter pensions et charges patronales avec leur traitement explicite. La contribution employeur aux pensions peut être incluse dans le coût de personnel ; ne pas ajouter ensuite les pensions versées aux retraités comme si elles étaient une seconde dépense propre au lycée. Une vue hors contribution pensions peut être proposée en complément, jamais par substitution silencieuse.

### 5.3 Effectifs et années

Préférer un effectif moyen de l’année civile fourni par l’administration. À défaut, convention explicitement estimée :

```text
effectif_moyen_N = (8 × effectif_rentree_N_moins_1 + 4 × effectif_rentree_N) / 12
```

Cette approximation répartit janvier–août et septembre–décembre ; elle n’est pas une mesure des présences ni des mouvements en cours d’année. Si un des deux effectifs est absent, ne pas le remplacer par zéro ni recopier silencieusement l’autre. Pour ouvertures, fermetures et fusions en cours d’année, utiliser les dates et une ventilation documentée ou marquer le ratio non comparable.

Afficher séparément GT, professionnel, post-bac (BTS/CPGE/autres), apprentissage, collège et formation continue. Les coûts d’une cité scolaire ou d’un lycée avec prépa ne doivent pas être divisés uniquement par les lycéens pré-bac. Tant que les coûts ne sont pas ventilés, proposer une vue « établissement, tous apprenants couverts » avec dénominateur adéquat, ou bloquer le ratio pré-bac.

Pour chaque périmètre, utiliser un total source validé. Ne pas sommer total, filles, garçons et langues. Les sous-populations GT/PRO peuvent être réunies seulement après validation de leur disjonction et de leurs liens UAI. Une cellule masquée reste masquée ; ne pas la reconstituer par différence.

### 5.4 Répartition des coûts partagés

Ordre de préférence : affectation directe documentée → clé administrative fournie → estimation explicite. Exemples de clés possibles, à justifier poste par poste : temps de service pour personnel ; compteurs pour énergie ; surfaces et usage pour bâti ; repas/nuitées pour restauration/internat. Une clé élèves uniforme appliquée à tout est une hypothèse forte, pas une vérité comptable.

Conserver le coût non attribué dans un ensemble résiduel. Les parts allouées plus le reliquat doivent égaler le coût source. Les affectations d’un remplaçant multi-sites ne doivent pas dépasser le coût employeur total. Le salaire du titulaire absent et le coût du remplaçant sont tous deux des dépenses possibles ; ne pas supprimer le premier, et ne pas compter le second deux fois.

### 5.5 Agrégation territoriale et temporelle

```text
ratio_territoire_N = somme(couts_eligibles_N) / somme(effectifs_correspondants_N)
ratio_plusieurs_annees = somme(couts_eligibles_N_sur_periode) /
                        somme(effectifs_correspondants_N_sur_periode)
```

Pas de moyenne simple des ratios de lycées. Un lycée à 10 000 €/élève pour 100 élèves et un autre à 20 000 € pour 900 élèves donnent 19 000 €/élève, pas 15 000 €. Exemple fictif pour test.

Pour les communes/départements, agréger des périmètres homogènes et présenter nombre d’établissements et effectifs couverts sur le total attendu. Les établissements manquants ne valent pas zéro. Deux modes distincts : ensemble documenté de chaque année et panel constant comparable. Pour comparer deux territoires avec des lacunes, afficher le sous-ensemble et bloquer un classement global prétendument exhaustif.

À Paris, distinguer la commune Paris et les arrondissements comme niveau optionnel. Ne pas créer vingt communes à partir des libellés d’adresse. Utiliser les codes géographiques officiels et leur historique, pas uniquement les codes postaux.

Euros courants par défaut ; euros constants en option avec série de déflateur officielle, année de base et formule documentées. La série précise reste à sélectionner et valider avant implémentation de cette option. Ne pas comparer des euros de bases différentes. Pas d’extrapolation d’une année manquante.

### 5.6 Couverture et incertitude

Deux dimensions distinctes : état de la valeur (`observed`, `allocated`, `estimated`, `missing`, `suppressed`, `not_applicable`) et état du dossier (`partial`, `complete_declared_scope`, `not_comparable`). Une allocation issue d’un calcul administratif reste une allocation.

Ne pas annoncer « 80 % du coût couvert » sans connaître le coût total. On peut dire « 8 postes renseignés sur 10 » et « 85 % des effectifs du territoire couverts ». Afficher toujours les postes absents et les hypothèses. Les courbes interrompent la ligne lorsqu’une année manque. Les coûts élevés ne mesurent pas automatiquement un gaspillage : ateliers techniques, handicap, internat, petite taille, foncier et travaux peuvent expliquer des écarts.

## 6. Destinataires et stratégie de demande

Les demandes A, B (trois envois) et C ci-dessous sont les modèles des demandes initiales déjà envoyées ; elles ne sont plus des actions en attente. Les textes rectoraux envoyés précisent le nom de chaque académie.

Coordonnées issues des sources officielles S23–S27, vérifiées le 02/10/2026. Ne pas adresser la demande initiale à la CADA : elle intervient en cas de refus.

| Demande | À | Périmètre |
|---|---|---|
| A | `prada@iledefrance.fr` | Patrimoine, dépenses directes, dotations, agents régionaux, inventaires, conventions de cités scolaires. |
| B — Paris | `acces-aux-documents@ac-paris.fr` | Académie de Paris, département 75. |
| B — Créteil | `ce.sj@ac-creteil.fr` | Académie de Créteil, départements 77, 93, 94. |
| B — Versailles | `prada@ac-versailles.fr` | Académie de Versailles, départements 78, 91, 92, 95. |
| C | `daj.saisines-cada@education.gouv.fr` | PRADA du ministère, transmission DAF/DEPP et SIES si nécessaire. Comptes EPLE et référentiels nationaux. |
| D, seulement si nécessaire | Adresse officielle de chaque EPLE extraite de S01 et vérifiée | Comptes et pièces manquants, sur un échantillon ciblé. |

Fondement : droit de communication du CRPA, notamment L311-1. L311-9 prévoit l’envoi électronique sans frais lorsque le document est disponible sous cette forme. L311-7 permet la communication après occultation de mentions protégées. L311-2 prévoit la transmission à l’administration détentrice. L’administration n’est pas tenue de réaliser une étude nouvelle ; les extractions courantes restent pertinentes selon S21.

Demander des exports dans leur organisation existante. Les colonnes souhaitées sont un guide, pas l’exigence d’un schéma informatique spécialement développé. Accepter une livraison progressive et les données partielles, sans renoncer à documenter les omissions. Ne pas multiplier les demandes répétitives auprès de chaque lycée tant qu’une extraction centralisée est possible.

### Courriel A — Région Île-de-France

**À :** prada@iledefrance.fr  
**Objet :** Demande de communication de documents administratifs — dépenses des lycées publics, exercices 2020 à 2025

Bonjour,

Je souhaite recueillir des données sur les dépenses et les effectifs des lycées publics d’Île-de-France sur plusieurs années, afin de mieux comprendre les différents postes de coût par établissement.

Sur le fondement des articles L311-1 et L311-9 du Code des relations entre le public et l’administration, je souhaite obtenir, pour les exercices 2020 à 2025, les documents ou extractions existantes suivants concernant les lycées publics franciliens :

1. Les états des dépenses exécutées directement par la Région pour ces établissements, notamment travaux, entretien, énergie, équipements, numérique, restauration et prestations, avec les identifiants de lycée ou de site disponibles.
2. Les états des dotations et subventions notifiées et effectivement versées aux établissements, en distinguant fonctionnement, travaux, équipements et aides spécifiques.
3. Les états annuels de coût employeur des agents régionaux affectés aux lycées, y compris les remplacements, charges patronales et personnels temporaires, agrégés par établissement ou site.
4. Les tableaux de suivi des opérations immobilières et d’équipement : objet des travaux, référence d’opération et de marché, établissements concernés, montant programmé, engagements, mandatements et paiements annuels lorsqu’ils sont disponibles, dates et état d’avancement. Pour les opérations sous mandat, les états existants permettant de distinguer avances et dépenses finales justifiées.
5. Les inventaires et états d’amortissement des actifs concernés, ainsi que les conventions ou tableaux existants de répartition des charges des cités scolaires et sites partagés.

Je souhaite également recevoir les nomenclatures, tables de correspondance des identifiants régionaux avec les codes UAI, et notices déjà disponibles sur les périmètres et clés de répartition utilisés. Les documents existants distinguant les dépenses des services centraux affectables aux lycées seraient également utiles.

Une transmission électronique des fichiers dans leur format existant, de préférence CSV ou tableur lorsque disponible, conviendrait. Ma demande porte sur les documents détenus et les extractions réalisables par un traitement automatisé d’usage courant, sans création d’une étude ni reconstitution manuelle d’une comptabilité analytique.

Les fichiers peuvent être transmis séparément et progressivement, en commençant si nécessaire par 2023 à 2025. Je ne demande aucune donnée nominative concernant les agents ou les élèves ; les éventuelles mentions protégées peuvent être occultées conformément à l’article L311-7.

Si certains documents sont déjà publiés, pourriez-vous m’en indiquer les liens précis ? Pour ceux détenus par une autre administration, je vous remercie de lui transmettre la demande conformément à l’article L311-2 et de m’en informer.

Je vous remercie par avance de votre retour.

Bien cordialement,
Nicolas Mitchell

### Courriel B — à envoyer séparément aux trois rectorats

**À :** contact rectoral correspondant dans le tableau ci-dessus  
**Objet :** Demande de communication — masse salariale et moyens des lycées publics de votre académie, 2020–2025

Bonjour,

Je souhaite recueillir des données sur les dépenses et les effectifs des lycées publics d’Île-de-France sur plusieurs années, afin de mieux comprendre les différents postes de coût par établissement.

Sur le fondement des articles L311-1 et L311-9 du Code des relations entre le public et l’administration, je souhaite obtenir les documents ou extractions existantes suivants pour les lycées publics de votre académie, pour chacun des exercices 2020 à 2025 :

1. Les états de masse salariale par établissement issus de l’« Application nationale Masse Salariale des EPLE et établissements privés », ou de l’outil équivalent utilisé par vos services, accompagnés des notices disponibles. Un jeu issu de cette application est déjà publié par l’académie de Normandie : https://data.normandie.education.gouv.fr/explore/dataset/fr-en-normandie-masse-salariale-des-etablissements-scolaires/.
2. Les ventilations existantes du coût employeur par code UAI et catégorie de personnels : enseignement, direction, administration, éducation, surveillance, accompagnement du handicap, santé, social et orientation, avec distinction des montants constatés et estimés lorsqu’elle existe.
3. Les états ou exports existants des dépenses de remplacement, courtes ou longues durées, et des heures ou indemnités correspondantes, avec les identifiants des établissements bénéficiaires disponibles. Je souhaite pouvoir déterminer si ces sommes sont déjà incluses dans les états de masse salariale.
4. Les tableaux et notices existants relatifs aux personnels multi-affectés, aux remplaçants rattachés administrativement à un établissement et aux clés d’imputation, ainsi qu’au traitement des cotisations employeur et des pensions.
5. Les comptes financiers et états d’exécution des EPLE détenus par vos services, les tableaux existants de dépenses hors personnel directement financées par l’État et ceux de ventilation des moyens mutualisés.

Je recherche une information agrégée par établissement et année, sans identité, bulletin de paie, motif médical ou donnée individuelle sur les agents ou les élèves. Si certaines ventilations présentent un risque d’identification, un niveau d’agrégation compatible avec leur communication me convient.

Je sollicite les fichiers existants ou les extractions réalisables par un traitement automatisé d’usage courant, dans leur format électronique disponible, sans demander de calcul nouveau. Les fichiers peuvent être transmis séparément, en priorité pour 2023 à 2025 si cela facilite leur communication.

Si ces documents sont détenus par l’administration centrale ou un autre service, je vous remercie de lui transmettre la demande conformément à l’article L311-2 et de m’en informer. Pour les éléments déjà publiés, les liens précis conviendront.

Je vous remercie par avance de votre retour.

Bien cordialement,
Nicolas Mitchell

### Courriel C — ministère, pour les extractions centralisées et les effectifs

**À :** daj.saisines-cada@education.gouv.fr  
**Objet :** Demande de communication — comptes financiers et référentiels des lycées publics d’Île-de-France

Bonjour,

Je souhaite recueillir des données sur les dépenses et les effectifs des lycées publics d’Île-de-France sur plusieurs années, afin de mieux comprendre les différents postes de coût par établissement. Je sollicite votre aide pour orienter cette demande vers les services détenteurs, notamment la DAF et la DEPP.

En application des articles L311-1 et L311-9 du Code des relations entre le public et l’administration, je souhaite obtenir, pour les lycées publics sous tutelle de l’Éducation nationale situés dans les départements 75, 77, 78, 91, 92, 93, 94 et 95 :

1. Les extractions centralisées existantes des comptes financiers des EPLE pour les exercices 2020 à 2025 : balances, charges et produits, opérations d’investissement, services et budgets annexes, avec code UAI et exercice, au niveau de détail disponible.
2. Les nomenclatures et notices correspondantes, ainsi que les tables de passage existantes entre outils ou nomenclatures comptables, notamment lors des changements de système de gestion.
3. Les fichiers historiques disponibles reliant EPLE, UAI de sections, sites, cités scolaires et établissements de rattachement, avec les ouvertures, fermetures et fusions sur la période.
4. Les tableaux annuels d’effectifs par UAI pour les rentrées 2019 à 2025, distinguant second cycle général et technologique, voie professionnelle, BTS, CPGE et autres populations hébergées dans les établissements, ainsi que les effectifs moyens par année civile s’ils existent déjà.
5. Les documents méthodologiques et tables existantes de ventilation des coûts de personnel et de soutien par établissement, ainsi que les extractions franciliennes de l’application nationale de masse salariale si elles sont détenues centralement.

J’ai identifié les jeux ouverts d’effectifs GT et professionnels ; ma demande porte sur les compléments de périmètre, d’historique et de rapprochement nécessaires, sans reconstitution de petites cellules couvertes par le secret statistique. Les données nominatives ne sont pas demandées.

Les fichiers dans leur format existant, idéalement CSV ou tableur, peuvent être communiqués séparément et progressivement. Il ne s’agit pas de demander une étude nouvelle, mais des documents détenus ou des extractions réalisables par un traitement automatisé d’usage courant.

J’adresse parallèlement aux trois rectorats une demande portant sur les éléments locaux. Si les mêmes exports sont gérés centralement, une transmission unique et une coordination entre services conviendraient pleinement. Pour les documents détenus par une autre administration, je vous remercie d’assurer la transmission prévue à l’article L311-2 et de m’en informer.

Je vous remercie par avance de votre retour.

Bien cordialement,
Nicolas Mitchell

### Courriel D — EPLE, repli ciblé

**Objet :** Demande de communication — comptes financiers du lycée [nom, UAI], [années]

Bonjour,

Dans le cadre d’un projet citoyen de comparaison documentée des dépenses publiques par élève, je souhaite obtenir les comptes financiers approuvés de votre établissement pour [années], leurs annexes, les rapports de l’ordonnateur et de l’agent comptable qui les accompagnent, ainsi que les états d’exécution par service et compte déjà disponibles.

Cette demande est fondée sur les articles L311-1 et L311-9 du Code des relations entre le public et l’administration. Une transmission électronique des documents existants convient, après occultation des éventuelles mentions protégées. Je ne demande aucune donnée nominative ni la création d’un tableau nouveau.

Si votre établissement mutualise des dépenses avec d’autres structures, pourriez-vous joindre les conventions ou tableaux de répartition existants ?

Je vous remercie par avance de votre retour.

Bien cordialement,
Nicolas Mitchell

### Pièce technique facultative à joindre aux demandes

Ces champs sont souhaités seulement lorsqu’ils existent dans les fichiers ; ne pas imposer leur création : exercice, période, UAI, identifiant EPLE/site/opération/marché, compte et libellé, service, objet de dépense, financeur, payeur, bénéficiaire, montant, unité, HT/TTC, nature du montant, date d’engagement/mandatement/paiement, montant annulé, population couverte, règle de ventilation, document source. Pour paie : catégorie, coût employeur, cotisations/pensions incluses ou non, ETPT/JETP et part remplacement si disponible. Pour actifs : coût historique, date de mise en service, durée d’amortissement, composant, valeur nette. Pour recettes : origine et nature pour distinguer fonds publics et participations privées.

### Suivi et recours

Créer un registre avec : destinataire, version exacte de la demande, date d’envoi, preuve de réception par l’administration compétente, périmètre, réponse, fichiers reçus, occultations, motifs de refus, date de refus et échéance de recours.

Le silence pendant un mois à compter de la réception par l’administration compétente vaut en principe refus. La saisine de la CADA se fait en principe dans les deux mois suivant le refus exprès ou tacite ; conserver les preuves et ne pas supposer qu’une relance suspend ce délai. Les conditions d’opposabilité peuvent varier selon les mentions de l’accusé de réception ou de la décision. [S20, S22]

**Relance courte :**

Bonjour,

Je reviens vers vous concernant ma demande de communication du [date], reçue le [date], relative à [objet]. Pourriez-vous m’indiquer la suite qui lui est donnée et me transmettre les documents déjà disponibles ? Une communication progressive conviendrait.

Je vous remercie par avance de votre retour.

Bien cordialement,
Nicolas Mitchell

**Trame de saisine CADA, à compléter uniquement après refus :**

Bonjour,

Je sollicite l’avis de la Commission sur le refus [exprès du … / tacite intervenu le …] opposé par [administration] à ma demande du [date], reçue le [date], portant sur les documents suivants : [liste précise des seuls documents demandés et non communiqués].

Vous trouverez en pièces jointes la demande initiale, sa preuve de réception et [la réponse de refus / les échanges disponibles]. Ma demande vise des documents existants ou des extractions d’usage courant, sous réserve d’occultation des mentions protégées.

Mes coordonnées sont : Nicolas Mitchell, [adresse postale complète], [courriel].

Je vous remercie de l’examen de ma demande.

Bien cordialement,
Nicolas Mitchell

## 7. Produit : ce que le site doit permettre

### Parcours public

Accueil avec recherche de deux lycées, deux communes ou deux départements ; choix de l’année/période, du périmètre de population et de l’indicateur. Titre neutre, absence de classement implicite « bon/mauvais ». Pages indexables par UAI et codes géographiques stables.

Fiche lycée : identité et changements historiques, formations et effectifs, résumé annuel avec état de couverture, série historique, postes de dépense, sources, demandes encore en cours. Tableau département → commune → établissement, tri numérique par département et alphabétique par commune, filtres public/tutelle/type/périmètre.

Comparaison : montants en euros et euros/élève côte à côte, différence absolue et relative si comparable, effectifs, dépenses de personnel/fonctionnement/investissement, travaux exceptionnels, données manquantes. Si le coût de référence est nul ou absent, pas de pourcentage calculé. Interdire les comparaisons numériques de périmètres incompatibles ou les signaler sans produire de conclusion globale.

### Détail au clic

Le clic sur « travaux » ouvre les opérations : objet exact, lycée/site concerné, statut, années, montant programmé, dépenses annuelles et cumul, méthode de ventilation, référence du marché, page ou ligne source et date de consultation. Les différentes natures de montant sont affichées séparément.

Le clic sur tout poste donne les observations constitutives, leur qualité et les exclusions. Une dépense allouée montre montant source, clé et part affectée. Un zéro est distingué d’une absence de donnée.

Sources : fiche de chaque document, producteur, licence ou régime de réutilisation, URL d’origine, date de publication et de collecte, version/hash, page/table/ligne, périmètre, transformations. Pour un document reçu par courriel, conserver l’original en accès interne ; publier une version documentaire expurgée des coordonnées ou signatures personnelles non nécessaires et vérifier les restrictions éventuelles. Ne pas publier les données d’agents ni des cellules masquées.

Export des résultats en CSV/JSON avec unités, statut et provenance ; lien de comparaison partageable ; méthodologie lisible ; journal des corrections ; formulaire de signalement d’une erreur. Accessible sur mobile, tableaux navigables au clavier, aucune information portée uniquement par une couleur. Carte optionnelle après fiabilisation, pas indispensable au MVP.

### Publication progressive

Étape 1 : répertoire, effectifs, sources et disponibilité des données ; dotations identifiées comme financements prévisionnels/notifiés selon leur pièce.

Étape 2 : dépenses documentées comparables, après consolidation sur un panel contrôlé.

Étape 3 : extension francilienne, coûts complets selon un périmètre déclaré, puis coût économique si inventaire et allocations permettent un calcul défendable.

## 8. Modèle de données minimal

Les noms suivants sont une proposition de modèle, pas une description des schémas des administrations.

| Entité | Principaux champs / rôle |
|---|---|
| `establishments` | Identifiant interne, UAI, nom, statut, tutelle, nature, dates de validité, commune, département, coordonnées. |
| `entity_relations` | UAI section→lycée, EPLE→site, site→cité scolaire, parenté et dates ; rapprochements validés avec preuve. |
| `geographies` | Codes INSEE, département, commune, arrondissement optionnel, dates et changements. |
| `enrollments` | UAI, rentrée, période, population, effectif, total/détail, statut, source ; unicité par grain réel. |
| `sources` | Producteur, titre, URL, licence, dates, périmètre, historique de versions. |
| `source_versions` | Hash des octets, date de collecte, emplacement original, schéma, content-type, taille, restrictions. |
| `evidence` | Version source, page/table/ligne ou clé d’enregistrement, extrait minimal, validation. |
| `financial_observations` | Entité source, bénéficiaire, payeur, financeur, exercice, dates, poste, compte, service, valeur, devise, unité, HT/TTC, nature comptable, périmètre, qualité, preuve. |
| `operations` | Identifiant opération, objet, site, dates, statut, coûts programmés et références marchés ; les dépenses annuelles restent des observations liées. |
| `transfers` | Émetteur, bénéficiaire, flux source et rapprochement final, règle d’élimination, solde non consommé si connu. |
| `allocations` | Observation source, cible, fraction, clé, périmètre, période, méthode/version, statut ; reliquat explicite. |
| `assets` | Actif/composant, site, coût, mise en service, durée, amortissement/source, parts d’usage. |
| `coverage` | Entité×année×population×poste : observé/alloué/estimé/manquant/masqué/non applicable ; motifs. |
| `computed_metrics` | Version de calcul, entrées, numérateur, dénominateur, indicateur, territoire, prix, exclusions, qualité, reproductibilité. |
| `requests_log` | Demandes administratives et réponses, séparées des données publiques. |

Montants en décimal exact ou centimes entiers ; aucune arithmétique financière en flottants binaires. Effectifs moyens peuvent être décimaux. Conserver le signe et l’unité d’origine puis la conversion. UAI/code INSEE en texte. L’agrégat publié doit pouvoir être reconstruit depuis les observations et les règles versionnées.

Liaison plusieurs-à-plusieurs entre mesures et preuves. Une révision ne doit pas écraser l’ancien document ni l’ancien calcul. Ajouter `supersedes` et date d’effet. Détecter le double import du même fichier par hash et du même enregistrement par clé métier.

## 9. Instructions directement utilisables dans Codex

Copier le bloc suivant dans Codex et joindre ce dossier. Les sections précédentes sont normatives pour les calculs et les libellés de qualité.

```text
Tu développes « Le vrai coût par lycéen », un observatoire des dépenses publiques,
des moyens et des conditions d’étude des lycées franciliens pour Nicolas Mitchell.
Domaine choisi : levraicoutlyceen.fr. Applique en priorité la section
« Intention éditoriale et priorités de cette version » de ce dossier.
Lis intégralement le dossier joint avant de modifier le code.

Objectif : comparer deux lycées, communes ou départements, année par année,
avec effectifs, ventilation des frais, détail des travaux au clic et preuves
consultables. Période cible 2020–2025 ; effectifs des rentrées 2019–2025.

Le livrable doit être une application fonctionnelle et un pipeline reproductible,
pas une maquette remplie de faux coûts. Les données actuellement manquantes
doivent rester manquantes. Ne présente jamais une dotation, une autorisation
de programme ou un marché comme une dépense annuelle exécutée.

Commence par lire AGENTS.md et inspecter le dépôt existant. Réutilise sa stack
et ses conventions. Sans dépôt imposé, proposition simple : frontend TypeScript
avec rendu serveur, PostgreSQL et scripts Python d'ingestion/calcul ; éviter
les microservices et les infrastructures inutiles. Vérifie les versions et
API dans leur documentation officielle avant de choisir les dépendances.

Phase 1 — Données et preuve de faisabilité
- Crée un registre machine des sources S01–S28 à partir du dossier, sans inventer
  d'URL pour les pièces seulement mentionnées ou pour les réponses attendues.
- Télécharge et conserve les originaux accessibles, avec date, hash et licence.
- Interroge le schéma des API avant d'écrire les mappings. Les appels records
  S01/S02/S03 ont été testés ; pagination complète et exports restent à vérifier.
- Importe le référentiel et les effectifs IDF/public. Préserve les UAI historiques
  absents de l'annuaire actuel. Signale tous les rapprochements non résolus.
- Pour S06 et S07, extrais les annexes en conservant les coordonnées page/table.
  Vérifie visuellement les tables PDF et les totaux ; ne publie pas une extraction
  OCR non contrôlée. Vérifie statut d'adoption/notification avant de le libeller.
- Recherche les millésimes antérieurs officiels ; n'invente pas les absents.
- Importe S28 dans la vue décisions votées, avec UAI parfois absent, dédoublonnage
  des opérations et distinction des affectations/révisions. Ne pas l’utiliser comme paiement.
- Ne charge jamais les données normandes dans les coûts franciliens.
- Produis un rapport de couverture UAI × année × poste et une liste des blocages.

Phase 2 — Moteur de consolidation
- Implémente le modèle et les règles des sections 4, 5 et 8.
- Distingue paie, EPLE, Région, mandataires, financement et dépenses finales.
- Les remplacements inclus dans la paie ne sont pas une addition indépendante.
- Différencie budget, engagement, mandatement, paiement, charge, amortissement
  et transfert. N'autorise aucune somme mélangeant ces bases.
- Année civile, population et unité doivent être compatibles avant tout ratio.
- Ventile cités scolaires et post-bac uniquement selon des règles documentées.
- Aucun coût complet sans matrice de couverture, élimination des doubles comptes
  et validation du dénominateur. Aucun ratio si le dénominateur est nul/inconnu.
- Coût économique annualisé : fonctionnalité désactivée tant que les actifs
  et méthodes nécessaires sont indisponibles. Ne pas appliquer 30 ans à tout.
- Agrégats territoriaux = sommes des coûts / sommes des effectifs correspondants,
  jamais moyenne simple des ratios. Conserve les résiduels non attribués.

Phase 3 — Produit
- Prévois trois dimensions : annoncé/voté, exécuté et conditions d’étude.
  Applique les mêmes critères au 93 et aux autres départements, sans conclusion préétablie.
- Développe recherche, arborescence département/commune/lycée, fiche établissement,
  comparaison à deux, historique, sources, méthodologie et exports.
- Chaque chiffre doit ouvrir son détail de calcul et ses pièces justificatives.
- Le poste travaux ouvre des opérations et leurs dépenses par année, avec
  montants programmés séparés. Fournis des liens partageables et URLs stables.
- Les données de démonstration éventuelles sont explicitement synthétiques,
  dans un environnement distinct, jamais incluses dans les exports publics.
- Affiche les trous de couverture et bloque les conclusions de coût complet
  quand les données sont partielles. Prévoir un mode dotations clairement nommé.
- Prévoir import contrôlé des réponses CSV/XLSX/PDF, validation humaine des
  correspondances et journal de corrections. Pas d'écriture publique anonyme.
- Préserver l'accessibilité clavier, la lisibilité mobile et la traçabilité.

Phase 4 — Validation
- Exécute les tests métier de la section 10 et les tests utiles aux risques réels.
- Vérifie un échantillon diversifié : GT sans post-bac, lycée pro avec ateliers,
  lycée polyvalent, lycée avec CPGE/BTS, cité scolaire, site avec gros travaux,
  cas de fusion et personnels mutualisés. Les cas manquants restent bloqués.
- Recoupe les sommes avec les totaux officiels de même périmètre. Enregistre les
  écarts ; n'ajoute pas de ligne d'ajustement artificielle pour les faire disparaître.
- Livre code, migrations, commandes d'import/recalcul, journal de provenance,
  rapport de couverture, tests, captures de l'app et liste des limites résiduelles.
- Explique ce qui est opérationnel avec les seules données ouvertes et ce qui
  attend les demandes administratives. Ne t'arrête pas au plan : réalise les
  parties possibles et présente les blocages précis sur les autres.

N'envoie aucun courriel, n'achète aucun domaine et ne publie pas le site public
sans instruction correspondante de Nicolas. Les cinq demandes initiales ont déjà été envoyées le 2 octobre 2026.
Les modèles de repli et de recours restent des brouillons ; ne rien renvoyer. Un environnement local de développement est
attendu. Révise les coordonnées publiques avant un envoi ultérieur autorisé.
```

## 10. Tests d’acceptation métier

1. **Transfert interne** : Région→EPLE 100, achat final 80, autres flux nuls : dépense finale 80, financement 100, reliquat 20. Jamais 180.
2. **Remplacement** : paie totale 1 000 incluant remplacement 100 : total 1 000, détail « dont remplacement : 100 ». Si le remplacement de 100 est documenté hors total, total 1 100.
3. **Travaux** : AP de 10 M€, marché de 8 M€, paiements 1 M€ puis 2 M€ : vue paiement affiche 1 et 2, pas 10 ni 8 par an ; cumul 3.
4. **Amortissement** : actif fictif 100 000 €, durée documentée 10 ans, exercice complet : vue investissement 100 000 lors de l’acquisition ; vue économique 10 000 par année d’usage. Jamais 110 000 dans un même indicateur économique.
5. **Moyenne pondérée** : exemple 100 élèves à 10 000 et 900 à 20 000 → 19 000 €/élève.
6. **Période** : effectifs rentrée N−1=600 et N=900 → effectif moyen estimé 700. Si N−1 manque, pas de calcul automatique.
7. **Post-bac** : coût établissement incluant BTS mais dénominateur pré-bac seul → ratio bloqué tant que coût/élèves ne sont pas mis au même périmètre.
8. **Multi-sites** : une observation 100 ventilée 60/30 laisse 10 non attribués ; une allocation 60/50 est refusée.
9. **Manquants** : `null`, secret statistique, zéro observé et non applicable restent quatre états distincts. Pas de ligne continue sur l’année absente.
10. **Historique** : fusion de deux UAI ne produit pas trois établissements comptés la même année ; dates et correspondance contrôlées.
11. **Idempotence** : double import du même document ou même facture ne double pas les dépenses ; modification source crée une nouvelle version.
12. **Territoire incomplet** : coûts pour 3 lycées sur 5 → ratio du seul panel correspondant et mention 3/5, jamais coût total départemental.
13. **Unités** : 1,5 M€ HT ne devient ni 1,5 € ni 1,5 M€ TTC sans traitement justifié. Pas de taux TVA uniforme supposé.
14. **Sources** : chaque chiffre publié remonte à une preuve et une transformation ; l’export conserve identifiants et statuts.
15. **Engagement/paiement** : la même opération présente dans deux sources est reliée, pas additionnée.
16. **Mandataire** : avance régionale et paiement fournisseur correspondant ne sont jamais tous deux retenus comme dépense finale.
17. **Comparaison** : dénominateur nul, année incompatible ou poste manquant significatif → pas de différence globale présentée comme complète.
18. **Révisions et annulations** : avoir ou annulation diminue le bon périmètre de dépense, avec trace de la correction.

## 11. Points restant à résoudre avant publication du coût complet

- Réception et audit des masses salariales franciliennes, particulièrement remplacements, agents mutualisés et contributions pensions.
- Obtention des dépenses régionales exécutées et comptes EPLE, avec historique et correspondance des unités.
- Délimitation des coûts et effectifs post-bac, apprentissage, collège et formation continue ; conventions de cités scolaires.
- Identification des dépenses externalisées, directes et sous mandat ; élimination des transferts entre financeurs.
- Sélection de la base comptable comparable et explicitation de toute approximation.
- Choix de la vue publique principale : dépenses exécutées documentées, puis financement public net si les recettes le permettent ; coût économique uniquement dans un périmètre faisable.
- Registre des licences et vérification des documents reçus avant republication.
- Vérification du domaine demandé ; ne pas prétendre qu’il est réservé.

Le premier enjeu n’est pas le graphique : c’est la possibilité de justifier chaque montant et de dire exactement ce qu’il couvre. L’application peut avancer avant les réponses, mais la promesse de coût complet ne doit pas précéder les données qui la rendent démontrable.
