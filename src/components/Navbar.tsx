import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Menu, X, Library, TrendingUp, Home as HomeIcon, LayoutGrid, 
  Clock, RotateCcw 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { apiService } from '../services/apiService';
import { Manga } from '../types';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await apiService.searchManga(searchQuery);
        setSearchResults(results.slice(0, 5));
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-500 py-6 px-4 md:px-12 flex items-center justify-between",
      isScrolled || isMenuOpen ? "bg-background/80 backdrop-blur-2xl border-b border-white/5 py-4 shadow-2xl" : "bg-transparent"
    )}>
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-4 group transition-transform active:scale-95">
        <div className="w-12 h-12 rounded-[16px] bg-accent flex items-center justify-center shadow-2xl shadow-accent/40 rotate-3 group-hover:rotate-0 transition-all duration-500">
          <TrendingUp className="text-white w-7 h-7" />
        </div>
        <span className="text-3xl font-black tracking-tighter text-white">
          Manhwa<span className="text-accent">Hub</span>
        </span>
      </NavLink>

      {/* Nav Items - Desktop */}
      <div className="hidden lg:flex items-center gap-10">
        {[
          { icon: <HomeIcon className="w-5 h-5" />, label: 'HOME', path: '/' },
          { icon: <LayoutGrid className="w-5 h-5" />, label: 'BROWSE', path: '/browse' },
          { icon: <Library className="w-5 h-5" />, label: 'LIBRARY', path: '/bookmarks' },
          { icon: <Clock className="w-5 h-5" />, label: 'NEW', path: '/browse' },
        ].map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-2 text-xs font-black transition-all hover:text-accent tracking-widest",
              isActive ? "text-accent scale-110" : "text-muted"
            )}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Search & Menu */}
      <div className="flex items-center gap-6 relative">
        <div className="relative hidden md:block group">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search premium titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 bg-white/5 focus:bg-white/10 outline-none border border-white/5 focus:border-accent/50 rounded-2xl px-6 py-3 text-sm text-white placeholder:text-muted/50 transition-all focus:w-96 font-bold"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted/50 group-focus-within:text-accent transition-colors" />
          </form>

          {/* Quick Search Dropdown */}
          <AnimatePresence>
            {searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 w-96 bg-card/95 backdrop-blur-3xl border border-white/10 rounded-3xl p-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] z-[60]"
              >
                {isSearching ? (
                  <div className="p-8 text-center">
                     <RotateCcw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                     <p className="text-muted text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning global sources</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="space-y-1 mb-2">
                      {searchResults.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            navigate(`/manhwa/${m.id}`, { state: { manga: m } });
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all text-left group/item"
                        >
                          <div className="w-12 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 shadow-lg">
                             <img src={apiService.getProxyImageUrl(m.coverImage) || m.coverImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black truncate text-white group-hover/item:text-accent transition-colors">{m.title}</p>
                            <p className="text-[10px] uppercase font-black text-muted mt-1 tracking-widest">{m.type || 'Manhwa'}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={handleSearchSubmit}
                      className="w-full py-4 bg-accent/10 hover:bg-accent text-accent hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      VIEW ALL RESULTS
                    </button>
                  </>
                ) : (
                  <div className="p-10 text-center text-muted font-black uppercase tracking-widest text-[10px]">No results found</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-3 bg-white/5 rounded-2xl text-text hover:text-accent transition-all active:scale-95"
        >
          {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-background/95 backdrop-blur-3xl border-b border-white/10 p-8 shadow-2xl lg:hidden flex flex-col gap-8"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search titles..."
                className="w-full bg-white/5 outline-none border border-white/5 rounded-2xl px-6 py-5 text-white focus:border-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-7 h-7 text-muted" />
            </form>
            <div className="grid grid-cols-2 gap-4">
              {[
                 { icon: <HomeIcon />, label: 'Home', path: '/' },
                 { icon: <LayoutGrid />, label: 'Browse', path: '/browse' },
                 { icon: <Library />, label: 'Library', path: '/bookmarks' },
                 { icon: <Clock />, label: 'New', path: '/browse' },
              ].map(item => (
                <NavLink 
                  key={item.label} 
                  to={item.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center gap-4 p-6 bg-white/5 rounded-3xl hover:bg-accent/10 transition-all border border-white/5"
                >
                  <div className="p-3 bg-accent/20 rounded-2xl text-accent">
                    {item.icon}
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
;
