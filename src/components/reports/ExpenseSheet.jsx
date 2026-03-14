import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    X,
    IndianRupee,
    Calendar as CalendarIcon,
    Briefcase,
    Loader2
} from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
const ExpenseSheet = ({ isOpen, onClose }) => {
    const [expenses, setExpenses] = useState([]);
    const [yards, setYards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const toast = useToast();
    const { selectedBranch } = useAuth();

    const [form, setForm] = useState({
        category: 'Others',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        yardId: ''
    });

    const categories = ['Rent', 'Electricity', 'Water', 'Salaries', 'Security', 'Maintenance', 'Taxes', 'Others'];

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedBranch && selectedBranch !== 'ALL') {
                params.branchId = selectedBranch;
            }

            const [expRes, yardRes] = await Promise.all([
                api.get('/expenses', { params }),
                api.get('/yards')
            ]);
            setExpenses(expRes.data);
            setYards(yardRes.data);

            // Default yardId to selectedBranch or first yard
            if (selectedBranch && selectedBranch !== 'ALL') {
                setForm(prev => ({ ...prev, yardId: selectedBranch }));
            } else if (yardRes.data.length > 0) {
                setForm(prev => ({ ...prev, yardId: yardRes.data[0]._id }));
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen, selectedBranch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { data } = await api.post('/expenses', form);
            setExpenses([data, ...expenses]);
            setForm({
                category: 'Others',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                yardId: yards[0]?._id || ''
            });
            toast.success("Expense recorded");
        } catch (error) {
            toast.error("Failed to save expense");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/expenses/${id}`);
            setExpenses(expenses.filter(e => e._id !== id));
            toast.success("Expense removed");
        } catch (error) {
            toast.error("Failed to remove expense");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="h-full w-full max-w-2xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">

                {/* Header */}
                <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Yard Expenses</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">Record rent, salaries, and other operational costs</p>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-white flex items-center justify-center transition-colors border">
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10">

                    {/* Add Form */}
                    <form onSubmit={handleSubmit} className="bg-gray-50/80 rounded-[2rem] p-6 border border-gray-100 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-white border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-teal-500/20"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Amount (₹)</label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-teal-500/20"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-white border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-teal-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Select Yard</label>
                                <select
                                    value={form.yardId}
                                    onChange={e => setForm({ ...form, yardId: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-white border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-teal-500/20"
                                >
                                    {yards.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Description (Optional)</label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-100 text-sm font-bold focus:ring-2 focus:ring-teal-500/20"
                                placeholder="e.g. Paid via Bank Transfer"
                            />
                        </div>

                        <button
                            disabled={saving}
                            className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Record Expense
                        </button>
                    </form>

                    {/* List */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 pl-2">Recent Transactions</h3>
                        {loading ? (
                            <div className="py-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                        ) : expenses.length === 0 ? (
                            <div className="py-10 text-center border-2 border-dashed rounded-[2rem] text-gray-400 font-bold text-xs uppercase tracking-widest">No expenses recorded yet</div>
                        ) : (
                            <div className="space-y-3">
                                {expenses.map(exp => (
                                    <div key={exp._id} className="group bg-white rounded-2xl p-4 border hover:border-teal-500/30 transition-all flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-gray-900">{exp.category}</span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold">{exp.yardId?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 font-bold">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {new Date(exp.date).toLocaleDateString()}
                                                    {exp.description && <span>• {exp.description}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-gray-900">₹{exp.amount}</span>
                                            <button
                                                onClick={() => handleDelete(exp._id)}
                                                className="h-8 w-8 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t bg-gray-50/50">
                    <button onClick={onClose} className="w-full h-12 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-sm hover:bg-white hover:border-gray-900 transition-all">
                        Close Panel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ExpenseSheet;
