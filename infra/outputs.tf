output "repository_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}/app"
}
output "service_url" {
  value = var.container_image == null ? null : google_cloud_run_v2_service.app[0].uri
}
output "runtime_service_account" { value = google_service_account.app.email }
output "cost_controls" {
  value = { min_instances = 0, max_instances = var.max_instances, cpu = 1, memory = "512Mi", concurrency = var.concurrency, cpu_idle = true, startup_cpu_boost = false, database = "immutable_public_snapshot" }
}
