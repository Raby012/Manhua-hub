// Mock implementation of persistence for local storage
const mockPersistence = {
  getBookmarks: () => JSON.parse(localStorage.getItem('manhwahub_bookmarks') || '[]'),
  addBookmark: (manga: any) => {
    const bookmarks = mockPersistence.getBookmarks();
    if (!bookmarks.find((b: any) => b.id === manga.id)) {
      bookmarks.push(manga);
      localStorage.setItem('manhwahub_bookmarks', JSON.stringify(bookmarks));
    }
  },
  removeBookmark: (mangaId: string) => {
    const bookmarks = mockPersistence.getBookmarks();
    const filtered = bookmarks.filter((b: any) => b.id !== mangaId);
    localStorage.setItem('manhwahub_bookmarks', JSON.stringify(filtered));
  },
  isBookmarked: (mangaId: string) => {
    const bookmarks = mockPersistence.getBookmarks();
    return !!bookmarks.find((b: any) => b.id === mangaId);
  },
  saveProgress: (mangaId: string, chapterId: string, chapterNumber: number, page: number) => {
    const history = JSON.parse(localStorage.getItem('manhwahub_history') || '{}');
    history[mangaId] = { chapterId, chapterNumber, page, lastRead: new Date().toISOString() };
    localStorage.setItem('manhwahub_history', JSON.stringify(history));
  },
  getProgress: (mangaId: string) => {
    const history = JSON.parse(localStorage.getItem('manhwahub_history') || '{}');
    return history[mangaId];
  },
  getAllHistory: () => {
    const history = JSON.parse(localStorage.getItem('manhwahub_history') || '{}');
    return Object.entries(history).map(([id, data]: [string, any]) => ({ id, ...data }));
  }
};

export const persistenceService = mockPersistence;
export const supabase = null;
