import React from 'react';
import { AlertCircle, X, Trash2, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    type = "danger", // 'danger' | 'warning' | 'info' | 'success'
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false
}) => {
    if (!isOpen) return null;

    const config = {
        danger: {
            icon: Trash2,
            iconClass: "text-red-500 bg-red-50",
            buttonClass: "bg-red-500 hover:bg-red-600 shadow-red-100",
            accent: "border-red-100"
        },
        warning: {
            icon: AlertTriangle,
            iconClass: "text-amber-500 bg-amber-50",
            buttonClass: "bg-amber-500 hover:bg-amber-600 shadow-amber-100",
            accent: "border-amber-100"
        },
        info: {
            icon: Info,
            iconClass: "text-blue-500 bg-blue-50",
            buttonClass: "bg-blue-500 hover:bg-blue-600 shadow-blue-100",
            accent: "border-blue-100"
        },
        success: {
            icon: CheckCircle2,
            iconClass: "text-teal-500 bg-teal-50",
            buttonClass: "bg-teal-500 hover:bg-teal-600 shadow-teal-100",
            accent: "border-teal-100"
        }
    };

    const currentConfig = config[type] || config.info;
    const Icon = currentConfig.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={cn(
                "bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border animate-in zoom-in-95 duration-200",
                currentConfig.accent
            )}>
                {/* Header */}
                <div className="p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pb-6 text-center">
                    <div className={cn(
                        "mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300",
                        currentConfig.iconClass
                    )}>
                        <Icon className="h-7 w-7" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed px-2">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-8 flex flex-col gap-2">
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                            "w-full py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2",
                            currentConfig.buttonClass,
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : confirmText}
                    </button>

                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-2xl transition-all"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
