# Déploiement Cloud Run à coût réduit

Projet choisi : `levraicoutlyceen`. Région : `europe-west1` (Belgique, données en Europe). Toutes les ressources créées pour cette application sont gérées par Terraform : bucket privé d’état versionné, dépôt d’images, identité d’exécution dédiée et service Cloud Run. Aucun domaine, DNS, load balancer, connecteur VPC ou ordonnanceur n’est créé.

URL publiée : <https://levraicoutlyceen-fe6jzy2diq-ew.a.run.app>. La configuration de livraison est conservée dans `cloud-deployment.json`, les contrôles HTTPS dans `cloud-integrity.json` et `cloud-ui-validation.json`, avec les captures dans `screenshots-cloud/`.

## Choix de stockage

La consultation du site est entièrement en lecture. L’image contient le calcul validé, les rapports publics et les 38 archives vérifiées par empreinte, avec les versions documentaires disponibles. PostgreSQL et ses migrations restent disponibles pour l’ingestion et les contrôles locaux. Le service hébergé lit le même instantané public ; aucune fonctionnalité publique existante ne nécessite une base distante.

Une base Cloud SQL permanente introduirait un coût indépendant de la mise à zéro des instances web. PostgreSQL dans le système de fichiers éphémère de Cloud Run ne conserverait pas les écritures. Cette version utilise donc `DATA_BACKEND=snapshot`, sans base distante. Les futures réponses sont vérifiées et expurgées localement, recalculées, puis intégrées à une nouvelle image immuable. Aucun import anonyme ou fichier privé n’est publié.

## Réglages de coûts

- Minimum **0**, maximum **1** instance, limites au niveau du service et de la révision.
- CPU alloué aux requêtes (`cpu_idle=true`), 1 vCPU, 512 Mio, concurrence 8 ; pas de CPU boost au démarrage.
- Données immuables chargées une fois par instance, ce qui évite de parser à chaque requête les 9,5 Mo de l’instantané.
- Construction Docker locale : aucun Cloud Build ou job d’ingestion périodique facturé.
- Dépôt d’images privé : les trois dernières images sont conservées, les autres versions de plus de 30 jours sont nettoyées.
- Identité d’exécution sans clé et sans permission d’accès aux données GCP. Le conteneur utilise un utilisateur non administrateur.
- Bucket d’état privé, versionné, avec expiration des anciennes versions après 30 jours et conservation de trois versions plus récentes. Aucun secret de base ni clé de service dans Terraform.

L’arrêt à zéro n’est pas instantané après la dernière requête. Un démarrage à froid peut ajouter de la latence. Le maximum d’instances limite la capacité, pas la facture totale : requêtes, trafic sortant, stockage d’images et d’état restent potentiellement facturés. Aucun engagement de gratuité n’est annoncé. Les contrôles de santé externes périodiques sont à éviter si l’objectif est de laisser le site inactif.

## Reproduire

Prérequis : Terraform ≥ 1.6, Google Cloud CLI, Docker avec construction Linux AMD64, Node.js. Le projet doit exister, sa facturation être activée et le compte utilisé doit pouvoir créer les ressources et activer les API. Les authentifications restent locales :

```sh
gcloud auth login
gcloud auth application-default login
bash scripts/deploy-cloud.sh levraicoutlyceen
```

Le script prépare les données publiques, crée et migre l’état Terraform vers GCS, prépare le dépôt, construit puis contrôle l’image avec 512 Mio et huit exports simultanés. Il vérifie les empreintes des documents téléchargeables avant de pousser l’image et de déployer **son empreinte exacte**, jamais un tag modifiable. La compilation utilise le processeur natif du poste ; les dépendances d’exécution et le conteneur final ciblent Linux AMD64, y compris depuis un Mac Apple Silicon. Les plans enregistrés sont visibles avant chaque application. Les fichiers d’état, de plan et d’authentification sont exclus de Git et du contexte Docker.

Le premier déploiement n’utilise pas d’image de démonstration. Les relances conservent l’image précédente pendant la préparation, puis basculent sur la nouvelle image validée. Ne pas changer de projet dans un état existant ; utiliser un autre dossier d’état pour une autre infrastructure.

Après une nouvelle collecte et ses validations :

```sh
npm run recalculate
npm test
bash scripts/deploy-cloud.sh levraicoutlyceen
```

La source de vérité reste le dépôt et ses documents versionnés. Le nettoyage des anciennes images n’efface pas les fichiers source conservés localement. L’URL HTTPS `run.app` est imprimée par Terraform. `SITE_DOMAIN` conserve `levraicoutlyceen.fr` sans créer de liaison DNS. L’indexation reste désactivée comme dans la première version ; elle pourra être activée avec la configuration du domaine.

## Vérifier et modifier

```sh
terraform -chdir=infra output cost_controls
terraform -chdir=infra output -raw service_url
gcloud run services describe levraicoutlyceen --project=levraicoutlyceen --region=europe-west1
```

Les variables `max_instances` et `concurrency` sont modifiables dans Terraform. Pour retirer uniquement le service en conservant l’infrastructure et les archives : mettre `container_image=null` dans `infra/terraform.auto.tfvars.json`, examiner `terraform -chdir=infra plan` puis appliquer le plan. Le bucket d’état possède une protection contre la destruction.

Pour refaire les contrôles en ligne (contrôles ponctuels, sans surveillance permanente) :

```sh
APP_URL=https://levraicoutlyceen-fe6jzy2diq-ew.a.run.app CLOUD_REPORT=docs/cloud-integrity.json node scripts/check-cloud.mjs
APP_URL=https://levraicoutlyceen-fe6jzy2diq-ew.a.run.app UI_REPORT=docs/cloud-ui-validation.json SCREENSHOT_DIR=docs/screenshots-cloud npm run test:ui
```

Les essais d’interface demandent le navigateur Playwright local : `npx playwright install chromium` si nécessaire. Pour les commandes Terraform avec plan, conserver `TF_VAR_project_id=levraicoutlyceen` dans l’environnement ; le script de déploiement le fait automatiquement. Les sorties d’état ne demandent pas de variable supplémentaire.

Documentation officielle vérifiée le 2 octobre 2026 : [CPU et facturation par requête](https://docs.cloud.google.com/run/docs/configuring/services/cpu), [instances minimales](https://docs.cloud.google.com/run/docs/configuring/min-instances), [contrat des conteneurs](https://docs.cloud.google.com/run/docs/container-contract), [tarification Cloud Run](https://cloud.google.com/run/pricing), [nettoyage des images](https://docs.cloud.google.com/artifact-registry/docs/repositories/cleanup-policy), [fournisseur Terraform Google 8.4.0](https://registry.terraform.io/providers/hashicorp/google/8.4.0/docs/resources/cloud_run_v2_service), [Next.js autonome](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).
