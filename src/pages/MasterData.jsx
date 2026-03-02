import { useState, useEffect } from "react";
import api, { getFileUrl } from "../services/api";
import { useToast } from "../context/ToastContext";
import {
    Loader2,
    X,
    Database,
    DollarSign,
    Smartphone,
    Save,
    Plus,
    Edit2,
    Trash2,
    Check,
    QrCode,
    Upload,
    Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";

const MasterData = () => {
    const [activeTab, setActiveTab] = useState("pricing");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [masterData, setMasterData] = useState({
        pricingRules: [],
        repoTypes: [],
        appConfig: {
            requireGps: true,
            requirePhotos: true,
            allowManualEntry: false
        }
    });

    // Modals State
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [editingPricing, setEditingPricing] = useState(null);
    const [pricingForm, setPricingForm] = useState({ type: '', daily: 0, weekly: 0, monthly: 0 });

    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
    const [editingRepo, setEditingRepo] = useState(null);
    const [repoForm, setRepoForm] = useState({ label: '', code: '' });

    const toast = useToast();

    const fetchMasterData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/master-data');
            setMasterData(data);
        } catch (error) {
            console.error("Failed to fetch master data", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterData();
    }, []);

    const handleUpdatePricing = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let updatedRules = [...masterData.pricingRules];
            if (editingPricing !== null) {
                updatedRules[editingPricing] = pricingForm;
            } else {
                updatedRules.push(pricingForm);
            }
            const { data } = await api.patch('/master-data/pricing', { pricingRules: updatedRules });
            setMasterData(data);
            toast.success("Pricing rules updated");
            setIsPricingModalOpen(false);
            setEditingPricing(null);
        } catch (error) {
            toast.error("Failed to save pricing");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateRepoTypes = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let updatedTypes = [...masterData.repoTypes];
            if (editingRepo !== null) {
                updatedTypes[editingRepo] = repoForm;
            } else {
                updatedTypes.push(repoForm);
            }
            const { data } = await api.patch('/master-data/repo-types', { repoTypes: updatedTypes });
            setMasterData(data);
            toast.success("Repo types updated");
            setIsRepoModalOpen(false);
            setEditingRepo(null);
        } catch (error) {
            toast.error("Failed to save repo types");
        } finally {
            setSaving(false);
        }
    };



    const handleDeletePricing = async (index) => {
        if (!window.confirm("Delete this pricing rule?")) return;
        try {
            const updatedRules = masterData.pricingRules.filter((_, i) => i !== index);
            const { data } = await api.patch('/master-data/pricing', { pricingRules: updatedRules });
            setMasterData(data);
            toast.success("Rule removed");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleDeleteRepo = async (index) => {
        if (!window.confirm("Delete this repo type?")) return;
        try {
            const updatedTypes = masterData.repoTypes.filter((_, i) => i !== index);
            const { data } = await api.patch('/master-data/repo-types', { repoTypes: updatedTypes });
            setMasterData(data);
            toast.success("Type removed");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (loading) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center gap-4 text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-xs font-black uppercase tracking-widest">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">Master Configuration</h2>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#1F2937] p-1 rounded-2xl shadow-lg shadow-gray-900/10">
                    <button
                        onClick={() => setActiveTab("pricing")}
                        className={cn("px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2", activeTab === "pricing" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-white")}
                    >
                        <DollarSign className="h-3.5 w-3.5" /> Pricing
                    </button>
                    <button
                        onClick={() => setActiveTab("repo")}
                        className={cn("px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2", activeTab === "repo" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-white")}
                    >
                        <Database className="h-3.5 w-3.5" /> Repo Types
                    </button>
                    <button
                        onClick={() => setActiveTab("payment")}
                        className={cn("px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2", activeTab === "payment" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-white")}
                    >
                        <QrCode className="h-3.5 w-3.5" /> Payment
                    </button>

                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50 min-h-[600px]">

                {activeTab === "pricing" && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-gray-800">Vehicle Pricing Rules</h3>
                            <button
                                onClick={() => { setEditingPricing(null); setPricingForm({ type: '', daily: 0, weekly: 0, monthly: 0 }); setIsPricingModalOpen(true); }}
                                className="px-4 py-2 bg-[#94D8D7] text-teal-900 rounded-xl font-bold hover:bg-teal-200 transition-all flex items-center gap-2 text-xs"
                            >
                                <Plus className="h-4 w-4" /> Add Type
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200/50 text-left">
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle Type</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Daily Rate (₹)</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weekly Rate (₹)</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Monthly Rate (₹)</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {masterData.pricingRules.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No pricing rules defined</td>
                                        </tr>
                                    ) : masterData.pricingRules.map((rule, idx) => (
                                        <tr key={idx} className="group hover:bg-white/40 transition-colors">
                                            <td className="px-4 py-4 font-bold text-gray-700">{rule.type}</td>
                                            <td className="px-4 py-4 text-gray-600 font-mono font-medium">₹{rule.daily}</td>
                                            <td className="px-4 py-4 text-gray-600 font-mono font-medium">₹{rule.weekly}</td>
                                            <td className="px-4 py-4 text-gray-600 font-mono font-medium">₹{rule.monthly}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingPricing(idx); setPricingForm(rule); setIsPricingModalOpen(true); }}
                                                        className="h-8 w-8 rounded-full bg-transparent hover:bg-white text-gray-400 hover:text-blue-600 transition-all flex items-center justify-center border border-transparent hover:border-gray-100"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePricing(idx)}
                                                        className="h-8 w-8 rounded-full bg-transparent hover:bg-white text-gray-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-gray-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "repo" && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-gray-800">Repossession Types</h3>
                            <button
                                onClick={() => { setEditingRepo(null); setRepoForm({ label: '', code: '' }); setIsRepoModalOpen(true); }}
                                className="px-4 py-2 bg-[#94D8D7] text-teal-900 rounded-xl font-bold hover:bg-teal-200 transition-all flex items-center gap-2 text-xs"
                            >
                                <Plus className="h-4 w-4" /> Add Type
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200/50 text-left">
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type Label</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Code</th>
                                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {masterData.repoTypes.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-4 py-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No repo types defined</td>
                                        </tr>
                                    ) : masterData.repoTypes.map((type, idx) => (
                                        <tr key={idx} className="group hover:bg-white/40 transition-colors">
                                            <td className="px-4 py-4 font-bold text-gray-700">{type.label}</td>
                                            <td className="px-4 py-4 text-gray-600 font-mono font-medium">{type.code}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingRepo(idx); setRepoForm(type); setIsRepoModalOpen(true); }}
                                                        className="h-8 w-8 rounded-full bg-transparent hover:bg-white text-gray-400 hover:text-blue-600 transition-all flex items-center justify-center border border-transparent hover:border-gray-100"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRepo(idx)}
                                                        className="h-8 w-8 rounded-full bg-transparent hover:bg-white text-gray-400 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-gray-100"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "payment" && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-10 px-2 mt-2">
                            <div className="h-12 w-12 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 flex-shrink-0">
                                <QrCode className="h-6 w-6 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight">Payment Configuration</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Manage Business QR Code & Bank Transfer Details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Column 1: QR Code & Security */}
                            <div className="space-y-8">
                                <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/60 shadow-sm flex flex-col items-center gap-8 group">
                                    <div className="w-full flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Official QR Code</span>
                                        </div>
                                    </div>

                                    {masterData.paymentQrCode ? (
                                        <div className="relative group/qr">
                                            <div className="h-72 w-72 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 p-4 transition-transform group-hover/qr:scale-[1.02]">
                                                <img
                                                    src={getFileUrl(masterData.paymentQrCode)}
                                                    alt="Payment QR"
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm("Remove this QR code?")) {
                                                        try {
                                                            await api.patch('/master-data/payment-details', { paymentQrCode: '' });
                                                            toast.success("QR Code removed");
                                                            fetchMasterData();
                                                        } catch (e) { toast.error("Failed to remove"); }
                                                    }
                                                }}
                                                className="absolute -top-3 -right-3 h-10 w-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 transition-all opacity-0 group-hover/qr:opacity-100 scale-90 group-hover/qr:scale-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-72 w-72 bg-white/60 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-400">
                                            <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                <Upload className="h-8 w-8 opacity-20" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest px-8 text-center leading-relaxed">No QR Code<br />Uploaded Yet</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center gap-4 w-full">
                                        <label className="w-full max-w-[280px]">
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    if (file.size > 2 * 1024 * 1024) {
                                                        toast.error("File size must be less than 2MB");
                                                        return;
                                                    }

                                                    const formData = new FormData();
                                                    formData.append('image', file);

                                                    setSaving(true);
                                                    try {
                                                        const { data: uploadData } = await api.post('/upload', formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });

                                                        const { data: updatedDoc } = await api.patch('/master-data/payment-details', {
                                                            paymentQrCode: uploadData.filePath
                                                        });

                                                        setMasterData(updatedDoc);
                                                        toast.success("Payment QR code updated securely");
                                                    } catch (e) {
                                                        toast.error("Upload failed. Ensure image is valid.");
                                                    } finally {
                                                        setSaving(false);
                                                    }
                                                }}
                                            />
                                            <div className="w-full py-4 bg-[#1F2937] text-white rounded-2xl font-bold text-center cursor-pointer hover:bg-black transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3">
                                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                                <span className="uppercase tracking-widest text-[11px] font-black">{masterData.paymentQrCode ? 'Update QR Code' : 'Upload QR Code'}</span>
                                            </div>
                                        </label>
                                        <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded">PNG</span>
                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded">JPG</span>
                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded">WEBP</span>
                                            <span className="ml-2">| MAX 2MB</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-amber-100/50 flex gap-6">
                                    <div className="h-12 w-12 bg-amber-100/80 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Smartphone className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">End-User Application View</h4>
                                        <p className="text-[11px] text-amber-800/80 leading-relaxed font-bold">
                                            The configuration above is displayed in real-time to all employees
                                            on their mobile apps during the vehicle exit settlement process.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Transfer Details Form */}
                            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/60 space-y-10 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 rounded-bl-full -mr-10 -mt-10" />

                                <div className="flex items-center gap-4 relative">
                                    <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                                        <Landmark className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 tracking-tight">Bank & Transfer Details</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Primary Direct Settlement Config</p>
                                    </div>
                                </div>

                                <div className="space-y-6 relative">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                                            Business UPI ID
                                            <div className="h-1 w-1 rounded-full bg-blue-400" />
                                        </label>
                                        <input
                                            type="text"
                                            value={masterData.upiId || ''}
                                            onChange={e => setMasterData({ ...masterData, upiId: e.target.value })}
                                            className="w-full bg-white/60 border border-gray-200/80 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-500/30 transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                                            placeholder="payee@okaxis"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                                            Bank Name
                                            <div className="h-1 w-1 rounded-full bg-blue-400" />
                                        </label>
                                        <input
                                            type="text"
                                            value={masterData.bankName || ''}
                                            onChange={e => setMasterData({ ...masterData, bankName: e.target.value })}
                                            className="w-full bg-white/60 border border-gray-200/80 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-500/30 transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                                            placeholder="State Bank of India"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                                            Account Number
                                            <div className="h-1 w-1 rounded-full bg-blue-400" />
                                        </label>
                                        <input
                                            type="text"
                                            value={masterData.bankAccount || ''}
                                            onChange={e => setMasterData({ ...masterData, bankAccount: e.target.value })}
                                            className="w-full bg-white/60 border border-gray-200/80 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-500/30 transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                                            placeholder="301239847123"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest flex items-center gap-2">
                                            IFSC Code
                                            <div className="h-1 w-1 rounded-full bg-blue-400" />
                                        </label>
                                        <input
                                            type="text"
                                            value={masterData.ifscCode || ''}
                                            onChange={e => setMasterData({ ...masterData, ifscCode: e.target.value })}
                                            className="w-full bg-white/60 border border-gray-200/80 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-500/30 transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/5 placeholder:text-gray-300"
                                            placeholder="SBIN0001234"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={async () => {
                                        setSaving(true);
                                        try {
                                            const { data: updatedDoc } = await api.patch('/master-data/payment-details', {
                                                upiId: masterData.upiId,
                                                bankName: masterData.bankName,
                                                bankAccount: masterData.bankAccount,
                                                ifscCode: masterData.ifscCode
                                            });
                                            setMasterData(updatedDoc);
                                            toast.success("Transfer details saved successfully");
                                        } catch (e) {
                                            toast.error("Failed to save bank details");
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    disabled={saving}
                                    className="w-full py-4 bg-[#1F2937] text-white rounded-2xl font-bold shadow-xl shadow-gray-900/10 hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50 relative z-10"
                                >
                                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                                    <span className="uppercase tracking-widest text-[11px] font-black">Save Transfer Details</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}



            </div>

            {/* Modals */}
            {isPricingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-black text-gray-900">{editingPricing !== null ? 'Edit Pricing' : 'Add Vehicle Type'}</h3>
                            <button onClick={() => setIsPricingModalOpen(false)} className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePricing} className="p-8 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Vehicle Type Label</label>
                                <input
                                    required
                                    value={pricingForm.type}
                                    onChange={e => setPricingForm({ ...pricingForm, type: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50"
                                    placeholder="e.g. SUV, Heavy Truck"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 text-center">Daily</label>
                                    <input
                                        type="number"
                                        required
                                        value={pricingForm.daily}
                                        onChange={e => setPricingForm({ ...pricingForm, daily: Number(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 text-center">Weekly</label>
                                    <input
                                        type="number"
                                        required
                                        value={pricingForm.weekly}
                                        onChange={e => setPricingForm({ ...pricingForm, weekly: Number(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none text-center"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 ml-1 text-center">Monthly</label>
                                    <input
                                        type="number"
                                        required
                                        value={pricingForm.monthly}
                                        onChange={e => setPricingForm({ ...pricingForm, monthly: Number(e.target.value) })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none text-center"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl shadow-gray-900/10 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingPricing !== null ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />)}
                                <span className="uppercase tracking-widest text-[11px] font-black">{editingPricing !== null ? 'Save Changes' : 'Add Type'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isRepoModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-black text-gray-900">{editingRepo !== null ? 'Edit Repo Type' : 'Add Repo Type'}</h3>
                            <button onClick={() => setIsRepoModalOpen(false)} className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateRepoTypes} className="p-8 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Label</label>
                                <input
                                    required
                                    value={repoForm.label}
                                    onChange={e => setRepoForm({ ...repoForm, label: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50"
                                    placeholder="e.g. Valuation"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Short Code</label>
                                <input
                                    required
                                    value={repoForm.code}
                                    onChange={e => setRepoForm({ ...repoForm, code: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50"
                                    placeholder="e.g. VAL"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl shadow-gray-900/10 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingRepo !== null ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />)}
                                <span className="uppercase tracking-widest text-[11px] font-black">{editingRepo !== null ? 'Save Changes' : 'Add Type'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterData;
