const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find().select('-quiz -simulationPrompt');
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a module by ID
router.get('/:id', auth, async (req, res) => {
    try {
      const module = await Module.findById(req.params.id);
      if (!module) return res.status(404).json({ message: 'Module not found' });
      res.json(module);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
});

// Mark module as completed & submit simulation
router.post('/:id/complete', auth, async (req, res) => {
    try {
      const { simulationResponse } = req.body;
      const user = await User.findById(req.user.id);
      if (!user.completedModules.includes(req.params.id)) {
        user.completedModules.push(req.params.id);
        user.badges.push('Module Completer');
        await user.save();
      }
      res.json({ message: 'Module completed successfully', badges: user.badges });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
