import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { MangaRow } from '../components/MangaRow';
import { Navbar } from '../components/Navbar';
import { HomeSkeleton } from '../components/SkeletonLoader';
import { apiService } from '../services/apiService';
import { MangaImage } from '../components/MangaImage';
import { Manga } from '../types';
import { TrendingUp, Clock, Star, Sparkles, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    trending: Manga[];
    latest: Manga[];
    topRated: Manga[];
    popular: Manga[];
    newArrivals: Manga[];
  }>({
    trending: [],
    latest: [],
    topRated: [],
    popular: [],
    newArrivals: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const homeData = await apiService.getHomeData();
        setData({
          trending: homeData.trending || [],
          latest: homeData.latest || [],
          topRated: (homeData as any).topManga || [],
          popular: homeData.popular || [],
          newArrivals: (homeData as any).featuredManhua || []
        });
      } catch (e) {
        console.error("Critical home data failure:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <HomeSkeleton />;

  return (
    <div className="min-h-screen pb-20 bg-background text-text selection:bg-accent/30">
      <Navbar />
      
      {data.trending.length > 0 && <Hero mangaList={data.trending} />}

      <div className="relative z-20 space-y-4 -mt-10 md:-mt-32">
        <MangaRow 
          title="Trending Manhwa" 
          icon={<TrendingUp className="text-accent" />} 
          mangaList={data.trending} 
        />
        
        <MangaRow 
          title="New Updates" 
          icon={<Clock className="text-green" />} 
          mangaList={data.latest} 
        />

        <div className="py-12 px-6 md:px-16">
          <div className="glass-panel rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative group">
            <div className="absolute inset-x-0 bottom-0 top-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 text-accent mb-4">
                <Sparkles className="w-6 h-6" />
                <span className="font-black text-xs uppercase tracking-[0.3em]">Featured selection</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter">
                Discover your next <span className="text-accent">obsession</span>
              </h2>
              <p className="text-muted text-lg max-w-xl mb-10 font-medium leading-relaxed">
                Dive into thousands of titles from all over Asia. Experience high-quality translations and a professional reader interface.
              </p>
              <div className="flex gap-4">
                <button className="bg-accent text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform active:scale-95">
                  Explore Now
                </button>
              </div>
            </div>
            <div className="relative z-10 w-full md:w-[400px] h-[300px] md:h-[500px]">
              <div className="grid grid-cols-2 gap-4 rotate-12 scale-110 translate-x-12 opacity-50 group-hover:opacity-100 transition-all duration-700">
                {data.trending.slice(0, 4).map((m, i) => (
                  <div key={m.id} className={cn("rounded-2xl overflow-hidden shadow-2xl", i % 2 === 0 ? "translate-y-8" : "-translate-y-8")}>
                    <img src={apiService.getProxyImageUrl(m.coverImage) || m.coverImage} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <MangaRow 
          title="Popular Classics" 
          icon={<Star className="text-gold" />} 
          mangaList={data.popular} 
        />
        
        <MangaRow 
          title="Top Manga" 
          icon={<TrendingUp className="text-blue-500" />} 
          mangaList={data.topRated} 
        />

        <MangaRow 
          title="Featured Manhua" 
          icon={<Sparkles className="text-orange-500" />} 
          mangaList={data.newArrivals} 
        />
      </div>

      <footer className="mt-40 px-6 md:px-16 py-32 border-t border-white/5 bg-black/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center shadow-2xl shadow-accent/40">
                <TrendingUp className="text-white w-6 h-6" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white">
                Manhwa<span className="text-accent">Hub</span>
              </span>
            </div>
            <p className="text-muted text-sm max-w-xs font-medium leading-loose">
              Copyright © 2026 ManhwaHub. All rights reserved. Read free manhwa, manhua, and manga online in high quality.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-12">
            <div>
              <h4 className="text-white font-black mb-6 uppercase tracking-widest text-xs opacity-50">Community</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><button className="text-muted hover:text-accent transition-colors">Discord</button></li>
                <li><button className="text-muted hover:text-accent transition-colors">Twitter</button></li>
                <li><button className="text-muted hover:text-accent transition-colors">Reddit</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 uppercase tracking-widest text-xs opacity-50">Information</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><button className="text-muted hover:text-accent transition-colors">Privacy</button></li>
                <li><button className="text-muted hover:text-accent transition-colors">Terms</button></li>
                <li><button className="text-muted hover:text-accent transition-colors">DMCA</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
