# Le vrai coût par lycéen

Application pour Nicolas Mitchell, utilisable localement et sur Cloud Run : « Dépenses publiques, moyens et conditions d’étude, lycée par lycée ». Question directrice : davantage de moyens annoncés se traduit-il par de meilleures conditions d’étude ? Les mêmes règles s’appliquent aux huit départements d’Île-de-France.

La première tranche fonctionne avec des données officielles : annuaire → fiche lycée → comparaison → preuve → document conservé. Aucun compte n’est nécessaire. Aucun montant fictif ne figure dans l’application ou ses exports.

Site déployé : <https://levraicoutlyceen-fe6jzy2diq-ew.a.run.app>. Le déploiement GCP demandé est décrit dans [docs/deploiement-gcp.md](docs/deploiement-gcp.md) : Terraform, Cloud Run pouvant revenir à zéro et données publiques embarquées, sans base distante permanente.

Les sélecteurs recherchables, les graphiques de comparaison et les contrôles de parcours sont décrits dans [docs/ux.md](docs/ux.md). `npm run test:ux` vérifie le clavier, les filtres dépendants, le partage et la fidélité des graphiques aux données et aux exports.

Le sélecteur de thème dans l’en-tête propose Clair, Sombre et Système. Le choix est conservé dans le navigateur ; Système suit les réglages de l’appareil. `npm run test:theme` contrôle la persistance, les changements système, la synchronisation entre onglets, les graphiques et les listes ouvertes. `UI_THEME=dark npm run test:ui` vérifie les pages en sombre ; `UI_REPORT` et `SCREENSHOT_DIR` permettent de conserver des rapports et captures séparés.

## Lancer l’application

Prérequis : Node.js 24 LTS conseillé (minimum Next.js : 20.9), Python 3.12 et Docker Compose pour PostgreSQL. Les versions exactes de l’application sont verrouillées dans `package-lock.json` ; utiliser `npm ci`.

```sh
npm ci
cp .env.example .env.local
docker compose up -d
npm run db:migrate
npm run db:load
npm run dev
```

Ouvrir <http://127.0.0.1:3000>. Les fichiers source et le calcul de cette collecte sont livrés : aucune collecte réseau n’est nécessaire pour consulter cette version. Ces commandes lancent le serveur et PostgreSQL sur l’adresse locale. Le déploiement distant utilise la commande distincte documentée plus haut.

`DATA_BACKEND=snapshot` lit `data/derived/current.json`. Pour utiliser la base chargée, définir `DATA_BACKEND=postgres` dans `.env.local` puis redémarrer l’application. Les scripts de base lisent eux aussi `.env.local`. Le mot de passe fourni concerne uniquement la base de développement locale. Pour arrêter la base sans effacer les données : `docker compose stop`.

Pour contrôler le fonctionnement après compilation :

```sh
npm run build
npm start
```

Arrêter auparavant le serveur de développement qui occupe le même port. Webpack est sélectionné explicitement : il fonctionne dans cet environnement local, où les ports temporaires de Turbopack étaient bloqués.

Le domaine est centralisé dans `lib/config.ts`, via `SITE_DOMAIN=levraicoutlyceen.fr`. Son activation et ses DNS ne sont pas confirmés. Ces commandes n’achètent aucun domaine et ne modifient aucun DNS.

## Collecter et recalculer

