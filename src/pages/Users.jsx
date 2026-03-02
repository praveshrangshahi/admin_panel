import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    ShieldCheck,
    MoreVertical,
    Plus,
    UserCheck,
    ArrowUpRight,
    Loader2,
    Trash2,
    Edit2,
    X,
    Check,
    Download,
    Search,
    ChevronDown,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import api, { getFileUrl } from "../services/api";
import { useToast } from "../context/ToastContext";

// --- Sub-Components ---
const SummaryCard = ({ title, timeLabel, stats, accentColor = "bg-[#94D8D7]" }) => (
    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 relative overflow-visible shadow-sm hover:shadow-md transition-all border border-white/50 group">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
                <div className="mt-2 inline-flex items-center px-4 py-1.5 rounded-full bg-white/50 border border-white/60 shadow-sm text-[10px] font-bold text-gray-500">
                    {timeLabel} <ArrowUpRight className="h-3 w-3 ml-1 text-gray-400" />
                </div>
            </div>
            <div className={cn("absolute -top-1 -right-1 h-20 w-20 rounded-bl-[2.5rem] bg-[#F5FBFB] flex items-center justify-center")}>
                <button className={cn("h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 group-hover:rotate-45", accentColor)}>
                    <ArrowUpRight className="h-6 w-6" />
                </button>
            </div>
        </div>
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
                </div>
            ))}
        </div>
    </div>
);

