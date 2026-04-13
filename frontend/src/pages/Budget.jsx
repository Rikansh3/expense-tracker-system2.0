import React, { useContext, useState, useEffect } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit } from 'react-icons/fa';

const Budget = () => {
    const { budgets, categories, fetchData, loading } = useContext(ExpenseContext);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ category_id: '', amount: '' });

    const handleOpenModal = () => {
        setFormData({ category_id: '', amount: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budgets', { ...formData, month, year });
            toast.success('Budget saved!');
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving budget');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Delete this budget?')) {
            try {
                await api.delete(`/budgets/${id}`);
                toast.success('Budget deleted');
                fetchData();
            } catch (error) {
                toast.error('Error deleting budget');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    const currentBudgets = budgets.filter(b => b.month === parseInt(month) && b.year === parseInt(year));
    const totalBudget = currentBudgets.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const totalSpent = currentBudgets.reduce((acc, curr) => acc + (parseFloat(curr.spent) || 0), 0);
    const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <div className="p-4 fade-in pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0 mt-2 text-main">Budget Manager</h2>
                <div className="d-flex gap-3">
                    <select className="form-select bg-transparent text-main" style={{ width: '120px' }} value={month} onChange={(e) => setMonth(e.target.value)}>
                        {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1} className="text-dark">{new Date(0, i).toLocaleString('en', {month: 'long'})}</option>)}
                    </select>
                    <select className="form-select bg-transparent text-main" style={{ width: '100px' }} value={year} onChange={(e) => setYear(e.target.value)}>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="text-dark">{y}</option>)}
                    </select>
                    <button onClick={handleOpenModal} className="btn btn-primary-gradient rounded-pill px-4 shadow-sm fw-bold">
                        + Set Budget
                    </button>
                </div>
            </div>

            <div className="glass-card p-4 mb-4 text-center">
                <h5 className="text-muted mb-3">Overall Budget Progress</h5>
                <div className="progress mb-3" style={{ height: '30px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <div 
                        className={`progress-bar progress-bar-striped progress-bar-animated ${totalProgress > 90 ? 'bg-danger' : totalProgress > 75 ? 'bg-warning' : 'bg-success'}`}
                        role="progressbar" 
                        style={{ width: `${Math.min(totalProgress, 100)}%` }}
                    >
                        {totalProgress.toFixed(1)}%
                    </div>
                </div>
                <div className="d-flex justify-content-around fw-bold">
                    <span>Spent: <span className="text-expense">₹{totalSpent.toFixed(2)}</span></span>
                    <span>Total Limit: <span className="text-primary">₹{totalBudget.toFixed(2)}</span></span>
                </div>
            </div>

            <div className="row g-4">
                {currentBudgets.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted glass-card">No budgets set for this month.</div>
                ) : currentBudgets.map(b => {
                    const spent = parseFloat(b.spent) || 0;
                    const amount = parseFloat(b.amount);
                    const progress = (spent / amount) * 100;
                    const isDanger = progress >= 80;

                    return (
                        <div key={b.id} className="col-md-6 col-xl-4">
                            <div className={`glass-card p-4 h-100 position-relative border border-${isDanger ? 'danger' : 'glass-border'}`}>
                                <button onClick={() => handleDelete(b.id)} className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 m-3 p-0" title="Delete Budget">
                                    <FaTrash />
                                </button>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{ backgroundColor: `${b.color}22`, color: b.color, width: '40px', height: '40px' }}>
                                        {categories.find(c => c.id === b.category_id)?.icon || '📁'}
                                    </div>
                                    <h5 className="m-0 fw-bold">{b.category_name}</h5>
                                </div>
                                <div className="d-flex justify-content-between mb-2 text-sm">
                                    <span className="text-muted">Spent: ₹{spent.toFixed(2)}</span>
                                    <span className="fw-bold">of ₹{amount.toFixed(2)}</span>
                                </div>
                                <div className="progress" style={{ height: '10px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                    <div 
                                        className={`progress-bar ${isDanger ? 'bg-danger' : 'bg-primary'}`} 
                                        role="progressbar" 
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                                </div>
                                {isDanger && <small className="text-danger d-block mt-2">Warning: Approaching or exceeding limit!</small>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card p-4 fade-in m-3 w-100" style={{ maxWidth: '400px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0 text-main">Set Category Budget</h4>
                            <button onClick={() => setShowModal(false)} className="btn-close btn-close-white" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-muted">Category</label>
                                <select className="form-select" required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
                                    <option value="" disabled>Select Expense Category</option>
                                    {categories.filter(c => c.type === 'expense').map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-muted">Amount Limit (₹)</label>
                                <input type="number" step="0.01" min="1" required className="form-control" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="500.00" />
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

export default Budget;
