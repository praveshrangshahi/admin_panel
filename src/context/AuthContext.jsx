import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBranch, setSelectedBranch] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setUser(parsed);

            // Sync with backend to get latest profileImage etc.
            const syncProfile = async () => {
                try {
                    const { data } = await api.get('/auth/me');
                    // Merge with existing token
                    const updatedUser = { ...parsed, ...data };
                    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                } catch (error) {
                    console.error("Profile sync failed", error);
                    if (error.response?.status === 401) logout();
                }
            }
            syncProfile();
        }

        // Restore selected branch
        const savedBranch = localStorage.getItem('selectedBranch');
        if (savedBranch) {
            setSelectedBranch(savedBranch);
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            return { success: true };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('selectedBranch');
        setUser(null);
        setSelectedBranch(null);
    };

    const updateSelectedBranch = (branchId) => {
        if (branchId) {
            localStorage.setItem('selectedBranch', branchId);
            setSelectedBranch(branchId);
        } else {
            localStorage.removeItem('selectedBranch');
            setSelectedBranch(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, selectedBranch, updateSelectedBranch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
