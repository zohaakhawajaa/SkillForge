import { useState } from 'react';

function App() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    // Simulating the API Gateway calling our Python Agent
    setTimeout(() => {
      setRoadmap({
        role: "AI Engineer",
        score: "16.67%",
        gaps: ["Machine Learning", "Docker", "Git", "Mathematics"],
        insight: "Programming: Python is mandatory. Mathematics: Linear Algebra, Calculus. DevOps: Docker, Kubernetes."
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="dashboard-container">
      <nav className="sidebar">
        <h2>🚀 SkillForge</h2>
        <ul>
          <li>Dashboard</li>
          <li>My Skills</li>
          <li>Assessments</li>
          <li>AI Career Agent</li>
        </ul>
      </nav>
      
      <main className="main-content">
        <header>
          <h1>Welcome back, Zoha 👋</h1>
          <p>Your AI-Powered Career Development Platform</p>
        </header>

        <section className="card-grid">
          <div className="card">
            <h3>Current Role Goal</h3>
            <p className="highlight">AI Engineer</p>
          </div>
          <div className="card">
            <h3>Current Skills</h3>
            <div className="badges">
              <span>Python</span><span>HTML</span><span>CSS</span>
            </div>
          </div>
        </section>

        <section className="action-section">
          <h2>Agentic AI Roadmap Generator</h2>
          <p>Click below to have our AI analyze your profile, search the knowledge base, and generate your custom path.</p>
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "🤖 AI Agent is thinking..." : "Generate My AI Roadmap"}
          </button>
        </section>

        {roadmap && (
          <section className="roadmap-results">
            <h2>🎓 Your Personalized Roadmap</h2>
            <div className="result-card">
              <h4>Readiness Score: {roadmap.score}</h4>
              
              <h4 className="alert">🚨 Skill Gaps to Fix:</h4>
              <ul>
                {roadmap.gaps.map((gap, i) => <li key={i}>{gap}</li>)}
              </ul>

              <h4>📚 RAG Knowledge Base Insights:</h4>
              <p>{roadmap.insight}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
