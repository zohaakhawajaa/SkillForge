import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

service_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(service_dir)
sys.path.extend([root_dir, service_dir])

from skill_analyzer import SkillAnalyzer
from agent.career_agent import CareerAgent

app = Flask(__name__)
CORS(app)
agent = CareerAgent()


def validate_payload(data):
    if not isinstance(data, dict):
        return "A JSON request body is required."
    if not isinstance(data.get("current_skills"), list):
        return "current_skills must be an array."
    if not data.get("target_role"):
        return "target_role is required."
    return None


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "python-ai-service", "llmConfigured": bool(os.getenv("OPENAI_API_KEY"))})


@app.post("/api/analyze")
def analyze_skills():
    data = request.get_json(silent=True)
    error = validate_payload(data)
    if error:
        return jsonify({"error": error}), 400
    analyzer = SkillAnalyzer(data.get("student_name", "Student"), data["current_skills"], data["target_role"])
    return jsonify({
        "student": analyzer.student_name,
        "role": analyzer.target_role,
        "score": analyzer.calculate_score(),
        "matched_skills": analyzer.matched_skills(),
        "missing_skills": analyzer.identify_gaps(),
        "recommendations": analyzer.recommend_topics(),
    })


@app.post("/api/roadmap")
def roadmap():
    data = request.get_json(silent=True)
    error = validate_payload(data)
    if error:
        return jsonify({"error": error}), 400
    try:
        return jsonify(agent.generate_roadmap(data.get("student_name", "Student"), data["current_skills"], data["target_role"]))
    except Exception as exc:
        app.logger.exception("Roadmap generation failed")
        return jsonify({"error": "Roadmap generation failed.", "detail": str(exc) if app.debug else None}), 502


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True)
    error = validate_payload(data)
    if error:
        return jsonify({"error": error}), 400
    question = str(data.get("question", "")).strip()
    if not question or len(question) > 500:
        return jsonify({"error": "question is required and must be 500 characters or fewer."}), 400
    try:
        return jsonify(agent.answer_question(data.get("student_name", "Student"), data["current_skills"], data["target_role"], question))
    except Exception as exc:
        app.logger.exception("RAG chat failed")
        return jsonify({"error": "RAG chat failed.", "detail": str(exc) if app.debug else None}), 502


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
