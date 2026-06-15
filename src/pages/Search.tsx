import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { MangaCard } from '../components/MangaCard';
import { apiService } from '../services/apiService';
import { Manga } from '../types';
import { Search as SearchIcon, RotateCw } from 'lucide-react';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const data = await apiService.searchManga(query);
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
           <div>
             <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
               <SearchIcon className="w-8 h-8 text-accent" />
               Search Results
             </h1>
             <p className="text-white/40 font-medium">
               Found {results.length} results for <span className="text-accent">"{query}"</span>
             </p>
           </div>
           
           <div className="flex items-center gap-2 px-4 py-2 bg-card border border-white/5 rounded-full text-xs font-bold text-white/60">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             Live Scraper Results
           </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
             <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
             <p className="font-black text-xs text-accent animate-pulse uppercase tracking-[0.3em]">Querying Global Repositories</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-8 md:gap-12">
            {results.map((m) => (
              <MangaCard key={m.slug} manga={m} />
            ))}
            
            {results.length === 0 && !loading && (
              <div className="col-span-full py-40 text-center">
                <p className="text-4xl font-black text-white/10 mb-6 tracking-tighter uppercase italic">No matches found</p>
                <div className="w-20 h-1 bg-white/5 mx-auto" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
