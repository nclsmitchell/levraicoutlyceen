variable "project_id" { type = string }
variable "region" {
  type    = string
  default = "europe-west1"
}
resource "google_project_service" "storage" {
  project            = var.project_id
  service            = "storage.googleapis.com"
  disable_on_destroy = false
}
resource "google_storage_bucket" "terraform_state" {
  name                        = "${var.project_id}-levraicout-tfstate"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = false
  versioning { enabled = true }
  lifecycle_rule {
    condition {
      days_since_noncurrent_time = 30
      num_newer_versions         = 3
      with_state                 = "ARCHIVED"
    }
    action { type = "Delete" }
  }
  lifecycle { prevent_destroy = true }
  labels     = { app = "levraicoutlyceen", managed_by = "terraform" }
  depends_on = [google_project_service.storage]
}
output "state_bucket" { value = google_storage_bucket.terraform_state.name }
