const express = require('express');
const router = express.Router();
const RoleModel = require('../models/RoleModel');
const auth = require('../middleware/auth');

// Get all role models (public)
router.get('/', async (req, res) => {
  try {
    const roleModels = await RoleModel.find();
    res.json(roleModels);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single role model by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const roleModel = await RoleModel.findById(req.params.id);
    if (!roleModel) return res.status(404).json({ message: 'Role model not found' });
    res.json(roleModel);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new role model (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, title, story, achievements, imageUrl, quoteText, quoteAttr } = req.body;

    if (!name || !title || !story) {
      return res.status(400).json({ message: 'Name, title, and story are required' });
    }

    const newRoleModel = new RoleModel({
      name,
      title,
      story,
      achievements: achievements || [],
      imageUrl: imageUrl || '',
      quoteText: quoteText || '',
      quoteAttr: quoteAttr || ''
    });

    const saved = await newRoleModel.save();
    res.status(201).json({ message: 'Role model created successfully', roleModel: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a role model (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, title, story, achievements, imageUrl, quoteText, quoteAttr } = req.body;

    const roleModel = await RoleModel.findById(req.params.id);
    if (!roleModel) return res.status(404).json({ message: 'Role model not found' });

    // Update fields if provided
    if (name) roleModel.name = name;
    if (title) roleModel.title = title;
    if (story) roleModel.story = story;
    if (achievements) roleModel.achievements = achievements;
    if (imageUrl !== undefined) roleModel.imageUrl = imageUrl;
    if (quoteText !== undefined) roleModel.quoteText = quoteText;
    if (quoteAttr !== undefined) roleModel.quoteAttr = quoteAttr;

    const updated = await roleModel.save();
    res.json({ message: 'Role model updated successfully', roleModel: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a role model (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const roleModel = await RoleModel.findByIdAndDelete(req.params.id);
    if (!roleModel) return res.status(404).json({ message: 'Role model not found' });

    res.json({ message: 'Role model deleted successfully', roleModel });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
