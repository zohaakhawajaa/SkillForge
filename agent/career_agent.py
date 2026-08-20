import sys
import os

# Add the root directory to Python's path so we can import our microservices
# Add the python-service directory specifically so we can import from it despite the hyphen
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "python-service"))

from skill_analyzer import SkillAnalyzer
from rag.retriever import RAGRetriever

class CareerAgent:
    """
    This satisfies the 'Agentic AI' requirement!
    An Agent is an AI that has access to multiple "Tools" (functions) it can call.
    """
    def __init__(self):
        # The Agent's Tools
        self.rag_tool = RAGRetriever(kb_path="rag/knowledge-base")
        
    def generate_roadmap(self, student_name, current_skills, target_role):
        print("🤖 [AGENT] Starting Career Planning Workflow...")
        
        # TOOL 1: Analyze Skills (Using the Python OOP Microservice)
        print(f"🤖 [AGENT] Using Tool: Analyzing skills for {student_name}...")
        analyzer = SkillAnalyzer(student_name, current_skills, target_role)
        gaps = analyzer.identify_gaps()
        score = analyzer.calculate_score()
        
        # TOOL 2: RAG Search (Using the RAG Retriever)
        print(f"🤖 [AGENT] Using Tool: Searching Knowledge Base for '{target_role}'...")
        kb_info = self.rag_tool.retrieve(target_role)
        
        # FINAL STEP: The Generative AI Simulation
        # (In a production app, we would send 'gaps' and 'kb_info' to the Gemini/OpenAI API here)
        print("🤖 [AGENT] Generating final personalized roadmap...\n")
        print("="*50)
        
        roadmap = f"🎓 AI CAREER ROADMAP FOR {student_name.upper()} 🎓\n"
        roadmap += f"Target Role: {target_role} | Current Readiness: {score}%\n\n"
        
        if gaps:
            roadmap += "🚨 SKILL GAPS TO FIX:\n"
            for gap in gaps:
                roadmap += f"  - You need to learn: {gap.title()}\n"
        else:
            roadmap += "✅ You have all the core skills for this role!\n"
            
        roadmap += "\n📚 KNOWLEDGE BASE INSIGHTS (RAG):\n"
        roadmap += kb_info
        
        print(roadmap)
        print("="*50)
        return roadmap

if __name__ == "__main__":
    # Test our Agent!
    agent = CareerAgent()
    agent.generate_roadmap("Zoha", ["Python", "HTML", "CSS"], "AI Engineer")
