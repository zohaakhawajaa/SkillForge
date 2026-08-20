output "ecr_repository_urls" {
  description = "Repository URLs to use when pushing SkillForge images."
  value = {
    frontend       = aws_ecr_repository.frontend.repository_url
    api_gateway    = aws_ecr_repository.api_gateway.repository_url
    python_service = aws_ecr_repository.python_service.repository_url
  }
}
