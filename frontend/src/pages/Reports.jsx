import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { FaFilePdf, FaFileCsv } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Reports = () => {
    const { user } = useContext(AuthContext);
    const { t, language } = useContext(LanguageContext);
    const [year, setYear] = useState(new Date().getFullYear());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/stats/reports?year=${year}`);
            
            if (res.data.status === 'success') {
                // Map Node.js keys to component structure
                setReportData({
                    monthly: res.data.data.monthlyComparison,
                    category: res.data.data.topCategories
                });
            } else {
                throw new Error(res.data.message || 'API returned an error');
            }
        } catch (error) {
            console.error("Error fetching reports", error);
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(user) fetchReports();
        // eslint-disable-next-line
    }, [year, user]);

    const handleExportCSV = async () => {
        try {
            const response = await api.get(`/stats/export/csv?year=${year}`, { responseType: 'blob' });
            
            // If it's an error JSON, show error
            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || 'Export failed');
            }

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Expense_Report_${year}.csv`);
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error("CSV Export failed", error);
            const msg = error.response?.data?.message || error.message;
            toast.error(msg === '[object Object]' ? 'Export failed' : msg);
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await api.get(`/stats/export/pdf?year=${year}`, { responseType: 'blob' });
            
            // If it's an error JSON, show error
            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const errorData = JSON.parse(text);
                throw new Error(errorData.message || 'Export failed');
            }

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Expense_Report_${year}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error("PDF Export failed", error);
            const msg = error.response?.data?.message || error.message;
            toast.error(msg === '[object Object]' ? 'Export failed' : msg);
        }
    };

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 py-5">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <div className="text-muted">Analyzing financial data...</div>
            </div>
        );
    }

    if (error || !reportData) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center h-100 py-5 text-center">
                <div className="glass-card p-5" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                    <h3 className="text-danger mb-3">Connection Issue</h3>
                    <p className="text-muted">{error || 'Could not load report data.'}</p>
                    <button onClick={fetchReports} className="btn btn-primary-gradient px-4">Try Again</button>
                </div>
            </div>
        );
    }

    const { monthly, category } = reportData;

    // Bar Chart
    const barLabels = Array.from({length: 12}, (_, i) => {
        return new Date(0, i).toLocaleString(language === 'hi' ? 'hi-IN' : language === 'ru' ? 'ru' : 'en-US', {month: 'short'});
    });

    const barData = {
        labels: barLabels,
        datasets: [
            {
                label: t('income'),
                data: Array.from({length: 12}, (_, i) => {
                    const monthNum = i + 1;
                    const m = monthly.find(x => x.month == monthNum && x.type === 'income');
                    return m ? parseFloat(m.total) : 0;
                }),
                backgroundColor: 'rgba(6, 214, 160, 0.8)',
            },
            {
                label: t('expense'),
                data: Array.from({length: 12}, (_, i) => {
                    const monthNum = i + 1;
                    const m = monthly.find(x => x.month == monthNum && x.type === 'expense');
                    return m ? parseFloat(m.total) : 0;
                }),
                backgroundColor: 'rgba(239, 71, 111, 0.8)',
            }
        ]
    };

    // Pie Chart
    const pieData = {
        labels: category.map(c => c.name),
        datasets: [{
            data: category.map(c => c.total),
            backgroundColor: category.map(c => c.color),
            borderWidth: 0
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: { 
            legend: { labels: { color: 'var(--text-main)' } },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat(language === 'hi' ? 'en-IN' : 'en-US', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'var(--glass-border)' } },
            x: { ticks: { color: 'var(--text-muted)' }, grid: { color: 'var(--glass-border)' } }
        }
    };
    const pieOptions = {
        responsive: true,
        plugins: { 
            legend: { position: 'right', labels: { color: 'var(--text-main)' } },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) label += ': ';
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat(language === 'hi' ? 'en-IN' : 'en-US', { style: 'currency', currency: 'INR' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
        }
    };

    return (
        <div className="p-4 fade-in pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2 className="fw-bold m-0 mt-2 text-main">{t('advancedReports')}</h2>
                <div className="d-flex gap-2 align-items-center">
                    <div className="d-flex align-items-center gap-2 me-3">
                        <label className="text-muted small fw-bold">{t('year')}:</label>
                        <select className="form-select bg-transparent text-main" style={{ width: '100px' }} value={year} onChange={(e) => setYear(e.target.value)}>
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="text-dark">{y}</option>)}
                        </select>
                    </div>
                    <button onClick={handleExportCSV} className="btn btn-outline-info d-flex align-items-center gap-2 px-3 fw-bold">
                        <FaFileCsv /> CSV
                    </button>
                    <button onClick={handleExportPDF} className="btn btn-outline-danger d-flex align-items-center gap-2 px-3 fw-bold">
                        <FaFilePdf /> PDF
                    </button>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="glass-card p-4 h-100">
                        <h5 className="mb-4 text-main fw-bold">{t('monthlyComparison')} ({year})</h5>
                        <Bar options={chartOptions} data={barData} />
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="glass-card p-4 h-100 d-flex flex-column align-items-center">
                        <h5 className="mb-4 align-self-start text-main fw-bold">{t('topExpenseCategories')}</h5>
                        {category && category.length > 0 ? (
                            <div style={{ width: '100%', maxWidth: '280px' }}>
                                <Pie options={pieOptions} data={pieData} />
                            </div>
                        ) : (
                            <p className="text-muted mt-5 text-center">No category data for {year}</p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Extended month-wise breakdown table could go here to match prompt requirement */}
        </div>
    );
};

export default Reports;
