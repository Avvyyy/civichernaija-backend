const mongoose = require('mongoose');

const practiceResourceSchema = new mongoose.Schema({
  resourceType: { type: String, enum: ['simulation', 'debateTopic', 'policyGuidance'], required: true },
  
  // For simulations
  simulationScenario: { type: String },
  simulationContext: { type: String }, // background info
  simulationOptions: [
    {
      id: { type: String },
      title: { type: String },
      description: { type: String }
    }
  ],
  simulationEvaluationCriteria: { type: String }, // guidance for AI evaluation
  
  // For debate topics
  debateTopic: { type: String },
  debateContext: { type: String },
  debateTimeLimit: { type: Number, default: 120 }, // in seconds
  debateEvaluationCriteria: { type: String },
  
  // For policy guidance
  policyGuidanceTitle: { type: String },
  policyGuidanceContent: { type: String },
  policyCriteria: { type: String },
  
  // Common fields
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  category: { type: String }, // e.g., 'budget-allocation', 'governance', 'gender-equality'
  description: { type: String },
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PracticeResource', practiceResourceSchema);
