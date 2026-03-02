import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    Plus,
    Building2,
    Briefcase,
    CheckCircle2,
    AlertCircle,
    Phone,
    ArrowUpRight,
    Maximize2,
    Edit2,
    Trash2,
    X,
    Loader2,
    Mail,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useToast } from "../context/ToastContext";

// --- Sub-Components (Restored) ---
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

const Clients = () => {
    const { user, selectedBranch } = useAuth();
    const toast = useToast();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    const [editMode, setEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8); // Convertible to state for selector

    // State
    const [yards, setYards] = useState([]);
    const [formData, setFormData] = useState({
        matchName: "",
        type: "BANK",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: "",
        branchId: ""
    });

    const [currentId, setCurrentId] = useState(null);
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        id: null,
        loading: false
    });

    // Function to fetch clients
    const fetchClients = async () => {
        try {
            setLoading(true);
            // Pass branchId if selectedBranch is not 'ALL' or null
            const branchId = selectedBranch && selectedBranch !== 'ALL' ? selectedBranch : undefined;
            const response = await api.get("/clients", {
                params: { branchId }
            });
            setClients(response.data);
        } catch (error) {
            console.error("Frontend: Failed to fetch clients", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Clients on mount and when branch changes
    useEffect(() => {
        fetchClients();
    }, [selectedBranch]);

    // Fetch Yards for Super Admin to populate dropdown
    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN') {
            const fetchYards = async () => {
                try {
                    const { data } = await api.get('/yards');
                    setYards(data);
                } catch (error) {
                    console.error("Failed to fetch yards", error);
                }
            };
            fetchYards();
        }
    }, [user]);

    // Initialize formData with selectedBranch if available
    useEffect(() => {
        if (!editMode && selectedBranch && selectedBranch !== 'ALL') {
            setFormData(prev => ({ ...prev, branchId: selectedBranch }));
        }
    }, [selectedBranch, editMode]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openEdit = (client) => {
        setFormData({
            matchName: client.matchName || "",
            type: client.type || "BANK",
            contactPerson: client.contactPerson || "",
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
            gstNumber: client.gstNumber || "",
            branchId: client.branchId?._id || client.branchId || ""
        });
        setCurrentId(client._id);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        setConfirmConfig({
            isOpen: true,
            id: id,
            loading: false
        });
    };

    const confirmDelete = async () => {
        try {
            setConfirmConfig(prev => ({ ...prev, loading: true }));
            await api.delete(`/clients/${confirmConfig.id}`);
            setConfirmConfig({ isOpen: false, id: null, loading: false });
            toast.success("Client deleted successfully!");
            fetchClients();
        } catch (error) {
            console.error("Failed to delete client", error);
            toast.error(error.response?.data?.message || "Failed to delete client");
            setConfirmConfig(prev => ({ ...prev, loading: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate branchId for Super Admin
            if (user?.role === 'SUPER_ADMIN' && !formData.branchId) {
                toast.error("Please select a branch.");
                return;
            }

            const payload = {
                ...formData,
                branchId: formData.branchId || user?.branchId // Fallback for Managers
            };

            if (editMode) {
                await api.put(`/clients/${currentId}`, payload);
                toast.success("Client updated successfully!");
            } else {
                await api.post("/clients", payload);
                toast.success("Client created successfully!");
            }
            setShowModal(false);
            resetForm();
            fetchClients();
        } catch (error) {
            console.error("Failed to save client", error);
            toast.error(error.response?.data?.message || "Operation failed");
        }
    };

    const resetForm = () => {
        setFormData({
            matchName: "",
            type: "BANK",
            contactPerson: "",
            email: "",
            phone: "",
            address: "",
            gstNumber: "",
            branchId: (selectedBranch && selectedBranch !== 'ALL') ? selectedBranch : ""
        });
        setEditMode(false);
        setCurrentId(null);
    };

    // Derived Stats
    const totalClients = clients.length;

    // Calculate New Clients (This Month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newClientsCount = clients.filter(c => {
        const d = new Date(c.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const activeContracts = clients.filter(c => c.status === 'ACTIVE').length;
    const totalVehicles = 0; // Set to 0 for now as backend aggregation is pending

    const filteredClients = clients.filter(c =>
        c.matchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const paginatedClients = filteredClients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when search or branch changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedBranch]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Smart Pagination Logic (Ellipsis)
    const getPaginationGroup = () => {
        let start = Math.floor((currentPage - 1) / 5) * 5;
        return new Array(Math.min(5, totalPages - start)).fill().map((_, idx) => start + idx + 1);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">Client Master</h2>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-6 py-3 bg-[#1F2937] text-white rounded-2xl font-bold shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center gap-2 text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add New Client
                </button>
            </div>

            {/* Stats Row (Restored) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Client Overview"
                    timeLabel="Total Count"
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Total Clients", value: totalClients || "0", icon: Building2 },
                        { label: "New (This Month)", value: `+${newClientsCount}`, icon: Plus }
                    ]}
                />
                <SummaryCard
                    title="Contracts"
                    timeLabel="Status"
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Active", value: activeContracts || "0", icon: CheckCircle2 },
                        { label: "Pending", value: "0", icon: AlertCircle }
                    ]}
                />
                <SummaryCard
                    title="Performance"
                    timeLabel="In Yard"
                    accentColor="bg-[#F3C465]"
                    stats={[
                        { label: "Total Vehicles", value: totalVehicles, icon: Briefcase }
                    ]}
                />
            </div>

            {/* Client List Container (Table View Restored) */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-sm border border-white/50 min-h-[500px]">

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 px-2 mt-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto">
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">All Clients</h3>

                        {/* Integrated Search Pill */}
                        <div className="group relative flex items-center bg-gray-50/50 backdrop-blur-md border border-gray-200/60 rounded-2xl px-4 py-2.5 w-full md:w-[320px] shadow-sm hover:shadow-md hover:bg-white hover:border-teal-500/30 transition-all duration-500 ring-4 ring-transparent hover:ring-teal-500/5">
                            <Search className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search client or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-400 ml-3 w-full"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-white/60 hover:bg-white backdrop-blur-md rounded-2xl text-[11px] font-black text-gray-700 shadow-sm border border-gray-100/50 flex items-center gap-2 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest">
                            <Filter className="h-3.5 w-3.5 text-teal-600" />
                            Filter
                            <div className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-pulse ml-0.5" />
                        </button>
                    </div>
                </div>

                {/* Table - Scrollable Container */}
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-100/50">
                        {/* Fixed Header */}
                        <div className="overflow-x-auto bg-white/40 backdrop-blur-md rounded-t-xl z-10">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200/50 text-left">
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[25%]">Client Name</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[10%]">Type</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[20%]">Contact</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[25%]">Details</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[10%]">Status</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right w-[10%]">Actions</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scrollable Body - Scrollbar Hidden but correct */}
                        <div className="overflow-y-auto max-h-[400px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            <table className="w-full">
                                <tbody className="divide-y divide-gray-100/50">
                                    {paginatedClients.map((client) => (
                                        <tr key={client._id} className="group hover:bg-white/40 transition-colors cursor-pointer">
                                            <td className="px-4 py-4 whitespace-nowrap w-[25%]">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                                                        {client.matchName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-700">{client.matchName}</div>
                                                        {/* Placeholder for vehicles count */}
                                                        <div className="text-[10px] font-bold text-gray-400">0 Vehicles</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-bold text-white shadow-sm",
                                                    client.type === 'BANK' ? "bg-[#94D8D7]" :
                                                        client.type === 'AGENCY' ? "bg-[#F3C465]" : "bg-purple-400"
                                                )}>
                                                    {client.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-600">{client.contactPerson || '-'}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold">{client.phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-500">{client.gstNumber || 'No GST'}</span>
                                                    <span className="text-[9px] text-gray-400 truncate max-w-[150px]">{client.address || 'No Address'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        client.status === 'ACTIVE' ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                                    )} />
                                                    {client.status}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right w-[10%]">
                                                <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(client)} className="h-8 w-8 rounded-full bg-transparent hover:bg-white text-gray-400 hover:text-blue-600 transition-all flex items-center justify-center">
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(client._id)} className="h-8 w-8 rounded-full bg-transparent hover:bg-white text-gray-400 hover:text-red-500 transition-all flex items-center justify-center">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredClients.length === 0 && (
                                <div className="p-8 text-center text-gray-400 text-sm font-bold">
                                    No clients found. Add one to get started.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Integrated Pagination Controls */}
                {!loading && filteredClients.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-100/30 flex flex-col lg:flex-row justify-between items-center gap-6 px-2">

                        {/* Left: Range Info & Settings */}
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Viewing</span>
                                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md p-1 rounded-xl border border-white/60 shadow-sm">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg border border-white">
                                        <span className="text-xs font-black text-gray-800">
                                            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredClients.length)}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">of</span>
                                        <span className="text-xs font-black text-teal-600">{filteredClients.length}</span>
                                    </div>

                                    {/* Custom Rows Selector */}
                                    <div className="flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-gray-900 transition-colors group relative">
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                            className="bg-transparent text-[10px] font-bold outline-none cursor-pointer appearance-none pr-5 z-10"
                                        >
                                            {[8, 12, 20, 50].map(v => <option key={v} value={v} className="bg-white text-gray-800">{v} / page</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-0 h-3 w-3 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Center: Interactive Page Navigation */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white/30 backdrop-blur-md p-1 rounded-full border border-white/50 shadow-sm">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-white disabled:opacity-20 transition-all active:scale-90"
                                >
                                    <ChevronsLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-white disabled:opacity-20 transition-all active:scale-90"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="flex items-center bg-white/60 p-0.5 rounded-full border border-white">
                                    {getPaginationGroup().map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(item)}
                                            className={cn(
                                                "min-w-[32px] h-8 rounded-full text-[10px] font-black transition-all flex items-center justify-center",
                                                currentPage === item
                                                    ? "bg-gray-900 text-white shadow-md"
                                                    : "text-gray-400 hover:text-gray-900 hover:bg-white"
                                            )}
                                        >
                                            {item}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-white disabled:opacity-20 transition-all active:scale-90"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-white disabled:opacity-20 transition-all active:scale-90"
                                >
                                    <ChevronsRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>




            {/* Modal - Kept the clean design for the form, but applied slight blur */}
            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                                <h2 className="text-lg font-bold text-gray-800">{editMode ? "Edit Client" : "Add New Client"}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                                {/* Branch Selection for Super Admin */}
                                {user?.role === 'SUPER_ADMIN' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold text-gray-700 uppercase">Assign Branch</label>
                                            {editMode && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                    Locked for Integrity
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <select
                                                name="branchId"
                                                value={formData.branchId}
                                                onChange={handleInputChange}
                                                disabled={editMode}
                                                className={cn(
                                                    "w-full px-4 py-3 rounded-xl border outline-none font-medium transition-all appearance-none",
                                                    editMode
                                                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                                        : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-teal-500"
                                                )}
                                                required
                                            >
                                                <option value="">Select Branch</option>
                                                {yards.map(yard => (
                                                    <option key={yard._id} value={yard._id}>{yard.name}</option>
                                                ))}
                                            </select>
                                            {editMode && (
                                                <div className="absolute inset-0 z-10 cursor-not-allowed" title="Branch cannot be changed after creation" />
                                            )}
                                        </div>
                                        {editMode && (
                                            <p className="text-[10px] text-gray-400 font-medium px-1 flex items-center gap-1.5">
                                                <AlertCircle className="h-3 w-3 text-amber-500" />
                                                Branch assignment is locked to maintain data integrity.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Client Name</label>
                                    <input required name="matchName" value={formData.matchName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-medium" placeholder="E.g. HDFC Bank, Bajaj Finance" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Type</label>
                                        <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-medium">
                                            <option value="BANK">Bank</option>
                                            <option value="AGENCY">Agency</option>
                                            <option value="CORPORATE">Corporate</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Person</label>
                                        <input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-medium" placeholder="Manager Name" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone</label>
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-medium" placeholder="+91..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-medium" placeholder="contact@bank.com" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-medium min-h-[80px]" placeholder="Full Address..." />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">GST Number</label>
                                    <input name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-medium uppercase" placeholder="GSTIN..." />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                                        {editMode ? "Save Changes" : "Create Client"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <ConfirmDialog
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ isOpen: false, id: null, loading: false })}
                onConfirm={confirmDelete}
                loading={confirmConfig.loading}
                title="Delete Client?"
                message="Are you sure you want to remove this client? This action will permanently delete all associated data."
                type="danger"
                confirmText="Delete Client"
            />

        </div >
    );
};

export default Clients;
