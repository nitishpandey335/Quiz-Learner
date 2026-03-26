const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

const generateAIFeedback = (score, total, weakTopics) => {
    const pct = (score / total) * 100;
    let level = 'average';
    let feedback = '';
    if (pct >= 85) {
        level = 'excellent';
        feedback = `Outstanding! You scored ${pct.toFixed(0)}%. Keep challenging yourself with harder topics.`;
    } else if (pct >= 65) {
        level = 'good';
        feedback = `Good job! You scored ${pct.toFixed(0)}%. Review missed questions to strengthen understanding.`;
    } else if (pct >= 40) {
        level = 'average';
        feedback = `You scored ${pct.toFixed(0)}%. Focus on weak areas${weakTopics.length ? ': ' + weakTopics.join(', ') : ''}. Practice more.`;
    } else {
        level = 'poor';
        feedback = `You scored ${pct.toFixed(0)}%. Revisit fundamentals${weakTopics.length ? ' especially: ' + weakTopics.join(', ') : ''} and try again.`;
    }
    return { feedback, level };
};

const submitAttempt = async (req, res) => {
    try {
        const { quizId, answers, timeTaken } = req.body;
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let correct = 0;
        const weakTopics = [];
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) {
                correct++;
            } else if (q.difficulty !== 'easy') {
                weakTopics.push(q.questionText.substring(0, 40));
            }
        });

        const score = Math.round((correct / quiz.questions.length) * 100);
        const { feedback, level } = generateAIFeedback(correct, quiz.questions.length, weakTopics);

        const attempt = await Attempt.create({
            studentId: req.user._id,
            quizId,
            answers,
            score,
            totalQuestions: quiz.questions.length,
            correctAnswers: correct,
            timeTaken,
            aiFeedback: feedback,
            weakTopics,
            performanceLevel: level,
        });

        await Quiz.findByIdAndUpdate(quizId, { $inc: { totalAttempts: 1 } });
        res.status(201).json(attempt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMyAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ studentId: req.user._id })
            .populate('quizId', 'title category difficulty')
            .select('quizId score correctAnswers totalQuestions performanceLevel createdAt')
            .sort({ createdAt: -1 })
            .lean();
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMyAnalytics = async (req, res) => {
    try {
        const attempts = await Attempt.find({ studentId: req.user._id }).populate('quizId', 'title category');
        const totalAttempts = attempts.length;
        const avgScore = totalAttempts ? attempts.reduce((a, b) => a + b.score, 0) / totalAttempts : 0;
        const categoryMap = {};
        attempts.forEach((a) => {
            const cat = a.quizId?.category || 'Unknown';
            if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
            categoryMap[cat].total += a.score;
            categoryMap[cat].count++;
        });
        const categoryStats = Object.entries(categoryMap).map(([cat, v]) => ({
            category: cat,
            avgScore: (v.total / v.count).toFixed(1),
        }));
        res.json({ totalAttempts, avgScore: avgScore.toFixed(1), categoryStats, attempts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getAttemptById = async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id).populate('quizId');
        res.json(attempt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { submitAttempt, getMyAttempts, getMyAnalytics, getAttemptById };
