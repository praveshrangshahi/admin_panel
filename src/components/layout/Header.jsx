import { MapPin, ChevronDown, Search, Loader2, Car, Users, Briefcase, LogOut, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import api, { getFileUrl } from '@/services/api';

const Header = ({ isCollapsed, scrolled }) => {
    const { user, selectedBranch, updateSelectedBranch } = useAuth();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [yards, setYards] = useState([]);
    const [greeting, setGreeting] = useState("Good Morning");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    // Dynamic Greeting Logic
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good Morning");
        else if (hour < 17) setGreeting("Good Afternoon");
        else setGreeting("Good Evening");
    }, []);

    // Global Search Logic (Debounced)
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                const { data } = await api.get(`/search?q=${searchQuery}`);
                setSearchResults(data);
                setShowResults(true);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle outside click to close search
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle outside click to close user menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper to determine if we should show the full content of the right pill
    const showFullPill = !scrolled || isHovered;

    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN') {
            const fetchYards = async () => {
                try {
                    const { data } = await api.get('/yards');
                    setYards(data);
                } catch (error) {
                    console.error("Failed to fetch yards", error);
                }
            };
            fetchYards();
        }
    }, [user, selectedBranch]);

    const handleYardChange = (e) => {
        const val = e.target.value;
        if (val === 'ALL') updateSelectedBranch(null);
        else updateSelectedBranch(val);
    };

    const handleResultClick = (result) => {
        navigate(result.link);
        setShowResults(false);
        setSearchQuery('');
    };

    const getIcon = (type) => {
        switch (type) {
            case 'vehicle': return <Car className="h-4 w-4" />;
            case 'client': return <Briefcase className="h-4 w-4" />;
            case 'user': return <Users className="h-4 w-4" />;
            default: return <Search className="h-4 w-4" />;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className={cn(
            "fixed top-0 right-0 z-50 flex items-center justify-between pt-4 pb-4 px-4 transition-all duration-300 bg-transparent pointer-events-none",
            isCollapsed ? "left-[80px]" : "left-[260px]",
        )}>

            {/* Left: Greeting Section (Fades Up & Blurs out) */}
            <div className={cn(
                "transition-all duration-700 ease-out origin-top-left pointer-events-auto",
                scrolled ? "opacity-0 -translate-y-8 blur-md" : "opacity-100 translate-y-0 blur-0"
            )}>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
                <p className="text-xs text-gray-500 font-medium mt-1 ml-0.5">Here's what's happening with your store today.</p>
            </div>

            {/* Right: Unified Control Pill */}
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "flex items-center bg-white/20 backdrop-blur-md rounded-full shadow-[0_0_40px_0_rgba(94,204,203,0.1)] border border-white/40 transition-all duration-[1500ms] ease-in-out pointer-events-auto relative",
                    showFullPill ? "px-2 py-2 gap-0" : "p-1.5 gap-0"
                )}
            >

                {/* Collapsible Content - Fixed Width for Wipe Effect */}
                <div className={cn(
                    "flex items-center transition-[max-width,margin] duration-[1500ms] ease-in-out",
                    showResults ? "overflow-visible" : "overflow-hidden",
                    showFullPill ? "max-w-[550px] mr-2" : "max-w-0 mr-0"
                )}>
                    <div className="flex items-center w-full justify-end">

                        {/* Location Selector (Only for Super Admin) */}
                        {user?.role === 'SUPER_ADMIN' && (
                            <div className="flex items-center pl-2 pr-3 border-r border-gray-200/60">
                                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full transition-all cursor-pointer group relative border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md">
                                    <MapPin className="h-4 w-4 text-teal-600" />
                                    <div className="relative min-w-[120px]">
                                        <select
                                            className="appearance-none bg-transparent outline-none cursor-pointer text-sm font-bold text-gray-800 pr-4 w-full"
                                            value={selectedBranch || 'ALL'}
                                            onChange={handleYardChange}
                                        >
                                            <option value="ALL">All Branches</option>
                                            {yards.map(yard => (
                                                <option key={yard._id} value={yard._id}>{yard.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* If not Super Admin, show static location */}
                        {user?.role !== 'SUPER_ADMIN' && (
                            <div className="flex items-center pl-2 pr-3 border-r border-gray-200/60">
                                <div className="flex items-center gap-2 px-2 py-1">
                                    <MapPin className="h-4 w-4 text-teal-600" />
                                    <span className="text-sm font-bold text-gray-800">{user?.branchId?.name || 'Your Yard'}</span>
                                </div>
                            </div>
                        )}


                        {/* Search Wrapper */}
                        <div ref={searchRef} className="flex items-center px-4 border-r border-gray-200/60 whitespace-nowrap relative">
                            {isSearching ? <Loader2 className="h-4 w-4 text-teal-500 animate-spin" /> : <Search className="h-4 w-4 text-gray-400" />}
                            <input
                                type="text"
                                placeholder="Universal Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                                className="bg-transparent border-none outline-none text-sm font-bold ml-2 w-40 placeholder:text-gray-400 text-gray-700"
                            />

                            {/* Search Results Dropdown */}
                            {showResults && (
                                <div className="absolute top-12 right-0 w-[320px] bg-white rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[1000]">
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map((result) => (
                                                <button
                                                    key={`${result.type}-${result.id}`}
                                                    onClick={() => handleResultClick(result)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50/50 transition-colors text-left group"
                                                >
                                                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                                                        {getIcon(result.type)}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-gray-900 leading-none">{result.title}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{result.subtitle}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Search className="h-8 w-8 text-gray-100 mx-auto mb-2" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">No results found for<br /> "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Name & Role */}
                        <div className="flex flex-col text-right pl-4 pr-2 ml-1 whitespace-nowrap">
                            <span className="text-xs font-black text-gray-900 leading-none">{user?.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{user?.role?.replace('_', ' ').toLowerCase() || 'Admin'}</span>
                        </div>
                    </div>
                </div>

                {/* Avatar (Always Visible) with Dropdown */}
                <div ref={userMenuRef} className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="h-9 w-9 rounded-full bg-teal-50 overflow-hidden border border-white shadow-sm flex-shrink-0 z-10 transition-all duration-[1500ms] hover:ring-2 hover:ring-teal-400 cursor-pointer"
                    >
                        {user?.profileImage ? (
                            <img src={getFileUrl(user.profileImage)} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-teal-500 text-white font-black text-xs">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute top-12 right-0 w-56 bg-white rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[1000]">
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-teal-50 overflow-hidden border border-teal-100">
                                        {user?.profileImage ? (
                                            <img src={getFileUrl(user.profileImage)} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-teal-500 text-white font-bold text-sm">
                                                {user?.name?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-900 truncate">{user?.name}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">{user?.role?.replace('_', ' ')}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="py-2">
                                
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left group"
                                >
                                    <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;
