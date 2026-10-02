#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
deployment_project="${1:-levraicoutlyceen}"
deployment_region="${REGION:-europe-west1}"
export TF_VAR_project_id="$deployment_project"
export TF_VAR_region="$deployment_region"
export TF_IN_AUTOMATION=true
deployment_bucket="${deployment_project}-levraicout-tfstate"
deployment_service="levraicoutlyceen"
deployment_repository="${deployment_region}-docker.pkg.dev/${deployment_project}/${deployment_service}/app"
deployment_container=""
deployment_docker_config=""
cleanup() {
  if [[ -n "$deployment_container" ]]; then docker rm -f "$deployment_container" >/dev/null 2>&1 || true; fi
  if [[ -n "$deployment_docker_config" ]]; then rm -rf "$deployment_docker_config"; fi
}
trap cleanup EXIT

for executable in terraform gcloud docker node; do command -v "$executable" >/dev/null; done
gcloud projects describe "$deployment_project" --format='value(projectId)'
if [[ "$(gcloud billing projects describe "$deployment_project" --format='value(billingEnabled)')" != "True" ]]; then
  echo "Billing must already be enabled for the selected project." >&2
  exit 1
fi
gcloud auth application-default print-access-token >/dev/null
node scripts/prepare-cloud-data.mjs
deployment_revision="$(node -e 'process.stdout.write(require("./data/derived/current.json").revision.slice(0,16))')"
deployment_tag="release-${deployment_revision}-$(date -u +%Y%m%d%H%M%S)"

# One-time state-bucket bootstrap. Move even the bootstrap state into private GCS.
if [[ ! -f infra/bootstrap/backend.tf ]]; then
  terraform -chdir=infra/bootstrap init -input=false
  terraform -chdir=infra/bootstrap plan -out=bootstrap.tfplan -input=false
  terraform -chdir=infra/bootstrap apply -input=false bootstrap.tfplan
  cp infra/bootstrap/backend.tf.example infra/bootstrap/backend.tf
  terraform -chdir=infra/bootstrap init -force-copy -input=false \
    -backend-config="bucket=$deployment_bucket" -backend-config="prefix=bootstrap"
else
  terraform -chdir=infra/bootstrap init -input=false \
    -backend-config="bucket=$deployment_bucket" -backend-config="prefix=bootstrap"
fi
terraform -chdir=infra init -input=false \
  -backend-config="bucket=$deployment_bucket" -backend-config="prefix=app"
# An existing state must belong to the explicitly selected project.
deployment_previous_repository="$(terraform -chdir=infra output -json | node -e 'let input=""; process.stdin.on("data", x => input += x); process.stdin.on("end", () => process.stdout.write(JSON.parse(input).repository_url?.value || ""))')"
if [[ -n "$deployment_previous_repository" && "$deployment_previous_repository" != "$deployment_repository" ]]; then
  echo "Existing Terraform state belongs to another project/region. Use a separate state." >&2
  exit 1
fi

# First deployment prepares the registry without deploying a placeholder site.
# Later releases retain the previous digest during this infrastructure pass.
terraform -chdir=infra plan -out=infrastructure.tfplan -input=false
terraform -chdir=infra apply -input=false infrastructure.tfplan

docker build --platform linux/amd64 --tag "$deployment_repository:$deployment_tag" .
# Verify the actual runtime image with Cloud Run's limits before publishing it.
deployment_container="levraicout-release-$$"
docker run --detach --platform linux/amd64 --name "$deployment_container" \
  --memory 512m --cpus 1 --publish 127.0.0.1::8080 \
  --env SITE_DOMAIN=levraicoutlyceen.fr "$deployment_repository:$deployment_tag" >/dev/null
deployment_local_url="http://$(docker port "$deployment_container" 8080/tcp)"
APP_URL="$deployment_local_url" node --input-type=module -e '
  let ready = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    try { if ((await fetch(process.env.APP_URL)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("Container did not become ready");
'
APP_URL="$deployment_local_url" node scripts/check-cloud.mjs
docker rm -f "$deployment_container" >/dev/null
deployment_container=""
# Use a temporary Docker config. Existing registry authentication is untouched.
deployment_docker_config="$(mktemp -d)"
deployment_docker_host="${DOCKER_HOST:-$(docker context inspect --format '{{.Endpoints.docker.Host}}')}"
gcloud auth print-access-token | docker --config "$deployment_docker_config" login \
  -u oauth2accesstoken --password-stdin "${deployment_region}-docker.pkg.dev" >/dev/null
DOCKER_HOST="$deployment_docker_host" docker --config "$deployment_docker_config" push "$deployment_repository:$deployment_tag"
deployment_digest="$(gcloud artifacts docker images describe "$deployment_repository:$deployment_tag" \
  --project="$deployment_project" --format='value(image_summary.digest)')"
[[ "$deployment_digest" =~ ^sha256:[a-f0-9]{64}$ ]]
export DEPLOYMENT_IMAGE="$deployment_repository@$deployment_digest"
node -e 'require("fs").writeFileSync("infra/terraform.auto.tfvars.json", JSON.stringify({container_image:process.env.DEPLOYMENT_IMAGE},null,2))'
terraform -chdir=infra plan -out=release.tfplan -input=false
terraform -chdir=infra apply -input=false release.tfplan
terraform -chdir=infra output -raw service_url
