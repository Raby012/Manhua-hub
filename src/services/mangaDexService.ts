import { Manga, Chapter } from '../types';

const MANGADEX_API = 'https://api.mangadex.org';
const MANGADEX_UPLOADS = 'https://uploads.mangadex.org';

const fetchJson = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Direct fetch failed for ${url}, trying proxy...`, e);
    try {
      // Primary proxy fallback
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy status: ${res.status}`);
      const data = await res.json();
      return JSON.parse(data.contents);
    } catch (proxyError) {
      console.error(`Fetch & Proxy failed for ${url}:`, proxyError);
      throw proxyError;
    }
  }
};

export const mangaDexService = {
  getCoverUrl(mangaId: string, fileName: string) {
    return `${MANGADEX_UPLOADS}/covers/${mangaId}/${fileName}`;
  },

  async searchManga(params: {
    title?: string;
    limit?: number;
    offset?: number;
    originalLanguage?: string[];
    order?: Record<string, 'asc' | 'desc'>;
  }) {
    const url = new URL(`${MANGADEX_API}/manga`);
    url.searchParams.append('limit', String(params.limit || 20));
    url.searchParams.append('offset', String(params.offset || 0));
    url.searchParams.append('contentRating[]', 'safe');
    url.searchParams.append('contentRating[]', 'suggestive');
    url.searchParams.append('includes[]', 'cover_art');
    url.searchParams.append('includes[]', 'author');

    if (params.title) url.searchParams.append('title', params.title);
    if (params.originalLanguage) {
      params.originalLanguage.forEach(lang => url.searchParams.append('originalLanguage[]', lang));
    }
    
    if (params.order) {
      Object.entries(params.order).forEach(([key, val]) => {
        url.searchParams.append(`order[${key}]`, val);
      });
    }

    const data = await fetchJson(url.toString());
    
    return data.data.map((m: any) => {
      const coverArt = m.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
      const author = m.relationships.find((r: any) => r.type === 'author')?.attributes?.name;
      
      return {
        id: m.id,
        slug: m.id,
        mangadexId: m.id,
        title: m.attributes.title.en || Object.values(m.attributes.title)[0],
        description: m.attributes.description.en || '',
        coverImage: coverArt ? this.getCoverUrl(m.id, coverArt) : '',
        status: m.attributes.status,
        type: m.attributes.originalLanguage === 'ko' ? 'manhwa' : m.attributes.originalLanguage === 'zh' ? 'manhua' : 'manga',
        author: author || 'Unknown',
        genres: m.attributes.tags.map((t: any) => t.attributes.name.en),
        rating: 0, // MangaDex rating needs extra call usually
        source: 'mangadex'
      } as Manga;
    });
  },

  async getTrending() {
    return this.searchManga({
      originalLanguage: ['ko'],
      order: { followedCount: 'desc' },
      limit: 20
    });
  },

  async getLatestUpdates() {
     const url = `${MANGADEX_API}/manga?limit=20&order[latestUploadedChapter]=desc&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive`;
     const data = await fetchJson(url);
     return data.data.map((m: any) => {
        const coverArt = m.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
        const author = m.relationships.find((r: any) => r.type === 'author')?.attributes?.name;
        return {
          id: m.id,
          slug: m.id,
          mangadexId: m.id,
          title: m.attributes.title.en || Object.values(m.attributes.title)[0],
          description: m.attributes.description.en || '',
          coverImage: coverArt ? this.getCoverUrl(m.id, coverArt) : '',
          status: m.attributes.status,
          type: m.attributes.originalLanguage === 'ko' ? 'manhwa' : m.attributes.originalLanguage === 'zh' ? 'manhua' : 'manga',
          author: author || 'Unknown',
          genres: m.attributes.tags.map((t: any) => t.attributes.name.en),
          rating: 0,
          source: 'mangadex'
        } as Manga;
     });
  },

  async getTopRated() {
    return this.searchManga({
      originalLanguage: ['ko'],
      order: { rating: 'desc' },
      limit: 20
    });
  },

  async getMangaDetails(id: string) {
    const url = `${MANGADEX_API}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`;
    const m = await fetchJson(url);
    const data = m.data;
    const coverArt = data.relationships.find((r: any) => r.type === 'cover_art')?.attributes?.fileName;
    const author = data.relationships.find((r: any) => r.type === 'author')?.attributes?.name;
    const artist = data.relationships.find((r: any) => r.type === 'artist')?.attributes?.name;

    return {
      id: data.id,
      slug: data.id,
      mangadexId: data.id,
      title: data.attributes.title.en || Object.values(data.attributes.title)[0],
      description: data.attributes.description.en || '',
      coverImage: coverArt ? this.getCoverUrl(data.id, coverArt) : '',
      status: data.attributes.status,
      type: data.attributes.originalLanguage === 'ko' ? 'manhwa' : data.attributes.originalLanguage === 'zh' ? 'manhua' : 'manga',
      author: author || 'Unknown',
      artist: artist || author || 'Unknown',
      genres: data.attributes.tags.map((t: any) => t.attributes.name.en),
      rating: 0,
      source: 'mangadex'
    } as Manga;
  },

  async getChapters(mangaId: string, limit = 500, offset = 0) {
    const url = `${MANGADEX_API}/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc&limit=${limit}&offset=${offset}&contentRating[]=safe&contentRating[]=suggestive`;
    const data = await fetchJson(url);
    return data.data.map((c: any) => ({
      id: c.id,
      number: parseFloat(c.attributes.chapter),
      title: c.attributes.title || `Chapter ${c.attributes.chapter}`,
      date: c.attributes.updatedAt,
      source: 'mangadex',
      mangaSlug: mangaId
    } as Chapter));
  },

  async getChapterPages(chapterId: string) {
    const data = await fetchJson(`${MANGADEX_API}/at-home/server/${chapterId}`);
    const { baseUrl, chapter: { hash, data: images } } = data;
    return images.map((f: string) => `${baseUrl}/data/${hash}/${f}`);
  },

  async getTags() {
    const data = await fetchJson(`${MANGADEX_API}/manga/tag`);
    return data.data.map((t: any) => t.attributes.name.en);
  }
};
