const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String },
  quiz: [
    {
      question: { type: String },
      options: [{ type: String }],
      correctAnswerIndex: { type: Number }
    }
  ],
  simulationPrompt: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Module', moduleSchema);
