import {
    MapPin,
    Car,
    AlertCircle,
    ArrowUpRight,
    Maximize2,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const YardMap = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 px-2 opacity-80">Yard Capacity</h2>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SummaryCard
                    title="Total Occupancy"
                    timeLabel="Live"
                    accentColor="bg-[#94D8D7]"
                    stats={[
                        { label: "Total Capacity", value: "1500", icon: MapPin },
                        { label: "Occupied Slots", value: "1248", icon: Car }
                    ]}
                />
                <SummaryCard
                    title="Efficiency"
                    timeLabel="Weekly"
                    accentColor="bg-[#F3C465]"
                    stats={[
                        { label: "Turnover Rate", value: "85%", icon: CheckCircle2 },
                        { label: "Avg Dwell Time", value: "4 Days", icon: ArrowUpRight }
                    ]}
                />
            </div>

            {/* Capacity Visualization */}
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm border border-white/50">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Capacity Utilization</h3>

                <div className="bg-white/60 rounded-[2rem] p-8 mt-4">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h4 className="text-4xl font-bold text-gray-900">83%</h4>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">Full</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-500">252 Slots Available</p>
                        </div>
                    </div>

                    <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-gradient-to-r from-[#94D8D7] to-[#4ECDC4] w-[83%] rounded-full shadow-sm" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/50 p-4 rounded-2xl flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-800">540</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Hatchbacks</span>
                        </div>
                        <div className="bg-white/50 p-4 rounded-2xl flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-800">320</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Sedans</span>
                        </div>
                        <div className="bg-white/50 p-4 rounded-2xl flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-800">280</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">SUVs</span>
                        </div>
                        <div className="bg-white/50 p-4 rounded-2xl flex flex-col items-center">
                            <span className="text-2xl font-bold text-gray-800">108</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Commercial</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YardMap;
