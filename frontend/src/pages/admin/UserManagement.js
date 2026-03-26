import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAllUsers, deleteUser, updateUser } from '../../utils/api';
import Loader from '../../components/Loader';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchUsers = () => {
        getAllUsers()
            .then(({ data }) => setUsers(data))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await deleteUser(id);
            toast.success('User deleted');
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch { toast.error('Delete failed'); }
    };

    const handleToggleActive = async (user) => {
        try {
            const { data } = await updateUser(user._id, { isActive: !user.isActive });
            setUsers((prev) => prev.map((u) => (u._id === data._id ? data : u)));
            toast.success('User updated');
        } catch { toast.error('Update failed'); }
    };

    const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter);

    if (loading) return <Loader />;

    return (
        <div style={styles.page}>
            <h1 style={styles.title}>User Management</h1>
            <div style={styles.filters}>
                {['all', 'student', 'teacher', 'admin'].map((r) => (
                    <button key={r} onClick={() => setFilter(r)} style={{ ...styles.filterBtn, background: filter === r ? 'var(--primary)' : 'var(--card)', color: filter === r ? '#fff' : 'var(--text)' }}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                ))}
            </div>
            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.thead}>
                            <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((u) => (
                            <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.row}>
                                <td style={styles.td}>{u.name}</td>
                                <td style={styles.td}>{u.email}</td>
                                <td style={styles.td}><span style={{ ...styles.badge, background: u.role === 'admin' ? '#ef4444' : u.role === 'teacher' ? '#f59e0b' : '#10b981' }}>{u.role}</span></td>
                                <td style={styles.td}><span style={{ color: u.isActive ? '#10b981' : '#ef4444', fontWeight: 600 }}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td style={styles.td}>
                                    {u.email === 'nitishkumarpandey05@gmail.com' ? (
                                        <span style={styles.protectedBadge}>🔒 Protected</span>
                                    ) : (
                                        <>
                                            <button onClick={() => handleToggleActive(u)} style={styles.actionBtn}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                                            <button onClick={() => handleDelete(u._id)} style={{ ...styles.actionBtn, background: '#ef444420', color: '#ef4444' }}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    page: { padding: '2rem 3rem', maxWidth: 1200, margin: '0 auto' },
    title: { fontSize: '2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem' },
    filters: { display: 'flex', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    filterBtn: { padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid var(--border)', fontWeight: 500, cursor: 'pointer' },
    tableWrap: { overflowX: 'auto', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: 'var(--primary)', color: '#fff' },
    row: { borderBottom: '1px solid var(--border)' },
    td: { padding: '1rem 1.2rem', color: 'var(--text)', fontSize: '0.9rem' },
    badge: { color: '#fff', padding: '0.2rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 },
    actionBtn: { background: '#6366f120', color: 'var(--primary)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '8px', marginRight: '0.5rem', fontWeight: 500, cursor: 'pointer', fontSize: '0.8rem' },
    protectedBadge: { background: '#6366f120', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 },
};

export default UserManagement;
