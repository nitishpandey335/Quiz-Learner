const express = require('express');
const router = express.Router();
const { generateQuestions, suggestSubject, analyzePerformance } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-questions', protect, generateQuestions);
router.post('/suggest-subject', protect, suggestSubject);
router.post('/analyze-performance', protect, analyzePerformance);

module.exports = router;
