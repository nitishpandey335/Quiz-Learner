import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await loginUser(form);
            login(data);
            toast.success(`Welcome back, ${data.name}!`);
            const path = data.role === 'admin' ? '/admin' : data.role === 'teacher' ? '/teacher' : '/student';
            navigate(path);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
                <div style={styles.logo}>🧠</div>
                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.sub}>Login to your Quiz Learner account</p>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input style={styles.input} type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    <input style={styles.input} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    <motion.button whileTap={{ scale: 0.97 }} type="submit" style={styles.btn} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </motion.button>
                </form>
                <p style={styles.footer}>Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</Link></p>
            </motion.div>
        </div>
    );
};

const styles = {
    wrapper: { minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f115, #06b6d415)', padding: '2rem' },
    card: { background: 'var(--card)', borderRadius: '24px', padding: '3rem 2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(99,102,241,0.15)', border: '1px solid var(--border)', textAlign: 'center' },
    logo: { fontSize: '3rem', marginBottom: '1rem' },
    title: { fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' },
    sub: { color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    input: { padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '1rem' },
    btn: { background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem' },
    footer: { marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' },
};

export default Login;
