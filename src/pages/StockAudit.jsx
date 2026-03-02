import {
    ClipboardCheck,
    AlertTriangle,
    CheckCircle2,
    Search,
    ArrowUpRight,
    Maximize2,
    RefreshCw,
    ChevronDown,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import api from "../services/api";
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

const StockAudit = () => {
    const toast = useToast();
    const [activeAudit, setActiveAudit] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pagination & Search States
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);

    const fetchAuditData = async () => {
        setLoading(true);
        try {
            // Fetch stats and active audit
            const [statsRes, activeRes] = await Promise.all([
                api.get('/audit/stats'),
                api.get('/audit/active')
            ]);
            setStats(statsRes.data);
            setActiveAudit(activeRes.data);
        } catch (error) {
            console.error("Failed to fetch audit data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditData();
    }, []);

    const handleStartAudit = async () => {
        try {
            await api.post('/audit/start');
            fetchAuditData(); // Refresh UI
            toast.success("New stock audit started successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to start audit");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Audit Data...</div>;

    // Determine current discrepancies: 
    let allDiscrepancies = [];
    if (activeAudit && activeAudit.discrepancies) {
        allDiscrepancies = activeAudit.discrepancies;
    }

    // Filter by keyword
    let filteredDiscrepancies = allDiscrepancies;
    if (keyword) {
        const lowerKey = keyword.toLowerCase();
        filteredDiscrepancies = allDiscrepancies.filter(item => {
            const plate = item.vehicleId?.licensePlate?.toLowerCase() || item.vehicleId?.toLowerCase() || '';
            const status = item.status?.replace('_', ' ').toLowerCase() || '';
            const notes = item.notes?.toLowerCase() || '';
            return plate.includes(lowerKey) || status.includes(lowerKey) || notes.includes(lowerKey);
        });
    }

    // Pagination
    const totalItems = filteredDiscrepancies.length;
    const pages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const currentPage = Math.min(page, pages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const displayedDiscrepancies = filteredDiscrepancies.slice(startIndex, startIndex + itemsPerPage);

    const isAuditActive = activeAudit && activeAudit.status === 'IN_PROGRESS';
    const totalV = isAuditActive ? activeAudit.totalVehicles : (stats?.totalVehicles || 0);
    const scannedProgress = isAuditActive && totalV > 0
        ? Math.round((activeAudit.verifiedCount / totalV) * 100)
        : (stats?.completionPercentage || 0);

    const pendingProgress = isAuditActive && totalV > 0
        ? Math.round(((totalV - activeAudit.verifiedCount) / totalV) * 100)
        : (100 - (stats?.completionPercentage || 100)); // Default to 100% pending if no history

    const extraCountNum = isAuditActive ? (activeAudit?.extraCount || 0) : (stats?.extraCount || 0);
    const missingCountNum = isAuditActive ? "Pending" : (stats?.missingCount || 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Stock Reconciliation</h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Track and Audit Yard Inventory</p>
                </div>
                {!isAuditActive ? (
                    <button onClick={handleStartAudit} className="px-6 py-3.5 bg-gray-900 hover:bg-black text-white rounded-[1.4rem] font-bold shadow-xl shadow-gray-200 transition-all flex items-center gap-3 text-sm active:scale-95 group">
                        <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                            <RefreshCw className="h-4 w-4" />
                        </div>
                        Start New Audit
                    </button>
                ) : (
                    <div className="px-6 py-3.5 bg-teal-50 text-teal-700 rounded-[1.4rem] font-bold border border-teal-200 shadow-sm flex items-center gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                        Audit In Progress
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Audit Status"
                    timeLabel={isAuditActive ? "Ongoing" : "Last Audit"}
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Scanned", value: `${scannedProgress}%`, icon: ClipboardCheck },
                        { label: "Pending", value: `${pendingProgress}%`, icon: AlertTriangle }
                    ]}
                />
                <SummaryCard
                    title="Discrepancies"
                    timeLabel={isAuditActive ? "Live Current" : "Last Known"}
                    accentColor="bg-red-400"
                    stats={[
                        { label: "Extra Vehicles Found", value: extraCountNum, icon: AlertTriangle },
                        { label: "Missing Vehicles", value: missingCountNum, icon: AlertTriangle }
                    ]}
                />
            </div>

            {/* Discrepancy Table */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50 min-h-[400px]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Discrepancy Report</h3>
                    <div className="group relative flex items-center bg-gray-50/50 backdrop-blur-md border border-gray-200/60 rounded-2xl px-4 py-2.5 w-full md:w-[320px] shadow-sm hover:shadow-md hover:bg-white hover:border-teal-500/30 transition-all duration-500 ring-4 ring-transparent hover:ring-teal-500/5">
                        <Search className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by VIN or Issue..."
                            value={keyword}
                            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                            className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-400 ml-3 w-full"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200/50 text-left">
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">VIN / Chassis</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issue Type</th>

                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {displayedDiscrepancies.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                                                <ClipboardCheck className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-500">No discrepancies reported for active audit.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : displayedDiscrepancies.map((item, idx) => (
                                <tr key={idx} className="group hover:bg-white/40 transition-colors">
                                    <td className="px-4 py-4 text-sm font-bold text-gray-700">
                                        {/* Backend currently only populates id for discrepancies if we do deep populate, but for now we might only have ObjectId. Ideally we populate vehicleId in active audit */}
                                        {item.vehicleId?.licensePlate || item.vehicleId}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className={cn(
                                            "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold border w-fit flex items-center gap-1.5",
                                            item.status === 'MISSING' ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                        )}>
                                            <AlertTriangle className="h-3 w-3" />
                                            {item.status.replace('_', ' ')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-xs font-bold text-gray-600 cursor-help" title={item.notes}>
                                            {item.notes ? item.notes.substring(0, 20) + '...' : 'Under Review'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Premium Compact Pagination */}
                {totalItems > 0 && (
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
                                            <option key={size} value={size}>{size} units</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-hover/select:text-teal-500 transition-colors pointer-events-none" />
                                </div>
                            </div>
                            <div className="h-6 w-[1px] bg-gray-100" />
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                Total Discrepancies: <span className="text-gray-900">{totalItems}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(1)}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all duration-300 hover:shadow-sm shadow-teal-500/10 border border-transparent hover:border-gray-100"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all duration-300 hover:shadow-sm shadow-teal-500/10 border border-transparent hover:border-gray-100"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-center px-4 h-9 bg-white rounded-xl shadow-sm border border-gray-100">
                                <span className="text-[11px] font-black text-gray-700">
                                    <span className="text-teal-600">{currentPage}</span>
                                    <span className="mx-2 text-gray-300">/</span>
                                    <span className="text-gray-400">{pages}</span>
                                </span>
                            </div>

                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    disabled={currentPage === pages}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all duration-300 hover:shadow-sm shadow-teal-500/10 border border-transparent hover:border-gray-100"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPage(pages)}
                                    disabled={currentPage === pages}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 transition-all duration-300 hover:shadow-sm shadow-teal-500/10 border border-transparent hover:border-gray-100"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockAudit;
