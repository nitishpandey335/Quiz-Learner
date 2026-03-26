import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getQuizById, submitAttempt } from '../../utils/api';
import Loader from '../../components/Loader';

const AttemptQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [current, setCurrent] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime] = useState(Date.now());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getQuizById(id).then(({ data }) => {
            setQuiz(data);
            setAnswers(new Array(data.questions.length).fill(-1));
            setTimeLeft(data.duration * 60);
        }).finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const timeTaken = Math.round((Date.now() - startTime) / 1000);
            const { data } = await submitAttempt({ quizId: id, answers, timeTaken });
            toast.success('Quiz submitted!');
            navigate(`/student/result/${data._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
            setSubmitting(false);
        }
    }, [id, answers, startTime, navigate, submitting]);

    useEffect(() => {
        if (!timeLeft || !quiz) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [quiz, handleSubmit, timeLeft]);

    if (loading) return <Loader />;
    if (!quiz) return <p>Quiz not found</p>;

    const q = quiz.questions[current];
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    const progress = ((current + 1) / quiz.questions.length) * 100;

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.quizTitle}>{quiz.title}</h2>
                    <p style={styles.meta}>{quiz.category} · {quiz.questions.length} questions</p>
                </div>
                <div style={{ ...styles.timer, color: timeLeft < 60 ? '#ef4444' : 'var(--primary)' }}>
                    ⏱ {mins}:{secs}
                </div>
            </div>

            {/* Progress */}
            <div style={styles.progressBar}>
                <motion.div animate={{ width: `${progress}%` }} style={styles.progressFill} />
            </div>
            <p style={styles.progressText}>Question {current + 1} of {quiz.questions.length}</p>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={styles.questionCard}>
                    <div style={styles.diffBadge}>{q.difficulty}</div>
                    <h3 style={styles.questionText}>{q.questionText}</h3>
                    <div style={styles.options}>
                        {q.options.map((opt, oi) => (
                            <motion.button
                                key={oi}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    const updated = [...answers];
                                    updated[current] = oi;
                                    setAnswers(updated);
                                }}
                                style={{
                                    ...styles.option,
                                    background: answers[current] === oi ? 'var(--primary)' : 'var(--bg)',
                                    color: answers[current] === oi ? '#fff' : 'var(--text)',
                                    borderColor: answers[current] === oi ? 'var(--primary)' : 'var(--border)',
                                }}
                            >
                                <span style={styles.optLabel}>{String.fromCharCode(65 + oi)}</span>
                                {opt}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div style={styles.nav}>
                <button onClick={() => setCurrent((c) => c - 1)} disabled={current === 0} style={styles.navBtn}>← Previous</button>
                <div style={styles.dots}>
                    {quiz.questions.map((_, i) => (
                        <button key={i} onClick={() => setCurrent(i)} style={{ ...styles.dot, background: answers[i] !== -1 ? 'var(--primary)' : i === current ? 'var(--secondary)' : 'var(--border)' }} />
                    ))}
                </div>
                {current < quiz.questions.length - 1 ? (
                    <button onClick={() => setCurrent((c) => c + 1)} style={styles.nextBtn}>Next →</button>
                ) : (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting} style={styles.submitBtn}>
                        {submitting ? 'Submitting...' : '✅ Submit Quiz'}
                    </motion.button>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { padding: '2rem 3rem', maxWidth: 800, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
    quizTitle: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' },
    meta: { color: 'var(--text-muted)', fontSize: '0.9rem' },
    timer: { fontSize: '1.5rem', fontWeight: 700, background: 'var(--card)', padding: '0.5rem 1.2rem', borderRadius: '12px', border: '1px solid var(--border)' },
    progressBar: { height: 8, background: 'var(--border)', borderRadius: '20px', overflow: 'hidden', marginBottom: '0.5rem' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '20px' },
    progressText: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' },
    questionCard: { background: 'var(--card)', borderRadius: '20px', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', marginBottom: '2rem' },
    diffBadge: { display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'capitalize' },
    questionText: { fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.5rem', lineHeight: 1.5 },
    options: { display: 'flex', flexDirection: 'column', gap: '0.8rem' },
    option: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem', borderRadius: '12px', border: '2px solid', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', transition: 'all 0.15s' },
    optLabel: { fontWeight: 700, minWidth: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
    navBtn: { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '0.7rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' },
    nextBtn: { background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' },
    submitBtn: { background: '#10b981', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' },
    dots: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' },
    dot: { width: 12, height: 12, borderRadius: '50%', border: 'none', cursor: 'pointer' },
};

export default AttemptQuiz;
