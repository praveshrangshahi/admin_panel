import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

const MainLayout = () => {
    const [scrolled, setScrolled] = useState(false);

    return (
        <div className="h-screen bg-[#F5FBFB] font-sans text-gray-900 overflow-hidden selection:bg-teal-100">
            <Sidebar />

            <div className={cn(
                "h-full relative z-0 transition-all duration-300 ease-in-out pl-[80px]"
            )}>
                {/* Visual Content Card (Transparent for Unified Gradient) */}
                <div className="w-full h-full bg-transparent rounded-tl-[40px] overflow-hidden flex flex-col">
                    <Header isCollapsed={true} scrolled={scrolled} />

                    <main
                        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-200/50 hover:scrollbar-thumb-teal-300 pt-24 px-2  pb-4 transition-all duration-700 ease-out"
                        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 20)}
                    >
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
