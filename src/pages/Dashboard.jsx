import {
    ArrowUpRight,
    Maximize2,
    Users,
    Car,
    Activity,
    Clock,
    Search,
    AlertTriangle,
    MapPin,
    Phone,
    Wallet,
    CircleDollarSign,
    Plus,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// --- Sub-Components ---

// 1. The Big Summary Card (Top Left) - Restored to Glassmorphism
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

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalInventory: 0,
        todayEntries: 0,
        todayExits: 0
    });
    const [trends, setTrends] = useState([]);
    const [yardStatus, setYardStatus] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user, selectedBranch } = useAuth(); // Get selectedBranch from context
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Pass selectedBranch as query param if it exists (and is not 'ALL')
                // The API interceptor might handle header, but query param is explicitly handled in controller too.
                // Actually, the controller checks query.branchId. 
                // Let's rely on the Interceptor for header or explicitly add query param?
                // The interceptor adds x-branch-id. The controller checks:
                // const branchId = req.query.branchId || req.headers['x-branch-id'];
                // So header is enough!

                // Fetch all dashboard data in parallel
                const [statsRes, trendsRes, statusRes, activitiesRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/trends'),
                    api.get('/dashboard/yard-status'),
                    api.get('/dashboard/activity')
                ]);

                setStats(statsRes.data);
                setTrends(trendsRes.data);
                setYardStatus(statusRes.data);
                setActivities(activitiesRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedBranch]); // Refetch when branch changes

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in duration-700 pb-10">

            {/* LEFT COLUMN (Summary + Trends) - Spans 3 Columns */}
            <div className="xl:col-span-3 space-y-8">

                {/* Header Text */}
                <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">Statistical Summary</h2>

                {/* Top Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Inventory */}
                    <SummaryCard
                        title="Yard Inventory"
                        timeLabel="Total Count"
                        accentColor="bg-[#94D8D7]"
                        stats={[
                            { label: "Parked Vehicles", value: stats.totalInventory, icon: Car },
                            // Placeholder for Empty Slots as backend doesn't calculate it yet
                            { label: "Empty Slots", value: yardStatus?.capacity ? (yardStatus.capacity - stats.totalInventory) : "N/A", icon: Users }
                        ]}
                    />
                    {/* Card 2: Visits */}
                    <SummaryCard
                        title="Daily Visit"
                        timeLabel="Today"
                        accentColor="bg-[#94D8D7]"
                        stats={[
                            { label: "Entries", value: stats.todayEntries, icon: Activity },
                            { label: "Exits", value: stats.todayExits, icon: Activity }
                        ]}
                    />
                    {/* Card 3: Revenue (Static for now) */}
                    <SummaryCard
                        title="Total Revenue"
                        timeLabel="This Month"
                        accentColor="bg-[#F3C465]"
                        stats={[
                            { label: "Parking Fees", value: `₹${stats.totalRevenue || 0}`, icon: Wallet },
                            { label: "Fines Col.", value: `₹${stats.totalFines || 0}`, icon: CircleDollarSign }
                        ]}
                    />
                </div>

                {/* Yard Status */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50 relative overflow-hidden group hover:shadow-md transition-all">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">Yard Status</h3>

                        <div className="flex items-center gap-2">
                            <span className={cn("h-2 w-2 rounded-full animate-pulse", yardStatus?.status === 'Operational' ? 'bg-green-500' : 'bg-red-500')}></span>
                            <span className={cn("text-xs font-bold", yardStatus?.status === 'Operational' ? 'text-green-600' : 'text-red-600')}>{yardStatus?.status || 'Unknown'}</span>
                        </div>
                    </div>

                    {/* Capacity Visualization */}
                    <div className="bg-white/60 rounded-3xl p-6 shadow-sm mb-6 border border-white/50">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Occupancy</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.totalInventory} <span className="text-sm text-gray-400 font-normal">/ {yardStatus?.capacity || 1500}</span></h3>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Available Slots</p>
                                <h3 className="text-3xl font-bold text-gray-900">{yardStatus?.capacity ? (yardStatus.capacity - stats.totalInventory) : 'N/A'}</h3>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                            <div
                                className="h-full bg-gradient-to-r from-[#94D8D7] to-[#4ECDC4] rounded-full shadow-sm"
                                style={{ width: `${(stats.totalInventory / (yardStatus?.capacity || 1500)) * 100}%` }}
                            />
                        </div>
                        <div className="mt-2 text-right">
                            <p className="text-[10px] font-bold text-gray-500">{((stats.totalInventory / (yardStatus?.capacity || 1500)) * 100).toFixed(1)}% Full</p>
                        </div>
                    </div>

                    {/* Footer - Profile & Avatars (Compact) */}
                    <div className="flex items-center justify-between pl-1">
                        {/* Manager Profile (Left) */}
                        <div className="flex items-center gap-3">
                            <img src="https://i.pravatar.cc/150?u=manager" className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-tight">{yardStatus?.manager?.role || 'Manager'}</p>
                                <h4 className="text-sm font-bold text-gray-800 leading-tight">{yardStatus?.manager?.name || 'N/A'}</h4>
                            </div>
                        </div>

                        {/* Staff Stack (Right) */}
                        <div className="flex -space-x-3">
                            {Array.from({ length: Math.min(yardStatus?.staffCount || 0, 4) }).map((_, x) => (
                                <div key={x} className="h-10 w-10 rounded-full border-[3px] border-white bg-gray-50 flex items-center justify-center shadow-sm relative z-0 hover:z-10 transition-all hover:scale-110 cursor-pointer">
                                    <img src={`https://i.pravatar.cc/150?u=stafffront${x}`} className="h-full w-full rounded-full" />
                                </div>
                            ))}
                            {(yardStatus?.staffCount || 0) > 4 && (
                                <div className="h-10 w-10 rounded-full border-[3px] border-white bg-gray-50 flex items-center justify-center shadow-sm text-[10px] font-bold text-gray-400">
                                    +{yardStatus.staffCount - 4}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Bottom Widgets Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Widget 1: Health Trends (Yard Trends) */}
                    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-bold text-gray-800">Yard Trends</h3>
                            <div className="flex gap-2">
                                <button className="h-8 w-8 bg-white/60 rounded-full flex items-center justify-center shadow-sm"><Search className="h-4 w-4 text-gray-400" /></button>
                                <button className="px-3 py-1.5 bg-white/60 rounded-full text-[10px] font-bold text-gray-600 shadow-sm border border-white flex items-center gap-2">
                                    {new Date().toLocaleString('default', { month: 'short', year: '2-digit' })} <div className="h-1 w-1 bg-gray-400 rounded-full" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-1">
                            {/* Header */}
                            <div className="grid grid-cols-4 px-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <div className="col-span-1">Vehicle</div>
                                <div className="col-span-1">Type</div>
                                <div className="text-center">Count</div>
                                <div className="text-center">Turnover</div>
                            </div>
                            {/* Rows */}
                            {trends.length === 0 ? (
                                <div className="p-4 text-center text-xs text-gray-500">No trends data available</div>
                            ) : (
                                trends.map((row, i) => (
                                    <div key={i} className="grid grid-cols-4 items-center px-4 py-3 hover:bg-white/40 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-white/50 hover:shadow-sm">
                                        <div className="text-sm font-bold text-gray-700">{row.name}</div>
                                        <div><span className={cn("px-3 py-1 rounded-full text-[9px] font-bold text-white shadow-sm", row.color)}>{row.type}</span></div>
                                        <div className="text-center text-sm font-bold text-gray-600">{row.c}</div>
                                        <div className="text-center text-sm font-bold text-gray-600">{row.t}%</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Widget 2: Stacked Widgets (Branch + Efficiency) */}
                    <div className="space-y-6 flex flex-col">

                        {/* Widget 2a: Branch Overview (Compact) */}
                        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-gray-800">Branch Status</h3>
                                <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[9px] font-bold border border-green-200 flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="bg-teal-50/50 rounded-2xl border border-teal-100/50 relative group overflow-hidden mb-4 flex items-center justify-center min-h-[100px]">
                                {/* Decorative Map Pattern */}
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]"></div>

                                <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white flex items-center gap-2 z-10 transition-transform group-hover:scale-105 cursor-pointer">
                                    <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        {/* TODO: Return Branch Name from API for Super Admin view, or use Context */}
                                        <p className="text-[10px] font-bold text-gray-800">{yardStatus?.name || "Selected Yard"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Manager Info */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src="https://i.pravatar.cc/150?u=manager" className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
                                    <div>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{yardStatus?.manager?.role || 'Yard Manager'}</p>
                                        <p className="text-xs font-bold text-gray-900">{yardStatus?.manager?.name || 'Unassigned'}</p>
                                    </div>
                                </div>
                                <button className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl active:scale-95">
                                    <Phone className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Widget 2b: Efficiency Score (Moved Back Here) */}
                        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50 flex items-center justify-between relative overflow-hidden flex-1">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Efficiency Score</p>
                                <h3 className="text-3xl font-bold text-gray-800 mb-2">{yardStatus?.efficiency?.score || 0}%</h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 w-fit">
                                    <ArrowUpRight className="h-3 w-3" /> {(yardStatus?.efficiency?.trend > 0) ? `+${yardStatus?.efficiency?.trend}%` : 'Stable'} vs last week
                                </div>
                            </div>

                            {/* Circular Progress Placeholder */}
                            <div className="h-20 w-20 relative flex items-center justify-center">
                                <svg className="transform -rotate-90 w-full h-full text-gray-100">
                                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" fill="transparent" />
                                    <circle cx="40" cy="40" r="32" stroke="#94D8D7" strokeWidth="8" fill="transparent"
                                        strokeDasharray="200"
                                        strokeDashoffset={200 - (200 * (yardStatus?.efficiency?.score || 0)) / 100}
                                        strokeLinecap="round" className="transition-all duration-1000" />
                                </svg>
                                <Activity className="h-5 w-5 text-gray-400 absolute" />
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* RIGHT COLUMN (Alerts/Log) - Spans 1 Column */}
            <div className="xl:col-span-1 h-full flex flex-col gap-6">
                <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50 flex flex-col flex-1 min-h-0">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-gray-800">Recent Logs</h3>
                        <button className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm"><Search className="h-4 w-4" /></button>
                    </div>

                    {/* Timeline (Dynamic Recent Logs) */}
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-none">
                        {activities.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center">No recent activity logs</p>
                        ) : (
                            activities.map((item, i) => {
                                const logDate = new Date(item.timestamp);
                                const isEntry = item.type === 'ENTRY';
                                return (
                                    <div key={i} className="flex gap-4 items-start group cursor-pointer">
                                        <div className="w-14 pt-1 shrink-0 text-center">
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{logDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}</p>
                                            <p className="text-xs font-bold text-gray-800">{logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className="flex-1 pb-6 border-b border-gray-200/50 group-last:border-0 relative">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-white shadow-sm", isEntry ? "bg-[#4ECDC4]" : "bg-[#FF6B6B]")}>
                                                    <ArrowUpRight className={cn("h-3.5 w-3.5", !isEntry && "rotate-90")} />
                                                </div>
                                                <p className="text-sm font-bold text-gray-800 leading-tight">
                                                    {isEntry ? "Vehicle Entry" : "Vehicle Exit"}
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mb-2 pl-8">
                                                {item.vehicleId?.licensePlate || 'Unknown Vehicle'} • {item.vehicleId?.make || ''} {item.vehicleId?.model || ''}
                                            </p>
                                            <div className="flex -space-x-2 pl-8">
                                                <div className="h-6 w-6 rounded-full border border-white bg-gray-200 flex items-center justify-center text-[7px] font-bold text-gray-500" title={item.handledBy?.name}>
                                                    {item.handledBy?.name ? item.handledBy.name.substring(0, 2).toUpperCase() : 'NA'}
                                                </div>
                                            </div>
                                            <ArrowUpRight className="absolute top-0 right-0 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Button */}
                    <button onClick={() => navigate('/entry-exit')} className="w-full py-4 bg-[#FF6B6B] text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-[#ff5252] transition-all mt-6 text-sm">
                        + New Entry
                    </button>

                </div>

                {/* Widget 2b: Quick Actions (New) */}
                {/* ... (Kept existing visual quick actions) ... */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/50 shrink-0">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 px-1">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/entry-exit')} className="flex flex-col items-center justify-center gap-2 bg-white/60 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all group">
                            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Plus className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">Add Vehicle</span>
                        </button>
                        <button onClick={() => navigate('/entry-exit', { state: { tab: 'exit' } })} className="flex flex-col items-center justify-center gap-2 bg-white/60 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all group">
                            <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                <FileText className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">Issue Pass</span>
                        </button>
                        <button onClick={() => navigate('/reports')} className="flex flex-col items-center justify-center gap-2 bg-white/60 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all group">
                            <div className="h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">Report</span>
                        </button>
                        <button onClick={() => navigate('/reports')} className="flex flex-col items-center justify-center gap-2 bg-white/60 p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all group">
                            <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Clock className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600">View Logs</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
