import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Bookmark, Star, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Manga } from '../types';
import { cn } from '../lib/utils';
import { persistenceService } from '../services/persistenceService';
import { MangaImage } from './MangaImage';

interface HeroProps {
  mangaList: Manga[];
}

export const Hero: React.FC<HeroProps> = ({ mangaList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const current = mangaList[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mangaList.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [mangaList.length]);

  if (!current) return null;

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsBookmarked(persistenceService.isBookmarked(current.id));
  }, [current.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBookmarked) {
      persistenceService.removeBookmark(current.id);
    } else {
      persistenceService.addBookmark(current);
    }
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[700px] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <MangaImage
            src={current.coverImage}
            alt={current.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
          <div className="absolute inset-0 hero-gradient" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-16 pb-12 md:pb-24">
        <div className="max-w-3xl relative z-10">
          <motion.div
            key={`meta-${current.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-accent text-[10px] font-black text-white uppercase tracking-widest rounded-lg">
                {current.type || 'Manhwa'}
              </span>
              <div className="flex items-center gap-1.5 text-gold bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-black">{(8.5 + (currentIndex % 1.5)).toFixed(1)}</span>
              </div>
              <span className="text-text/60 text-xs font-bold uppercase tracking-widest">
                Latest: Ch. 179
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">
              {current.title}
            </h1>

            <p className="text-text/70 text-sm md:text-lg mb-10 line-clamp-3 max-w-xl leading-relaxed font-medium">
              {current.description || "Discover the latest chapters and follow the journey in this immersive story. Updated regularly with high-quality translations from multiple sources."}
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate(`/manhwa/${current.slug}`, { state: { manga: current } })}
                className="flex items-center gap-3 bg-accent hover:bg-accent/90 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-2xl shadow-accent/20 active:scale-95 group/btn"
              >
                <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                Start Reading
              </button>
              <button 
                onClick={toggleBookmark}
                className={cn(
                  "flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-xl text-white border border-white/10 px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95",
                  isBookmarked && "text-accent border-accent/30"
                )}
              >
                <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
                {isBookmarked ? 'Bookmarked' : 'Add to Library'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hero Navigation */}
      <div className="absolute right-12 bottom-12 hidden md:flex items-center gap-4 z-20">
        <button 
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? mangaList.length - 1 : prev - 1))}
          className="p-4 bg-white/5 hover:bg-accent/20 backdrop-blur-lg border border-white/10 rounded-2xl text-white transition-all active:scale-90"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <div className="flex gap-2">
          {mangaList.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 transition-all rounded-full",
                i === currentIndex ? "w-8 bg-accent" : "w-3 bg-white/20"
              )} 
            />
          ))}
        </div>
        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % mangaList.length)}
          className="p-4 bg-white/5 hover:bg-accent/20 backdrop-blur-lg border border-white/10 rounded-2xl text-white transition-all active:scale-90"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Decorative Gradient Top */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />
    </div>
  );
};
