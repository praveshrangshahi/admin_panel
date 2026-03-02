import {
    Search,
    Filter,
    ArrowUpRight,
    Maximize2,
    MoreVertical,
    LogIn,
    LogOut,
    Clock,
    Camera,
    FileText,
    CheckCircle2,
    ChevronDown,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
    X,
    Image
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import api, { getFileUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";

// --- Sub-Components (Consistent with Dashboard) ---

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
                    <div className="h-8 w-8 rounded-full border border-white/60 flex items-center justify-center">
                        <Maximize2 className="h-3.5 w-3.5 text-gray-300" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);


const EntryExit = () => {
    const [activeTab, setActiveTab] = useState("entry");
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalLogs, setTotalLogs] = useState(0);
    const [keyword, setKeyword] = useState("");
    const [selectedLog, setSelectedLog] = useState(null);

    const { user, selectedBranch } = useAuth();

    // Stats
    const [stats, setStats] = useState({
        parked: 0,
        entries: 0,
        exits: 0
    });

    useEffect(() => {
        setPage(1); // Reset page when branch changes
        fetchLogs();
        fetchStats();
    }, [activeTab, page, itemsPerPage, keyword, selectedBranch]);

    const fetchStats = async () => {
        try {
            const branchQuery = selectedBranch && selectedBranch !== 'ALL' ? `?branchId=${selectedBranch}` : '';
            const { data } = await api.get(`/vehicles/logs/stats${branchQuery}`);
            setStats({
                parked: data.parkedCount,
                entries: data.entriesToday,
                exits: data.exitsToday
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const branchQuery = selectedBranch && selectedBranch !== 'ALL' ? `&branchId=${selectedBranch}` : '';
            const { data } = await api.get(`/vehicles/logs?type=${activeTab}&pageNumber=${page}&pageSize=${itemsPerPage}&keyword=${keyword}${branchQuery}`);
            setLogs(data.logs);
            setPages(data.pages);
            setTotalLogs(data.total);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching logs:", error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">Entry & Exit Management</h2>
                </div>
                <div className="flex bg-[#1F2937] p-1 rounded-2xl shadow-lg shadow-gray-900/10">
                    <button
                        onClick={() => { setActiveTab("entry"); setPage(1); }}
                        className={cn("px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2", activeTab === "entry" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-white")}
                    >
                        <LogIn className="h-3.5 w-3.5" /> Entry Log
                    </button>
                    <button
                        onClick={() => { setActiveTab("exit"); setPage(1); }}
                        className={cn("px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2", activeTab === "exit" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-white")}
                    >
                        <LogOut className="h-3.5 w-3.5" /> Exit Log
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="In Yard"
                    timeLabel="Current Stock"
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Parked Vehicles", value: stats.parked || "0", icon: CheckCircle2 }
                    ]}
                />
                <SummaryCard
                    title="Entries"
                    timeLabel="Today"
                    accentColor="bg-[#94D8D7]"

                    stats={[
                        { label: "Total Entries", value: stats.entries || "0", icon: LogIn }
                    ]}
                />
                <SummaryCard
                    title="Exits"
                    timeLabel="Today"
                    accentColor="bg-[#F3C465]"
                    stats={[
                        { label: "Total Exits", value: stats.exits || "0", icon: LogOut }
                    ]}
                />
            </div>

            {/* Logs Table Container */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50 min-h-[500px]">

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <h3 className="text-lg font-bold text-gray-800">{activeTab === "entry" ? "Vehicle Entry History" : "Vehicle Exit History"}</h3>

                        {/* Integrated Search Pill */}
                        <div className="group relative flex items-center bg-gray-50/50 backdrop-blur-md border border-gray-200/60 rounded-2xl px-4 py-2.5 w-full md:w-[320px] shadow-sm hover:shadow-md hover:bg-white hover:border-teal-500/30 transition-all duration-500 ring-4 ring-transparent hover:ring-teal-500/5">
                            <Search className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search plate or vehicle..."
                                value={keyword}
                                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                                className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-400 ml-3 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200/50 text-left">
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gate / Time</th>
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeTab === "entry" ? "Handled By" : "Approved By"}</th>
                                {activeTab === "exit" && <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>}
                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reading / Status</th>
                                {activeTab === "exit" && <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>}

                                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <div className="h-12 w-12 rounded-full border-4 border-teal-500/10 border-t-teal-500 animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400 animate-pulse">Loading Logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-20 text-gray-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 bg-gray-50 rounded-[2rem] flex items-center justify-center">
                                                <FileText className="h-8 w-8 text-gray-200" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No logs found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr key={log._id} className="group hover:bg-white/40 transition-colors cursor-pointer">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 font-bold shadow-sm">
                                                {activeTab === "entry" ? <LogIn className="h-4 w-4 text-teal-600" /> : <LogOut className="h-4 w-4 text-orange-500" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-700">{log.vehicleId?.make} {log.vehicleId?.model}</div>
                                                <div className="text-[10px] font-bold text-gray-400">{log.vehicleId?.licensePlate}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-600">{log.gateNumber || 'Main Gate'}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="text-xs font-bold text-gray-600">{log.handledBy?.name || 'Unknown'}</span>
                                    </td>
                                    {activeTab === "exit" && (
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-xs font-bold text-gray-600">{log.customerName || '-'}</span>
                                        </td>
                                    )}

                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {activeTab === "entry" ? (
                                            <span className="text-xs font-bold text-gray-600">{log.odometerReading} km</span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-[9px] font-bold border shadow-sm bg-green-50 text-green-700 border-green-100">
                                                RELEASED
                                            </span>
                                        )}
                                    </td>
                                    {activeTab === "exit" && (
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {log.paymentMode === 'YARD_TRANSFER' ? (
                                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                                                        YARD TRANSFER
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-green-700">₹{log.paymentAmount}</span>
                                                )}
                                                {log.paymentScreenshot && (
                                                    <button className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 hover:bg-blue-100" title="View Screenshot">
                                                        <FileText className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}

                                    <td className="px-4 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="h-8 w-8 rounded-full bg-white/60 hover:bg-white text-gray-400 hover:text-teal-600 transition-all flex items-center justify-center shadow-sm"
                                            >
                                                <Camera className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                                    {[15, 25, 50, 100].map(size => (
                                        <option key={size} value={size}>{size} rows</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-hover/select:text-teal-500 transition-colors pointer-events-none" />
                            </div>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-100" />
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Total Logs: <span className="text-gray-900">{totalLogs} Entries</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-200/50 shadow-inner">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
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
                                className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(pages)}
                                disabled={page === pages}
                                className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-white text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border border-white", selectedLog.type === 'ENTRY' ? "bg-teal-50" : "bg-orange-50")}>
                                    {selectedLog.type === 'ENTRY' ? <LogIn className="h-6 w-6 text-teal-600" /> : <LogOut className="h-6 w-6 text-orange-500" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">
                                        {selectedLog.vehicleId?.make} {selectedLog.vehicleId?.model}
                                    </h3>
                                    <p className="text-xs font-bold text-gray-400">{selectedLog.vehicleId?.licensePlate}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Key Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Log Type</p>
                                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border", selectedLog.type === 'ENTRY' ? "bg-teal-50 text-teal-700 border-teal-100" : "bg-orange-50 text-orange-700 border-orange-100")}>
                                        {selectedLog.type}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</p>
                                    <p className="text-sm font-bold text-gray-700">{new Date(selectedLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                                    <p className="text-sm font-bold text-gray-700">{new Date(selectedLog.timestamp).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gate</p>
                                    <p className="text-sm font-bold text-gray-700">{selectedLog.gateNumber || 'Main Gate'}</p>
                                </div>
                            </div>

                            {/* Specific Details */}
                            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 mb-8">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                                    Log Particulars
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                                        <span className="text-xs font-bold text-gray-500">Handled By</span>
                                        <span className="text-xs font-bold text-gray-900">{selectedLog.handledBy?.name || 'Unknown'}</span>
                                    </div>

                                    {selectedLog.type === 'ENTRY' && (
                                        <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                                            <span className="text-xs font-bold text-gray-500">Odometer Reading</span>
                                            <span className="text-xs font-bold text-teal-600">{selectedLog.odometerReading} km</span>
                                        </div>
                                    )}

                                    {selectedLog.type === 'EXIT' && (
                                        <>
                                            <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                                                <span className="text-xs font-bold text-gray-500">Customer Name</span>
                                                <span className="text-xs font-bold text-gray-900">{selectedLog.customerName || '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                                                <span className="text-xs font-bold text-gray-500">Payment Mode</span>
                                                <span className="text-xs font-bold text-gray-900">{selectedLog.paymentMode}</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                                                <span className="text-xs font-bold text-gray-500">Amount Paid</span>
                                                <span className="text-xs font-bold text-green-600">₹{selectedLog.paymentAmount}</span>
                                            </div>
                                            {selectedLog.paymentRemarks && (
                                                <div className="col-span-2 mt-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Remarks</p>
                                                    <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100">{selectedLog.paymentRemarks}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Photos / Screenshots */}
                            {(selectedLog.type === 'EXIT' && selectedLog.paymentScreenshot) && (
                                <div>
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Image className="h-3.5 w-3.5 text-gray-400" />
                                        Payment Proof
                                    </h4>
                                    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative group">
                                        <img src={getFileUrl(selectedLog.paymentScreenshot)} alt="Payment Proof" className="w-full h-auto object-cover max-h-[300px]" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a
                                                href={getFileUrl(selectedLog.paymentScreenshot)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 bg-white rounded-full text-xs font-bold text-gray-900 shadow-lg transform scale-90 group-hover:scale-100 transition-all"
                                            >
                                                View Full Size
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Photos (If Entry) */}
                            {selectedLog.type === 'ENTRY' && selectedLog.vehicleId?.photos && (
                                <div>
                                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Image className="h-3.5 w-3.5 text-gray-400" />
                                        Vehicle Photos
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(selectedLog.vehicleId.photos).map(([key, url]) => {
                                            if (!url) return null;
                                            return (
                                                <div key={key} className="space-y-2">
                                                    <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative group">
                                                        <img src={getFileUrl(url)} alt={key} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <a href={getFileUrl(url)} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full shadow-sm"><Maximize2 className="h-3 w-3" /></a>
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-center font-bold text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntryExit;
