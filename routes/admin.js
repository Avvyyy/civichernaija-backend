const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Module = require('../models/Module');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Admin = require('../models/Admin');
const PracticeResource = require('../models/PracticeResource');
const PracticeSubmission = require('../models/PracticeSubmission');
const auth = require('../middleware/auth');
const { generateModuleFromDetails } = require('../gemini-start');

// Secret for MVP
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email });
    
    // Seed an admin if none exists for easy testing
    if (!admin && email === 'admin@admin.com') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      admin = new Admin({ email, password: hashedPassword });
      await admin.save();
    }
    
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { id: admin.id, role: 'admin' } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Stats
router.get('/stats', auth, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const opportunitiesCount = await Opportunity.countDocuments();
    const modulesCount = await Module.countDocuments();
    
    res.json({ usersCount, opportunitiesCount, modulesCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Generate Module
router.post('/generate-module', auth, async (req, res) => {
  try {
    const { title, description, sourceLink } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description required" });
    
    const result = await generateModuleFromDetails({ title, description, sourceLink });
    res.json({ message: "Module generated successfully", module: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Add Opportunity
router.post('/opportunity', auth, async (req, res) => {
  try {
    const { title, type, location, applyLink, image } = req.body;
    
    // Fallback if the user adds description, usually Opportunity needs description
    const newOpp = new Opportunity({
      title,
      description: req.body.description || 'Awesome opportunity',
      type: type || 'Project',
      location: location || 'Virtual',
      applyLink: applyLink || '#',
      image: image || ''
    });
    
    const saved = await newOpp.save();
    res.json({ message: "Opportunity created", opportunity: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Get All Modules
router.get('/modules', auth, async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Module
router.put('/modules/:id', auth, async (req, res) => {
  try {
    const updated = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Delete Module
router.delete('/modules/:id', auth, async (req, res) => {
  try {
    await Module.findByIdAndDelete(req.params.id);
    res.json({ message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Get All Opportunities
router.get('/opportunities', auth, async (req, res) => {
  try {
    const opps = await Opportunity.find();
    res.json(opps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Update Opportunity
router.put('/opportunities/:id', auth, async (req, res) => {
  try {
    const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Delete Opportunity
router.delete('/opportunities/:id', auth, async (req, res) => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);
    res.json({ message: "Opportunity deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PRACTICE RESOURCES ====================

// Get all practice resources
router.get('/practice-resources', auth, async (req, res) => {
  try {
    const resources = await PracticeResource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get practice resources by type
router.get('/practice-resources/type/:type', auth, async (req, res) => {
  try {
    const resources = await PracticeResource.find({ resourceType: req.params.type }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a simulation resource
router.post('/practice-resources/simulation', auth, async (req, res) => {
  try {
    const { scenario, context, options, criteria, difficulty, category, description } = req.body;
    
    if (!scenario || !options || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ message: 'Scenario and options array are required' });
    }
    
    const resource = new PracticeResource({
      resourceType: 'simulation',
      simulationScenario: scenario,
      simulationContext: context,
      simulationOptions: options,
      simulationEvaluationCriteria: criteria,
      difficulty: difficulty || 'intermediate',
      category: category || 'general',
      description: description || scenario,
      isActive: true
    });
    
    const saved = await resource.save();
    res.status(201).json({ message: 'Simulation created', resource: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a debate topic resource
router.post('/practice-resources/debate', auth, async (req, res) => {
  try {
    const { topic, context, criteria, timeLimit, difficulty, category, description } = req.body;
    
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }
    
    const resource = new PracticeResource({
      resourceType: 'debateTopic',
      debateTopic: topic,
      debateContext: context,
      debateEvaluationCriteria: criteria,
      debateTimeLimit: timeLimit || 120,
      difficulty: difficulty || 'intermediate',
      category: category || 'general',
      description: description || topic,
      isActive: true
    });
    
    const saved = await resource.save();
    res.status(201).json({ message: 'Debate topic created', resource: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a policy guidance resource
router.post('/practice-resources/policy-guidance', auth, async (req, res) => {
  try {
    const { title, content, criteria, difficulty, category, description } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const resource = new PracticeResource({
      resourceType: 'policyGuidance',
      policyGuidanceTitle: title,
      policyGuidanceContent: content,
      policyCriteria: criteria,
      difficulty: difficulty || 'intermediate',
      category: category || 'general',
      description: description || title,
      isActive: true
    });
    
    const saved = await resource.save();
    res.status(201).json({ message: 'Policy guidance created', resource: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a practice resource
router.put('/practice-resources/:id', auth, async (req, res) => {
  try {
    const updated = await PracticeResource.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Resource not found' });
    res.json({ message: 'Resource updated', resource: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a practice resource
router.delete('/practice-resources/:id', auth, async (req, res) => {
  try {
    const deleted = await PracticeResource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle practice resource active status
router.patch('/practice-resources/:id/toggle', auth, async (req, res) => {
  try {
    const resource = await PracticeResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    
    resource.isActive = !resource.isActive;
    await resource.save();
    
    res.json({ message: 'Resource status updated', resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get practice submissions analytics
router.get('/practice-analytics', auth, async (req, res) => {
  try {
    const totalSubmissions = await PracticeSubmission.countDocuments();
    const completedEvaluations = await PracticeSubmission.countDocuments({ evaluationStatus: 'completed' });
    const avgScore = await PracticeSubmission.aggregate([
      { $match: { evaluationStatus: 'completed' } },
      { $group: { _id: null, avgScore: { $avg: '$aiEvaluation.score' } } }
    ]);
    
    const submissionsByType = await PracticeSubmission.aggregate([
      { $group: { _id: '$submissionType', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalSubmissions,
      completedEvaluations,
      averageScore: avgScore[0]?.avgScore || 0,
      submissionsByType
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent practice submissions
router.get('/practice-submissions', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const submissions = await PracticeSubmission.find()
      .populate('userId', 'name email')
      .populate('resourceId', 'resourceType simulationScenario debateTopic')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;