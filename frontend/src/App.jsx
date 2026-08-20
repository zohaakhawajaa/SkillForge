import { useEffect, useMemo, useState } from 'react';
import './themes.css';

const apiBase = import.meta.env.VITE_API_URL || '';
const roleOptions = ['AI Engineer', 'Web Developer', 'Data Analyst', 'Data Scientist', 'Cybersecurity Analyst', 'Mobile Developer'];
const resourceCatalog = {
  'machine learning': { provider: 'Google Machine Learning', title: 'Machine Learning Crash Course', detail: 'Core concepts, exercises, and model-building practice.', url: 'https://developers.google.com/machine-learning/crash-course' },
  mathematics: { provider: 'Khan Academy', title: 'Linear algebra foundations', detail: 'Build the maths intuition used in machine learning.', url: 'https://www.khanacademy.org/math/linear-algebra' },
  docker: { provider: 'Docker Docs', title: 'Docker getting started', detail: 'Learn images, containers, and a practical deployment workflow.', url: 'https://docs.docker.com/get-started/' },
  git: { provider: 'GitHub Skills', title: 'Introduction to GitHub', detail: 'A guided project for Git, commits, branches, and pull requests.', url: 'https://github.com/skills/introduction-to-github' },
  sql: { provider: 'SQLBolt', title: 'Interactive SQL lessons', detail: 'Short browser-based SQL exercises and practice queries.', url: 'https://sqlbolt.com/' },
  javascript: { provider: 'MDN Web Docs', title: 'JavaScript guide', detail: 'Learn language fundamentals through official documentation.', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
  react: { provider: 'React', title: 'Quick Start', detail: 'Build components, manage state, and create interactive interfaces.', url: 'https://react.dev/learn' },
  'node.js': { provider: 'Node.js', title: 'Learn Node.js', detail: 'Understand Node runtime concepts and backend fundamentals.', url: 'https://nodejs.org/en/learn' },
  html: { provider: 'MDN Web Docs', title: 'HTML basics', detail: 'Create accessible, semantic web page structure.', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content' },
  css: { provider: 'MDN Web Docs', title: 'CSS styling basics', detail: 'Learn responsive layouts and modern styling techniques.', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics' },
  excel: { provider: 'Microsoft Support', title: 'Excel training', detail: 'Learn spreadsheets, formulas, and data analysis workflows.', url: 'https://support.microsoft.com/en-us/excel' },
  statistics: { provider: 'Khan Academy', title: 'Statistics and probability', detail: 'Build the statistical reasoning needed for data work.', url: 'https://www.khanacademy.org/math/statistics-probability' },
  'data visualization': { provider: 'Tableau', title: 'Data visualization learning', detail: 'Turn data into clear, persuasive visual stories.', url: 'https://www.tableau.com/learn/training' },
  'power bi': { provider: 'Microsoft Learn', title: 'Power BI learning path', detail: 'Model data and create interactive business reports.', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi/' },
  networking: { provider: 'Cisco Networking Academy', title: 'Networking basics', detail: 'Learn how networks, protocols, and devices work.', url: 'https://www.netacad.com/courses/networking-basics' },
  linux: { provider: 'Linux Foundation', title: 'Introduction to Linux', detail: 'Build command-line confidence and operating-system basics.', url: 'https://training.linuxfoundation.org/resources/free-courses/introduction-to-linux/' },
  'security fundamentals': { provider: 'Cisco Networking Academy', title: 'Introduction to Cybersecurity', detail: 'Explore threats, defence concepts, and security careers.', url: 'https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity' },
  wireshark: { provider: 'Wireshark', title: 'Wireshark documentation', detail: 'Learn packet analysis and network troubleshooting.', url: 'https://www.wireshark.org/docs/' },
  'react native': { provider: 'React Native', title: 'React Native learning', detail: 'Build native mobile experiences with React.', url: 'https://reactnative.dev/docs/getting-started' },
  'api integration': { provider: 'MDN Web Docs', title: 'Using the Fetch API', detail: 'Connect applications to APIs reliably and securely.', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch' },
};
const resourceFor = skill => resourceCatalog[skill.toLowerCase()] || { provider: 'MDN Web Docs', title: `Explore ${skill}`, detail: 'Use this learning hub to find a high-quality next lesson.', url: 'https://developer.mozilla.org/en-US/docs/Learn' };

function Icon({ name, size = 20 }) {
  const icons = {
    spark: <path d="m12 2 1.9 7.1L21 11l-7.1 1.9L12 20l-1.9-7.1L3 11l7.1-1.9L12 2Z" />,
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="m18 6 3-3" /></>,
    book: <><path d="M4 5a3 3 0 0 1 3-3h13v18H7a3 3 0 0 0-3 3V5Z" /><path d="M4 20a3 3 0 0 1 3-3h13" /></>,
    chart: <><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20V7" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    refresh: <><path d="M20 11a8 8 0 1 0 1 5" /><path d="M20 4v7h-7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch(`${apiBase}/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not continue.');
      localStorage.setItem('skillforge-auth', JSON.stringify(result)); onAuthenticated(result);
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  };
  return <div className="auth-page"><section className="auth-copy"><a className="logo" href="#"><span><Icon name="spark" size={17} /></span>SkillForge</a><div><p className="kicker">YOUR CAREER, CLARIFIED</p><h1>Start with what you know.<br /><i>Grow into what you want.</i></h1><p>Build a private career roadmap that adapts as your skills grow.</p></div><small>SkillForge · Career planning with direction</small></section><section className="auth-panel"><form className="auth-card" onSubmit={submit}><p className="kicker">WELCOME TO SKILLFORGE</p><h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2><p>{mode === 'signup' ? 'Save your roadmap and track your growth.' : 'Sign in to continue your career plan.'}</p>{mode === 'signup' && <label>Name<input required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Your name" autoComplete="name" /></label>}<label>Email<input required type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} placeholder="you@example.com" autoComplete="email" /></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} placeholder="At least 8 characters" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label><button className="generate" disabled={loading}>{loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'} <Icon name="arrow" size={18} /></button>{error && <p className="form-error" role="alert">{error}</p>}<button className="auth-toggle" type="button" onClick={() => { setMode(current => current === 'signup' ? 'login' : 'signup'); setError(''); }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'New to SkillForge? Create an account'}</button></form></section></div>;
}

function App() {
  const [profile, setProfile] = useState({ name: '', targetRole: 'AI Engineer', skills: ['Python'] });
  const [theme, setTheme] = useState('aurora');
  const [skillInput, setSkillInput] = useState('');
  const [profileId, setProfileId] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [history, setHistory] = useState([]);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [auth, setAuth] = useState(() => { try { return JSON.parse(localStorage.getItem('skillforge-auth')) || null; } catch { return null; } });
  const canGenerate = profile.name.trim() && profile.targetRole && profile.skills.length;
  const initials = useMemo(() => profile.name.trim().split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'SF', [profile.name]);
  const roadmapLines = useMemo(() => roadmap?.roadmap?.split('\n').filter(line => line.trim() && !line.startsWith('#')) || [], [roadmap]);
  const progress = roadmapLines.length ? Math.round((completedSteps.length / roadmapLines.length) * 100) : 0;

  useEffect(() => {
    if (!auth?.token) return;
    fetch(`${apiBase}/api/profiles`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(response => response.ok ? response.json() : [])
      .then(profiles => {
        setHistory(profiles);
        const latest = profiles.find(item => item.latestRoadmap);
        if (!latest) return;
        setProfileId(latest._id); setProfile({ name: latest.name, targetRole: latest.targetRole, skills: latest.skills });
        setRoadmap({ score: latest.latestRoadmap.readinessScore, gaps: latest.latestRoadmap.gaps, recommendations: latest.latestRoadmap.recommendations, roadmap: latest.latestRoadmap.roadmap, sources: latest.latestRoadmap.retrievedSources, generation_mode: 'saved' });
        setCompletedSteps(latest.latestRoadmap.completedSteps || []);
      }).catch(() => {});
  }, [auth]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (value && !profile.skills.some(skill => skill.toLowerCase() === value.toLowerCase())) setProfile(current => ({ ...current, skills: [...current.skills, value] }));
    setSkillInput('');
  };

  const generateRoadmap = async () => {
    if (!canGenerate) return;
    setLoading(true); setError('');
    const payload = { name: profile.name.trim(), targetRole: profile.targetRole, skills: profile.skills };
    try {
      const endpoint = profileId ? `${apiBase}/api/profiles/${profileId}` : `${apiBase}/api/profiles`;
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` };
      const savedResponse = await fetch(endpoint, { method: profileId ? 'PUT' : 'POST', headers, body: JSON.stringify(payload) });
      const saved = await savedResponse.json();
      if (!savedResponse.ok) throw new Error(saved.error || 'We could not save your profile.');
      const id = saved._id || profileId;
      setProfileId(id);
      const response = await fetch(`${apiBase}/api/profiles/${id}/roadmap`, { method: 'POST', headers: { Authorization: `Bearer ${auth.token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'We could not generate your roadmap.');
      setRoadmap(result);
      setCompletedSteps([]);
      setHistory(current => [{ ...saved, latestRoadmap: { readinessScore: result.score, gaps: result.gaps, roadmap: result.roadmap, completedSteps: [] } }, ...current.filter(item => item._id !== id)]);
      window.setTimeout(() => document.querySelector('#roadmap')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (requestError) { setError(requestError.message || 'Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const toggleStep = async step => {
    const next = completedSteps.includes(step) ? completedSteps.filter(item => item !== step) : [...completedSteps, step];
    setCompletedSteps(next);
    try {
      const response = await fetch(`${apiBase}/api/profiles/${profileId}/progress`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ completedSteps: next }) });
      if (!response.ok) throw new Error();
    } catch { setCompletedSteps(completedSteps); setError('Your progress could not be saved. Please try again.'); }
  };

  const askRag = async event => {
    event.preventDefault();
    const question = chatQuestion.trim();
    if (!question || !profileId) return;
    setChatLoading(true); setError('');
    setChatMessages(current => [...current, { role: 'student', text: question }]); setChatQuestion('');
    try {
      const response = await fetch(`${apiBase}/api/profiles/${profileId}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` }, body: JSON.stringify({ question }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The RAG assistant could not answer right now.');
      setChatMessages(current => [...current, { role: 'assistant', text: result.answer, sources: result.sources }]);
    } catch (requestError) { setError(requestError.message); }
    finally { setChatLoading(false); }
  };

  const loadJudgeDemo = () => {
    setProfile({ name: 'Amina Rahman', targetRole: 'AI Engineer', skills: ['Python', 'Git', 'SQL'] });
    setProfileId(null); setRoadmap(null); setCompletedSteps([]); setChatMessages([]); setError('');
    window.setTimeout(() => document.querySelector('#assessment')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  if (!auth) return <AuthScreen onAuthenticated={result => { setAuth(result); setProfile(current => ({ ...current, name: result.user.name })); }} />;
  return <div className={`app theme-${theme}`}>
    <nav className="nav"><a className="logo" href="#top"><span><Icon name="spark" size={17} /></span>SkillForge</a><div className="nav-links"><a href="#assessment">Assessment</a><a href="#roadmap">Roadmap</a></div><div className="theme-switcher" role="group" aria-label="Choose a colour theme">{[['aurora', 'Aurora'], ['mono', 'Mono'], ['dusk', 'Dusk'], ['sage', 'Sage']].map(([value, label]) => <button key={value} className={theme === value ? 'active' : ''} onClick={() => setTheme(value)} aria-pressed={theme === value}>{label}</button>)}</div><button className="sign-out" onClick={() => { localStorage.removeItem('skillforge-auth'); setAuth(null); setProfileId(null); setRoadmap(null); }}>Sign out</button><div className="nav-avatar" title={auth.user.name}>{initials}</div></nav>
    <main id="top">
      <section className="hero"><div className="hero-copy"><p className="kicker">AI-POWERED CAREER INTELLIGENCE</p><h1>From <i>“what now?”</i><br />to a plan you can ship.</h1><p>SkillForge identifies the skills between a student and their dream role, then turns that gap into a grounded, trackable learning journey.</p><div className="hero-actions"><button className="hero-primary" onClick={loadJudgeDemo}>Run judge demo <Icon name="arrow" size={18} /></button><a href="#assessment">Build my profile</a></div><div className="hero-metrics"><span><b>6</b> career paths</span><span><b>RAG</b> grounded guidance</span><span><b>100%</b> personal progress</span></div></div><div className="hero-card"><div className="pulse"><Icon name="spark" size={26} /></div><p>YOUR NEXT CHAPTER</p><strong>{profile.targetRole}</strong><div className="orbit o1" /><div className="orbit o2" /><div className="floating-chip chip-one">{profile.skills[0] || 'Your skill'}</div><div className="floating-chip chip-two">Future ready</div></div></section>
      <section className="proof-strip"><div><b>01</b><span>Assess</span><small>Map current skills to a target role.</small></div><div><b>02</b><span>Forge</span><small>Generate an agentic, RAG-grounded roadmap.</small></div><div><b>03</b><span>Advance</span><small>Learn, track progress, and ask follow-up questions.</small></div><aside><p>BUILT WITH</p><span>OOP</span><span>GenAI</span><span>RAG</span><span>Agentic AI</span><span>Microservices</span></aside></section>
      <section className="assessment" id="assessment"><div className="section-heading"><div><p className="kicker">START HERE</p><h2>Build your skill profile</h2><p>This takes less than a minute. Your roadmap is based on exactly what you enter.</p></div><span className="step-badge">01 <small>of 02</small></span></div>
        <div className="assessment-grid"><form className="profile-card" onSubmit={event => { event.preventDefault(); generateRoadmap(); }}><label>Your name<input value={profile.name} onChange={event => setProfile(current => ({ ...current, name: event.target.value }))} placeholder="e.g. Zoha Khawaja" autoComplete="name" /></label><label>Career goal<select value={profile.targetRole} onChange={event => setProfile(current => ({ ...current, targetRole: event.target.value }))}>{roleOptions.map(role => <option key={role}>{role}</option>)}</select></label><label>Skills you already have</label><div className="skills-entry">{profile.skills.map(skill => <span className="skill-chip" key={skill}>{skill}<button type="button" onClick={() => setProfile(current => ({ ...current, skills: current.skills.filter(item => item !== skill) }))} aria-label={`Remove ${skill}`}><Icon name="close" size={13} /></button></span>)}<input value={skillInput} onChange={event => setSkillInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addSkill(); } }} placeholder="Type a skill and press Enter" /></div><button className="add-skill" type="button" onClick={addSkill}><Icon name="plus" size={15} /> Add skill</button><button className="generate" disabled={!canGenerate || loading}>{loading ? 'Creating your roadmap…' : 'Generate my roadmap'} <Icon name="arrow" size={18} /></button>{error && <p className="form-error" role="alert">{error}</p>}</form>
          <aside className="help-card"><div className="help-icon"><Icon name="target" size={22} /></div><p className="kicker">HOW IT WORKS</p><h3>A roadmap made for your starting line.</h3><ol><li><b>01</b><span>We compare your skills with your target role.</span></li><li><b>02</b><span>We surface the gaps worth focusing on first.</span></li><li><b>03</b><span>You get practical steps grounded in our learning knowledge base.</span></li></ol></aside>
        </div>
      </section>
      <section id="roadmap" className="roadmap-section">{!roadmap ? <div className="empty-roadmap"><div><Icon name="chart" size={28} /></div><p className="kicker">YOUR ROADMAP</p><h2>Your next steps will appear here.</h2><p>Complete your profile above to get a personalized readiness score, skill gaps, and action plan.</p></div> : <><div className="roadmap-heading"><div><p className="kicker">YOUR PERSONALIZED PLAN</p><h2>{profile.name ? `${profile.name.split(' ')[0]}’s ${profile.targetRole} roadmap` : `${profile.targetRole} roadmap`}</h2></div><button className="secondary-button" onClick={generateRoadmap} disabled={loading}><Icon name="refresh" size={16} /> Refresh plan</button></div><div className="progress-panel"><div><p className="kicker">YOUR PROGRESS</p><strong>{completedSteps.length} of {roadmapLines.length} steps complete</strong></div><b>{progress}%</b><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div><div className="summary-grid"><article className="readiness"><p>CAREER READINESS</p><div className="score" style={{ '--score': `${roadmap.score}%` }}><span>{roadmap.score}<small>%</small></span></div><strong>{roadmap.score >= 70 ? 'Strong foundation' : 'A promising start'}</strong><small>Based on the core skills for {profile.targetRole}.</small></article><article className="gaps"><p>FOCUS AREAS</p><h3>{roadmap.gaps.length ? `${roadmap.gaps.length} skills to strengthen` : 'You have the core skills!'}</h3><div>{roadmap.gaps.map((gap, index) => <span key={gap}><b>0{index + 1}</b>{gap}</span>)}</div></article></div><article className="plan-card"><div className="plan-title"><span><Icon name="book" size={20} /></span><div><p className="kicker">LEARNING PLAN</p><h3>Your practical roadmap</h3></div></div><div className="plan-list">{roadmapLines.map((line, index) => { const step = line.replace(/^\d+\.\s*/, ''); const done = completedSteps.includes(step); return <button className={`plan-item ${done ? 'done' : ''}`} onClick={() => toggleStep(step)} key={`${line}-${index}`}><b>{String(index + 1).padStart(2, '0')}</b><p>{step}</p><span>{done ? <Icon name="check" size={17} /> : <span />}</span></button>; })}</div>{roadmap.sources?.length > 0 && <p className="source-note">Grounded in: {roadmap.sources.join(', ')} · {roadmap.generation_mode === 'llm' ? 'AI generated' : 'Local guidance mode'}</p>}</article><section className="resources-card"><p className="kicker">CURATED LEARNING RESOURCES</p><h3>Start learning with confidence.</h3><div>{roadmap.gaps.map(gap => { const resource = resourceFor(gap); return <a key={gap} href={resource.url} target="_blank" rel="noreferrer"><span><small>{resource.provider}</small><strong>{resource.title}</strong><p>{resource.detail}</p></span><Icon name="arrow" size={18} /></a>; })}</div></section><section className="chat-card"><p className="kicker">RAG CHAT · KNOWLEDGE-BASE GROUNDED</p><h3>Ask your career assistant</h3><p>Ask a follow-up question about your learning plan. Answers are grounded in the local role knowledge base.</p><div className="chat-messages">{chatMessages.length === 0 && <span>Try: “What should I learn first and why?”</span>}{chatMessages.map((message, index) => <article className={message.role} key={index}><b>{message.role === 'student' ? 'You' : 'SkillForge RAG'}</b><p>{message.text}</p>{message.sources && <small>Sources: {message.sources.join(', ')}</small>}</article>)}</div><form onSubmit={askRag}><input value={chatQuestion} maxLength="500" onChange={event => setChatQuestion(event.target.value)} placeholder="Ask about this roadmap…" /><button className="generate" disabled={chatLoading}>{chatLoading ? 'Thinking…' : 'Ask RAG'} <Icon name="arrow" size={17} /></button></form></section><aside className="history-card"><p className="kicker">SAVED PLANS</p><h3>Your roadmap history</h3>{history.filter(item => item.latestRoadmap).slice(0, 3).map(item => <button key={item._id} onClick={() => { setProfileId(item._id); setProfile({ name: item.name, targetRole: item.targetRole, skills: item.skills }); setRoadmap({ score: item.latestRoadmap.readinessScore, gaps: item.latestRoadmap.gaps, roadmap: item.latestRoadmap.roadmap, sources: item.latestRoadmap.retrievedSources, generation_mode: 'saved' }); setCompletedSteps(item.latestRoadmap.completedSteps || []); }}><span>{item.targetRole}</span><small>{item.latestRoadmap.completedSteps?.length || 0} completed</small></button>)}</aside></>}</section>
    </main><footer>SkillForge <span>·</span> Make your next move with confidence.</footer>
  </div>;
}

export default App;
