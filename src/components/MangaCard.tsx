import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Manga } from '../types';
import { MangaImage } from './MangaImage';
import { cn } from '../lib/utils';

interface MangaCardProps {
  manga: Manga;
}

export const MangaCard: React.FC<MangaCardProps> = ({ manga }) => {
  const navigate = useNavigate();

  const typeColor = {
    manhwa: 'bg-accent',
    manga: 'bg-blue-600',
    manhua: 'bg-orange-500',
    other: 'bg-muted',
    merged: 'bg-accent'
  }[manga.type] || 'bg-muted';

  // Attempt to extract MD filename for fallback hint
  const mdCover = manga.coverImage.match(/covers\/[^\/]+\/([^\/]+)\.512\.jpg/)?.[1];
  const fallbackSources = {
    comickB2Key: manga.coverImage.includes('meo.comick.pictures') ? manga.coverImage.split('/').pop() : undefined,
    mangadex: manga.mangadexId && mdCover ? { id: manga.mangadexId, filename: mdCover } : undefined,
    slug: manga.slug
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer relative"
      onClick={() => navigate(`/manhwa/${manga.slug}`, { state: { manga } })}
    >
      <div className="relative w-[160px] h-[220px] md:w-[200px] md:h-[280px] rounded-[12px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] bg-card border border-white/5 transition-all group-hover:shadow-[0_8px_30px_rgba(124,58,237,0.3)]">
        <MangaImage
          src={manga.coverImage}
          alt={manga.title}
          className="w-full h-full"
          fallbackSources={fallbackSources}
        />
        
        {/* Card Overlay */}
        <div className="absolute inset-0 card-gradient opacity-80" />
        
        {/* Status Badges - Top Row */}
        <div className="absolute top-2 inset-x-2 flex justify-between items-start z-10">
          <div className={cn(
            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter text-white",
            typeColor
          )}>
            {manga.type}
          </div>
          <div className={cn(
            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter text-white",
            manga.status === 'ongoing' ? 'bg-green' : 'bg-red'
          )}>
            {manga.status}
          </div>
        </div>

        {/* Content at Bottom */}
        <div className="absolute inset-x-0 bottom-0 p-3 z-10">
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-accent transition-colors">
            {manga.title}
          </h3>
          <p className="text-[10px] text-accent font-black mt-1 uppercase tracking-widest">
            {manga.source.toUpperCase()} CHAPTERS
          </p>
        </div>

        {/* Purple Glow Line on Hover */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      </div>
    </motion.div>
  );
};
