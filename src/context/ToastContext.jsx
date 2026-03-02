import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};

const Toast = ({ message, type, onClose }) => {
    const config = {
        success: { icon: CheckCircle2, color: "text-teal-500", bg: "bg-teal-50", border: "border-teal-100" },
        error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
        info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" }
    };

    const current = config[type] || config.info;
    const Icon = current.icon;

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md animate-in slide-in-from-right-full duration-300",
            current.bg, current.border
        )}>
            <Icon className={cn("h-5 w-5", current.color)} />
            <p className="text-sm font-bold text-gray-700">{message}</p>
            <button onClick={onClose} className="ml-2 p-1 hover:bg-white/50 rounded-full transition-colors">
                <X className="h-4 w-4 text-gray-400" />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const toast = {
        success: (msg) => showToast(msg, 'success'),
        error: (msg) => showToast(msg, 'error'),
        info: (msg) => showToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
                {toasts.map(t => (
                    <Toast
                        key={t.id}
                        {...t}
                        onClose={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
