import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { language, setLanguage, t } = useContext(LanguageContext);
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="p-4 fade-in">
            <h2 className="fw-bold mb-4 text-main">{t('settings')}</h2>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="glass-card p-4">
                        <h5 className="mb-4 fw-bold">{t('language')} & {t('theme')}</h5>
                        
                        <div className="mb-4">
                            <label className="form-label text-muted">{t('language')}</label>
                            <select 
                                className="form-select" 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option value="en">English</option>
                                <option value="hi">हिन्दी (Hindi)</option>
                                <option value="ru">Русский (Russian)</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label text-muted">{t('theme')}</label>
                            <div className="d-flex align-items-center gap-3">
                                <span>{t('light')}</span>
                                <div className="form-check form-switch m-0">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        checked={theme === 'dark'}
                                        onChange={toggleTheme}
                                        style={{ width: '50px', height: '25px', cursor: 'pointer' }}
                                    />
                                </div>
                                <span>{t('dark')}</span>
                            </div>
                        </div>

                        <button onClick={logout} className="btn btn-outline-danger w-100 py-2 fw-bold mt-2">
                            {t('logout')}
                        </button>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="glass-card p-4 h-100">
                        <h5 className="mb-4 fw-bold">{t('name')}: {user?.name}</h5>
                        <div className="text-center mb-2">
                            <div className="rounded-circle bg-primary-gradient d-inline-flex align-items-center justify-content-center text-white fw-bold mb-3 shadow" style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}>
                                {user?.name?.charAt(0)}
                            </div>
                            <h4 className="m-0 fw-bold">{user?.name}</h4>
                            <p className="text-muted">{user?.email}</p>
                            <div className="mt-3">
                                <span className={`badge rounded-pill px-4 py-2 text-uppercase ${user?.role === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                                    {user?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
