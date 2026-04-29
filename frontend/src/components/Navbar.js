import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, logout, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const navLinks = {
        admin: [
            { to: '/admin', label: 'Dashboard' },
            { to: '/admin/users', label: 'Users' },
            { to: '/admin/analytics', label: 'Analytics' },
            { to: '/admin/timetable', label: '🗓️ Timetable' },
        ],
        teacher: [
            { to: '/teacher', label: 'Dashboard' },
            { to: '/teacher/quizzes', label: 'Quizzes' },
            { to: '/teacher/practice', label: '🎯 Practice' },
            { to: '/teacher/notes', label: 'Notes' },
            { to: '/teacher/coding', label: '💻 Coding' },
            { to: '/teacher/attendance', label: '📋 Attendance' },
            { to: '/teacher/section-results', label: '📊 Results' },
        ],
        student: [
            { to: '/student', label: 'Dashboard' },
            { to: '/student/practice', label: '🎯 Practice' },
            { to: '/student/quizzes', label: 'Quizzes' },
            { to: '/student/notes', label: 'Notes' },
            { to: '/student/coding', label: '💻 Coding' },
            { to: '/student/attendance', label: '📋 Attendance' },
            { to: '/student/analytics', label: 'Analytics' },
        ],
    };

    const links = user ? (navLinks[user.role] || []) : [];

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={styles.nav}
        >
            <Link to="/" style={styles.logo}>
                🧠 Quiz Learner
            </Link>
            <div style={styles.right}>
                <button onClick={toggleTheme} style={styles.iconBtn}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                {user ? (
                    <>
                        {links.map(l => (
                            <Link key={l.to} to={l.to} style={styles.link}>{l.label}</Link>
                        ))}
                        <span style={styles.badge}>{user.role}</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                    </>
                )}
            </div>
        </motion.nav>
    );
};

const styles = {
    nav: {
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem',
        background: 'var(--card)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
    },
    logo: { fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' },
    right: { display: 'flex', alignItems: 'center', gap: '1rem' },
    link: { color: 'var(--text)', fontWeight: 500, fontSize: '0.95rem' },
    badge: {
        background: 'var(--primary)', color: '#fff',
        padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
        textTransform: 'capitalize',
    },
    iconBtn: { background: 'none', border: 'none', fontSize: '1.3rem' },
    logoutBtn: {
        background: 'var(--danger)', color: '#fff', border: 'none',
        padding: '0.4rem 1rem', borderRadius: '8px', fontWeight: 500,
    },
    signupBtn: {
        background: 'var(--primary)', color: '#fff',
        padding: '0.4rem 1.2rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem',
    },
};

export default Navbar;
