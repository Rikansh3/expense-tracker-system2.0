import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpenseContext } from '../context/ExpenseContext';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const CountUp = ({ end, duration = 1000, formatter }) => {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
        let start = 0;
        const totalFrames = Math.round(duration / 16);
        const increment = end / totalFrames;
        let frame = 0;
        const timer = setInterval(() => {
            frame++;
            start += increment;
            if (frame >= totalFrames) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration]);
    return <span>{formatter ? formatter(count) : Math.floor(count)}</span>;
};

const Dashboard = () => {
    const { stats, loading, fetchData } = useContext(ExpenseContext);
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    if (loading || !stats) {
        return (
            <div className="p-4">
                <div className="row g-4 mb-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="col-md-3">
                            <div className="glass-card p-4 skeleton" style={{ height: '100px' }}></div>
                        </div>
                    ))}
                </div>
                <div className="row g-4">
                    <div className="col-lg-8"><div className="glass-card p-4 skeleton" style={{ height: '400px' }}></div></div>
                    <div className="col-lg-4"><div className="glass-card p-4 skeleton" style={{ height: '400px' }}></div></div>
                </div>
            </div>
        );
    }

    const { summary, trend, categoryExpense, recentTransactions } = stats;

    // Currency Formatter
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: user?.currency || 'INR'
        }).format(amount);
    };

    // Chart Options
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: 'var(--text-main)' }
            }
        },
        scales: {
            y: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'var(--glass-border)' } },
            x: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'var(--glass-border)' } }
        }
    };

    // Line Chart Data
    const months = [...new Set(trend.map(t => t.month))];
    const lineData = {
        labels: months,
        datasets: [
            {
                label: 'Income',
                data: months.map(m => {
                    const found = trend.find(t => t.month === m && t.type === 'income');
                    return found ? parseFloat(found.total) : 0;
                }),
                borderColor: '#06d6a0',
                backgroundColor: 'rgba(6, 214, 160, 0.5)',
                tension: 0.4
            },
            {
                label: 'Expense',
                data: months.map(m => {
                    const found = trend.find(t => t.month === m && t.type === 'expense');
                    return found ? parseFloat(found.total) : 0;
                }),
                borderColor: '#ef476f',
                backgroundColor: 'rgba(239, 71, 111, 0.5)',
                tension: 0.4
            }
        ]
    };

    // Doughnut Chart Data
    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'right', labels: { color: 'var(--text-main)' } }
        }
    };
    const doughnutData = {
        labels: categoryExpense.slice(0,5).map(c => c.name),
        datasets: [{
            data: categoryExpense.slice(0,5).map(c => parseFloat(c.total)),
            backgroundColor: categoryExpense.slice(0,5).map(c => c.color),
            borderWidth: 0
        }]
    };

    return (
        <div className="p-4 fade-in pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold m-0 text-main">{t('dashboard')}</h2>
                <button 
                    onClick={() => navigate('/transactions', { state: { openModal: true } })} 
                    className="btn btn-primary-gradient rounded-pill px-4 shadow-sm" 
                    style={{ fontWeight: 600 }}
                >
                    {t('quickAdd')}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-lg-3 col-md-6">
                    <div className={`glass-card p-4 h-100 border-start border-4 ${summary.totalBalance < 0 ? 'border-danger' : 'border-primary'}`}>
                        <div className="card-label mb-2">{t('totalBalance')} {summary.totalBalance < 0 && <small className="text-danger opacity-75">(Deficit)</small>}</div>
                        <h4 className={`fw-bold m-0 ${summary.totalBalance < 0 ? 'text-danger' : 'text-main'}`} style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                            <CountUp end={Math.abs(summary.totalBalance)} formatter={formatCurrency} />
                        </h4>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="glass-card p-4 h-100 border-start border-success border-4">
                        <div className="card-label mb-2">{t('monthlyIncome')}</div>
                        <h4 className="fw-bold text-income m-0" style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}><CountUp end={summary.monthlyIncome} formatter={formatCurrency} /></h4>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="glass-card p-4 h-100 border-start border-danger border-4">
                        <div className="card-label mb-2">{t('monthlyExpense')}</div>
                        <h4 className="fw-bold text-expense m-0" style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}><CountUp end={summary.monthlyExpense} formatter={formatCurrency} /></h4>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="glass-card p-4 h-100 border-start border-info border-4">
                        <div className="card-label mb-2">{t('savingsRate')}</div>
                        <h4 className="fw-bold text-info m-0" style={{ fontSize: '1.4rem' }}><CountUp end={parseFloat(summary.savingsRate)} />%</h4>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="glass-card p-4 h-100">
                        <h5 className="mb-4">6-Month Trend Overview</h5>
                        <Line options={chartOptions} data={lineData} />
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="glass-card p-4 h-100 d-flex flex-column align-items-center">
                        <h5 className="mb-4 align-self-start">Top Expense Categories</h5>
                        {categoryExpense.length > 0 ? (
                             <div style={{ width: '250px' }}>
                                 <Doughnut options={doughnutOptions} data={doughnutData} />
                             </div>
                        ) : (
                            <p className="text-muted mt-5 text-center">No expenses this month</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-card p-4">
                <h5 className="mb-4 fw-bold">{t('recentTransactions')}</h5>
                <div className="table-responsive">
                    <table className="table table-borderless table-glass text-main align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="text-primary small fw-bold text-uppercase pb-3">{t('date')}</th>
                                <th className="text-primary small fw-bold text-uppercase pb-3">{t('title')}</th>
                                <th className="text-primary small fw-bold text-uppercase pb-3">{t('category')}</th>
                                <th className="text-primary small fw-bold text-uppercase pb-3 text-end">{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-4 text-muted">No recent transactions.</td></tr>
                            ) : recentTransactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td className="text-main fw-medium py-3" style={{ opacity: 0.9 }}>{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="fw-bold text-white py-3">{t.title.replace(/&#x27;/g, "'").replace(/&quot;/g, '"')}</td>
                                    <td className="py-3">
                                        <span className="badge rounded-pill px-3 py-2 fw-bold" style={{ backgroundColor: `${t.color}44`, color: t.color, border: `1px solid ${t.color}66` }}>
                                            {t.icon} {t.category_name}
                                        </span>
                                    </td>
                                    <td className={`fw-bold text-end py-3 ${t.type === 'income' ? 'text-income' : 'text-expense'}`} style={{ fontSize: '1.1rem' }}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
