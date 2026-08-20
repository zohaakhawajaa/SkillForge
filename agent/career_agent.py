import os
import sys

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.extend([root_dir, os.path.join(root_dir, "python-service")])

from skill_analyzer import SkillAnalyzer
from rag.retriever import RAGRetriever


class CareerAgent:
    """Career-planning agent with two explicit tools: skill analysis and RAG retrieval."""

    def __init__(self):
        self.rag_tool = RAGRetriever(kb_path=os.path.join(root_dir, "rag", "knowledge-base"))
        self.openai_client = None
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            from openai import OpenAI
            self.openai_client = OpenAI(api_key=api_key)

    def analyze_skill_gaps(self, student_name, current_skills, target_role):
        """Tool 1: OOP skill analysis service."""
        analyzer = SkillAnalyzer(student_name, current_skills, target_role)
        return {
            "score": analyzer.calculate_score(),
            "gaps": analyzer.identify_gaps(),
            "recommendations": analyzer.recommend_topics(),
        }

    def retrieve_grounding(self, target_role, gaps):
        """Tool 2: local RAG knowledge-base retrieval."""
        return self.rag_tool.retrieve(f"{target_role} {' '.join(gaps)}")

    def _fallback_roadmap(self, target_role, analysis, documents):
        steps = "\n".join(
            f"{index + 1}. Build {gap.title()} through a focused lesson and a small practical exercise."
            for index, gap in enumerate(analysis["gaps"])
        ) or "1. Build a portfolio project that demonstrates your current skill stack."
        grounding = documents[0]["content"][:500]
        return f"## {target_role} Roadmap\n\n{steps}\n\n### Grounded guidance\n{grounding}"

    def _generate_with_llm(self, target_role, analysis, documents):
        context = "\n\n".join(f"Source: {item['source']}\n{item['content']}" for item in documents)
        prompt = f"""You are SkillForge, a supportive career-planning assistant.
Create a concise, practical, step-by-step roadmap for a student targeting {target_role}.
Current readiness score: {analysis['score']}%.
Missing skills: {', '.join(analysis['gaps']) or 'none'}.
Use the retrieved knowledge below as factual grounding. Do not invent courses, certifications, or sources.
For each step, include a skill focus, a practical deliverable, and an estimated duration.
Use readable Markdown.

Retrieved knowledge:
{context}"""
        response = self.openai_client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            input=prompt,
        )
        return response.output_text

    def answer_question(self, student_name, current_skills, target_role, question):
        """Answer a student's follow-up question using the same RAG toolchain."""
        analysis = self.analyze_skill_gaps(student_name, current_skills, target_role)
        documents = self.rag_tool.retrieve(f"{target_role} {question} {' '.join(analysis['gaps'])}")
        if self.openai_client:
            context = "\n\n".join(f"Source: {item['source']}\n{item['content']}" for item in documents)
            response = self.openai_client.responses.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
                input=f"""You are SkillForge's RAG learning assistant. Answer the student's question concisely and practically.
Student: {student_name}. Target role: {target_role}. Current skills: {', '.join(current_skills)}.
Question: {question}
Only use this retrieved knowledge. If it does not contain the answer, say what the student should explore next.

Retrieved knowledge:\n{context}""",
            )
            answer = response.output_text
        else:
            answer = f"For your {target_role} path, focus on {', '.join(analysis['gaps'][:3]) or 'a portfolio project'}. " \
                     f"Based on the knowledge base: {documents[0]['content'][:420]}"
        return {"answer": answer, "sources": [item["source"] for item in documents], "generation_mode": "llm" if self.openai_client else "fallback"}

    def generate_roadmap(self, student_name, current_skills, target_role):
        analysis = self.analyze_skill_gaps(student_name, current_skills, target_role)
        documents = self.retrieve_grounding(target_role, analysis["gaps"])
        roadmap = self._generate_with_llm(target_role, analysis, documents) if self.openai_client else self._fallback_roadmap(target_role, analysis, documents)
        return {
            **analysis,
            "roadmap": roadmap,
            "sources": [item["source"] for item in documents],
            "generation_mode": "llm" if self.openai_client else "fallback",
        }
