const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PracticeSubmission = require('../models/PracticeSubmission');
const PracticeResource = require('../models/PracticeResource');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { evaluatePracticeSubmission } = require('../gemini-start');

// Get all active practice resources (public)
router.get('/resources', async (req, res) => {
  try {
    const { type } = req.query;
    let query = { isActive: true };
    
    if (type === 'simulation') {
      query.resourceType = 'simulation';
    } else if (type === 'debateTopic') {
      query.resourceType = 'debateTopic';
    } else if (type === 'policyGuidance') {
      query.resourceType = 'policyGuidance';
    }
    
    const resources = await PracticeResource.find(query).select('-evaluationCriteria');
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific practice resource
router.get('/resources/:id', async (req, res) => {
  try {
    const resource = await PracticeResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a simulation response (auth required)
router.post('/submit/simulation', auth, async (req, res) => {
  try {
    const { resourceId, option, reason } = req.body;
    
    if (!option || !reason) {
      return res.status(400).json({ message: 'Option and reason are required' });
    }
    
    const resource = await PracticeResource.findById(resourceId);
    if (!resource || resource.resourceType !== 'simulation') {
      return res.status(404).json({ message: 'Simulation resource not found' });
    }
    
    const submission = new PracticeSubmission({
      userId: req.user.id,
      submissionType: 'simulation',
      resourceId,
      simulationOption: option,
      simulationReason: reason,
      evaluationStatus: 'pending'
    });
    
    await submission.save();
    
    // Trigger async evaluation
    evaluatePracticeSubmission(submission._id).catch(err => 
      console.error('Error evaluating submission:', err.message)
    );
    
    res.status(201).json({ 
      message: 'Simulation submitted successfully', 
      submissionId: submission._id 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a debate response (auth required)
router.post('/submit/debate', auth, async (req, res) => {
  try {
    const { resourceId, topicIndex, response, timeSpent } = req.body;
    
    if (!response) {
      return res.status(400).json({ message: 'Debate response is required' });
    }
    
    const resource = await PracticeResource.findById(resourceId);
    if (!resource || resource.resourceType !== 'debateTopic') {
      return res.status(404).json({ message: 'Debate resource not found' });
    }
    
    const submission = new PracticeSubmission({
      userId: req.user.id,
      submissionType: 'debate',
      resourceId,
      debateTopicIndex: topicIndex || 0,
      debateResponse: response,
      timeSpent: timeSpent || 0,
      evaluationStatus: 'pending'
    });
    
    await submission.save();
    
    // Trigger async evaluation
    evaluatePracticeSubmission(submission._id).catch(err => 
      console.error('Error evaluating submission:', err.message)
    );
    
    res.status(201).json({ 
      message: 'Debate response submitted successfully', 
      submissionId: submission._id 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a policy draft (auth required)
router.post('/submit/policy', auth, async (req, res) => {
  try {
    const { title, problem, proposal } = req.body;
    
    if (!title || !problem || !proposal) {
      return res.status(400).json({ message: 'Title, problem, and proposal are required' });
    }
    
    const submission = new PracticeSubmission({
      userId: req.user.id,
      submissionType: 'policy',
      policyTitle: title,
      policyProblem: problem,
      policyProposal: proposal,
      evaluationStatus: 'pending'
    });
    
    await submission.save();
    
    // Trigger async evaluation
    evaluatePracticeSubmission(submission._id).catch(err => 
      console.error('Error evaluating submission:', err.message)
    );
    
    res.status(201).json({ 
      message: 'Policy draft submitted successfully', 
      submissionId: submission._id 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's practice submissions with evaluation status
router.get('/submissions', auth, async (req, res) => {
  try {
    const submissions = await PracticeSubmission.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('resourceId', 'resourceType simulationScenario debateTopic policyGuidanceTitle');
    
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific submission with evaluation
router.get('/submissions/:id', auth, async (req, res) => {
  try {
    const submission = await PracticeSubmission.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('resourceId');
    
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user practice statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await PracticeSubmission.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
        _id: '$submissionType',
        count: { $sum: 1 },
        completedCount: { 
          $sum: { $cond: [{ $eq: ['$evaluationStatus', 'completed'] }, 1, 0] }
        },
        averageScore: { 
          $avg: '$aiEvaluation.score'
        }
      }}
    ]);
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
