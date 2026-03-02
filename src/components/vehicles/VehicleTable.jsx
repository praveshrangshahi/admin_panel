import React from 'react';
import {
    Search, Filter, Car, Calendar, Maximize2, FileText, X,
    ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const VehicleTable = ({
    vehicles, loading, page, setPage, pages,
    keyword, setKeyword, itemsPerPage, setItemsPerPage, totalVehicles,
    onEdit, onDelete
}) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-4 shadow-sm border border-white/50 min-h-[500px]">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 px-2 mt-2">
                <div className="flex flex-col md:flex-row md:items-center gap-6 w-full md:w-auto">
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">All Stock</h3>

                    {/* Integrated Search Pill */}
                    <div className="group relative flex items-center bg-gray-50/50 backdrop-blur-md border border-gray-200/60 rounded-2xl px-4 py-2.5 w-full md:w-[320px] shadow-sm hover:shadow-md hover:bg-white hover:border-teal-500/30 transition-all duration-500 ring-4 ring-transparent hover:ring-teal-500/5">
                        <Search className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search plate or vehicle..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-bold text-gray-700 placeholder:text-gray-400 ml-3 w-full"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white/60 hover:bg-white backdrop-blur-md rounded-2xl text-[11px] font-black text-gray-700 shadow-sm border border-gray-100/50 flex items-center gap-2 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 uppercase tracking-widest">
                        <Filter className="h-3.5 w-3.5 text-teal-600" />
                        Filters
                        <div className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-pulse" />
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full border-separate border-spacing-0">
                    <thead>
                        <tr className="border-b border-gray-100/50 text-left">
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30 rounded-l-2xl">Vehicle Identity</th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30">Client / Authority</th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30">Movement Data</th>
                            <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30">Inventory Status</th>
                            <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50/30 rounded-r-2xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50/50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-full border-4 border-teal-500/10 border-t-teal-500 animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Car className="h-5 w-5 text-teal-500" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 animate-pulse">Scanning Inventory...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : vehicles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-16 w-16 bg-gray-50 rounded-[2rem] flex items-center justify-center">
                                            <Car className="h-8 w-8 text-gray-200" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching units found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            vehicles.map((v) => (
                                <tr key={v.id} className="group hover:bg-white/40 backdrop-blur-sm transition-all duration-300">
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-[#F5FBFB] border border-teal-100/50 flex items-center justify-center text-teal-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                <Car className="h-6 w-6" />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="text-sm font-black text-gray-900 tracking-tight group-hover:text-teal-600 transition-colors uppercase">{v.make}</div>
                                                <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 border border-gray-200 text-[10px] font-black text-gray-500 uppercase tracking-wider w-fit">{v.plate}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-black text-gray-800 uppercase tracking-tight">{v.bankName}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{v.client}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3 text-gray-300" />
                                                <span className="text-xs font-black text-gray-700 tracking-tight italic">{v.date}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                Repo By: <span className="text-gray-600">{v.repoAgent}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap">
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 group-hover:shadow-sm" style={{
                                            backgroundColor: v.status === 'Parked' ? '#F0FDF4' : v.status === 'Held' ? '#FEF2F2' : '#FFFBEB',
                                            borderColor: v.status === 'Parked' ? '#BBF7D0' : v.status === 'Held' ? '#FECACA' : '#FEF3C7',
                                            color: v.status === 'Parked' ? '#166534' : v.status === 'Held' ? '#991B1B' : '#92400E'
                                        }}>
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                                v.status === 'Parked' ? "bg-green-600" : v.status === 'Held' ? "bg-red-600" : "bg-amber-600"
                                            )} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{v.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2 translate-x-2  group-hover:translate-x-0 transition-all duration-500">
                                            <button
                                                onClick={() => navigate(`/vehicles/${v.id}`)}
                                                className="h-9 w-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 active:scale-90 shadow-sm"
                                                title="View Details"
                                            >
                                                <Maximize2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(v)}
                                                className="h-9 w-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-amber-600 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 active:scale-90 shadow-sm"
                                                title="Edit Unit"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </button>
                                            <div className="h-6 w-[1px] bg-gray-100 mx-1" />
                                            <button
                                                onClick={() => onDelete(v.id)}
                                                className="h-9 w-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 active:scale-90 shadow-sm"
                                                title="Delete Unit"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
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
                                    <option key={size} value={size}>{size} units</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-hover/select:text-teal-500 transition-colors pointer-events-none" />
                        </div>
                    </div>
                    <div className="h-6 w-[1px] bg-gray-100" />
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Total Inventory: <span className="text-gray-900">{totalVehicles || vehicles.length} Units</span>
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
    );
};

export default VehicleTable;
