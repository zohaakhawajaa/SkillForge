require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
const port = process.env.PORT || 4000;
const jwtSecret = process.env.JWT_SECRET || 'development-only-change-this-secret';
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

const signToken = user => jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication is required.' });
  try { req.userId = jwt.verify(token, jwtSecret).sub; next(); } catch { return res.status(401).json({ error: 'Your session is invalid or has expired.' }); }
};

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.post('/auth/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || typeof password !== 'string') return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (name.trim().length > 80 || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid name and email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (await User.exists({ email: email.trim().toLowerCase() })) return res.status(409).json({ error: 'An account already exists for this email.' });
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});
app.post('/auth/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() });
    if (!user || !await bcrypt.compare(String(req.body.password || ''), user.passwordHash)) return res.status(401).json({ error: 'Incorrect email or password.' });
    res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});
app.get('/auth/me', authenticate, async (req, res, next) => { try { const user = await User.findById(req.userId); if (!user) return res.status(401).json({ error: 'Account not found.' }); res.json({ id: user.id, name: user.name, email: user.email }); } catch (error) { next(error); } });
app.use((error, _req, res, _next) => { console.error(error); res.status(500).json({ error: 'Unexpected authentication error.' }); });
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillforge').then(() => app.listen(port, () => console.log(`Auth service listening on ${port}`))).catch(error => { console.error('Unable to connect to MongoDB', error); process.exit(1); });
