import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ExpenseContext } from '../context/ExpenseContext';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaTrash, FaEdit, FaImage, FaArrowUp } from 'react-icons/fa';
import { LanguageContext } from '../context/LanguageContext';

const Transactions = () => {
    const { transactions, categories, loading, deleteTransaction, addTransaction, updateTransaction } = useContext(ExpenseContext);
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [showScroll, setShowScroll] = useState(false);
    const [formData, setFormData] = useState({
        id: null, title: '', amount: '', type: 'expense', category_id: '', date: new Date().toISOString().split('T')[0], note: '', payment_method: '', receipt: null, receipt_url: null
    });

    useEffect(() => {
        if (location.state?.openModal) {
            handleOpenModal();
            // Clear the state so it doesn't re-open on refresh or navigation back
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScroll && window.pageYOffset > 400) {
                setShowScroll(true);
            } else if (showScroll && window.pageYOffset <= 400) {
                setShowScroll(false);
            }
        };
        window.addEventListener('scroll', checkScrollTop);
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [showScroll]);

    const scrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        // We might want to re-fetch or filter if needed
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: user?.currency || 'INR' }).format(amount);
    };

    const handleOpenModal = (t = null) => {
        if (t) {
            setFormData({
                id: t.id, title: t.title, amount: t.amount, type: t.type, category_id: t.category_id, date: new Date(t.date).toISOString().split('T')[0], note: t.note || '', payment_method: t.payment_method || '', receipt: null,
                receipt_url: t.receipt_image ? `http://localhost:5000/uploads/${t.receipt_image}` : null
            });
        } else {
            setFormData({
                id: null, title: '', amount: '', type: 'expense', category_id: '', date: new Date().toISOString().split('T')[0], note: '', payment_method: '', receipt: null, receipt_url: null
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fData = new FormData();
        fData.append('title', formData.title);
        fData.append('amount', formData.amount);
        fData.append('type', formData.type);
        fData.append('category_id', formData.category_id);
        fData.append('date', formData.date);
        fData.append('note', formData.note);
        fData.append('payment_method', formData.payment_method);
        if (formData.receipt) {
            fData.append('receipt_image', formData.receipt);
        }

        try {
            if (formData.id) {
                await updateTransaction(formData.id, fData);
                toast.success('Transaction updated!');
            } else {
                await addTransaction(fData);
                toast.success('Transaction added!');
            }
            setShowModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving transaction');
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteTransaction(id);
                toast.success('Transaction deleted');
            } catch (error) {
                toast.error('Error deleting transaction');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-4 fade-in pb-5 relative">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0 mt-2 text-main">Transactions</h2>
                <button onClick={() => handleOpenModal()} className="btn btn-primary-gradient rounded-pill px-4 shadow-sm fw-bold">
                    + Add New
                </button>
            </div>

            <div className="glass-card p-4">
                <div className="table-responsive">
                    <table className="table table-borderless table-hover text-main align-middle mb-0">
                        <thead style={{ borderBottom: '1px solid var(--glass-border)' }}>
                            <tr>
                                <th className="text-muted fw-normal pb-3">Date</th>
                                <th className="text-muted fw-normal pb-3">Title</th>
                                <th className="text-muted fw-normal pb-3">Category</th>
                                <th className="text-muted fw-normal pb-3 text-end">Amount</th>
                                <th className="text-muted fw-normal pb-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">No transactions found.</td></tr>
                            ) : transactions.map(t => {
                                const cat = categories.find(c => c.id === t.category_id);
                                return (
                                    <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td className="py-3 text-muted">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="py-3 fw-medium">
                                            {t.title}
                                            {t.receipt_image && <FaImage className="ms-2 text-info" title="Has receipt" />}
                                        </td>
                                        <td className="py-3">
                                            {cat && <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: `${cat.color}33`, color: cat.color }}>
                                                {cat.icon} {cat.name}
                                            </span>}
                                        </td>
                                        <td className={`py-3 fw-bold text-end ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </td>
                                        <td className="py-3 mb-0 text-center">
                                            <button onClick={() => handleOpenModal(t)} className="btn btn-sm btn-link text-info p-0 me-3"><FaEdit /></button>
                                            <button onClick={() => handleDelete(t.id)} className="btn btn-sm btn-link text-danger p-0"><FaTrash /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Float quick add btn for mobile/bottom */}
            <button 
                onClick={() => handleOpenModal()} 
                className="btn btn-primary-gradient rounded-circle shadow-lg position-fixed d-md-none" 
                style={{ bottom: '30px', right: '30px', width: '60px', height: '60px', fontSize: '24px', zIndex: 1000 }}
            >
                +
            </button>

            {/* Simple Modal overlay since Bootstrap's native Modal needs JS init which can be tricky in pure React without react-bootstrap which we added but let's implement pure CSS/component modal for glassmorphism styling */}
            {showModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050, backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card p-4 fade-in m-3 w-100 shadow-lg" style={{ maxWidth: '600px', maxHeight: '95vh', overflowY: 'auto', background: '#1a1a2e', border: '1px solid var(--primary)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0 text-main">{formData.id ? 'Edit Transaction' : 'Add Transaction'}</h4>
                            <button onClick={() => setShowModal(false)} className="btn-close btn-close-white" aria-label="Close"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label text-main fw-bold">{t('type')}</label>
                                    <select className="form-select" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-main fw-bold">{t('category')}</label>
                                    <select className="form-select" required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
                                        <option value="" disabled>{(categories && categories.length > 0) ? 'Select Category' : 'Loading Categories...'}</option>
                                        {Array.isArray(categories) && categories.filter(c => c.type === formData.type).map(c => (
                                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-main fw-bold">{t('title')}</label>
                                    <input type="text" className="form-control" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Groceries, Salary, etc." />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-main fw-bold">{t('amount')}</label>
                                    <input type="number" step="0.01" min="0.01" className="form-control" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-main fw-bold">{t('date')}</label>
                                    <input type="date" className="form-control" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-main fw-bold">Note / Description (Optional)</label>
                                    <textarea className="form-control" rows="2" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})}></textarea>
                                </div>
                                <div className="col-12">
                                    <label className="form-label text-main fw-bold">Receipt Image (Optional)</label>
                                    <input type="file" className="form-control" accept="image/*" onChange={(e) => setFormData({...formData, receipt: e.target.files[0]})} />
                                    {formData.receipt_url && (
                                        <div className="mt-3">
                                            <p className="small text-muted mb-2">Existing Receipt:</p>
                                            <img src={formData.receipt_url} alt="Receipt Preview" className="img-thumbnail" style={{ maxHeight: '150px' }} />
                                        </div>
                                    )}
                                </div>
                                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline-secondary">Cancel</button>
                                    <button type="submit" className="btn btn-primary-gradient px-4">Save Transaction</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showScroll && (
                <div className="scroll-top-btn" onClick={scrollTop}>
                    <FaArrowUp />
                </div>
            )}
        </div>
    );
};

export default Transactions;
