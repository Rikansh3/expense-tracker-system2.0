import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaList, FaTags, FaChartPie, FaCog, FaChartBar, FaUserShield } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { theme } = useContext(ThemeContext);
    const { t } = useContext(LanguageContext);
    const { user } = useContext(AuthContext);

    const activeStyle = {
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        color: 'white',
        borderRadius: '8px'
    };

    return (
        <div className={`sidebar glass-card d-none d-md-flex flex-column p-3 m-2`} style={{ width: '250px' }}>
            <h3 className="text-center mb-4 mt-2" style={{ fontWeight: 700 }}>
                <span style={{ color: 'var(--primary)' }}>Expense</span>Tracker
            </h3>
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item mb-2">
                    <NavLink to="/dashboard" className="nav-link py-3 text-main" style={({isActive}) => isActive ? activeStyle : undefined}>
                        <FaHome className="me-2 mb-1" /> {t('dashboard')}
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/transactions" className="nav-link py-3 text-main" style={({isActive}) => isActive ? activeStyle : undefined}>
                        <FaList className="me-2 mb-1" /> {t('transactions')}
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/categories" className="nav-link py-3 text-main" style={({isActive}) => isActive ? activeStyle : undefined}>
                        <FaTags className="me-2 mb-1" /> {t('categories')}
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/budget" className="nav-link py-3 text-main" style={({isActive}) => isActive ? activeStyle : undefined}>
                        <FaChartPie className="me-2 mb-1" /> {t('budgets')}
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/reports" className="nav-link py-3 text-main" style={({isActive}) => isActive ? activeStyle : undefined}>
                        <FaChartBar className="me-2 mb-1" /> {t('reports')}
                    </NavLink>
                </li>
                <li className="nav-item mb-2">
                    <NavLink to="/settings" className="nav-link py-3 text-main" style={({isActive}) => isActive ? activeStyle : undefined}>
                        <FaCog className="me-2 mb-1" /> {t('settings')}
                    </NavLink>
                </li>
                {user?.role === 'admin' && (
                    <li className="nav-item mb-2">
                        <NavLink to="/admin/users" className="nav-link py-3 text-main" style={({isActive}) => isActive ? activeStyle : undefined}>
                            <FaUserShield className="me-2 mb-1" /> {t('adminPanel')}
                        </NavLink>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;
