const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Simple JWT Auth for MVP
  age: { type: Number },
  state: { type: String },
  interests: [{ type: String }],
  completedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  quizResults: [
    {
      moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
      score: { type: Number },
      totalQuestions: { type: Number },
      answers: [
        {
          questionIndex: { type: Number },
          selectedOptionIndex: { type: Number },
          isCorrect: { type: Boolean },
          correctAnswerIndex: { type: Number }
        }
      ],
      completedAt: { type: Date, default: Date.now }
    }
  ],
  badges: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
