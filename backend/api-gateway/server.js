require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const StudentProfile = require('./models/StudentProfile');

const app = express();
const port = process.env.PORT || 3000;
const pythonServiceAddress = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
const pythonServiceUrl = /^https?:\/\//.test(pythonServiceAddress) ? pythonServiceAddress : `http://${pythonServiceAddress}`;
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4000';
const insecureJwtSecrets = new Set(['development-only-change-this-secret', 'skillforge-local-development-secret-change-before-production']);
const jwtSecret = process.env.JWT_SECRET || 'development-only-change-this-secret';

if (process.env.NODE_ENV === 'production' && insecureJwtSecrets.has(jwtSecret)) throw new Error('JWT_SECRET must be configured in production.');
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '100kb' }));
app.use((_req, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); res.setHeader('X-Frame-Options', 'DENY'); next(); });

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many sign-in attempts. Please try again in 15 minutes.' } });

const signToken = user => jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });
  try { req.userId = jwt.verify(token, jwtSecret).sub; next(); }
  catch { return res.status(401).json({ error: 'Your session is invalid or has expired.' }); }
};

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

const proxyAuth = async (req, res, next) => {
  try {
    const response = await axios({ method: req.method, url: `${authServiceUrl}${req.path.replace('/api/auth', '/auth')}`, data: req.body, headers: { authorization: req.headers.authorization }, validateStatus: () => true, timeout: 10000 });
    return res.status(response.status).json(response.data);
  } catch (error) { if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') return res.status(503).json({ error: 'Authentication service is temporarily unavailable.' }); next(error); }
};
app.post('/api/auth/signup', authLimiter, proxyAuth);
app.post('/api/auth/login', authLimiter, proxyAuth);
app.get('/api/auth/me', proxyAuth);

app.post('/api/profiles', auth, async (req, res, next) => {
  try {
    const { name, targetRole, skills } = req.body;
    if (!name || !targetRole || !Array.isArray(skills)) return res.status(400).json({ error: 'name, targetRole, and a skills array are required.' });
    const cleanSkills = [...new Set(skills.map(skill => String(skill).trim()).filter(Boolean))];
    if (String(name).trim().length > 80 || String(targetRole).trim().length > 80 || cleanSkills.length > 25 || cleanSkills.some(skill => skill.length > 60)) return res.status(400).json({ error: 'Profile data exceeds allowed limits.' });
    const profile = await StudentProfile.create({ user: req.userId, name, targetRole, skills: cleanSkills });
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

app.post('/api/profiles/:id/chat', auth, async (req, res, next) => {
  try {
    const question = String(req.body.question || '').trim();
    if (!question || question.length > 500) return res.status(400).json({ error: 'A question of 500 characters or fewer is required.' });
    const profile = await StudentProfile.findOne({ _id: req.params.id, user: req.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found.' });
    const { data } = await axios.post(`${pythonServiceUrl}/api/chat`, { student_name: profile.name, current_skills: profile.skills, target_role: profile.targetRole, question }, { timeout: 30000 });
    res.json(data);
  } catch (error) { if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') return res.status(503).json({ error: 'RAG chat service is temporarily unavailable.' }); next(error); }
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
