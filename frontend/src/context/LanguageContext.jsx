import React, { createContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to 'en' or saved preference
    const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

    useEffect(() => {
        localStorage.setItem('lang', language);
    }, [language]);

    const t = (key) => {
        if (!translations[language]) {
            return translations['en']?.[key] || key;
        }
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
