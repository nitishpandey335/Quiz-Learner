const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }, // index of correct option
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
});

const quizSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        category: { type: String, required: true },
        subject: { type: String, default: '' },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        questions: [questionSchema],
        duration: { type: Number, default: 30 }, // minutes
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
        isPublished: { type: Boolean, default: false },
        totalAttempts: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
