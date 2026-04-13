import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit, FaUserSlash } from 'react-icons/fa';

const AdminUsers = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch users');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('confirmDelete'))) {
            try {
                await api.delete(`/admin/users/${id}`);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                console.error("DELETE_ERR:", error);
                toast.error(error.response?.data?.message || 'Delete failed');
            }
        }
    };

    const handleEdit = (u) => {
        setEditUser(u);
        setFormData({ name: u.name, email: u.email, role: u.role });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${editUser.id}`, formData);
            toast.success('User updated successfully');
            setEditUser(null);
            fetchUsers();
        } catch (error) {
            console.error("UPDATE_ERR:", error);
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return <div className="p-4 text-center text-main">Loading users...</div>;

    return (
        <div className="p-4 fade-in">
            <h2 className="fw-bold mb-4 text-main">{t('userManagement')}</h2>

            <div className="glass-card p-4">
                <div className="table-responsive">
                    <table className="table table-borderless table-glass text-main align-middle mb-0">
                        <thead style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <tr>
                                <th className="text-primary small fw-bold text-uppercase pb-3">{t('name')}</th>
                                <th className="text-primary small fw-bold text-uppercase pb-3">{t('email')}</th>
                                <th className="text-primary small fw-bold text-uppercase pb-3">{t('role')}</th>
                                <th className="text-primary small fw-bold text-uppercase pb-3 text-center">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary-gradient me-3 d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '40px', height: '40px' }}>
                                                {u.name?.charAt(0) || '?'}
                                            </div>
                                            <span className="fw-bold">{u.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="text-main opacity-75">{u.email}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 text-uppercase ${u.role === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <button onClick={() => handleEdit(u)} className="btn btn-sm btn-link text-info me-3"><FaEdit /></button>
                                        {u.id !== currentUser?.id && (
                                            <button onClick={() => handleDelete(u.id)} className="btn btn-sm btn-link text-danger"><FaTrash /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editUser && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 fade-in m-3 w-100" style={{ maxWidth: '400px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0 text-main">{t('editUser')}</h4>
                            <button onClick={() => setEditUser(null)} className="btn-close btn-close-white"></button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-3">
                                <label className="form-label text-muted">{t('name')}</label>
                                <input type="text" className="form-control" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted">{t('email')}</label>
                                <input type="email" className="form-control" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-muted">{t('role')}</label>
                                <select className="form-select" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setEditUser(null)} className="btn btn-outline-secondary">{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary-gradient px-4">{t('save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
