# Database / Schema Explanation

SkillForge uses MongoDB with two main document types.

## User (Auth Service)

| Field | Purpose |
| --- | --- |
| `name` | Student display name |
| `email` | Unique login identifier |
| `password` | bcrypt password hash; raw passwords are never stored |
| timestamps | Account audit timestamps |

## StudentProfile (API Gateway)

| Field | Purpose |
| --- | --- |
| `user` | MongoDB ObjectId that owns this profile |
| `name` | Student name used in roadmap generation |
| `targetRole` | Selected career goal |
| `skills` | Current skills entered by the student |
| `latestRoadmap.readinessScore` | Role-weighted readiness score |
| `latestRoadmap.matchedSkills` | Relevant student skills that contributed to the score |
| `latestRoadmap.gaps` | Missing skills identified by `SkillAnalyzer` |
| `latestRoadmap.roadmap` | Generated roadmap text |
| `latestRoadmap.retrievedSources` | RAG files used as grounding |
| `latestRoadmap.completedSteps` | Persisted student progress |

Every profile query is filtered by the authenticated JWT user ID, preventing one student from accessing another student's plans.