// --- Add/Edit User Modal ---
const AddUserModal = ({ onClose, onSave, yards, initialData, defaultBranchId }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        email: '',
        password: '',
        role: 'GATE_STAFF',
        branchId: defaultBranchId || '',
        status: 'ACTIVE',
        phone: '',
        bloodGroup: '',
        profileImage: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        setUploading(true);
        try {
            const { data } = await api.post('/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, profileImage: data.filePath }));
        } catch (error) {
            console.error("Upload error", error);
            // toast error? useToast is in parent, but this is a sub-component.
            // For now just alert or ignore.
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSave(formData);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-black text-gray-900">{initialData ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Left Side: Avatar/Image */}
                            <div className="w-full md:w-48 flex flex-col items-center gap-4">
                                <div className="h-40 w-40 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden relative group">
                                    {formData.profileImage ? (
                                        <img src={getFileUrl(formData.profileImage)} className="h-full w-full object-cover" alt="Profile" />
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                                            <Users className="h-10 w-10 mb-2 opacity-20" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">No Photo</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        <span className="text-white text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </span>
                                    </label>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase text-center leading-relaxed">
                                    Upload professional photo <br /> for ID card generation
                                </p>
                            </div>

                            {/* Right Side: Inputs */}
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                                        <input
                                            required
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all"
                                            placeholder="e.g. Rahul Singh"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all"
                                            placeholder="rahul@yms.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Phone Number</label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Blood Group</label>
                                        <input
                                            name="bloodGroup"
                                            value={formData.bloodGroup}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all"
                                            placeholder="e.g. O+ Positive"
                                        />
                                    </div>
                                </div>

                                {!initialData && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Password</label>
                                        <input
                                            required
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Role / Access Level</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none"
                                    >
                                        <option value="GATE_STAFF">Employee (Mobile App)</option>
                                        <option value="SUPER_ADMIN">Super Admin (Admin Panel)</option>
                                    </select>
                                </div>

                                {formData.role !== 'SUPER_ADMIN' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Assign Branch</label>
                                        <select
                                            name="branchId"
                                            value={formData.branchId || ''}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/10 transition-all appearance-none"
                                        >
                                            <option value="">Select Branch...</option>
                                            {yards.map(yard => (
                                                <option key={yard._id} value={yard._id}>{yard.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="w-full py-4 bg-[#1F2937] text-white rounded-2xl font-bold shadow-xl shadow-gray-900/10 hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (initialData ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />)}
                            <span className="uppercase tracking-widest text-[11px] font-black">
                                {initialData ? 'Save Changes' : 'Create User Profile'}
                            </span>
                        </button>
                    </form >
                </div >
            </div >
        </div >
    );
};


// --- ID Card Component ---
const IDCardModal = ({ user, onClose }) => {
    const [side, setSide] = useState('front'); // 'front' or 'back'
    const [isDownloading, setIsDownloading] = useState(false);

    // Config for print
    const printRef = useRef(null);

    const handleDownload = async () => {
        if (!printRef.current) return;
        setIsDownloading(true);

        try {
            // 1. Create a hidden iframe for native printing
            const iframe = document.createElement('iframe');
            Object.assign(iframe.style, {
                position: 'fixed',
                top: '-10000px',
                left: '-10000px',
                width: '0',
                height: '0',
                border: 'none',
                visibility: 'hidden'
            });
            document.body.appendChild(iframe);

            // 2. Prepare HTML with Google Fonts and Print Styles
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            const contentHTML = printRef.current.outerHTML;

            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>ID Card - ${user.name}</title>
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
                        <style>
                            @page { margin: 0; size: auto; }
                            body { 
                                margin: 0; 
                                padding: 20px; 
                                display: flex; 
                                align-items: center; 
                                justify-content: center; 
                                background-color: #ffffff;
                                font-family: 'Inter', sans-serif;
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact;
                            }
                            * { box-sizing: border-box; }
                        </style>
                    </head>
                    <body>
                        ${contentHTML}
                    </body>
                </html>
            `);
            doc.close();

            // 3. Wait for content/images to load
            await new Promise(resolve => {
                iframe.onload = resolve;
                // Fallback timeout in case onload doesn't fire fast enough or already fired
                setTimeout(resolve, 500);
            });

            // 4. Trigger Print
            // Note: print() is blocking in many contexts, so we cleanup after
            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            // 5. Cleanup
            // We delay removal slightly to ensure print dialog doesn't break if it's non-blocking
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 5000);

        } catch (error) {
            console.error("Print Error:", error);
            alert("Failed to open print dialog.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (!user) return null;

    // Helper to render card face (reused for visible and print)
    // Note: Using explicit HEX codes via inline styles because html2canvas crashes on Tailwind's 'oklch' colors in v4
    const CardFace = ({ type }) => (
        <div style={{ width: '320px', height: '540px', backgroundColor: '#ffffff', borderRadius: '2rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e5e7eb', position: 'relative', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
            {type === 'front' ? (
                <>
                    {/* Geometric Header Background */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '220px', overflow: 'hidden' }}>
                        {/* Dark Diagonal Shape */}
                        <div style={{ position: 'absolute', top: '-60px', left: '-50px', width: '600px', height: '220px', backgroundColor: '#374151', transform: 'rotate(-12deg)', transformOrigin: 'top left', zIndex: 0 }} />

                        {/* Logo - Top Left */}
                        <div style={{ position: 'absolute', top: '8px', left: '20px', zIndex: 20, transformOrigin: 'top left' }}>
                            <div style={{ height: '44px', width: '56px', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.8)', overflow: 'hidden', padding: '4px' }}>
                                <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        </div>

                        {/* Teal Diagonal Shape */}
                        <div style={{ position: 'absolute', top: '75px', left: '-50px', width: '600px', height: '80px', backgroundColor: '#2DD4BF', transform: 'rotate(-12deg)', transformOrigin: 'top left', zIndex: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} />

                        {/* Company Name */}
                        <div style={{ position: 'absolute', top: '60px', left: '16px', zIndex: 20, transform: 'rotate(-12deg)', transformOrigin: 'top left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1, gap: '4px' }}>
                            <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.25rem', letterSpacing: '0.1em', textTransform: 'uppercase', textShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>JAYANT ASSOCIATES</span>
                            <span style={{ color: '#f0fdfa', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', textShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', opacity: 0.95, paddingLeft: '2px' }}>THE COMPLETE PARKING YARD</span>
                        </div>
                    </div>

                    {/* Profile Photo */}
                    <div style={{ position: 'relative', marginTop: '88px', zIndex: 10, display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                        <div style={{ height: '128px', width: '128px', borderRadius: '40px', padding: '6px', backgroundColor: '#ffffff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #f3f4f6' }}>
                            <div style={{ height: '100%', width: '100%', borderRadius: '34px', backgroundColor: '#f9fafb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user.profileImage ? (
                                    <img
                                        src={getFileUrl(user.profileImage)}
                                        alt="Profile"
                                        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                        crossOrigin="anonymous"
                                    />
                                ) : (
                                    <Users style={{ height: '48px', width: '48px', color: '#d1d5db' }} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name & Role */}
                    <div style={{ textAlign: 'center', marginBottom: '24px', zIndex: 10, paddingLeft: '16px', paddingRight: '16px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em', lineHeight: 1.25 }}>{user.name}</h2>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2DD4BF', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '8px' }}>{user.role === 'SUPER_ADMIN' ? 'ADMIN' : 'GATE STAFF'}</p>
                    </div>

                    {/* Details Box */}
                    <div style={{ marginLeft: '20px', marginRight: '20px', backgroundColor: '#374151', borderRadius: '24px', padding: '20px 24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', position: 'relative', overflow: 'hidden', marginBottom: 'auto' }}>
                        <div style={{ color: '#ffffff', fontSize: '0.875rem', position: 'relative', zIndex: 10 }}>

                            <div style={{ display: 'grid', gridTemplateColumns: '60px 10px 1fr', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase' }}>ID No</span>
                                <span style={{ color: '#4b5563' }}>:</span>
                                <span style={{ fontWeight: 800, letterSpacing: '0.05em', color: '#2DD4BF' }}>YMS-{user._id?.substring(user._id.length - 5).toUpperCase() || '00000'}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '60px 10px 1fr', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase' }}>Blood</span>
                                <span style={{ color: '#4b5563' }}>:</span>
                                <span style={{ fontWeight: 700 }}>{user.bloodGroup || 'Not Provided'}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '60px 10px 1fr', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontWeight: 600, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase' }}>Email</span>
                                <span style={{ color: '#4b5563' }}>:</span>
                                <span style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px' }}>{user.email}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '60px 10px 1fr', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: '#9ca3af', fontSize: '10px', textTransform: 'uppercase' }}>Phone</span>
                                <span style={{ color: '#4b5563' }}>:</span>
                                <span style={{ fontWeight: 700, letterSpacing: '0.025em' }}>{user.phone || '+91 XXXXX XXXXX'}</span>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px', backgroundColor: '#2DD4BF', opacity: 0.15, borderRadius: '9999px', filter: 'blur(30px)' }} />
                    </div>

                    {/* Footer Barcode */}
                    <div style={{ position: 'relative', height: '96px', paddingLeft: '24px', paddingRight: '24px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', height: '32px', alignItems: 'flex-end', gap: '2px', opacity: 0.8 }}>
                            {[...Array(45)].map((_, i) => (
                                <div key={i} style={{ backgroundColor: '#374151', width: i % 3 === 0 ? '2px' : '1px', height: i % 5 === 0 ? '100%' : '80%' }} />
                            ))}
                        </div>
                        <span style={{ fontSize: '8px', fontWeight: 900, color: '#9ca3af', marginTop: '8px', letterSpacing: '0.5em', textTransform: 'uppercase' }}>{user._id || 'BC-000000000'}</span>
                    </div>
                </>
            ) : (
                <>
                    {/* Small Header */}
                    <div style={{ position: 'relative', height: '96px', overflow: 'hidden', marginBottom: '24px' }}>
                        <div style={{ position: 'absolute', top: '-80px', left: '-20px', width: '500px', height: '160px', backgroundColor: '#374151', transform: 'rotate(-8deg)' }} />
                        <div style={{ position: 'absolute', top: '40px', left: '-20px', width: '500px', height: '40px', backgroundColor: '#2DD4BF', transform: 'rotate(-8deg)' }} />

                        {/* Full Company Name Back */}
                        <div style={{ position: 'absolute', top: '8px', left: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', zIndex: 10, lineHeight: 1.25 }}>
                            <span style={{ color: '#ffffff', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>JAYANT ASSOCIATES</span>
                            <span style={{ color: '#2DD4BF', fontWeight: 700, fontSize: '0.55rem', letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9 }}>THE COMPLETE PARKING YARD</span>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div style={{ paddingLeft: '32px', paddingRight: '32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Terms */}
                        <div>
                            <h3 style={{ color: '#374151', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', marginBottom: '12px', borderBottom: '2px solid #2DD4BF', display: 'inline-block', paddingBottom: '4px' }}>Terms & Conditions</h3>
                            <ul style={{ listStyleType: 'disc', listStylePosition: 'outside', fontSize: '10px', color: '#6b7280', fontWeight: 500, paddingLeft: '12px', margin: 0 }}>
                                <li style={{ marginBottom: '6px' }}>This card is the property of <span style={{ fontWeight: 700, color: '#374151' }}>Jayant Associates</span>.</li>
                                <li style={{ marginBottom: '6px' }}>Transfer of this identity card to another person is strictly prohibited.</li>
                                <li style={{ marginBottom: '6px' }}>The card holder is responsible for the safe custody of this card.</li>
                                <li>If found, please return to the office address mentioned below.</li>
                            </ul>
                        </div>

                        {/* Emergency */}
                        <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <div style={{ height: '8px', width: '8px', borderRadius: '9999px', backgroundColor: '#ef4444' }} />
                                <span style={{ fontSize: '10px', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Emergency Contact</span>
                            </div>
                            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', letterSpacing: '0.05em', margin: 0 }}>+91 1122 334455</p>
                        </div>

                        {/* Address */}
                        <div>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Office Address</span>
                            <p style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', lineHeight: 1.375, marginTop: '4px' }}>
                                Plot No. 45, Transport Nagar,<br />
                                Behind Indian Oil Pump,<br />
                                New Delhi, 110042
                            </p>
                        </div>

                        {/* Signature */}
                        <div style={{ marginTop: 'auto', marginBottom: '16px', textAlign: 'right' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Signature_sample.svg/1200px-Signature_sample.svg.png" style={{ height: '32px', marginLeft: 'auto', opacity: 0.6, filter: 'grayscale(100%)', marginBottom: '4px' }} alt="Sign" />
                            <div style={{ height: '1px', width: '128px', backgroundColor: '#d1d5db', marginLeft: 'auto' }} />
                            <p style={{ fontSize: '9px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginTop: '4px' }}>Authorized Signatory</p>
                        </div>
                    </div>

                    {/* Geometric Footer */}
                    <div style={{ height: '16px', backgroundColor: '#374151', width: '100%' }} />
                </>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20"
                >
                    <ArrowUpRight className="h-5 w-5 rotate-45" />
                </button>

                {/* Visible Card (Toggles) */}
                <div className="relative w-[320px] h-[540px] perspective-1000">
                    <div className={`w-full h-full transition-transform duration-500 ${side === 'back' ? '' : ''}`}>
                        <CardFace type={side} />
                    </div>
                </div>

                {/* Hidden Print Container (Available for Capture) */}
                {/* Fixed positioning off-screen can cause empty renders. Using opacity/z-index ensures it renders. */}
                <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -50, opacity: 0, pointerEvents: 'none', overflow: 'hidden', height: 0, width: 0 }}>
                    <div ref={printRef} style={{ display: 'flex', gap: '16px', padding: '32px', backgroundColor: '#ffffff', minWidth: '800px' }}>
                        <style>
                            {`
                                * {
                                    border-color: #e5e7eb !important;
                                    outline-color: transparent !important;
                                    box-shadow: none !important;
                                }
                            `}
                        </style>
                        <CardFace type="front" />
                        <CardFace type="back" />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    {/* Toggle Button */}
                    <button
                        onClick={() => setSide(side === 'front' ? 'back' : 'front')}
                        className="flex-1 py-3 bg-white/10 backdrop-blur text-white rounded-2xl font-bold border border-white/20 hover:bg-white/20 transition-all text-xs flex items-center justify-center gap-2"
                    >
                        {side === 'front' ? 'Show Back Side' : 'Show Front Side'}
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex-1 py-3 bg-white text-gray-900 rounded-2xl font-bold shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isDownloading ? (
                            <div className="h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
                        )}
                        {isDownloading ? 'Print / PDF' : 'Print / PDF'}
                    </button>
                </div>

            </div>
        </div>
    );
};

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [yards, setYards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Pagination & Search State
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [keyword, setKeyword] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);

    const toast = useToast();
    const { selectedBranch } = useAuth();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                pageNumber: page,
                pageSize: itemsPerPage,
                keyword: keyword
            };
            if (selectedBranch && selectedBranch !== 'ALL') {
                params.branchId = selectedBranch;
            }
            const { data } = await api.get('/users', { params });
            setUsers(data.users);
            setPages(data.pages);
            setTotalUsers(data.total);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const fetchYards = async () => {
        try {
            const { data } = await api.get('/yards');
            setYards(data);
        } catch (error) {
            console.error("Error fetching yards:", error);
        }
    };

    useEffect(() => {
        // Debounce search
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [page, itemsPerPage, keyword, selectedBranch]);

    useEffect(() => {
        setPage(1); // Reset to first page when search or branch changes
    }, [keyword, selectedBranch]);

    useEffect(() => {
        fetchYards();
    }, []);

    const handleCreateUser = async (formData) => {
        try {
            await api.post('/users', formData);
            toast.success("User created successfully");
            fetchUsers();
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error creating user:", error);
            toast.error(error.response?.data?.message || "Failed to create user");
        }
    };

    const handleUpdateUser = async (formData) => {
        try {
            // Only send password if it's not empty (handled in backend but good to be explicit/careful)
            // But here formData has password, backend handles update logic.
            await api.put(`/users/${editingUser._id}`, formData);
            toast.success("User updated successfully");
            fetchUsers();
            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error(error.response?.data?.message || "Failed to update user");
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const activeUsersCount = users.filter(u => u.status === 'ACTIVE').length;
    // Mock "Online Now" for now as we don't have socket/real-time status yet
    const onlineUsersCount = Math.floor(Math.random() * (activeUsersCount + 1));

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* ID Card Modal */}
            {selectedUser && (
                <IDCardModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}

            {/* Add/Edit Modal */}
            {(isAddModalOpen || editingUser) && (
                <AddUserModal
                    onClose={() => { setIsAddModalOpen(false); setEditingUser(null); }}
                    onSave={editingUser ? handleUpdateUser : handleCreateUser}
                    yards={yards}
                    initialData={editingUser}
                    defaultBranchId={selectedBranch}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">User Management</h2>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 bg-[#1F2937] text-white rounded-2xl font-bold shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center gap-2 text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="System Users"
                    timeLabel="Total"
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Active Accounts", value: activeUsersCount, icon: Users },
                        { label: "Online Now", value: onlineUsersCount, icon: UserCheck }
                    ]}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50 min-h-[500px]">

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 px-2 mt-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto">
                        <h3 className="text-xl font-black text-gray-800 tracking-tight">System Users</h3>

                        {/* Integrated Search Pill */}
                        <div className="group relative flex items-center bg-white/50 backdrop-blur-md border border-gray-200/60 rounded-2xl px-4 py-2.5 w-full md:w-[320px] shadow-sm hover:shadow-md hover:bg-white hover:border-teal-500/30 transition-all duration-500 ring-4 ring-transparent hover:ring-teal-500/5">
                            <Search className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-400 ml-3 w-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200/50 text-left">
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Created At</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {users.map((user) => (
                                <tr key={user._id} className="group hover:bg-white/40 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                                                {user.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-700">{user.name}</div>
                                                <div className="text-[10px] font-bold text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-bold border",
                                            user.role === 'SUPER_ADMIN' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                        )}>{user.role === 'SUPER_ADMIN' ? 'Admin' : 'Employee'}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                user.status === 'ACTIVE' ? "bg-green-500 animate-pulse" : "bg-gray-400"
                                            )} />
                                            {user.status}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-xs font-bold text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                                                className="h-8 w-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all flex items-center justify-center"
                                                title="View ID Card"
                                            >
                                                <ShieldCheck className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="h-8 w-8 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-600 transition-all flex items-center justify-center"
                                                title="Edit User"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="h-8 w-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-all flex items-center justify-center"
                                                title="Delete User"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="text-center py-20 text-gray-400 font-bold">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Premium Compact Pagination */}
                <div className="mt-8 pt-6 border-t border-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-6 px-2">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show</span>
                            <div className="relative group/select">
                                <select
                                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2 text-[11px] font-black text-gray-700 outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/30 transition-all transition-duration-300 cursor-pointer shadow-sm"
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setPage(1);
                                    }}
                                >
                                    {[8, 12, 24, 48].map(size => (
                                        <option key={size} value={size}>{size} rows</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-hover/select:text-teal-500 transition-colors pointer-events-none" />
                            </div>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-100" />
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Total Users: <span className="text-gray-900">{totalUsers} Employees</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all duration-300 hover:shadow-sm shadow-teal-500/10 border border-transparent hover:border-gray-100"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all duration-300 hover:shadow-sm shadow-teal-500/10 border border-transparent hover:border-gray-100"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex items-center px-4 h-9 bg-white rounded-xl shadow-sm border border-gray-100">
                            <span className="text-[11px] font-black text-gray-700">
                                <span className="text-teal-600">{page}</span>
                                <span className="mx-2 text-gray-300">/</span>
                                <span className="text-gray-400">{pages}</span>
                            </span>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() => setPage(p => Math.min(pages, p + 1))}
                                disabled={page === pages}
                                className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all duration-300 hover:shadow-sm shadow-teal-500/10 border border-transparent hover:border-gray-100"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(pages)}
                                disabled={page === pages}
                                className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all duration-300 hover:shadow-sm shadow-teal-500/10 border border-transparent hover:border-gray-100"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
