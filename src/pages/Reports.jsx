import {
    FileText,
    Download,
    Calendar,
    ArrowUpRight,
    BarChart3,
    PieChart,
    Clock,
    Users,
    AlertTriangle,
    Maximize2,
    DollarSign,
    TrendingUp,
    Receipt,
    Plus
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ExpenseSheet from "@/components/reports/ExpenseSheet";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

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
                </div>
            ))}
        </div>
    </div>
);

const ReportCard = ({ title, description, icon: Icon, color = "text-teal-600", bg = "bg-teal-50", onClick }) => (
    <div onClick={onClick} className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/50 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:bg-white/80 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm", bg, color)}>
                <Icon className="h-6 w-6" />
            </div>
            <button className="h-10 w-10 rounded-full bg-white text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all flex items-center justify-center shadow-sm">
                <ArrowUpRight className="h-4 w-4" />
            </button>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-xs text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
);

const Reports = () => {
    const navigate = useNavigate();
    const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
    const { selectedBranch } = useAuth();
    const [stats, setStats] = useState({ generated: 0, scheduled: 0 });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedBranch && selectedBranch !== 'ALL') {
                params.branchId = selectedBranch;
            }
            const { data } = await api.get('/reports/stats', { params });
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch report stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedBranch]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            <ExpenseSheet isOpen={isExpenseSheetOpen} onClose={() => setIsExpenseSheetOpen(false)} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">Reports Center</h2>
                    {selectedBranch && selectedBranch !== 'ALL' && (
                        <p className="text-[10px] font-bold text-teal-600 px-2 uppercase tracking-widest mt-1 flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                            Branch Specific View
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsExpenseSheetOpen(true)}
                        className="px-6 py-2.5 bg-[#1F2937] text-white rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center gap-2 text-xs"
                    >
                        <Plus className="h-4 w-4" /> Manage Expenses
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/40 rounded-xl border border-white/50 shadow-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-600">{new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Report Activity"
                    timeLabel="This Month"
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Generated", value: loading ? "..." : stats.generated.toString().padStart(2, '0'), icon: FileText },
                        { label: "Scheduled", value: loading ? "..." : stats.scheduled.toString().padStart(2, '0'), icon: Clock }
                    ]}
                />
            </div>

            {/* Reports Grid */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50">

                {/* Section: Operational */}
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 pl-2">Operational Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ReportCard
                            title="Daily Movement"
                            description="Detailed log of all vehicle entries and exits for a specific date range."
                            icon={ArrowUpRight}
                            color="text-blue-600"
                            bg="bg-blue-50"
                            onClick={() => navigate('/reports/daily-movement')}
                        />
                        <ReportCard
                            title="Gate Activity"
                            description="Analysis of peak hours and gate-wise traffic distribution."
                            icon={BarChart3}
                            color="text-indigo-600"
                            bg="bg-indigo-50"
                            onClick={() => navigate('/reports/gate-activity')}
                        />

                    </div>
                </div>

                {/* Section: Inventory */}
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 pl-2">Inventory Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ReportCard
                            title="Aging Stock"
                            description="Identify vehicles dwelling longer than 30, 60, or 90 days."
                            icon={Clock}
                            color="text-red-600"
                            bg="bg-red-50"
                            onClick={() => navigate('/reports/aging-stock')}
                        />
                        <ReportCard
                            title="Slot Utilization"
                            description="Heatmap of yard capacity usage by branch."
                            icon={PieChart}
                            color="text-purple-600"
                            bg="bg-purple-50"
                            onClick={() => navigate('/reports/slot-utilization')}
                        />
                        <ReportCard
                            title="Client Inventory"
                            description="Breakdown of stock count by bank or insurance partner."
                            icon={Users}
                            color="text-teal-600"
                            bg="bg-teal-50"
                            onClick={() => navigate('/reports/client-inventory')}
                        />
                    </div>
                </div>

                {/* Section: Staff */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 pl-2">Staff & Audit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <ReportCard
                            title="Stock Audit"
                            description="Discrepancy report from the latest physical stock count."
                            icon={FileText}
                            color="text-green-600"
                            bg="bg-green-50"
                            onClick={() => navigate('/reports/stock-audit')}
                        />
                    </div>
                </div>

                {/* Section: Financials */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 pl-2">Financials & Revenue</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ReportCard
                            title="Revenue Report"
                            description="Total collections, pending dues, and revenue."
                            icon={DollarSign}
                            color="text-emerald-600"
                            bg="bg-emerald-50"
                            onClick={() => navigate('/reports/revenue-report')}
                        />
                        <ReportCard
                            title="Profit & Loss"
                            description="Income vs Operational Expenses statement."
                            icon={TrendingUp}
                            color="text-purple-600"
                            bg="bg-purple-50"
                            onClick={() => navigate('/reports/pnl-statement')}
                        />
                        <ReportCard
                            title="Transaction History"
                            description="Complete log of all payments and invoices generated."
                            icon={Receipt}
                            color="text-amber-600"
                            bg="bg-amber-50"
                            onClick={() => navigate('/reports/transaction-history')}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Reports;
