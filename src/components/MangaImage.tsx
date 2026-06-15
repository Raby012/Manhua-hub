import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { apiService } from '../services/apiService';

interface MangaImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSources?: {
    comickB2Key?: string;
    mangadex?: { id: string; filename: string };
    slug?: string;
  };
}

export const MangaImage: React.FC<MangaImageProps> = ({ src, alt, className, fallbackSources }) => {
  const getInitialSrc = () => apiService.getProxyImageUrl(src) || src;

  const [currentSrc, setCurrentSrc] = useState(getInitialSrc());
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    setCurrentSrc(getInitialSrc());
    setAttempt(0);
    setError(false);
  }, [src]);

  const handleError = () => {
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);

    if (nextAttempt === 1 && fallbackSources?.comickB2Key) {
      setCurrentSrc(apiService.getProxyImageUrl(`https://meo.comick.pictures/${fallbackSources.comickB2Key}`)!);
    } else if (nextAttempt === 2 && fallbackSources?.mangadex && fallbackSources.mangadex.filename) {
      setCurrentSrc(apiService.getProxyImageUrl(`https://uploads.mangadex.org/covers/${fallbackSources.mangadex.id}/${fallbackSources.mangadex.filename}.512.jpg`)! || '');
    } else if (nextAttempt === 3 && fallbackSources?.slug) {
      setCurrentSrc(apiService.getProxyImageUrl(`https://avt.mkklcdnv6temp.com/manga/${fallbackSources.slug}.jpg`)!);
    } else if (nextAttempt <= 4) {
      // Fallback: don't use proxy
      setCurrentSrc(src);
    } else {
      setError(true);
    }
  };

  if (error || !currentSrc) {
    return (
      <div className={cn("bg-card flex items-center justify-center text-muted text-[10px] font-bold text-center p-2", className)}>
        NO COVER
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={handleError}
      loading="lazy"
      width={300}
      height={400}
      style={{ objectFit: 'cover' }}
    />
  );
};
