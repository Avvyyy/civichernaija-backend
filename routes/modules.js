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
      const moduleDoc = await Module.findById(req.params.id);
      if (!moduleDoc) return res.status(404).json({ message: 'Module not found' });
      
      const module = moduleDoc.toObject();
      const user = await User.findById(req.user.id);
      
      // Look for a previous quiz result
      const pastResult = user.quizResults ? user.quizResults.find(r => r.moduleId.toString() === req.params.id) : null;
      
      // Security measure: if they haven't taken the quiz, strip the correct answer
      if (!pastResult && module.quiz) {
        module.quiz.forEach(q => {
          delete q.correctAnswerIndex;
        });
      }
      
      // Return both the module and their past result if any
      res.json({ module, pastResult });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
});

// Submit and mark quiz
router.post('/:id/quiz', auth, async (req, res) => {
    try {
      const { answers } = req.body; // Array of selected indices, e.g. [0, 2, 1]
      const module = await Module.findById(req.params.id);
      if (!module) return res.status(404).json({ message: 'Module not found' });
      
      let score = 0;
      const evaluatedAnswers = [];
      
      module.quiz.forEach((q, index) => {
        const selectedOptionIndex = answers[index];
        const isCorrect = selectedOptionIndex === q.correctAnswerIndex;
        if (isCorrect) score++;
        
        evaluatedAnswers.push({
          questionIndex: index,
          selectedOptionIndex: selectedOptionIndex !== undefined ? selectedOptionIndex : -1,
          isCorrect,
          correctAnswerIndex: q.correctAnswerIndex
        });
      });
      
      const user = await User.findById(req.user.id);
      
      if (!user.quizResults) {
        user.quizResults = [];
      }
      
      const existingResultIndex = user.quizResults.findIndex(r => r.moduleId.toString() === req.params.id);
      
      const resultObj = {
        moduleId: req.params.id,
        score,
        totalQuestions: module.quiz.length,
        answers: evaluatedAnswers,
        completedAt: Date.now()
      };
      
      if (existingResultIndex !== -1) {
        user.quizResults[existingResultIndex] = resultObj;
      } else {
        user.quizResults.push(resultObj);
      }
      
      // Update completion stats if perfect score
      // if (score === module.quiz.length && !user.completedModules.includes(req.params.id))
      // It depends on your policy if a perfect score is required to "complete" the module.
      
      await user.save();
      
      res.json({ message: 'Quiz graded successfully', result: resultObj });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
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
