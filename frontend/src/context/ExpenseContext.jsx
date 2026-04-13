import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from './AuthContext';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    // State
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [trxRes, catRes, budRes, statRes] = await Promise.all([
                api.get('/transactions?limit=100'), // For simple demo we load 100, prod might paginate
                api.get('/categories'),
                api.get('/budgets'),
                api.get('/stats/dashboard')
            ]);
            
            setTransactions(trxRes.data.data);
            setCategories(catRes.data.data);
            setBudgets(budRes.data.data);
            setStats(statRes.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setTransactions([]);
            setCategories([]);
            setBudgets([]);
            setStats(null);
        }
        // eslint-disable-next-line
    }, [user]);

    const addTransaction = async (formData) => {
        const res = await api.post('/transactions', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        fetchData(); // Refresh data to update stats and records
        return res.data;
    };

    const updateTransaction = async (id, formData) => {
        const res = await api.put(`/transactions/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        fetchData();
        return res.data;
    };

    const deleteTransaction = async (id) => {
        await api.delete(`/transactions/${id}`);
        fetchData();
    };

    return (
        <ExpenseContext.Provider value={{
            transactions, categories, budgets, stats, loading, fetchData,
            addTransaction, updateTransaction, deleteTransaction
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};
