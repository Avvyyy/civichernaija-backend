const mongoose = require('mongoose');

const practiceSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionType: { type: String, enum: ['simulation', 'debate', 'policy'], required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticeResource' },
  
  // For simulations
  simulationOption: { type: String }, // borehole-now, school-roof-now, etc.
  simulationReason: { type: String },
  
  // For debates
  debateTopicIndex: { type: Number },
  debateResponse: { type: String },
  timeSpent: { type: Number }, // in seconds
  
  // For policy drafts
  policyTitle: { type: String },
  policyProblem: { type: String },
  policyProposal: { type: String },
  
  // Evaluation
  evaluationStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  evaluationError: { type: String },
  aiEvaluation: {
    score: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    strengths: [{ type: String }],
    areasForImprovement: [{ type: String }],
    suggestedNextSteps: [{ type: String }]
  },
  
  createdAt: { type: Date, default: Date.now },
  evaluatedAt: { type: Date }
});

module.exports = mongoose.model('PracticeSubmission', practiceSubmissionSchema);
