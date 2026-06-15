import React from 'react';
import { Manga } from '../types';
import { MangaCard } from './MangaCard';
import { ChevronRight } from 'lucide-react';

interface MangaRowProps {
  title: string;
  mangaList: Manga[];
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const MangaRow: React.FC<MangaRowProps> = ({ title, mangaList, icon, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-12 px-4 md:px-12 overflow-hidden">
        <div className="h-10 w-64 bg-card shimmer rounded-2xl mb-8" />
        <div className="flex gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[180px] md:w-[240px] aspect-[3/4] bg-card shimmer rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!mangaList.length) return null;

  return (
    <div className="py-12 group/row">
      <div className="flex items-center justify-between mb-8 px-4 md:px-12">
        <div className="flex items-center gap-4">
          {icon && <div className="p-3 bg-white/5 rounded-2xl border border-white/5">{icon}</div>}
          <h2 className="text-2xl md:text-3xl font-black text-text tracking-tight flex items-center gap-3">
            {title}
          </h2>
        </div>
        <button className="flex items-center gap-2 text-muted hover:text-accent font-black text-sm uppercase tracking-widest transition-all hover:gap-3 group">
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth px-6 md:px-16 pb-12">
        {mangaList.map((m) => (
          <div key={m.id} className="flex-shrink-0">
            <MangaCard manga={m} />
          </div>
        ))}
        {/* Spacer for scroll end */}
        <div className="w-6 md:w-16 flex-shrink-0" />
      </div>
    </div>
  );
};
