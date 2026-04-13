import React, { useContext, useState } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit } from 'react-icons/fa';

const Categories = () => {
    const { categories, fetchData, loading } = useContext(ExpenseContext);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', icon: '🌟', color: '#6c63ff', type: 'expense' });

    const handleOpenModal = (c = null) => {
        if (c) {
            setFormData({ id: c.id, name: c.name, icon: c.icon, color: c.color, type: c.type });
        } else {
            setFormData({ id: null, name: '', icon: '🌟', color: '#6c63ff', type: 'expense' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await api.put(`/categories/${formData.id}`, formData);
                toast.success('Category updated!');
            } else {
                await api.post('/categories', formData);
                toast.success('Category created!');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure? This might fail if there are transactions linked to it!')) {
            try {
                await api.delete(`/categories/${id}`);
                toast.success('Category deleted');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting category');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    return (
        <div className="p-4 fade-in pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0 mt-2 text-main">Categories</h2>
                <button onClick={() => handleOpenModal()} className="btn btn-primary-gradient rounded-pill px-4 shadow-sm fw-bold">
                    + New Category
                </button>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="glass-card p-4">
                        <h4 className="mb-4 text-expense fw-bold">Expense Categories</h4>
                        <div className="d-flex flex-wrap gap-2">
                            {expenseCategories.map(c => (
                                <div key={c.id} className="badge rounded-pill p-3 d-flex align-items-center gap-2" style={{ backgroundColor: `${c.color}22`, color: c.color, fontSize: '14px', border: `1px solid ${c.color}44` }}>
                                    <span style={{ fontSize: '18px' }}>{c.icon}</span> 
                                    {c.name}
                                    <div className="ms-2 border-start ps-2 border-secondary d-flex gap-2">
                                        <FaEdit className="cursor-pointer text-main opacity-50 hover-opacity-100" onClick={() => handleOpenModal(c)} style={{ cursor: 'pointer' }} />
                                        {c.user_id && <FaTrash className="cursor-pointer text-danger opacity-50 hover-opacity-100" onClick={() => handleDelete(c.id)} style={{ cursor: 'pointer' }} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="glass-card p-4">
                        <h4 className="mb-4 text-income fw-bold">Income Categories</h4>
                        <div className="d-flex flex-wrap gap-2">
                            {incomeCategories.map(c => (
                                <div key={c.id} className="badge rounded-pill p-3 d-flex align-items-center gap-2" style={{ backgroundColor: `${c.color}22`, color: c.color, fontSize: '14px', border: `1px solid ${c.color}44` }}>
                                    <span style={{ fontSize: '18px' }}>{c.icon}</span> 
                                    {c.name}
                                    <div className="ms-2 border-start ps-2 border-secondary d-flex gap-2">
                                        <FaEdit className="cursor-pointer text-main opacity-50 hover-opacity-100" onClick={() => handleOpenModal(c)} style={{ cursor: 'pointer' }} />
                                        {c.user_id && <FaTrash className="cursor-pointer text-danger opacity-50 hover-opacity-100" onClick={() => handleDelete(c.id)} style={{ cursor: 'pointer' }} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 fade-in m-3 w-100" style={{ maxWidth: '400px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0 text-main">{formData.id ? 'Edit Category' : 'Add Category'}</h4>
                            <button onClick={() => setShowModal(false)} className="btn-close btn-close-white" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-muted">Type</label>
                                <select className="form-select" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted">Name</label>
                                <input type="text" required className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Pets" />
                            </div>
                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <label className="form-label text-muted">Icon (Emoji)</label>
                                    <input type="text" maxLength="2" required className="form-control" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} placeholder="🐕" />
                                </div>
                                <div className="col-6">
                                    <label className="form-label text-muted">Color</label>
                                    <input type="color" className="form-control form-control-color w-100" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary-gradient px-4">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
