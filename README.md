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

## Run locally

The complete stack is containerized. From the `SkillForge` directory, run:

```bash
docker compose up --build
```

Open `http://localhost:8080` for the dashboard. The API gateway is available at
`http://localhost:3000/api/health`, and the Python AI service health endpoint is
at `http://localhost:5000/api/health`.

Roadmaps work without an API key using the local knowledge-base fallback. To use
an OpenAI-generated roadmap, set `OPENAI_API_KEY` in your shell before starting
Compose. You may also set `OPENAI_MODEL` (defaults to `gpt-4.1-mini`).

For production, set a long random `JWT_SECRET` before starting Compose. The
included default is only suitable for local development.

## Quick verification

Run the core AI checks without starting Docker:

```bash
python python-service/test_skill_analyzer.py
```

Supported career goals: AI Engineer, Web Developer, Data Analyst, Data Scientist,
Cybersecurity Analyst, and Mobile Developer.

## Continuous integration

GitHub Actions runs Python analyzer tests, a production frontend build, API syntax
validation, and Docker Compose validation on pushes and pull requests to `main`.

## Security notes

Passwords are hashed with bcrypt, API sessions use seven-day JWTs, user resources
are ownership-protected, and authentication endpoints are rate limited. Configure
a long, unique `JWT_SECRET` before any public deployment.

## Kubernetes deployment

Build and publish the three images to a registry, update their image names in
`kubernetes/skillforge-stack.yaml`, replace the placeholder secret values, then run:

```bash
kubectl apply -f kubernetes/skillforge-stack.yaml
```

The included MongoDB deployment uses ephemeral storage for demonstration only.
Use a managed database or persistent volume before a production deployment.
