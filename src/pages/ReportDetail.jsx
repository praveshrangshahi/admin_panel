import { useState, useEffect, useMemo } from "react";
import {
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    Filter,
    Search,
    Share2,
    Loader2,
    CalendarDays,
    ChevronDown,
    FileSpreadsheet,
    Table
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { generateReportPDF } from "../utils/reportPdfGenerator";
import { downloadCSV, downloadExcel } from "../utils/reportExportUtils";

const ReportDetail = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState({ title: "Report", columns: [], data: [] });
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showExportOptions, setShowExportOptions] = useState(false);
    const toast = useToast();
    const { selectedBranch } = useAuth();

    const fetchReport = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedBranch && selectedBranch !== 'ALL') {
                params.branchId = selectedBranch;
            }
            if (startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            }
            const { data } = await api.get(`/reports/${reportId}`, { params });
            setReport(data);
        } catch (error) {
            console.error("Failed to fetch report", error);
            toast.error("Failed to load report data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [reportId, selectedBranch, startDate, endDate]);

    // Derived State: Filtered Data
    const filteredData = useMemo(() => {
        if (!searchTerm) return report.data;
        const lowSearch = searchTerm.toLowerCase();
        return report.data.filter(row =>
            Object.values(row).some(val =>
                val?.toString().toLowerCase().includes(lowSearch)
            )
        );
    }, [report.data, searchTerm]);

    const handleExportPDF = () => {
        if (report.data.length === 0) {
            toast.error("No data to export");
            return;
        }
        const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : '';
        generateReportPDF(report.title, report.columns, report.data, dateRange);
        toast.success("PDF Exported successfully");
        setShowExportOptions(false);
    };

    const handleExportExcel = () => {
        if (report.data.length === 0) {
            toast.error("No data to export");
            return;
        }
        downloadExcel(report.title, report.columns, report.data);
        toast.success("Excel exported successfully");
        setShowExportOptions(false);
    };

    const handleExportCSV = () => {
        if (report.data.length === 0) {
            toast.error("No data to export");
            return;
        }
        downloadCSV(report.title, report.columns, report.data);
        toast.success("CSV exported successfully");
        setShowExportOptions(false);
    };

    const handleShare = async () => {
        const shareData = {
            title: report.title,
            text: `View the ${report.title} on YMS Dashboard.`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    if (loading) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center gap-4 text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                <p className="text-xs font-black uppercase tracking-widest">Generating Report...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/reports')}
                        className="h-10 w-10 rounded-full bg-white text-gray-400 hover:text-gray-900 shadow-sm flex items-center justify-center transition-all hover:scale-110"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">{report.title}</h2>
                        <div className="flex items-center gap-2 px-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500">
                                {startDate && endDate ? `${startDate} - ${endDate}` : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 relative">
                    <button
                        onClick={handleShare}
                        className="px-4 py-2 bg-white/60 rounded-xl text-xs font-bold text-gray-700 hover:bg-white transition-all flex items-center gap-2 shadow-sm border border-white"
                    >
                        <Share2 className="h-3.5 w-3.5" /> Share
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowExportOptions(!showExportOptions)}
                            className="px-6 py-2 bg-[#1F2937] text-white rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center gap-2 text-xs"
                        >
                            <Download className="h-3.5 w-3.5" /> Export <ChevronDown className={cn("h-3 w-3 transition-transform", showExportOptions && "rotate-180")} />
                        </button>

                        {showExportOptions && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowExportOptions(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={handleExportPDF}
                                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        Export as PDF
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <FileSpreadsheet className="h-4 w-4" />
                                        </div>
                                        Export as Excel
                                    </button>
                                    <button
                                        onClick={handleExportCSV}
                                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Table className="h-4 w-4" />
                                        </div>
                                        Export as CSV
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50 min-h-[600px] print:shadow-none print:bg-white print:border-none print:p-0">

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8 print:hidden">
                    <div className="relative w-full lg:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 border-0 rounded-2xl bg-white/60 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white shadow-sm font-bold text-sm transition-all"
                            placeholder="Search within report..."
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                        <div className="flex items-center gap-2 bg-white/60 rounded-2xl p-1 shadow-sm border border-white shrink-0">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border">
                                <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-gray-700 outline-none w-24"
                                />
                            </div>
                            <span className="text-gray-400 font-bold px-1">to</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl shadow-sm border">
                                <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-gray-700 outline-none w-24"
                                />
                            </div>
                        </div>

                        <button
                            onClick={fetchReport}
                            className="px-4 py-2.5 bg-white/60 rounded-2xl text-xs font-bold text-gray-700 hover:bg-white transition-all flex items-center gap-2 shadow-sm border border-white whitespace-nowrap"
                        >
                            <Filter className="h-3.5 w-3.5" /> Apply Filters
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-3xl border border-white/60 shadow-sm bg-white/20">
                    <table className="w-full">
                        <thead className="bg-[#1F2937]">
                            <tr className="text-left">
                                {report.columns.map((col, i) => (
                                    <th key={i} className="px-6 py-5 text-[10px] font-black text-white/70 uppercase tracking-widest">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/50">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={report.columns.length} className="px-6 py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No data found matching current criteria</td>
                                </tr>
                            ) : filteredData.map((row, i) => (
                                <tr key={i} className="group hover:bg-white/60 transition-colors">
                                    {Object.values(row).map((cell, j) => (
                                        <td key={j} className={cn(
                                            "px-6 py-4 text-sm font-bold whitespace-nowrap",
                                            cell?.toString().includes('REVENUE') ? "text-emerald-600" :
                                                cell?.toString().includes('EXPENSE') ? "text-red-500" :
                                                    cell?.toString().includes('NET PROFIT') ? "text-teal-600 bg-teal-50/50" :
                                                        "text-gray-700"
                                        )}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] opacity-40">End of Report • Confidential Information</p>
                </div>

            </div>
        </div>
    );
};

export default ReportDetail;

