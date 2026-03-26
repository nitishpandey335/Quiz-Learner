const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = () => genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// POST /api/ai/generate-questions
const generateQuestions = async (req, res) => {
    try {
        const { topic, count = 5, difficulty = 'medium' } = req.body;
        if (!topic?.trim()) return res.status(400).json({ message: 'Topic is required' });

        const prompt = `Generate exactly ${count} multiple choice questions on the topic: "${topic}".
Difficulty level: ${difficulty}.

Return ONLY a valid JSON array, no extra text, no markdown:
[
  {
    "questionText": "Question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation.",
    "difficulty": "${difficulty}"
  }
]

Rules:
- correctAnswer is the index (0-3) of the correct option
- All 4 options must be distinct and plausible
- Return only the JSON array, nothing else`;

        const model = getModel();
        const result = await model.generateContent(prompt);
        const raw = result.response.text().trim();

        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (!jsonMatch) return res.status(500).json({ message: 'AI returned invalid format' });

        const questions = JSON.parse(jsonMatch[0]);
        res.json({ questions, topic, generated: questions.length });
    } catch (err) {
        console.error('Gemini error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// POST /api/ai/suggest-subject
const suggestSubject = async (req, res) => {
    try {
        const { title, category } = req.body;
        const prompt = `Given a quiz titled "${title}" in category "${category}", suggest a specific subject name (2-4 words max). Return ONLY the subject name, nothing else.`;

        const model = getModel();
        const result = await model.generateContent(prompt);
        const subject = result.response.text().trim().replace(/['"]/g, '');
        res.json({ subject });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/ai/analyze-performance
const analyzePerformance = async (req, res) => {
    try {
        const { score, totalQuestions, weakTopics, category } = req.body;
        const pct = ((score / totalQuestions) * 100).toFixed(1);

        const prompt = `A student scored ${score}/${totalQuestions} (${pct}%) in a ${category || 'general'} quiz.
Weak topics: ${weakTopics?.length ? weakTopics.join(', ') : 'none'}.
Give a short encouraging 2-3 sentence personalized feedback with specific improvement tips.`;

        const model = getModel();
        const result = await model.generateContent(prompt);
        const feedback = result.response.text().trim();
        const level = pct >= 85 ? 'excellent' : pct >= 65 ? 'good' : pct >= 40 ? 'average' : 'poor';

        res.json({ score: pct, level, feedback, message: `You answered ${score} out of ${totalQuestions} correctly.` });
    } catch (err) {
        const pct = ((req.body.score / req.body.totalQuestions) * 100).toFixed(1);
        const level = pct >= 85 ? 'excellent' : pct >= 65 ? 'good' : pct >= 40 ? 'average' : 'poor';
        res.json({ score: pct, level, feedback: `You scored ${pct}%. Keep practicing to improve!`, message: '' });
    }
};

module.exports = { generateQuestions, suggestSubject, analyzePerformance };
