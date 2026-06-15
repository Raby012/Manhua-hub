import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MangaCard } from '../components/MangaCard';
import { persistenceService } from '../services/persistenceService';
import { Manga } from '../types';
import { Library, Trash2, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Manga[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setBookmarks(persistenceService.getBookmarks());
    setHistory(persistenceService.getAllHistory());
  }, []);

  const removeBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    persistenceService.removeBookmark(id);
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto px-4 md:px-12 pt-32">
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-accent2/20 rounded-2xl border border-accent2/20">
              <Library className="w-8 h-8 text-accent2" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Your Library</h1>
          </div>
          <p className="text-muted font-bold text-lg max-w-2xl">
            You have <span className="text-accent2">{bookmarks.length} titles</span> saved in your personal collection. Offline access is coming soon!
          </p>
        </div>

        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {bookmarks.map((m) => (
              <div key={m.id} className="relative group">
                <MangaCard manga={m} />
                <button 
                  onClick={(e) => removeBookmark(m.id, e)}
                  className="absolute top-4 right-4 p-3 bg-red-600/80 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 active:scale-90 z-20"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center text-center">
             <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
               <Library className="w-16 h-16 text-muted" />
             </div>
             <h2 className="text-3xl font-black text-text mb-4 tracking-tighter">Library is empty</h2>
             <p className="text-muted max-w-xs mb-10 font-medium">Browse our catalog and start building your collection today!</p>
             <button onClick={() => navigate('/browse')} className="bg-accent text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-accent/20 active:scale-95 transition-transform hover:scale-105">
               Start Browsing
             </button>
          </div>
        )}

        {/* Recent History Section */}
        {history.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-3 bg-accent/20 rounded-2xl border border-accent/20">
                <Clock className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Reading History</h2>
            </div>

            <div className="space-y-4">
               {history.sort((a,b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime()).map(item => (
                 <div 
                   key={item.id}
                   onClick={() => navigate(`/manhwa/${item.id}`, { state: { manga: item } })}
                   className="group glass-panel rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/5 transition-colors cursor-pointer"
                 >
                   <div className="flex items-center gap-6 min-w-0 flex-1">
                      <div className="w-16 h-24 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                         {/* We don't store cover in history to save space, but title is there */}
                         <div className="w-full h-full flex items-center justify-center text-accent/20 uppercase font-black text-4xl">
                           {item.id.charAt(0)}
                         </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-black text-white truncate max-w-md group-hover:text-accent transition-colors">{item.id.replace(/-/g, ' ')}</h3>
                        <p className="text-accent2 text-sm font-black uppercase tracking-widest mt-1">Chapter {item.chapterNumber}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted font-black uppercase tracking-widest mb-1">Last Read</p>
                        <p className="text-white font-bold">{new Date(item.lastRead).toLocaleDateString()}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/read/${item.id}/${item.chapterId}`); }}
                        className="bg-accent text-white px-8 py-4 rounded-xl font-black flex items-center gap-2 hover:scale-105 transition-transform active:scale-95"
                      >
                        <BookOpen className="w-5 h-5" />
                        Continue
                      </button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
