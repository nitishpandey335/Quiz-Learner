import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAttemptById } from '../../utils/api';
import Loader from '../../components/Loader';

const levelColors = { excellent: '#10b981', good: '#6366f1', average: '#f59e0b', poor: '#ef4444' };
const levelEmoji = { excellent: '🏆', good: '👍', average: '📈', poor: '💪' };

const ResultPage = () => {
    const { id } = useParams();
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAttemptById(id).then(({ data }) => setAttempt(data)).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Loader />;
    if (!attempt) return <p>Result not found</p>;

    const quiz = attempt.quizId;
    const color = levelColors[attempt.performanceLevel] || '#6366f1';

    return (
        <div style={styles.page}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.scoreCard}>
                <div style={{ fontSize: '4rem' }}>{levelEmoji[attempt.performanceLevel]}</div>
                <h1 style={styles.scoreTitle}>Quiz Complete!</h1>
                <div style={{ ...styles.scoreBig, color }}>{attempt.score}%</div>
                <p style={styles.scoreLabel}>{attempt.correctAnswers} / {attempt.totalQuestions} correct</p>
                <span style={{ ...styles.levelBadge, background: color + '20', color }}>{attempt.performanceLevel}</span>
            </motion.div>

            {/* AI Feedback */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={styles.feedbackCard}>
                <h2 style={styles.feedbackTitle}>🤖 AI Feedback</h2>
                <p style={styles.feedbackText}>{attempt.aiFeedback}</p>
                {attempt.weakTopics?.length > 0 && (
                    <div style={styles.weakTopics}>
                        <strong>Weak areas to review:</strong>
                        <div style={styles.topicsList}>
                            {attempt.weakTopics.map((t, i) => (
                                <span key={i} style={styles.topicBadge}>{t}</span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Question Review */}
            {quiz?.questions && (
                <div style={styles.reviewSection}>
                    <h2 style={styles.reviewTitle}>Question Review</h2>
                    {quiz.questions.map((q, i) => {
                        const selected = attempt.answers[i];
                        const isCorrect = selected === q.correctAnswer;
                        return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ ...styles.reviewCard, borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}` }}>
                                <div style={styles.reviewHeader}>
                                    <span style={styles.qNum}>Q{i + 1}</span>
                                    <span style={{ color: isCorrect ? '#10b981' : '#ef4444', fontWeight: 600 }}>{isCorrect ? '✅ Correct' : '❌ Wrong'}</span>
                                </div>
                                <p style={styles.qText}>{q.questionText}</p>
                                <div style={styles.optReview}>
                                    {q.options.map((opt, oi) => (
                                        <div key={oi} style={{ ...styles.optItem, background: oi === q.correctAnswer ? '#10b98120' : oi === selected && !isCorrect ? '#ef444420' : 'transparent', color: oi === q.correctAnswer ? '#10b981' : oi === selected && !isCorrect ? '#ef4444' : 'var(--text)' }}>
                                            {oi === q.correctAnswer ? '✅' : oi === selected ? '❌' : '○'} {opt}
                                        </div>
                                    ))}
                                </div>
                                {q.explanation && <p style={styles.explanation}>💡 {q.explanation}</p>}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <div style={styles.actions}>
                <Link to="/student/quizzes" style={styles.primaryBtn}>Browse More Quizzes</Link>
                <Link to="/student" style={styles.outlineBtn}>Dashboard</Link>
                <Link to="/student/analytics" style={styles.outlineBtn}>My Analytics</Link>
            </div>
        </div>
    );
};

const styles = {
    page: { padding: '2rem 3rem', maxWidth: 800, margin: '0 auto' },
    scoreCard: { background: 'var(--card)', borderRadius: '24px', padding: '3rem', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', marginBottom: '2rem' },
    scoreTitle: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', margin: '0.5rem 0' },
    scoreBig: { fontSize: '4rem', fontWeight: 800, lineHeight: 1 },
    scoreLabel: { color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1rem' },
    levelBadge: { padding: '0.4rem 1.2rem', borderRadius: '20px', fontWeight: 700, textTransform: 'capitalize', fontSize: '0.9rem' },
    feedbackCard: { background: 'linear-gradient(135deg, #6366f110, #06b6d410)', borderRadius: '20px', padding: '2rem', border: '1px solid var(--primary)', marginBottom: '2rem' },
    feedbackTitle: { fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text)' },
    feedbackText: { color: 'var(--text)', lineHeight: 1.7, marginBottom: '1rem' },
    weakTopics: { marginTop: '1rem' },
    topicsList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' },
    topicBadge: { background: '#ef444420', color: '#ef4444', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 },
    reviewSection: { marginBottom: '2rem' },
    reviewTitle: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' },
    reviewCard: { background: 'var(--card)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid var(--border)' },
    reviewHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' },
    qNum: { fontWeight: 700, color: 'var(--primary)' },
    qText: { fontWeight: 600, color: 'var(--text)', marginBottom: '1rem', lineHeight: 1.5 },
    optReview: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    optItem: { padding: '0.5rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem' },
    explanation: { marginTop: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px' },
    actions: { display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' },
    primaryBtn: { background: 'var(--primary)', color: '#fff', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 600 },
    outlineBtn: { border: '2px solid var(--primary)', color: 'var(--primary)', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 600 },
};

export default ResultPage;
