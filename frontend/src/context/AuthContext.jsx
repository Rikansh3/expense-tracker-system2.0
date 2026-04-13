import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        
        // Optionally verify with backend
        const verifyUser = async () => {
            try {
                if(localStorage.getItem('token')){
                    const res = await api.get('/auth/me');
                    setUser(res.data.data);
                    localStorage.setItem('user', JSON.stringify(res.data.data));
                }
            } catch (err) {
                console.error("Auth verification failed", err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.status === 'success') {
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            return res.data;
        }
        throw new Error(res.data.message || 'Login failed');
    };

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch(err) {
            console.error(err);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
