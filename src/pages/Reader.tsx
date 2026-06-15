import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Settings, ChevronDown, ChevronUp, RotateCcw,
  Play, Bookmark, Star, Info, LayoutList, Search, Clock, User, BookOpen
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { cn } from '../lib/utils';
import { persistenceService } from '../services/persistenceService';
import { Chapter, Manga } from '../types';

const ReaderImage: React.FC<{ src: string, alt: string, isPaged?: boolean }> = ({ src, alt, isPaged }) => {
  const getProxyUrl = (url: string) => {
    if (url.startsWith('/api/')) return url;
    return `/api/proxy/image?url=${encodeURIComponent(url)}`;
  };
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imgSrc, setImgSrc] = useState(getProxyUrl(src));

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    setImgSrc(getProxyUrl(src));
  }, [src]);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      // Fallback: try direct loading with no-referrer
      setImgSrc(src);
    }
  };

  return (
    <>
      {!loaded && failed && imgSrc === src ? null : !loaded && (
        <div className={cn("absolute inset-0 flex items-center justify-center bg-white/5", isPaged ? "min-h-[85vh]" : "min-h-[400px]")}>
          <RotateCcw className="w-8 h-8 animate-spin text-white/20" />
        </div>
      )}
      {failed && imgSrc !== src && !loaded && (
        <div className={cn("absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white/50 text-xs backdrop-blur-sm z-10", isPaged ? "min-h-[85vh]" : "min-h-[400px]")}>
          <span>Trying fallback proxy...</span>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={cn(
           isPaged ? "max-h-[85vh] w-auto block select-none border-b border-transparent" : "w-full h-auto block m-0 p-0 border-b border-transparent",
           !loaded && "opacity-0",
           failed && loaded && "outline outline-red-500/20" // Indicate it's using fallback if we want, but let's hide visual failure 
        )}
        style={{ borderBottomWidth: isPaged ? "0" : "1px", borderBottomColor: "transparent" }}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        loading="lazy"
      />
    </>
  );
};

export const Reader: React.FC = () => {
  const params = useParams<{ manhwaId: string, chapterId: string }>();
  // For compatibility with the rest of the component's use of 'id'
  const id = params.manhwaId;
  const chapterId = params.chapterId;
  const navigate = useNavigate();
  const location = useLocation();
  const source = location.state?.source;
  const initialManga = location.state?.manga || { 
    id, 
    slug: id, 
    title: (id || ''), 
    source: 'merged',
    ...(id?.length === 36 && id.includes('-') ? { mangadexId: id } : { comickSlug: id, mangapillId: id })
  };

  const [pages, setPages] = useState<string[]>([]);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [readingMode, setReadingMode] = useState<'webtoon' | 'paged'>('webtoon');
  const [currentPage, setCurrentPage] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [manga, setManga] = useState<Manga | null>(null);
  
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const load = async () => {
      if (!id || !chapterId) return;
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const chapterNum = searchParams.get('num') || '1';
        let effectiveManga = { ...initialManga };
        if (!effectiveManga.mangapillId && !effectiveManga.mangadexId && !effectiveManga.comickId) {
            // Attempt to recover from bookmarks first
            let bookmarked = persistenceService.getBookmarks().find((b: any) => b.id === id || b.slug === id);
            if (bookmarked && bookmarked.mangapillId) {
              effectiveManga = bookmarked;
            } else {
              // Try to recover via search
              try {
                const searchResults = await apiService.searchManga(effectiveManga.title);
                const found = searchResults.find(m => m.id === id || m.comickSlug === id || m.mangadexId === id || m.slug === id);
                if (found) {
                  effectiveManga = { ...effectiveManga, ...found };
                }
              } catch (e) {
                console.warn("Recovery search failed:", e);
              }
            }
        }

        const mangaIdToUse = effectiveManga.mangadexId || effectiveManga.id;

        let [proxyData, details, chs] = await Promise.all([
          fetch(`/api/proxy/chapter/${encodeURIComponent(chapterId)}?num=${chapterNum}&mangaId=${mangaIdToUse}&title=${encodeURIComponent(effectiveManga.title)}`).then(res => res.json()),
          apiService.getMangaDetails(effectiveManga),
          apiService.getAllChapters(effectiveManga)
        ]);

        let imgs = proxyData?.pages || [];
        let returnedFallbackUrl = proxyData?.fallbackUrl || null;

        // If the primary variant fails to load pages, automatically try other alternatives
        if (imgs.length === 0 && chs.length > 0) {
          const numParamForProgress = new URLSearchParams(window.location.search).get('num');
          const currentCh = chs.find(c => c.id === chapterId || c.variants?.some(v => v.id === chapterId) || (numParamForProgress && c.number === parseFloat(numParamForProgress)));
          if (currentCh && currentCh.variants && currentCh.variants.length > 0) {
             for (const variant of currentCh.variants) {
                if (variant.id !== chapterId && variant.id !== currentCh.id) {
                   try {
                     const varData = await fetch(`/api/proxy/chapter/${encodeURIComponent(variant.id)}?num=${chapterNum}&mangaId=${mangaIdToUse}&title=${encodeURIComponent(initialManga.title)}`).then(res => res.json());
                     if (varData?.pages?.length > 0) {
                        imgs = varData.pages;
                        returnedFallbackUrl = null; // Images found
                        console.log("Successfully fell back to variant:", variant.id);
                        break;
                     }
                   } catch (e) {
                     console.error("Variant fetch failed", variant.id, e);
                   }
                }
             }
          }
        }

        setPages(imgs);
        setFallbackUrl(returnedFallbackUrl);
        setManga(details);
        setChapters(chs);

        const numParamForProgress = new URLSearchParams(window.location.search).get('num');
        const progressCh = chs.find(c => c.id === chapterId || c.variants?.some(v => v.id === chapterId) || (numParamForProgress && c.number === parseFloat(numParamForProgress)));
        if (progressCh) {
          persistenceService.saveProgress(id, progressCh.id, progressCh.number, 1);
        }
      } catch (e) {
        console.error("Reader data failure:", e);
      } finally {
        setLoading(false);
        window.scrollTo(0, 0);
      }
    };
    load();
  }, [id, chapterId, source]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsScrollingDown(true);
      } else {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeChapter = (direction: 'next' | 'prev') => {
    const currentIndex = chapters.findIndex(c => c.id === chapterId || c.variants?.some(v => v.id === chapterId));
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < chapters.length) {
      const nextChapter = chapters[nextIndex];
      navigate(`/read/${id}/${nextChapter.id}?num=${nextChapter.number}`, { state: { source: nextChapter.source, manga: initialManga } });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8">
      <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
      <p className="text-accent font-black tracking-widest uppercase text-xs animate-pulse">Loading high-quality pages</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent/30 font-sans">
      {/* Top Bar */}
      <motion.div 
        animate={{ y: isScrollingDown ? -100 : 0 }}
        className="fixed top-0 inset-x-0 h-20 bg-black/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50 md:px-12"
      >
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(`/manhwa/${id}`, { state: { manga: manga || initialManga } })}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all group"
          >
            <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="hidden md:block">
            <h2 className="text-lg font-black tracking-tighter truncate max-w-[300px] uppercase leading-none mb-1">
               {manga?.title}
            </h2>
            <div className="flex items-center gap-3">
               <span className="text-[10px] text-accent font-black uppercase tracking-widest">
                  Chapter {chapters.find(c => c.id === chapterId)?.number}
               </span>
               <div className="w-1 h-1 bg-white/20 rounded-full" />
               <span className="text-[10px] text-muted font-bold uppercase tracking-widest">
                  {pages.length} Pages
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={() => window.location.reload()}
             className="p-3 hover:bg-white/10 rounded-full text-muted hover:text-white transition-all"
           >
             <RotateCcw className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setShowSettings(true)}
             className="p-3 hover:bg-white/10 rounded-full text-muted hover:text-white transition-all"
           >
             <Settings className="w-6 h-6" />
           </button>
        </div>
      </motion.div>

      {/* Reader Content */}
      <main className="pt-24 pb-48">
        <div className={cn(
          "mx-auto flex flex-col items-center",
          readingMode === 'webtoon' ? "w-full" : "max-w-4xl px-4"
        )}>
          {pages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
              <div className="w-24 h-24 mb-6 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <BookOpen className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Images Not Found</h3>
              <p className="text-muted max-w-md mx-auto mb-8">
                The pages for this chapter could not be loaded. The source API might be unavailable, or the chapter data is empty.
              </p>
              {fallbackUrl && (
                <a 
                  href={fallbackUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-accent text-white font-black uppercase tracking-widest text-sm rounded-full hover:scale-105 transition-transform"
                >
                  Read on Source Website
                </a>
              )}
            </div>
          ) : readingMode === 'webtoon' ? (
            <div className="w-full max-w-[800px]">
              {pages.map((page, index) => (
                <div key={index} className="relative group min-h-[400px] bg-white/1 overflow-hidden flex justify-center">
                  <ReaderImage src={page} alt={`Page ${index + 1}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center min-h-[80vh] justify-center relative w-full">
               <motion.div 
                 key={currentPage}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="relative shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden border border-white/5"
               >
                 <ReaderImage 
                    src={pages[currentPage]} 
                    alt={`Page ${currentPage + 1}`} 
                    isPaged={true}
                  />
                  <div className="absolute top-4 right-4 bg-black/60 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                     PAGE {currentPage + 1} / {pages.length}
                  </div>
               </motion.div>
               
               {/* Horizontal Navigation Overlay */}
               <div className="absolute inset-y-0 inset-x-0 flex cursor-pointer z-20">
                  <div className="flex-1" onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)} />
                  <div className="flex-1" onClick={() => currentPage < pages.length - 1 && setCurrentPage(currentPage + 1)} />
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Floating Nav */}
      <motion.div 
        animate={{ y: isScrollingDown ? 120 : 0 }}
        className="fixed bottom-10 inset-x-0 flex justify-center z-50 px-4"
      >
        <div className="glass-panel rounded-full p-2 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 ring-1 ring-accent/20">
           <button 
             onClick={() => changeChapter('prev')}
             disabled={chapters.findIndex(c => c.id === chapterId) === 0}
             className="w-14 h-14 flex items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-20 transition-all font-black text-xs uppercase tracking-tighter"
           >
             PREV
           </button>
           
           <div className="h-10 w-[1px] bg-white/10 mx-2" />
           
           <div className="flex items-center gap-6 px-6">
              {readingMode === 'webtoon' ? (
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">SCROLLING</span>
                   <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-accent"
                        animate={{ width: `${(currentPage / pages.length) * 100}%` }}
                      />
                   </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 py-2">
                   <span className="text-xl font-black tracking-tighter">{currentPage + 1}</span>
                   <div className="h-6 w-[1px] bg-white/10" />
                   <span className="text-sm font-bold text-muted uppercase tracking-widest">{pages.length}</span>
                </div>
              )}
           </div>

           <div className="h-10 w-[1px] bg-white/10 mx-2" />

           <button 
             onClick={() => changeChapter('next')}
             disabled={chapters.findIndex(c => c.id === chapterId) === chapters.length - 1}
             className="w-14 h-14 flex items-center justify-center bg-accent text-white rounded-full hover:scale-105 transition-all font-black text-xs uppercase tracking-tighter shadow-xl shadow-accent/40"
           >
             NEXT
           </button>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-card w-full max-w-md rounded-3xl p-10 border border-white/10 relative shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-3xl font-black mb-10 tracking-tighter">READER CUSTOMIZATION</h3>
              
              <div className="space-y-10">
                <div>
                  <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mb-6">Display Layout</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'webtoon', label: 'Continuous', icon: <ChevronDown className="w-5 h-5" /> },
                      { id: 'paged', label: 'Page by Page', icon: <ChevronRight className="w-5 h-5" /> }
                    ].map(mode => (
                      <button 
                        key={mode.id}
                        onClick={() => setReadingMode(mode.id as any)}
                        className={cn(
                          "flex flex-col items-center gap-3 py-6 rounded-2xl border-2 transition-all",
                          readingMode === mode.id ? "bg-accent/10 border-accent text-white" : "bg-white/5 border-transparent text-muted hover:bg-white/10"
                        )}
                      >
                        {mode.icon}
                        <span className="text-xs font-black uppercase tracking-widest">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <p className="text-[10px] text-muted font-black uppercase tracking-[0.4em] mb-6">Active Source</p>
                   <div className="p-6 bg-accent rounded-2xl flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Authenticated via</p>
                         <p className="text-xl font-black text-white uppercase tracking-tighter">{source || 'MANHWASCAPER'}</p>
                      </div>
                      <LayoutList className="w-10 h-10 text-white/20" />
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full mt-12 py-5 bg-white text-black rounded-2xl font-black text-base uppercase tracking-[0.3em] hover:scale-95 transition-transform shadow-xl"
              >
                Close Settings
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
