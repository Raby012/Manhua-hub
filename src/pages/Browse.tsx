import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MangaCard } from '../components/MangaCard';
import { apiService } from '../services/apiService';
import { Manga } from '../types';
import { Search as SearchIcon, RotateCw, Filter, LayoutGrid, ListFilter } from 'lucide-react';
import { cn } from '../lib/utils';

export const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(1); // offset is page number here
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('followedCount');

  const fetchResults = useCallback(async (isInitial = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const page = isInitial ? 1 : offset;
      
      let data: Manga[] = [];
      if (query) {
        data = await apiService.searchManga(query);
        setHasMore(false); // Search usually isn't paginated the same way here
      } else {
        data = await apiService.getAllManga(page);
        setHasMore(data.length > 0);
      }

      if (isInitial) {
        setResults(data);
        setOffset(2);
        setHasMore(data.length > 0);
      } else {
        setResults(prev => {
          const newItems = data.filter(d => !prev.some(p => p.id === d.id));
          if (newItems.length === 0) setHasMore(false);
          return [...prev, ...newItems];
        });
        setOffset(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [query, offset, loading]);

  useEffect(() => {
    setResults([]);
    setOffset(0);
    setHasMore(true);
    fetchResults(true);
  }, [query, selectedType, selectedStatus, sortBy]);

  // Infinite Scroll Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchResults();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchResults]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto px-4 md:px-12 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
           <div className="flex-1">
             <h1 className="text-4xl md:text-5xl font-black mb-4 flex items-center gap-4 tracking-tighter">
               <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20">
                 <SearchIcon className="w-8 h-8 text-accent" />
               </div>
               {query ? `Search: ${query}` : 'Browse Catalog'}
             </h1>
             <p className="text-muted font-bold text-lg max-w-2xl px-1">
               Discover over <span className="text-accent2">50,000+</span> professionally curated titles from all over the world. Use filters to narrow down your next obsession.
             </p>
           </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 mb-12 flex flex-wrap items-center gap-6">
           <div className="flex flex-col gap-2 min-w-[150px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2 flex items-center gap-2">
                <ListFilter className="w-3 h-3" /> Type
              </label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-background/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-text outline-none focus:border-accent transition-all cursor-pointer"
              >
                <option value="all">Every Type</option>
                <option value="manhwa">Manhwa (KR)</option>
                <option value="manhua">Manhua (CN)</option>
                <option value="manga">Manga (JP)</option>
              </select>
           </div>

           <div className="flex flex-col gap-2 min-w-[150px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2 flex items-center gap-2">
                <Filter className="w-3 h-3" /> Status
              </label>
              <select 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-background/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-text outline-none focus:border-accent transition-all cursor-pointer"
              >
                <option value="all">Any Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
           </div>

           <div className="flex flex-col gap-2 min-w-[150px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2 flex items-center gap-2">
                <LayoutGrid className="w-3 h-3" /> Sort By
              </label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-text outline-none focus:border-accent transition-all cursor-pointer"
              >
                <option value="followedCount">Most Popular</option>
                <option value="relevance">Highly Relevant</option>
                <option value="latestUploadedChapter">New Chapters</option>
                <option value="createdAt">Recently Added</option>
                <option value="rating">Top Rated</option>
              </select>
           </div>

           <div className="h-10 w-px bg-white/10 hidden xl:block" />

           <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
              {['Action', 'Romance', 'Fantasy', 'Cultivation', 'Martial Arts', 'Adventure', 'Comedy', 'Drama'].map(tag => (
                <button key={tag} className="flex-shrink-0 px-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs font-bold text-muted hover:text-accent hover:border-accent hover:bg-accent/10 transition-all">
                  {tag}
                </button>
              ))}
           </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 md:gap-12">
          {results.length > 0 ? (
            results.map((m, index) => (
              <div key={`${m.slug}-${index}`} ref={index === results.length - 1 ? lastElementRef : null}>
                <MangaCard manga={m} />
              </div>
            ))
          ) : !loading && (
            <div className="col-span-full py-40 text-center">
               <p className="text-3xl font-black text-white/20 mb-4 tracking-[0.3em] uppercase">No titles found</p>
               <RotateCw className="w-12 h-12 text-accent/20 mx-auto animate-spin-slow" />
            </div>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <RotateCw className="w-12 h-12 text-accent animate-spin" />
             <p className="font-bold text-muted animate-pulse uppercase tracking-widest text-xs">Accessing MangaDex Core...</p>
          </div>
        )}

        {!hasMore && results.length > 0 && (
          <div className="py-20 text-center text-muted font-bold uppercase tracking-widest text-sm">
             You've reached the end of the catalog
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="py-40 text-center">
            <SearchIcon className="w-16 h-16 text-muted mx-auto mb-6 opacity-20" />
            <p className="text-2xl font-black text-white/20 mb-2">No matches found</p>
            <p className="text-muted font-medium">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </main>
    </div>
  );
};
