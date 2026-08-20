require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const StudentProfile = require('./models/StudentProfile');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 3000;
const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
const jwtSecret = process.env.JWT_SECRET || 'development-only-change-this-secret';

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '100kb' }));

const signToken = user => jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });
  try { req.userId = jwt.verify(token, jwtSecret).sub; next(); }
  catch { return res.status(401).json({ error: 'Your session is invalid or has expired.' }); }
};

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || typeof password !== 'string') return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (await User.exists({ email: email.trim().toLowerCase() })) return res.status(409).json({ error: 'An account already exists for this email.' });
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user || !await bcrypt.compare(String(password || ''), user.passwordHash)) return res.status(401).json({ error: 'Incorrect email or password.' });
    res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', auth, async (req, res, next) => {
  try { const user = await User.findById(req.userId); if (!user) return res.status(401).json({ error: 'Account not found.' }); res.json({ id: user.id, name: user.name, email: user.email }); }
  catch (error) { next(error); }
});

app.post('/api/profiles', auth, async (req, res, next) => {
  try {
    const { name, targetRole, skills } = req.body;
    if (!name || !targetRole || !Array.isArray(skills)) return res.status(400).json({ error: 'name, targetRole, and a skills array are required.' });
    const profile = await StudentProfile.create({ user: req.userId, name, targetRole, skills: [...new Set(skills.map(skill => String(skill).trim()).filter(Boolean))] });
    res.status(201).json(profile);
  } catch (error) { next(error); }
});

app.get('/api/profiles', auth, async (req, res, next) => { try { res.json(await StudentProfile.find({ user: req.userId }).sort({ updatedAt: -1 })); } catch (error) { next(error); } });
app.get('/api/profiles/:id', auth, async (req, res, next) => { try { const profile = await StudentProfile.findOne({ _id: req.params.id, user: req.userId }); if (!profile) return res.status(404).json({ error: 'Profile not found.' }); res.json(profile); } catch (error) { next(error); } });
app.put('/api/profiles/:id', auth, async (req, res, next) => {
  try {
    const { name, targetRole, skills } = req.body;
    if (skills && !Array.isArray(skills)) return res.status(400).json({ error: 'skills must be an array.' });
    const profile = await StudentProfile.findOneAndUpdate({ _id: req.params.id, user: req.userId }, { name, targetRole, skills }, { new: true, runValidators: true });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' }); res.json(profile);
  } catch (error) { next(error); }
});

app.post('/api/profiles/:id/roadmap', auth, async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ _id: req.params.id, user: req.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    const { data } = await axios.post(`${pythonServiceUrl}/api/roadmap`, { student_name: profile.name, current_skills: profile.skills, target_role: profile.targetRole }, { timeout: 30000 });
    profile.latestRoadmap = { readinessScore: data.score, gaps: data.gaps, recommendations: data.recommendations, roadmap: data.roadmap, retrievedSources: data.sources, completedSteps: [] };
    await profile.save(); res.json({ profileId: profile.id, ...data });
  } catch (error) { if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') return res.status(503).json({ error: 'AI analysis service is temporarily unavailable.' }); next(error); }
});

app.put('/api/profiles/:id/progress', auth, async (req, res, next) => {
  try {
    const { completedSteps } = req.body;
    if (!Array.isArray(completedSteps)) return res.status(400).json({ error: 'completedSteps must be an array.' });
    const profile = await StudentProfile.findOne({ _id: req.params.id, user: req.userId });
    if (!profile || !profile.latestRoadmap) return res.status(404).json({ error: 'Roadmap not found.' });
    profile.latestRoadmap.completedSteps = [...new Set(completedSteps.map(step => String(step)).filter(Boolean))];
    await profile.save();
    res.json({ completedSteps: profile.latestRoadmap.completedSteps });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => { console.error(error); res.status(error.name === 'CastError' ? 400 : 500).json({ error: error.name === 'CastError' ? 'Invalid profile id.' : 'Unexpected gateway error.' }); });

async function start() { try { await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillforge'); app.listen(port, () => console.log(`SkillForge API Gateway listening on ${port}`)); } catch (error) { console.error('Unable to connect to MongoDB', error); process.exit(1); } }
start();
