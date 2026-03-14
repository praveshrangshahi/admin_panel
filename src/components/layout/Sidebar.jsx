import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Car,
    FileText,
    Settings,
    PlusCircle,
    Database,
    BarChart3,
    Building2,
    ShieldCheck,
    LogOut,
    Sun,
    Briefcase,
    ClipboardCheck,
    Users,
    MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    // Mock Data
    const initials = "SR";
    const setTheme = (theme) => console.log("Theme set to", theme);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { name: 'Clients', icon: Briefcase, path: '/clients' },
        { name: 'Vehicles', icon: Car, path: '/vehicles' },
        { name: 'Entry/Exit', icon: PlusCircle, path: '/entry-exit' },
        { name: 'Reports', icon: FileText, path: '/reports', roles: ['SUPER_ADMIN'] },
        { name: 'Stock Audit', icon: ClipboardCheck, path: '/audit' },
        { name: 'Yards', icon: MapPin, path: '/yards', roles: ['SUPER_ADMIN'] },
        { name: 'Content', icon: FileText, path: '/content', roles: ['SUPER_ADMIN'] },
        { name: 'Users', icon: Users, path: '/users', roles: ['SUPER_ADMIN'] },
        { name: 'Master Data', icon: Database, path: '/master-data', roles: ['SUPER_ADMIN'] },
    ];

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(user?.role);
    });

    return (
        <aside className="fixed left-0 top-0 h-screen w-[84px] z-50 flex flex-col items-center pt-4 bg-transparent transition-all duration-300 ease-in-out pointer-events-none">
            {/* Pointer events none on container lets clicks pass through gaps, auto on children enables interaction */}

            {/* Brand Logo (Floating) */}
            <div className="mb-8 pointer-events-auto">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center text-teal-600 ring-1 ring-black/5 cursor-pointer hover:scale-110 transition-transform duration-300 overflow-hidden p-1.5">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
            </div>

            {/* Navigation Links (Floating Circles) */}
            <TooltipProvider>
                <div className="space-y-4 flex-1 w-full flex flex-col items-center pointer-events-auto overflow-y-visible py-4">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-white text-teal-600 shadow-[0_10px_20px_rgba(20,184,166,0.15)] scale-110 ring-2 ring-white"
                                        : "bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-white hover:text-teal-600 hover:shadow-lg hover:scale-110"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-3" />

                            <span className="absolute left-[calc(100%+12px)] z-[100] whitespace-nowrap rounded-lg bg-teal-900 text-white px-3 py-1.5 text-xs font-semibold shadow-xl transition-all duration-300 translate-x-3 scale-90 opacity-0 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 pointer-events-none after:content-[''] after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-r-teal-900">
                                {item.name}
                            </span>
                        </NavLink>
                    ))}
                </div>
            </TooltipProvider>
        </aside>
    );
};

export default Sidebar;
