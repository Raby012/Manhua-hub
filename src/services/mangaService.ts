import { Manga, Chapter } from '../types';

const PROXY_URL = 'https://images.weserv.nl/?url=';

export const getProxyUrl = (url: string, width = 300, height = 400) => {
  if (!url) return '';
  if (url.includes('weserv.nl') || url.includes('wsrv.nl')) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&h=${height}&fit=cover&output=jpg`;
};

export const getWsrvUrl = (url: string) => {
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
};

export const mangaService = {
  async fetchHomeData() {
    const page = 1;
    const offset = 0;

    const sources = [
      // ComicK - best English coverage
      fetch(`https://api.comick.fun/v1.0/search?type=manhwa&lang=en&sort=uploaded&page=${page}`).then(r => r.json()),
      // MangaDex - largest database
      fetch(`https://api.mangadex.org/manga?limit=30&offset=${offset}&originalLanguage[]=ko&availableTranslatedLanguage[]=en&order[updatedAt]=desc&includes[]=cover_art`).then(r => r.json()),
      // Juju API
      fetch(`https://juju-manhwa-2-0.vercel.app/api/latest/${page}`).then(r => r.json()),
      // MangaHook
      fetch(`https://mangahook-api.vercel.app/api/mangaList?page=${page}`).then(r => r.json()),
    ];

    const results = await Promise.allSettled(sources);
    
    let allManga: Manga[] = [];

    // Parse ComicK
    if (results[0].status === 'fulfilled') {
      const data = results[0].value;
      allManga.push(...(data || []).map((item: any) => ({
        id: item.slug,
        slug: item.slug,
        title: item.title,
        description: item.desc || '',
        coverImage: item.md_covers?.[0]?.b2key ? `https://meo.comick.pictures/${item.md_covers[0].b2key}` : '',
        rating: item.bayesian_rating || 0,
        status: item.status === 1 ? 'ongoing' : 'completed',
        type: 'manhwa',
        author: '',
        genres: item.genres || [],
        lastChapter: item.last_chapter,
        source: 'comick'
      })));
    }

    // Parse MangaDex
    if (results[1].status === 'fulfilled') {
      const data = results[1].value;
      allManga.push(...(data.data || []).map((item: any) => {
        const coverArt = item.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
        return {
          id: item.id,
          slug: item.id,
          title: item.attributes.title.en || Object.values(item.attributes.title)[0],
          mangadexId: item.id,
          description: item.attributes.description.en || '',
          coverImage: coverArt ? `https://uploads.mangadex.org/covers/${item.id}/${coverArt}.512.jpg` : '',
          rating: 0,
          status: item.attributes.status === 'ongoing' ? 'ongoing' : 'completed',
          type: item.attributes.originalLanguage === 'ko' ? 'manhwa' : item.attributes.originalLanguage === 'zh' ? 'manhua' : 'manga',
          author: '',
          genres: item.attributes.tags.map((t: any) => t.attributes.name.en),
          lastChapter: item.attributes.lastChapter,
          source: 'mangadex'
        };
      }));
    }

    // Parse Juju
    if (results[2].status === 'fulfilled') {
      const data = results[2].value;
      allManga.push(...(data || []).map((item: any) => ({
        id: item.slug,
        slug: item.slug,
        title: item.title,
        description: '',
        coverImage: item.image,
        rating: 0,
        status: 'ongoing',
        type: 'manhwa',
        author: '',
        genres: [],
        lastChapter: item.latest_chapter,
        source: 'juju'
      })));
    }

    // Deduplicate by title similarity (simplified: exact title match or very close)
    const unique = new Map<string, Manga>();
    allManga.forEach(m => {
      const key = m.title.toLowerCase().trim();
      if (!unique.has(key) || (m.source === 'comick' && unique.get(key)?.source !== 'comick')) {
        unique.set(key, m);
      }
    });

    return Array.from(unique.values());
  },

  async searchManga(query: string) {
    const sources = [
      fetch(`https://api.comick.fun/v1.0/search?q=${encodeURIComponent(query)}&lang=en`).then(r => r.json()),
      fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&availableTranslatedLanguage[]=en&includes[]=cover_art`).then(r => r.json()),
      fetch(`https://mangahook-api.vercel.app/api/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
    ];

    const results = await Promise.allSettled(sources);
    let allManga: Manga[] = [];

    if (results[0].status === 'fulfilled') {
       allManga.push(...(results[0].value || []).map((item: any) => ({
        id: item.slug,
        slug: item.slug,
        title: item.title,
        description: item.desc || '',
        coverImage: item.md_covers?.[0]?.b2key ? `https://meo.comick.pictures/${item.md_covers[0].b2key}` : '',
        rating: item.bayesian_rating || 0,
        status: item.status === 1 ? 'ongoing' : 'completed',
        type: 'manhwa',
        author: '',
        genres: item.genres || [],
        lastChapter: item.last_chapter,
        source: 'comick'
      })));
    }

    if (results[1].status === 'fulfilled') {
      const data = results[1].value;
       allManga.push(...(data.data || []).map((item: any) => {
        const coverArt = item.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
        return {
          id: item.id,
          slug: item.id,
          title: item.attributes.title.en || Object.values(item.attributes.title)[0],
          mangadexId: item.id,
          description: item.attributes.description.en || '',
          coverImage: coverArt ? `https://uploads.mangadex.org/covers/${item.id}/${coverArt}.512.jpg` : '',
          rating: 0,
          status: item.attributes.status === 'ongoing' ? 'ongoing' : 'completed',
          type: item.attributes.originalLanguage === 'ko' ? 'manhwa' : item.attributes.originalLanguage === 'zh' ? 'manhua' : 'manga',
          author: '',
          genres: item.attributes.tags.map((t: any) => t.attributes.name.en),
          lastChapter: item.attributes.lastChapter,
          source: 'mangadex'
        };
      }));
    }

    const unique = new Map<string, Manga>();
    allManga.forEach(m => {
      const key = m.title.toLowerCase().trim();
      if (!unique.has(key)) unique.set(key, m);
    });

    return Array.from(unique.values()).slice(0, 20);
  },

  async getMangaDetails(slug: string, source: string) {
    if (source === 'comick') {
      const res = await fetch(`https://api.comick.fun/comic/${slug}/`).then(r => r.json());
      const data = res.comic;
      return {
        id: data.slug,
        slug: data.slug,
        title: data.title,
        description: data.desc || '',
        coverImage: data.md_covers?.[0]?.b2key ? `https://meo.comick.pictures/${data.md_covers[0].b2key}` : '',
        rating: data.bayesian_rating || 0,
        status: data.status === 1 ? 'ongoing' : 'completed',
        type: 'manhwa',
        author: data.artists?.[0]?.name || '',
        genres: data.md_comic_genres?.map((g: any) => g.md_genres.name) || [],
        lastChapter: data.last_chapter,
        mangadexId: res.md_id,
        source: 'comick'
      } as Manga;
    } else if (source === 'mangadex') {
      const res = await fetch(`https://api.mangadex.org/manga/${slug}?includes[]=cover_art&includes[]=author`).then(r => r.json());
      const data = res.data;
      const coverArt = data.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
      const author = data.relationships.find((r: any) => r.type === 'author')?.attributes?.name;
      return {
        id: data.id,
        slug: data.id,
        title: data.attributes.title.en || Object.values(data.attributes.title)[0],
        mangadexId: data.id,
        description: data.attributes.description.en || '',
        coverImage: coverArt ? `https://uploads.mangadex.org/covers/${data.id}/${coverArt}.512.jpg` : '',
        rating: 0,
        status: data.attributes.status === 'ongoing' ? 'ongoing' : 'completed',
        type: data.attributes.originalLanguage === 'ko' ? 'manhwa' : data.attributes.originalLanguage === 'zh' ? 'manhua' : 'manga',
        author: author || '',
        genres: data.attributes.tags.map((t: any) => t.attributes.name.en),
        lastChapter: data.attributes.lastChapter,
        source: 'mangadex'
      } as Manga;
    }
    return null;
  },

  async getAllChapters(slug: string, title: string, mangadexId?: string) {
    let allChapters: any[] = [];
    
    // Source 1: ComicK
    try {
      let page = 1;
      while(true) {
        const res = await fetch(`https://api.comick.fun/comic/${slug}/chapters?lang=en&limit=300&page=${page}`).then(r => r.json());
        if(!res.chapters?.length) break;
        allChapters.push(...res.chapters.map((c: any) => ({
          id: c.hid,
          number: parseFloat(c.chap),
          title: c.title || `Chapter ${c.chap}`,
          date: c.created_at,
          source: 'comick',
          mangaSlug: slug
        })));
        if(res.chapters.length < 300) break;
        page++;
      }
    } catch(e) {}
    
    // Source 2: MangaDex
    if(mangadexId && allChapters.length < 10) {
      try {
        let offset = 0;
        while(true) {
          const res = await fetch(`https://api.mangadex.org/manga/${mangadexId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=500&offset=${offset}`).then(r => r.json());
          if(!res.data?.length) break;
          allChapters.push(...res.data.map((c: any) => ({
            id: c.id,
            number: parseFloat(c.attributes.chapter),
            title: c.attributes.title || `Chapter ${c.attributes.chapter}`,
            date: c.attributes.updatedAt,
            source: 'mangadex',
            mangaSlug: slug
          })));
          if(offset + 500 >= res.total) break;
          offset += 500;
        }
      } catch(e) {}
    }
    
    // Source 3: Juju scraper
    if(allChapters.length < 5) {
      try {
        const res = await fetch(`https://juju-manhwa-2-0.vercel.app/api/info/${slug}`).then(r => r.json());
        if(res.ch_list?.length) {
          allChapters.push(...res.ch_list.map((c: any) => ({
            id: c.slug,
            number: parseFloat(c.ch_title?.match(/\d+/)?.[0] || '0'),
            title: c.ch_title,
            date: c.time,
            source: 'juju',
            mangaSlug: slug
          })));
        }
      } catch(e) {}
    }
    
    const unique = [...new Map(allChapters
      .filter(c => c.number && !isNaN(c.number))
      .map(c => [c.number, c]))
      .values()];
    
    return unique.sort((a,b) => b.number - a.number) as Chapter[]; // Sort descending by default for details view
  },

  async getChapterImages(chapterId: string, source: string) {
    if(source === 'comick') {
      const res = await fetch(`https://api.comick.fun/chapter/${chapterId}/`).then(r => r.json());
      return res.chapter?.md_images?.map((img: any) =>
        `https://meo.comick.pictures/${img.b2key}`
      ) || [];
    }
    
    if(source === 'mangadex') {
      const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`).then(r => r.json());
      return res.chapter?.data?.map((f: string) =>
        `${res.baseUrl}/data/${res.chapter.hash}/${f}`
      ) || [];
    }
    
    try {
      const res = await fetch(`https://juju-manhwa-2-0.vercel.app/api/chapter/${chapterId}`).then(r => r.json());
      return res.chapters?.map((c: any) => c.ch) || [];
    } catch(e) {
      return [];
    }
  }
};
