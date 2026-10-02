variable "project_id" {
  type        = string
  description = "Existing billed GCP project. No project or billing account is created."
}
variable "region" {
  type    = string
  default = "europe-west1"
}
variable "service_name" {
  type    = string
  default = "levraicoutlyceen"
}
variable "site_domain" {
  type    = string
  default = "levraicoutlyceen.fr"
}
variable "container_image" {
  type        = string
  default     = null
  nullable    = true
  description = "Immutable registry URL ending in @sha256:...; null prepares infra before image push."
  validation {
    condition     = var.container_image == null ? true : can(regex("@sha256:[a-f0-9]{64}$", var.container_image))
    error_message = "Deploy an image pinned to its SHA-256 digest, never a mutable tag."
  }
}
variable "max_instances" {
  type    = number
  default = 1
  validation {
    condition     = var.max_instances >= 1 && var.max_instances <= 10 && floor(var.max_instances) == var.max_instances
    error_message = "Choose 1–10 instances; default 1 minimizes capacity cost."
  }
}
variable "concurrency" {
  type    = number
  default = 8
  validation {
    condition     = var.concurrency >= 1 && var.concurrency <= 80 && floor(var.concurrency) == var.concurrency
    error_message = "Concurrency must be an integer between 1 and 80."
  }
}
