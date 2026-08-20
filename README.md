# SkillForge 🚀

**AI-Powered Student Skills & Career Development Platform**

## 🌟 The Main Purpose
SkillForge is an AI-powered career development platform that evaluates a student's current tech skills against their dream job, and uses AI to generate a personalized, step-by-step learning roadmap to bridge the gap.

## 🏆 Project Overview (LOOPLEARN HACKATHON 2026)
This project is built for **Problem Statement 03 (PS-03)**. It focuses on solving the problem of students not knowing what skills they are missing or what projects they should build to reach their career goals in technology.

**Target SDGs:**
- SDG 4: Quality Education
- SDG 8: Decent Work and Economic Growth
- SDG 9: Industry, Innovation and Infrastructure
- SDG 10: Reduced Inequalities

## 🏗️ Architecture & Tech Stack
To ensure this is the best project possible, it strictly follows a robust Microservices architecture:

- **Frontend:** React (Responsive Dashboard)
- **Backend Core:** Node.js, Express, MongoDB (API Gateway, Auth)
- **AI Core (Python):** Python OOP microservice for skill gap analysis
- **Generative AI & RAG:** Knowledge-base grounded LLM for roadmap generation
- **Agentic AI:** Career Planning AI Agent with tools to analyze skills and search resources
- **DevOps:** Docker, Kubernetes, Terraform, GitHub Actions (CI/CD)

## 📁 Repository Structure
```
project/
├── frontend/             # React web application
├── backend/              # Node.js Microservices
│   ├── auth-service/     # JWT User Authentication
│   ├── core-service/     # Profile and database interactions
│   └── api-gateway/      # Routes traffic to microservices
├── python-service/       # Python OOP SkillAnalyzer
├── ai-service/           # Generative AI Integrations
├── rag/                  # Knowledge base and embeddings
├── agent/                # Agentic AI tools and workflow
├── docker/               # Dockerfiles and docker-compose
├── kubernetes/           # K8s Deployment YAMLs
├── terraform/            # Infrastructure as code
├── scripts/              # setup.sh and deploy.sh
└── docs/                 # Architecture & API documentation
```

## 👨‍💻 Author
- [@zohaakhawajaa](https://github.com/zohaakhawajaa)
