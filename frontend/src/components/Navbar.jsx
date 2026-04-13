import React, { useContext } from 'react';
import { FaSun, FaMoon, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar glass-nav px-4 py-3 d-flex justify-content-between align-items-center mb-4 sticky-top">
            <div className="d-flex align-items-center">
                <button className="btn btn-link text-main d-md-none me-3 p-0 fs-4">
                    <FaBars />
                </button>
                <h4 className="m-0 d-md-none fw-bold">
                    <span style={{ color: 'var(--primary)' }}>Expense</span>Tracker
                </h4>
                <div className="d-none d-md-block">
                    <h5 className="m-0">Welcome back, {user?.name}! 👋</h5>
                </div>
            </div>

            <div className="d-flex align-items-center gap-3">
                <button 
                    onClick={toggleTheme} 
                    className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', borderColor: 'var(--glass-border)' }}
                >
                    {theme === 'dark' ? <FaSun className="text-warning" /> : <FaMoon />}
                </button>
                
                <div className="d-flex align-items-center gap-2 border-start ps-3" style={{ borderColor: 'var(--glass-border) !important' }}>
                    <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <button onClick={logout} className="btn btn-link text-danger p-0 ms-2" title="Logout">
                        <FaSignOutAlt fs="1.2rem"/>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
