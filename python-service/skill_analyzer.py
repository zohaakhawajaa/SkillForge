class SkillAnalyzer:
    """
    This class analyzes a student's current skills against their target career.
    It uses Object-Oriented Programming (OOP), which is a core hackathon requirement.
    """
    
    def __init__(self, student_name, current_skills, target_role):
        # The __init__ method is called automatically when we create a new student object.
        # It sets up the starting 'properties' (state) for this specific student.
        self.student_name = student_name
        
        # We convert all skills to lowercase so it's easier to compare them later
        self.current_skills = [skill.lower() for skill in current_skills]
        self.target_role = target_role

        # This is a temporary Mock "Knowledge Base" mapping roles to required skills.
        # Later in the hackathon, we will replace this with an AI/RAG system!
        self.role_requirements = {
            "ai engineer": ["python", "machine learning", "git", "docker", "mathematics", "sql"],
            "web developer": ["html", "css", "javascript", "react", "node.js", "git"],
            "data analyst": ["python", "sql", "excel", "statistics", "data visualization", "power bi"],
            "data scientist": ["python", "sql", "statistics", "machine learning", "data visualization", "git"],
            "cybersecurity analyst": ["networking", "linux", "python", "security fundamentals", "wireshark", "git"],
            "mobile developer": ["javascript", "react", "react native", "git", "api integration", "mobile ui"]
        }
        # Higher-impact role skills carry more weight than supporting skills.
        self.role_weights = {
            "ai engineer": {"python": 25, "machine learning": 30, "git": 5, "docker": 15, "mathematics": 15, "sql": 10},
            "web developer": {"html": 10, "css": 10, "javascript": 25, "react": 25, "node.js": 20, "git": 10},
            "data analyst": {"python": 20, "sql": 25, "excel": 15, "statistics": 15, "data visualization": 15, "power bi": 10},
            "data scientist": {"python": 20, "sql": 15, "statistics": 20, "machine learning": 30, "data visualization": 10, "git": 5},
            "cybersecurity analyst": {"networking": 25, "linux": 20, "python": 10, "security fundamentals": 25, "wireshark": 15, "git": 5},
            "mobile developer": {"javascript": 20, "react": 15, "react native": 30, "git": 5, "api integration": 15, "mobile ui": 15},
        }

    def calculate_score(self):
        """Calculates a basic score based on how many required skills the student has."""
        required_skills = self.role_requirements.get(self.target_role.lower(), [])
        
        # If the role doesn't exist in our dictionary, return 0
        if not required_skills:
            return 0

        return round(sum(self.role_weights[self.target_role.lower()].get(skill, 0) for skill in self.matched_skills()), 2)

    def matched_skills(self):
        """Returns the entered skills that are relevant to the target role."""
        required_skills = self.role_requirements.get(self.target_role.lower(), [])
        return [skill for skill in required_skills if skill in self.current_skills]

    def identify_gaps(self):
        """Identifies which required skills the student is missing."""
        required_skills = self.role_requirements.get(self.target_role.lower(), [])
        
        # Find skills that are in required_skills but NOT in the student's current_skills
        missing_skills = [skill for skill in required_skills if skill not in self.current_skills]
        return missing_skills

    def recommend_topics(self):
        """Generates basic learning recommendations based on the skill gaps."""
        gaps = self.identify_gaps()
        
        if not gaps:
            return ["You have all the core skills! Time to build a portfolio project."]
        
        recommendations = []
        for skill in gaps:
            recommendations.append(f"Learn {skill.title()}: Focus on basic syntax and introductory projects.")
        return recommendations


# --- Testing the Class ---
# This block only runs if we run this file directly in the terminal.
if __name__ == "__main__":
    print("--- SkillForge AI Analyzer Test ---")
    
    # 1. Create a student object (An Instance of our blueprint)
    student_alex = SkillAnalyzer(
        student_name="Alex",
        current_skills=["Python", "HTML", "Git", "React"],
        target_role="AI Engineer"
    )
    
    # 2. Call the methods to see OOP in action!
    print(f"\nStudent: {student_alex.student_name}")
    print(f"Target Role: {student_alex.target_role}")
    
    print(f"Score: {student_alex.calculate_score()}% readiness")
    
    missing = student_alex.identify_gaps()
    print(f"Missing Skills (Gaps): {missing}")
    
    print("\nRecommended Learning Topics:")
    for topic in student_alex.recommend_topics():
        print(f"- {topic}")
