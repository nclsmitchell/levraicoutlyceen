locals {
  labels = { app = "levraicoutlyceen", managed_by = "terraform" }
}
resource "google_project_service" "required" {
  for_each           = toset(["run.googleapis.com", "artifactregistry.googleapis.com", "iam.googleapis.com"])
  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}
resource "google_artifact_registry_repository" "app" {
  location               = var.region
  repository_id          = var.service_name
  description            = "Reviewed Le vrai coût par lycéen container releases"
  format                 = "DOCKER"
  labels                 = local.labels
  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "delete-old-releases"
    action = "DELETE"
    condition {
      tag_state  = "ANY"
      older_than = "2592000s"
    }
  }
  cleanup_policies {
    id     = "keep-latest-three"
    action = "KEEP"
    most_recent_versions { keep_count = 3 }
  }
  depends_on = [google_project_service.required]
}
resource "google_service_account" "app" {
  account_id   = "${var.service_name}-run"
  display_name = "Le vrai coût par lycéen, read-only serving"
  description  = "No GCP data-access role or service-account key; data is embedded in the image."
  depends_on   = [google_project_service.required]
}
resource "google_cloud_run_v2_service" "app" {
  count                = var.container_image == null ? 0 : 1
  name                 = var.service_name
  location             = var.region
  ingress              = "INGRESS_TRAFFIC_ALL"
  deletion_protection  = false
  invoker_iam_disabled = true
  labels               = local.labels
  scaling {
    scaling_mode       = "AUTOMATIC"
    min_instance_count = 0
    max_instance_count = var.max_instances
  }
  template {
    service_account                  = google_service_account.app.email
    execution_environment            = "EXECUTION_ENVIRONMENT_GEN2"
    max_instance_request_concurrency = var.concurrency
    timeout                          = "60s"
    scaling {
      min_instance_count = 0
      max_instance_count = var.max_instances
    }
    containers {
      image = var.container_image
      ports { container_port = 8080 }
      resources {
        limits            = { cpu = "1", memory = "512Mi" }
        cpu_idle          = true
        startup_cpu_boost = false
      }
      env {
        name  = "DATA_BACKEND"
        value = "snapshot"
      }
      env {
        name  = "DATA_SNAPSHOT_IMMUTABLE"
        value = "true"
      }
      env {
        name  = "DEPLOYMENT_ENV"
        value = "cloudrun"
      }
      env {
        name  = "SITE_DOMAIN"
        value = var.site_domain
      }
      startup_probe {
        tcp_socket { port = 8080 }
        period_seconds    = 2
        timeout_seconds   = 1
        failure_threshold = 30
      }
    }
  }
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
  depends_on = [google_project_service.required, google_artifact_registry_repository.app]
}
