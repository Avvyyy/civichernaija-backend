const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Module = require('../models/Module');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Admin = require('../models/Admin');
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

module.exports = router;