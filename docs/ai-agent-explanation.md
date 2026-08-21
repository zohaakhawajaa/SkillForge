# AI / Agent Explanation

`CareerAgent` is the orchestration layer behind SkillForge. It uses two explicit tools:

1. **Skill analysis tool:** creates the OOP `SkillAnalyzer` object. It compares entered skills against the selected role, calculates a role-weighted readiness score, identifies gaps, and returns matched skills.
2. **RAG retrieval tool:** queries the local `rag/knowledge-base` folder. The role-specific document is prioritized and sources are returned with the answer.

The agent combines both results to produce a four-phase roadmap: Foundation, Build, Launch, and Reflect. If `OPENAI_API_KEY` is configured, an LLM writes the final grounded roadmap and RAG answer. Without a paid API, the resilient offline mode still creates personalized plans from the role, skill gaps, role projects, and retrieved local knowledge.

This design demonstrates Python OOP, GenAI integration, local RAG, tool-using agentic orchestration, and reliable no-cost fallback behavior.