L’ingestion du référentiel, des effectifs et des décisions régionales n’utilise que la bibliothèque standard Python. Pour les PDF et XLSX :

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-ingest.txt
```

Les schémas sont collectés avant les exports. Un export intégral est comparé au nombre de lignes annoncé par l’API ; un décalage arrête la collecte. Les fichiers sont conservés sous leur empreinte SHA-256, sans écrasement.

```sh
npm run import
npm run inspect:sources
npm run import:pdf
npm run recalculate
npm run db:load
```

`import` collecte les quatre jeux prioritaires et recalcule. `inspect:sources` inspecte les sources complémentaires, importe intégralement les opérations de travaux anciennes et conserve les rapports PDF officiels retrouvés. MEF, CPGE, IPS, hébergement, marchés et masse salariale normande restent des inspections de schéma/échantillon. Les montants normands ne sont jamais utilisés. Le document 2021 conservé est le rapport complémentaire CP2021-034, pas le rapport annuel complet.

`import:pdf` n’accepte que les empreintes et pages contrôlées dans `docs/pdf-review.json`. Toute nouvelle version de ces PDF bloque l’extraction jusqu’à vérification visuelle et mise à jour du mapping. Les rapports 2020–2024 restent archivés sans montants publiés. Les annexes DGFL, internat et CEO/CTO de 2025–2026 sont contrôlées. Les délibérations adoptées correspondantes ont été retrouvées et archivées ; le rapprochement ligne par ligne avec leurs annexes et notifications n’est pas terminé. Les montants extraits restent **proposés dans un rapport**. `data/budget-status.json` conserve cette distinction.

Pour recalculer entièrement sans réseau : `npm run recalculate`. À entrées et règles identiques, le calcul est identique. Chaque changement crée `data/derived/<empreinte>.json` ; `current.json` désigne la version consultée. Recharger la base après tout recalcul en mode PostgreSQL. Le serveur lit la version à chaque requête.

## Données et provenance livrées

- `data/catalog.json` : producteurs, URL et requêtes, collecte, publication si connue, régime de réutilisation, empreintes, schémas et contrôles de décompte.
- `data/raw/` : octets conservés, y compris les réponses compressées originales et les PDF.
- `data/collection-log.jsonl` : journal des relances de collecte ; la collecte initiale est décrite dans le catalogue.
- `data/pdf-reviewed.json` et `data/reports/pdf-controls.json` : lignes extraites, page, tableau, colonne, cellules brutes et rapprochements de totaux.
- `data/derived/` : observations normalisées, preuves et versions de calcul.
- `data/reports/coverage.{json,csv}` : disponibilité par UAI, année, population et poste.
- `data/reports/matches.{json,csv}`, `residual.{json,csv}`, `quarantine.{json,csv}` et `pdf-unmatched.json` : rapprochements exacts, résiduel et anomalies conservées.
- `docs/screenshots/` : huit captures sur ordinateur et mobile.
- `docs/livraison.md` et `docs/ui-validation.json` : résultats de validation et limites restantes.

Chaque nombre de la fiche ouvre sa preuve. Les observations financières ouvrent leurs unités, nature comptable, statut, périmètre et source. Les exports CSV/JSON de la fiche ou du comparateur conservent les entrées et la provenance. Les CSV neutralisent les cellules pouvant être interprétées comme des formules.

## Modèle et règles

Une application Next.js/TypeScript/Tailwind, une base PostgreSQL 18 et des scripts Python. Les migrations sont transactionnelles et relançables. Le schéma comprend les établissements, leurs versions et relations datées, géographies, effectifs, preuves et sources, observations financières, opérations et jalons, transferts, allocations et reliquats, actifs/amortissements, conditions, couverture, calculs, demandes et futures déclarations publiques.

Les observations et sources sont immuables. Pour interroger une version normalisée, joindre `snapshot_observations` à la révision de `app_snapshots` ; ne pas sommer toutes les versions historiques de la base. La couverture porte également sa révision. `establishment_versions` conserve les identités successives ; la table `establishments` contient l’identité de première insertion. Les relations de l’annuaire sont observées aujourd’hui, leur validité passée reste inconnue.

Les effectifs GT et PRO restent séparés. Les sections ne comptent pas comme lycées autonomes ; aucun rattachement actuel n’est rétroactivement appliqué. Les comparaisons territoriales utilisent les UAI autonomes actuels et affichent les exclusions, les preuves et le panel constant optionnel. Elles ne prétendent pas restituer un périmètre historique complet. Le champ PRO change en 2025. Les cellules supprimées restent supprimées, sans reconstitution par différence.

Le moteur `scripts/domain.py` prépare les consolidations prudentes, allocations, moyennes conventionnelles et ratios pondérés. Aucun ratio financier n’est activé dans cette collecte : dépenses finales, éliminations internes et populations compatibles ne sont pas documentées. Les dotations, affectations, marchés, mandats, paiements, charges et amortissements restent distincts. Aucun taux de « coût couvert » sans total connu. Le coût économique reste désactivé sans actifs et durées d’amortissement défendables. L’IPS n’ajuste aucun coût ; la rupture de 2022 est expliquée.

## Intégrer une future réponse administrative

Les cinq demandes ont déjà été envoyées le **2 octobre 2026** à la Région, aux trois rectorats et au ministère. Aucun renvoi n’est prévu et aucune réponse n’a été intégrée. L’import est uniquement local, sans formulaire public.

1. Copier et compléter `docs/response-metadata.example.json`, puis conserver la pièce originale en espace privé :

   ```sh
   python3 scripts/admin_import.py stage /chemin/reponse.csv --metadata /chemin/metadata.json
   ```

   CSV, XLSX et PDF sont acceptés. Le dossier imprimé est `data/private/<sha>/`. Il est ignoré par Git et inaccessible aux routes de téléchargement. Il peut contenir des signatures et coordonnées : ne pas le déplacer sous `data/raw/`.

2. Vérifier humainement les colonnes, UAI, exercice, population, nature comptable, unité, HT/TTC et poste. Compléter `response-mapping.example.json`. Obtenir son empreinte canonique :

   ```sh
   python3 scripts/admin_import.py mapping-hash /chemin/mapping.json
   ```

   Compléter `response-approval.example.json` avec cette empreinte, celle de l’original, le nom du vérificateur et la date. Les exemples ne constituent jamais une approbation.

3. Valider et examiner le résultat et les lignes rejetées :

   ```sh
   python3 scripts/admin_import.py validate data/private/SHA/bundle.json --mapping /chemin/mapping.json --approval /chemin/approval.json
   ```

   Pour un PDF, ajouter `--reviewed-rows /chemin/lignes-verifiees.json`, après contrôle visuel. Chaque ligne doit comporter page, tableau et colonne. L’approbation doit aussi inclure `visual_review_verified: true` et `reviewed_rows_sha256`. Les ambiguïtés restent en quarantaine.

4. Vérifier la version expurgée et le régime de réutilisation. Compléter `response-publication-approval.example.json` avec le SHA-256 exact de `validated.json` et les confirmations de vérification. Ensuite seulement :

   ```sh
   python3 scripts/promote_response.py data/private/SHA/validated.json --approval /chemin/publication-approval.json
   npm run recalculate
   npm run db:load
   ```

   Seules les colonnes publiques autorisées passent dans le catalogue. La pièce originale, les coordonnées et les signatures restent privées. Cette promotion rend l’extrait consultable **localement** ; elle ne déploie rien. Chaque ratio reste bloqué avant validation de la consolidation et de la population. L’ingestion des diagnostics et des heures de cours agrégées nécessitera un mapping spécifique aux tables de conditions ; le schéma est prêt, le connecteur de cette première version porte sur les observations financières.

## Vérifier

```sh
npm run typecheck
npm test
npm run format:check
npm run build
npm run db:load
npm run test:db
npx playwright install chromium
npm run test:ui
```

L’application doit être lancée pour `test:ui` ; `APP_URL` permet de changer le port. Le contrôle inclut parcours de recherche et preuve, comparaisons partageables, téléchargements, exports, navigation clavier, axe WCAG 2 A/AA et 2.1 AA, absence de débordement mobile et échantillon GT/PRO/polyvalent/post-bac/cité scolaire/travaux. Les captures sont régénérées. Ces vérifications automatisées ne constituent pas un audit RGAA complet.

Les données synthétiques sont cantonnées aux tests Python et à une transaction de test PostgreSQL annulée. Aucun jeu de démonstration n’est exposé.

## Compatibilité vérifiée

Consultation des documentations officielles le 2 octobre 2026 : [Next.js, installation et prérequis](https://nextjs.org/docs/app/getting-started/installation), [Next.js, variables d’environnement](https://nextjs.org/docs/app/guides/environment-variables), [Tailwind CSS avec PostCSS](https://tailwindcss.com/docs/installation/using-postcss), [PostgreSQL 18](https://www.postgresql.org/docs/18/release-18.html). Les conventions Next.js embarquées sous `node_modules/next/dist/docs/` ont également été utilisées. Le fichier documentaire fourni par Nicolas reste intact.
