import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPublishedQuizzes } from '../../utils/api';
import Loader from '../../components/Loader';

const BrowseQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: '', difficulty: '' });

    const fetchQuizzes = () => {
        setLoading(true);
        getPublishedQuizzes(filter)
            .then(({ data }) => setQuizzes(data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchQuizzes(); }, [filter]);

    const categories = [...new Set(quizzes.map((q) => q.category))];

    return (
        <div style={styles.page}>
            <h1 style={styles.title}>Browse Quizzes</h1>
            <div style={styles.filters}>
                <select style={styles.select} value={filter.difficulty} onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}>
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <select style={styles.select} value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
                    <option value="">All Categories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {loading ? <Loader /> : (
                <div style={styles.grid}>
                    {quizzes.map((q) => (
                        <motion.div key={q._id} whileHover={{ y: -6 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
                            <div style={styles.cardTop}>
                                <span style={styles.category}>{q.category}</span>
                                <span style={{ ...styles.diff, color: q.difficulty === 'easy' ? '#10b981' : q.difficulty === 'medium' ? '#f59e0b' : '#ef4444' }}>{q.difficulty}</span>
                            </div>
                            <h3 style={styles.quizTitle}>{q.title}</h3>
                            <p style={styles.desc}>{q.description || 'Test your knowledge with this quiz.'}</p>
                            <div style={styles.meta}>
                                <span>📝 {q.questionCount ?? q.questions?.length ?? 0} questions</span>
                                <span>⏱ {q.duration} min</span>
                                <span>🏆 {q.totalAttempts} attempts</span>
                            </div>
                            <p style={styles.teacher}>By {q.teacherId?.name || 'Teacher'}</p>
                            <Link to={`/student/attempt/${q._id}`} style={styles.startBtn}>Start Quiz →</Link>
                        </motion.div>
                    ))}
                    {quizzes.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No quizzes available.</p>}
                </div>
            )}
        </div>
    );
};

const styles = {
    page: { padding: '2rem 3rem', maxWidth: 1200, margin: '0 auto' },
    title: { fontSize: '2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' },
    filters: { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
    select: { padding: '0.7rem 1rem', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontSize: '0.9rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
    card: { background: 'var(--card)', borderRadius: '20px', padding: '1.8rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' },
    cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' },
    category: { background: 'var(--primary)', color: '#fff', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
    diff: { fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' },
    quizTitle: { fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' },
    desc: { fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 },
    meta: { display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', flexWrap: 'wrap' },
    teacher: { fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.2rem' },
    startBtn: { display: 'block', background: 'var(--primary)', color: '#fff', padding: '0.7rem', borderRadius: '10px', fontWeight: 600, textAlign: 'center' },
};

export default BrowseQuizzes;
