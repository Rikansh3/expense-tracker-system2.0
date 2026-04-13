import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthContext } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder Pages for now, will implement them next
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories'; // Placeholder for now
import Budget from './pages/Budget'; // Placeholder for now
import Reports from './pages/Reports'; // Placeholder for now
import Settings from './pages/Settings'; // Placeholder for now
import AdminUsers from './pages/AdminUsers';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <h4>Verifying session...</h4>
            </div>
        </div>
    );
    if (!user) return <Navigate to="/login" replace />;
    return (
        <div className="d-flex" style={{ backgroundColor: 'var(--bg-dark)' }}>
            <Sidebar />
            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, minHeight: '100vh' }}>
                <Navbar />
                <div className="container-fluid flex-grow-1 overflow-auto rounded-top-3 pb-5" style={{ backgroundColor: 'var(--bg-dark)' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
