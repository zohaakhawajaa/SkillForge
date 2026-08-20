const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  readinessScore: Number,
  gaps: [String],
  recommendations: [String],
  roadmap: String,
  retrievedSources: [String],
  completedSteps: [String],
  generatedAt: { type: Date, default: Date.now },
}, { _id: false });

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, trim: true, lowercase: true },
  targetRole: { type: String, required: true, trim: true },
  skills: [{ type: String, trim: true }],
  latestRoadmap: roadmapSchema,
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
