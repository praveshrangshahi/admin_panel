import React, { useState, useEffect } from 'react';
import {
    Plus, Search, MapPin, Phone, Mail, Edit, Trash2, X,
    Building2, LayoutGrid, Filter, ChevronDown,
    ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
    Loader2, ArrowUpRight, Maximize2
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { cn } from "@/lib/utils";

// --- Sub-Components (Matched from Clients.jsx) ---

const SummaryCard = ({ title, timeLabel, stats, accentColor = "bg-[#94D8D7]" }) => (
    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 relative overflow-visible shadow-sm hover:shadow-md transition-all border border-white/50 group">
        {/* Top Header */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
                <div className="mt-2 inline-flex items-center px-4 py-1.5 rounded-full bg-white/50 border border-white/60 shadow-sm text-[10px] font-bold text-gray-500">
                    {timeLabel} <ArrowUpRight className="h-3 w-3 ml-1 text-gray-400" />
                </div>
            </div>
            {/* Corner Arrow Button (Floating Style) */}
            <div className={cn("absolute -top-1 -right-1 h-20 w-20 rounded-bl-[2.5rem] bg-[#F5FBFB] flex items-center justify-center")}>
                <button className={cn("h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 group-hover:rotate-45", accentColor)}>
                    <ArrowUpRight className="h-6 w-6" />
                </button>
            </div>
        </div>

        {/* Inner Stats Blocks */}
        <div className="space-y-3 mt-8">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white/60 rounded-[1.8rem] p-4 flex items-center justify-between shadow-sm border border-white/40">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                        <div className="flex items-center gap-3">
                            {stat.icon && <div className="h-6 w-6 rounded-full bg-white/50 flex items-center justify-center"><stat.icon className="h-3.5 w-3.5 text-gray-400" /></div>}
                            <span className="text-xl font-bold text-gray-900">{stat.value}</span>
                        </div>
                    </div>
                    {/* Corner Indicator */}
                    <div className="h-8 w-8 rounded-full border border-white/60 flex items-center justify-center">
                        <Maximize2 className="h-3.5 w-3.5 text-gray-300" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const YardManagement = () => {
    const [yards, setYards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentYard, setCurrentYard] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    // Tabs State
    const [activeTab, setActiveTab] = useState('branch'); // 'branch' or 'headers'

    // Pagination (Client-side for now as dataset is small)
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    // Stats
    const [totalCapacity, setTotalCapacity] = useState(0);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        city: '',
        capacity: 0,
        address: '',
        // New structure for headers
        printHeaders: []
    });

    // Local state for adding/editing a header profile
    const [headerForm, setHeaderForm] = useState({
        title: '',
        address: '',
        phone: '',
        email: '',
        isDefault: false
    });
    const [editingHeaderIndex, setEditingHeaderIndex] = useState(null);

    useEffect(() => {
        fetchYards();
    }, []);

    const fetchYards = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/yards');
            setYards(data);

            // Calculate total capacity
            const capacity = data.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0);
            setTotalCapacity(capacity);
        } catch (error) {
            toast.error('Failed to fetch yards');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                location: { address: formData.address }
            };

            if (currentYard) {
                await api.put(`/yards/${currentYard._id}`, payload);
                toast.success('Yard updated successfully');
            } else {
                await api.post('/yards', payload);
                toast.success('Yard created successfully');
            }
            setIsDialogOpen(false);
            resetForm();
            fetchYards(); // Run in background after closing UI
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this yard?')) return;
        try {
            await api.delete(`/yards/${id}`);
            toast.success('Yard deleted successfully');
            fetchYards();
        } catch (error) {
            toast.error('Failed to delete yard');
        }
    };

    const openEdit = (yard) => {
        setCurrentYard(yard);
        setFormData({
            name: yard.name,
            code: yard.code,
            city: yard.city,
            capacity: yard.capacity,
            address: yard.location?.address || '',
            printHeaders: yard.printHeaders || [] // Load existing headers or empty array
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setCurrentYard(null);
        setActiveTab('branch');
        setFormData({
            name: '',
            code: '',
            city: '',
            capacity: 0,
            address: '',
            printHeaders: []
        });
        resetHeaderForm();
    };

    // --- Header Profile Handlers ---

    const resetHeaderForm = () => {
        setHeaderForm({ title: '', address: '', phone: '', email: '', isDefault: false });
        setEditingHeaderIndex(null);
    };

    const handleAddHeader = () => {
        if (!headerForm.title || !headerForm.address) {
            toast.error('Header Title and Address are required');
            return;
        }

        const newHeaders = [...formData.printHeaders];

        // If this is set as default, unset others (optional logic, can be refined)
        if (headerForm.isDefault) {
            newHeaders.forEach(h => h.isDefault = false);
        }

        if (editingHeaderIndex !== null) {
            newHeaders[editingHeaderIndex] = headerForm;
        } else {
            // If it's the first header, make it default automatically
            if (newHeaders.length === 0) headerForm.isDefault = true;
            newHeaders.push(headerForm);
        }

        setFormData({ ...formData, printHeaders: newHeaders });
        resetHeaderForm();
    };

    const handleEditHeader = (index) => {
        setHeaderForm(formData.printHeaders[index]);
        setEditingHeaderIndex(index);
    };

    const handleDeleteHeader = (index) => {
        const newHeaders = formData.printHeaders.filter((_, i) => i !== index);
        setFormData({ ...formData, printHeaders: newHeaders });
        if (editingHeaderIndex === index) resetHeaderForm();
    };


    const filteredYards = yards.filter(yard =>
        yard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        yard.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredYards.length / itemsPerPage);
    const paginatedYards = filteredYards.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto pb-10">
            {/* Header Section (Matched Clients.jsx) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">Yard Locations</h2>
                </div>
                <button
                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
                    className="px-6 py-3 bg-[#1F2937] text-white rounded-2xl font-bold shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center gap-2 text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add New Yard
                </button>
            </div>

            {/* Stats Cards (Matched Clients.jsx) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Yard Overview"
                    timeLabel="Live Count"
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Total Branches", value: yards.length, icon: Building2 },
                        { label: "Cities", value: [...new Set(yards.map(y => y.city))].length, icon: MapPin }
                    ]}
                />
                <SummaryCard
                    title="Capacity Checks"
                    timeLabel="Total Slots"
                    accentColor="bg-[#F3C465]"
                    stats={[
                        { label: "Total Capacity", value: totalCapacity, icon: LayoutGrid },
                        { label: "Utilization", value: "0%", icon: ArrowUpRight }
                    ]}
                />
                <SummaryCard
                    title="Operational"
                    timeLabel="Status"
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Active Yards", value: yards.length, icon: Building2 }
                    ]}
                />
            </div>

            {/* Table Container (Matched Clients.jsx) */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-sm border border-white/50 min-h-[500px]">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 px-2 mt-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto">
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">All Locations</h3>

                        {/* Integrated Search Pill */}
                        <div className="group relative flex items-center bg-gray-50/50 backdrop-blur-md border border-gray-200/60 rounded-2xl px-4 py-2.5 w-full md:w-[320px] shadow-sm hover:shadow-md hover:bg-white hover:border-teal-500/30 transition-all duration-500 ring-4 ring-transparent hover:ring-teal-500/5">
                            <Search className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-400 ml-3 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="border-b border-gray-100/50 text-left">
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30 rounded-l-2xl">Branch Info</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30">Location details</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30">Print Profiles</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30">Capacity</th>
                                <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30 rounded-r-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                                            <p className="text-sm font-bold text-gray-400 animate-pulse">Loading Yards...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedYards.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No yards found</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedYards.map((yard) => (
                                    <tr key={yard._id} className="group hover:bg-white/40 backdrop-blur-sm transition-all duration-300">
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-[#F5FBFB] border border-teal-100/50 flex items-center justify-center text-teal-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                    <Building2 className="h-6 w-6" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="text-sm font-black text-gray-900 tracking-tight group-hover:text-teal-600 transition-colors uppercase">{yard.name}</div>
                                                    <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-wider w-fit">{yard.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-start gap-2 max-w-[200px]">
                                                <MapPin className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                                                <span className="text-xs font-bold text-gray-600">{yard.location?.address || yard.city}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-900 badge badge-ghost">
                                                    {yard.printHeaders?.length || 0} Profiles
                                                </span>
                                                {yard.printHeaders && yard.printHeaders.length > 0 && (
                                                    <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                                        {yard.printHeaders[0].title} {yard.printHeaders.length > 1 && `+${yard.printHeaders.length - 1}`}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">
                                                    {yard.capacity} Units
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                                                <button onClick={() => openEdit(yard)} className="h-9 w-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:border-teal-200 transition-all hover:shadow-lg hover:shadow-teal-500/10 active:scale-95">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(yard._id)} className="h-9 w-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition-all hover:shadow-lg hover:shadow-red-500/10 active:scale-95">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Matched Clients.jsx) */}
                <div className="mt-8 pt-6 border-t border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-3">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Total Yards: <span className="text-gray-900">{filteredYards.length}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all shadow-teal-500/10"><ChevronLeft className="h-4 w-4" /></button>
                        <div className="flex items-center px-4 h-9 bg-white rounded-xl shadow-sm border border-gray-100">
                            <span className="text-[11px] font-black text-gray-700">
                                <span className="text-teal-600">{page}</span>
                                <span className="mx-2 text-gray-300">/</span>
                                <span className="text-gray-400">{totalPages || 1}</span>
                            </span>
                        </div>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all shadow-teal-500/10"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{currentYard ? 'Edit Yard' : 'Add New Yard'}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage Branch & Print Profiles</p>
                            </div>
                            <button onClick={() => setIsDialogOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="px-8 pt-4 pb-0 flex gap-4 border-b border-gray-100 bg-white">
                            <button
                                onClick={() => setActiveTab('branch')}
                                className={cn(
                                    "pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                                    activeTab === 'branch' ? "border-teal-500 text-teal-600" : "border-transparent text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Branch Details
                            </button>
                            <button
                                onClick={() => setActiveTab('headers')}
                                className={cn(
                                    "pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                                    activeTab === 'headers' ? "border-teal-500 text-teal-600" : "border-transparent text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Print Profiles ({formData.printHeaders.length})
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                            <style>{`
                                .input-field {
                                    width: 100%;
                                    padding: 12px 16px;
                                    border-radius: 12px;
                                    background-color: #F9FAFB;
                                    border: 1px solid #E5E7EB;
                                    font-size: 0.875rem;
                                    font-weight: 600;
                                    color: #374151;
                                    outline: none;
                                    transition: all 0.2s;
                                }
                                .input-field:focus {
                                    background-color: #FFFFFF;
                                    border-color: #14B8A6;
                                    box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
                                }
                                .label-text {
                                    font-size: 0.7rem;
                                    font-weight: 800;
                                    color: #9CA3AF;
                                    text-transform: uppercase;
                                    letter-spacing: 0.05em;
                                    margin-bottom: 4px;
                                    display: block;
                                    margin-left: 4px;
                                }
                            `}</style>

                            <form id="yard-form" onSubmit={handleSubmit}>
                                {/* TAB 1: Branch Details */}
                                <div className={cn("space-y-4", activeTab === 'branch' ? "block" : "hidden")}>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Branch Name*</label>
                                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-field" placeholder="e.g. Indore Main" />
                                        </div>
                                        <div>
                                            <label className="label-text">Branch Code*</label>
                                            <input required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="input-field" placeholder="e.g. IND01" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">City*</label>
                                            <input required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="input-field" />
                                        </div>
                                        <div>
                                            <label className="label-text">Capacity (Units)</label>
                                            <input type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} className="input-field" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">Physical Location Address*</label>
                                        <textarea required rows={3} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="input-field" placeholder="Actual location of the yard..." />
                                    </div>
                                </div>

                                {/* TAB 2: Print Profiles */}
                                <div className={cn("space-y-6", activeTab === 'headers' ? "block" : "hidden")}>

                                    {/* Add/Edit Section */}
                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-dashed border-gray-200">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            {editingHeaderIndex !== null ? <Edit className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                            {editingHeaderIndex !== null ? "Edit Print Profile" : "Add New Print Profile"}
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="label-text">Header Title (Company Name)*</label>
                                                <input
                                                    value={headerForm.title}
                                                    onChange={e => setHeaderForm({ ...headerForm, title: e.target.value })}
                                                    className="input-field bg-white"
                                                    placeholder="e.g. Jayant Associates"
                                                />
                                            </div>
                                            <div>
                                                <label className="label-text">Full Registered Address*</label>
                                                <textarea
                                                    rows={2}
                                                    value={headerForm.address}
                                                    onChange={e => setHeaderForm({ ...headerForm, address: e.target.value })}
                                                    className="input-field bg-white"
                                                    placeholder="Address to show on PDF..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label-text">Contact No.</label>
                                                    <input
                                                        value={headerForm.phone}
                                                        onChange={e => setHeaderForm({ ...headerForm, phone: e.target.value })}
                                                        className="input-field bg-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="label-text">Email</label>
                                                    <input
                                                        value={headerForm.email}
                                                        onChange={e => setHeaderForm({ ...headerForm, email: e.target.value })}
                                                        className="input-field bg-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <button
                                                    type="button"
                                                    onClick={handleAddHeader}
                                                    className="bg-teal-500 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20"
                                                >
                                                    {editingHeaderIndex !== null ? "Update Profile" : "Add Profile"}
                                                </button>
                                                {editingHeaderIndex !== null && (
                                                    <button
                                                        type="button"
                                                        onClick={resetHeaderForm}
                                                        className="text-gray-400 hover:text-gray-600 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* List of Profiles */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">Active Profiles</h4>
                                        {formData.printHeaders.length === 0 ? (
                                            <div className="text-center py-8 opacity-50">
                                                <p className="text-sm text-gray-400 font-bold">No profiles added yet.</p>
                                            </div>
                                        ) : (
                                            formData.printHeaders.map((header, idx) => (
                                                <div key={idx} className="group flex items-start justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
                                                    <div>
                                                        <h5 className="font-bold text-gray-800 text-sm">{header.title}</h5>
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{header.address}</p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            {header.phone && <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-500 border border-gray-100">{header.phone}</span>}
                                                            {header.email && <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-500 border border-gray-100">{header.email}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditHeader(idx)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-teal-600 transition-colors"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteHeader(idx)}
                                                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsDialogOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all text-sm">Cancel</button>
                            <button type="submit" form="yard-form" disabled={isSubmitting} className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg shadow-gray-900/20 transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Yard"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YardManagement;
