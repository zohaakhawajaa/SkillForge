from flask import Flask, request, jsonify
from skill_analyzer import SkillAnalyzer

app = Flask(__name__)

@app.route('/api/analyze', methods=['POST'])
def analyze_skills():
    data = request.json
    
    # Using our OOP Class from earlier
    student_name = data.get('name', 'Student')
    current_skills = data.get('skills', [])
    target_role = data.get('role', 'AI Engineer')
    
    analyzer = SkillAnalyzer(student_name, current_skills, target_role)
    
    return jsonify({
        "student": student_name,
        "role": target_role,
        "score": analyzer.calculate_score(),
        "missing_skills": analyzer.identify_gaps(),
        "recommendations": analyzer.recommend_topics()
    })

if __name__ == '__main__':
    # Runs on port 5000 inside the Docker container
    app.run(host='0.0.0.0', port=5000)
