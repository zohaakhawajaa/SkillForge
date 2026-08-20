variable "aws_region" {
  description = "AWS region for container image repositories."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Prefix used for SkillForge infrastructure resources."
  type        = string
  default     = "skillforge"
}
