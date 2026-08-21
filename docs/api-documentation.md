# API Documentation

Base URL locally: `http://localhost:3000/api`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/signup` | No | Create account |
| POST | `/auth/login` | No | Receive JWT session |
| GET | `/auth/me` | JWT | Current account |
| POST | `/profiles` | JWT | Create student profile |
| GET | `/profiles` | JWT | List owned profiles |
| PUT | `/profiles/:id` | JWT | Update profile before generation |
| POST | `/profiles/:id/roadmap` | JWT | Run analysis, RAG retrieval, and roadmap generation |
| POST | `/profiles/:id/chat` | JWT | Ask grounded RAG follow-up question |
| PUT | `/profiles/:id/progress` | JWT | Persist completed roadmap steps |
| GET | `/health` | No | Gateway health status |

The API Gateway sends roadmap and chat requests to the Python AI service. The Python service exposes `/api/analyze`, `/api/roadmap`, `/api/chat`, and `/api/health` internally.
