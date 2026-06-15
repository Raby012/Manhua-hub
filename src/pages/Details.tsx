import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Clock, User, BookOpen, ChevronDown, ChevronUp, Search, 
  ChevronLeft, Bookmark, Share2, Info, LayoutList, History, 
  Sparkles, Play, CheckCircle2, ArrowUpDown
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { Manga, Chapter } from '../types';
import { DetailsSkeleton } from '../components/SkeletonLoader';
import { cn } from '../lib/utils';
import { Navbar } from '../components/Navbar';
import { persistenceService } from '../services/persistenceService';
import { MangaImage } from '../components/MangaImage';

export const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        let initialManga = (location.state as any)?.manga;
        
        // If manga object is missing or seems severely deficient in IDs, try to recover it
        if (!initialManga || (!initialManga.mangapillId && !initialManga.mangadexId && !initialManga.comickId)) {
          // Attempt to recover from bookmarks first
          let bookmarked = persistenceService.getBookmarks().find((b: any) => b.id === id || b.slug === id);
          if (bookmarked && bookmarked.mangapillId) {
            initialManga = bookmarked;
          } else {
            // Fallback object with optimistic dual-ids
            initialManga = initialManga || { 
              id, 
              title: (id || '').replace(/-/g, ' '), 
              slug: id, 
              ...(id?.length === 36 && id.includes('-') 
                ? { mangadexId: id } 
                : { comickSlug: id, mangapillId: id }),
              source: 'merged' 
            };
            
            // Try to recover full details via search
            try {
              const searchResults = await apiService.searchManga(initialManga.title);
              const found = searchResults.find(m => m.id === id || m.comickSlug === id || m.mangadexId === id || m.slug === id);
              if (found) {
                initialManga = { ...initialManga, ...found };
              }
            } catch (e) {
              console.warn("Recovery search failed:", e);
            }
          }
        }

        const [details, chs] = await Promise.all([
          apiService.getMangaDetails(initialManga),
          apiService.getAllChapters(initialManga)
        ]);
        setManga(details);
        setChapters(chs);
        setIsBookmarked(persistenceService.isBookmarked(id));
      } catch (e) {
        console.error("Details fetch fail:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, location.state]);

  const toggleBookmark = () => {
    if (!manga) return;
    if (isBookmarked) {
      persistenceService.removeBookmark(manga.id);
    } else {
      persistenceService.addBookmark(manga);
    }
    setIsBookmarked(!isBookmarked);
  };

  const filteredChapters = useMemo(() => {
    let list = chapters.filter(c => 
      c.number.toString().includes(chapterSearch) || 
      c.title.toLowerCase().includes(chapterSearch.toLowerCase())
    );
    if (sortOrder === 'desc') return [...list].reverse();
    return list;
  }, [chapters, chapterSearch, sortOrder]);

  if (loading) return (
    <div className="min-h-screen bg-background">
       <Navbar />
       <DetailsSkeleton />
    </div>
  );
  if (!manga) return <div>Not Found</div>;

  const progress = persistenceService.getProgress(manga.id);

  return (
    <div className="min-h-screen bg-background text-text selection:bg-accent/30">
      <Navbar />

      {/* Dynamic Header / Banner */}
      <div className="relative h-[450px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MangaImage 
            src={manga.coverImage} 
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-30 scale-110"
            fallbackSources={{ mangadex: manga.mangadexId ? { id: manga.mangadexId, filename: '' } : undefined, comickB2Key: manga.comickSlug, slug: manga.slug }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 pt-32 h-full flex flex-col md:flex-row items-end gap-8 pb-12">
            {/* Poster */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-48 md:w-64 aspect-[3/4] flex-shrink-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/poster ring-1 ring-white/10"
            >
               <MangaImage 
                 src={manga.coverImage} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover/poster:scale-110" 
                 alt={manga.title}
                 fallbackSources={{ mangadex: manga.mangadexId ? { id: manga.mangadexId, filename: '' } : undefined, comickB2Key: manga.comickSlug, slug: manga.slug }}
               />
            </motion.div>

            {/* Info */}
            <div className="flex-1 pb-4">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-wrap gap-2 mb-6"
               >
                  <span className="px-3 py-1 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-lg">{manga.type || 'Manhwa'}</span>
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border",
                    manga.status === 'ongoing' ? "border-green-500/50 text-green-500 bg-green-500/10" : "border-muted/50 text-muted bg-muted/10"
                  )}>{manga.status}</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                     <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {manga.rating || 'N/A'}
                  </span>
               </motion.div>

               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-tight"
               >
                  {manga.title}
               </motion.h1>

               <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-8 text-sm font-bold text-muted uppercase tracking-widest"
               >
                  <div className="flex items-center gap-2">
                     <User className="w-4 h-4 text-accent" /> {manga.author}
                  </div>
                  <div className="flex items-center gap-2">
                     <LayoutList className="w-4 h-4 text-accent2" /> {chapters.length} Chapters
                  </div>
                  {progress && (
                    <div className="flex items-center gap-2 text-accent">
                       <History className="w-4 h-4" /> Resuming Ch. {progress.chapterNumber}
                    </div>
                  )}
               </motion.div>
            </div>

            {/* Actions */}
            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
               <button 
                 onClick={() => {
                   const startCh = progress ? chapters.find(c => c.id === progress.chapterId) : chapters[0];
                   if (startCh) navigate(`/read/${manga.id}/${startCh.id}?num=${startCh.number}`, { state: { source: startCh.source, manga } });
                 }}
                 className="flex-1 md:w-56 py-5 bg-accent hover:bg-accent/90 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-accent/40 active:scale-95 transition-all"
               >
                  <Play className="w-6 h-6 fill-white" />
                  {progress ? 'CONTINUE' : 'START NOW'}
               </button>
               <button 
                 onClick={toggleBookmark}
                 className={cn(
                   "flex-1 md:w-56 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-2 transition-all active:scale-95",
                   isBookmarked ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                 )}
               >
                  <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-black")} />
                  {isBookmarked ? 'SAVED' : 'ADD TO LIBRARY'}
               </button>
            </div>
        </div>
      </div>

      {/* Content Body */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          {/* Synopsis */}
          <section>
            <h3 className="text-sm font-black text-accent uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
               <Info className="w-4 h-4 underline" /> Story Synopsis
            </h3>
            <div className="relative">
              <p className={cn(
                "text-muted text-lg leading-relaxed font-medium transition-all duration-500",
                !showFullDesc && "line-clamp-4 mask-fade"
              )}>
                {manga.description || "In a world logic fails to explain, secrets lie buried deep within. A journey of growth, conflict, and destiny begins. This acclaimed series explores the boundaries of reality and the strength of the human spirit."}
              </p>
              <button 
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-4 text-accent font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all underline underline-offset-8"
              >
                 {showFullDesc ? "Collapse Detail" : "Expand Full Story"}
                 <Sparkles className="w-3 h-3" />
              </button>
            </div>
          </section>

          {/* Chapters List */}
          <section className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 md:p-12 shadow-inner">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">Archive</h3>
                  <p className="text-muted text-xs font-bold uppercase tracking-widest">Chronological Release Log ({chapters.length})</p>
               </div>

               <div className="flex items-center gap-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Jump to chapter..." 
                      value={chapterSearch}
                      onChange={e => setChapterSearch(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm focus:border-accent outline-none w-full md:w-48 font-bold"
                    />
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  </div>
                  <button 
                    onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <ArrowUpDown className="w-5 h-5 text-accent" />
                  </button>
               </div>
            </div>

            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
               {chapters.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center font-bold text-muted italic">EN</div>
                    <p className="text-muted font-bold text-xl max-w-xs">
                       English translation not available yet — check back soon!
                    </p>
                 </div>
               ) : filteredChapters.length === 0 ? (
                 <div className="py-20 text-center text-muted font-bold uppercase tracking-widest">
                    No matching chapters found
                 </div>
               ) : filteredChapters.map((ch) => (
                 <motion.button 
                   initial={{ opacity: 0, x: -10 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   key={ch.id}
                   onClick={() => navigate(`/read/${manga.id}/${ch.id}?num=${ch.number}`, { state: { source: ch.source, manga } })}
                   className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all text-left group"
                 >
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center font-black group-hover:bg-accent group-hover:text-white transition-colors">
                          {ch.number}
                       </div>
                       <div>
                          <p className="font-bold text-lg group-hover:text-accent transition-colors line-clamp-1 italic">{ch.title}</p>
                          <p className="text-[10px] text-muted font-medium uppercase tracking-widest mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                             <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(ch.date).toLocaleDateString()}</span>
                             <span className="px-2 py-0.5 bg-accent/20 text-accent rounded uppercase font-black text-[8px]">{ch.source}</span>
                             {ch.group && (
                               <span className="text-accent2 lowercase font-bold opacity-70">
                                 translated by: {ch.group}
                               </span>
                             )}
                          </p>
                       </div>
                    </div>
                    {progress?.chapterId === ch.id && (
                       <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                          <CheckCircle2 className="w-5 h-5" />
                       </div>
                    )}
                 </motion.button>
               ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
            <div>
               <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-6">Taxonomy / Tags</h4>
               <div className="flex flex-wrap gap-2">
                  {manga.genres?.map(g => (
                    <span key={g} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-muted hover:text-accent hover:border-accent transition-all cursor-default">
                       {g}
                    </span>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-card/30 backdrop-blur-xl rounded-[32px] border border-white/5 shadow-inner">
               <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-8">Asset Information</h4>
               <div className="space-y-6">
                  {manga.mangadexId && (
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-muted font-bold uppercase tracking-widest">MDX Registry</span>
                       <span className="text-white font-black truncate max-w-[120px]">{manga.mangadexId}</span>
                    </div>
                  )}
                  {manga.comickSlug && (
                    <div className="flex items-center justify-between text-xs">
                       <span className="text-muted font-bold uppercase tracking-widest">ComicK Core</span>
                       <span className="text-white font-black truncate max-w-[120px]">{manga.comickSlug}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs pt-6 border-t border-white/5">
                     <span className="text-muted font-bold uppercase tracking-widest">Translation</span>
                     <span className="text-white font-black">English Verified</span>
                  </div>
               </div>
            </div>
        </div>
      </main>
    </div>
  );
};
