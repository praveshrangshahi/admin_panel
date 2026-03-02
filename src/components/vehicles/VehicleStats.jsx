import React from 'react';
import { ArrowUpRight, Maximize2, Car, AlertCircle, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

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

const VehicleStats = ({ totalVehicles }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SummaryCard
                title="Inventory Status"
                timeLabel="Live Count"
                accentColor="bg-[#94D8D7]"
                stats={[
                    { label: "Total Vehicles", value: totalVehicles || "0", icon: Car },
                    { label: "Available Slots", value: "N/A", icon: AlertCircle }
                ]}
            />
            <SummaryCard
                title="Movement"
                timeLabel="Today"
                accentColor="bg-[#F3C465]"
                stats={[
                    { label: "Entries", value: "0", icon: ArrowUpRight },
                    { label: "Exits", value: "0", icon: ArrowUpRight }
                ]}
            />
            <SummaryCard
                title="Aging Stock"
                timeLabel="> 45 Days"
                accentColor="bg-[#94D8D7]"
                stats={[
                    { label: "Critical Units", value: "0", icon: Calendar },
                    { label: "Auction Ready", value: "0", icon: FileText }
                ]}
            />
        </div>
    );
};

export default VehicleStats;
