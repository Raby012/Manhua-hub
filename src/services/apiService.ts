import { Manga, Chapter } from '../types';

const fetchJson = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn(`[Proxy Intercept] Non-JSON response for ${url}. Returning null.`);
      return null;
    }
    return await res.json();
  } catch (e: any) {
    if (e.name !== 'AbortError') {
      console.error(`Fetch failed for ${url}:`, e);
    }
    return null;
  }
};

const normalizeTitle = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const mergeMangaResults = (lists: Manga[][]) => {
  const merged = new Map<string, Manga>();
  
  lists.forEach(list => {
    list.forEach(manga => {
      const titlesToMatch = [manga.title, ...(manga.altTitles || [])].map(normalizeTitle).filter(Boolean);
      
      let matchedKey: string | null = null;
      for (const t of titlesToMatch) {
         if (merged.has(t)) {
            matchedKey = t;
            break;
         }
      }

      if (!matchedKey) {
        merged.set(titlesToMatch[0], manga);
      } else {
        // Prefer MangaDex or ComicK for metadata if possible
        const existing = merged.get(matchedKey)!;
        if (manga.source === 'mangadex' || manga.source === 'comick') {
          merged.set(matchedKey, { ...manga, ...existing, source: 'merged' as any, 
             mangadexId: manga.mangadexId || existing.mangadexId,
             comickSlug: manga.comickSlug || existing.comickSlug,
             comickId: manga.comickId || existing.comickId,
             mangapillId: manga.mangapillId || existing.mangapillId
          });
        } else {
           merged.set(matchedKey, { ...existing, 
             mangadexId: manga.mangadexId || existing.mangadexId,
             comickSlug: manga.comickSlug || existing.comickSlug,
             comickId: manga.comickId || existing.comickId,
             mangapillId: manga.mangapillId || existing.mangapillId
           });
        }
      }
    });
  });

  return Array.from(merged.values());
};

export const apiService = {
  getProxyImageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('/api/')) return url;
    return `/api/proxy/image?url=${encodeURIComponent(url)}`;
  },

  async getHomeData(page = 1): Promise<Record<string, Manga[]>> {
    const offset = (page - 1) * 20;
    
    const [comick, mangadex] = await Promise.all([
      fetchJson(`/api/proxy/comick/v1.0/search?type=comic&sort=uploaded&page=${page}`),
      fetchJson(`/api/proxy/mangadex/manga?limit=32&offset=${offset}&order[updatedAt]=desc&includes[]=cover_art&availableTranslatedLanguage[]=en`)
    ]);

    const comickList: Manga[] = (comick || []).map((m: any) => ({
      id: m.slug,
      slug: m.slug,
      comickSlug: m.slug,
      title: m.title,
      altTitles: m.md_titles ? m.md_titles.map((t: any) => t.title) : [],
      coverImage: `https://meo.comick.pictures/${m.md_covers?.[0]?.b2key || ''}`,
      description: m.desc || '',
      rating: m.rating || 0,
      status: m.status === 1 ? 'ongoing' : 'completed',
      type: 'manhwa',
      author: 'Unknown',
      genres: m.md_genres?.map((g: any) => g.name) || [],
      source: 'comick'
    } as Manga));

    const mangadexList: Manga[] = (mangadex?.data || []).map((m: any) => {
      const cover = m.relationships.find((r: any) => r.type === 'cover_art');
      const altEn = m.attributes.altTitles?.find((t: any) => t.en)?.en;
      const allAlts = m.attributes.altTitles?.map((t: any) => Object.values(t)[0]) || [];

      return {
        id: m.id,
        slug: m.id,
        mangadexId: m.id,
        title: m.attributes.title.en || altEn || Object.values(m.attributes.title)[0],
        altTitles: allAlts,
        coverImage: cover ? `https://uploads.mangadex.org/covers/${m.id}/${cover.attributes.fileName}.512.jpg` : '',
        description: m.attributes.description.en || '',
        rating: 0,
        status: m.attributes.status === 'ongoing' ? 'ongoing' : 'completed',
        type: 'manhwa',
        author: 'Unknown',
        genres: m.attributes.tags?.map((t: any) => t.attributes?.name?.en).filter(Boolean) || [],
        source: 'mangadex'
      } as Manga;
    });

    const merged = mergeMangaResults([comickList, mangadexList]);

    return {
      trending: merged.slice(0, 10),
      latest: merged.slice(10, 22),
      popular: merged.slice(5, 17),
      topManga: merged.filter(m => m.type === 'manga').slice(0, 10),
      featuredManhua: merged.filter(m => m.type === 'manhua').slice(0, 10)
    };
  },

  async getAllManga(page = 1): Promise<Manga[]> {
    const data = await this.getHomeData(page);
    return data.trending; // return any of the merged lists
  },

  async searchManga(query: string): Promise<Manga[]> {
    const [comick, mangadex, mangapill] = await Promise.all([
      fetchJson(`/api/proxy/comick/v1.0/search?q=${encodeURIComponent(query)}&type=comic&limit=20`),
      fetchJson(`/api/proxy/mangadex/manga?title=${encodeURIComponent(query)}&includes[]=cover_art&availableTranslatedLanguage[]=en`),
      fetchJson(`/api/mangapill/search?q=${encodeURIComponent(query)}`)
    ]);

    const comickList: Manga[] = (comick || []).map((m: any) => ({
      id: m.slug,
      slug: m.slug,
      comickSlug: m.slug,
      title: m.title,
      altTitles: m.md_titles ? m.md_titles.map((t: any) => t.title) : [],
      coverImage: `https://meo.comick.pictures/${m.md_covers?.[0]?.b2key || ''}`,
      source: 'comick'
    } as Manga));

    const mangadexList: Manga[] = (mangadex?.data || []).map((m: any) => {
      const cover = m.relationships.find((r: any) => r.type === 'cover_art');
      const altEn = m.attributes.altTitles?.find((t: any) => t.en)?.en;
      const allAlts = m.attributes.altTitles?.map((t: any) => Object.values(t)[0]) || [];

      return {
        id: m.id,
        slug: m.id,
        mangadexId: m.id,
        title: m.attributes.title.en || altEn || Object.values(m.attributes.title)[0],
        altTitles: allAlts,
        coverImage: cover ? `https://uploads.mangadex.org/covers/${m.id}/${cover.attributes.fileName}.512.jpg` : '',
        source: 'mangadex'
      } as Manga;
    });

    const mangapillList: Manga[] = (mangapill || []).map((m: any) => ({
      id: m.id,
      slug: m.id,
      mangapillId: m.id,
      title: m.title,
      coverImage: m.cover || '',
      description: '',
      rating: 0,
      status: 'ongoing',
      type: 'other',
      author: 'Unknown',
      genres: [],
      source: 'mangapill'
    } as Manga));

    return mergeMangaResults([comickList, mangadexList, mangapillList]).slice(0, 30);
  },

  async getMangaDetails(manga: Manga): Promise<Manga> {
    // If we have ComicK slug, it's the best for more details
    if (manga.comickSlug) {
      try {
        const data = await fetchJson(`/api/proxy/comick/comic/${manga.comickSlug}`);
        if (data && data.comic) {
          return {
            ...manga,
            description: data.comic.desc || manga.description,
            rating: data.comic.rating || manga.rating,
            status: data.comic.status === 1 ? 'ongoing' : 'completed',
            genres: data.genres?.map((g: any) => g.name) || manga.genres,
            author: data.authors?.map((a: any) => a.name).join(', ') || manga.author,
            coverImage: manga.coverImage || (data.comic.md_covers?.[0]?.b2key ? `https://meo.comick.pictures/${data.comic.md_covers[0].b2key}` : manga.coverImage),
            comickId: data.comic.hid
          };
        }
      } catch (e) {
        console.warn(`ComicK details failed for ${manga.comickSlug}:`, e);
      }
    }
    
    // Fallback to MangaDex if we have ID
    if (manga.mangadexId) {
      try {
        const data = await fetchJson(`/api/proxy/mangadex/manga/${manga.mangadexId}?includes[]=cover_art`);
        if (data && data.data) {
          const attr = data.data.attributes;
          const coverRel = data.data.relationships?.find((r: any) => r.type === 'cover_art');
          const updatedCover = coverRel ? `https://uploads.mangadex.org/covers/${manga.mangadexId}/${coverRel.attributes?.fileName}.512.jpg` : manga.coverImage;
          return {
            ...manga,
            description: attr.description?.en || manga.description,
            status: attr.status === 'ongoing' ? 'ongoing' : 'completed',
            genres: attr.tags?.map((t: any) => t.attributes?.name?.en).filter(Boolean) || manga.genres,
            coverImage: manga.coverImage || updatedCover || manga.coverImage
          };
        }
      } catch (e) {
        console.warn(`MangaDex details failed for ${manga.mangadexId}:`, e);
      }
    }

    if (manga.mangapillId) {
       try {
         const data = await fetchJson(`/api/mangapill/manga/${encodeURIComponent(manga.mangapillId)}`);
         if (data && data.description) {
             return {
                 ...manga,
                 description: data.description || manga.description,
                 coverImage: manga.coverImage || data.cover || manga.coverImage
             }
         }
       } catch (e) {
         console.warn(`MangaPill details failed for ${manga.mangapillId}:`, e);
       }
    }

    return manga;
  },

  async getAllChapters(manga: Manga): Promise<Chapter[]> {
    let allChapters: Chapter[] = [];
    
    // 1. ComicK
    let hid = manga.comickId;
    if (!hid && manga.comickSlug) {
      try {
        const details = await fetchJson(`/api/proxy/comick/comic/${manga.comickSlug}`);
        hid = details?.comic?.hid;
      } catch (e) {
        console.warn(`ComicK HID fetch failed for ${manga.comickSlug}:`, e);
      }
    }

    if (hid) {
      try {
        let page = 1;
        let lastFirstChapterId = '';
        while (page <= 5) {
          const data = await fetchJson(`/api/proxy/comick/comic/${hid}/chapters?limit=300&page=${page}&lang=en`);
          if (!data || !data.chapters || data.chapters.length === 0) break;
          
          if (data.chapters[0].hid === lastFirstChapterId) break;
          lastFirstChapterId = data.chapters[0].hid;

          allChapters.push(...data.chapters.map((c: any) => ({
            id: `comick_${c.hid}`,
            number: parseFloat(c.chap),
            title: c.title || `Chapter ${c.chap}`,
            date: c.created_at,
            source: 'comick',
            mangaSlug: manga.comickSlug || '',
            group: (c.group_name?.[0] || 'Unknown') + (c.lang ? ` (${c.lang})` : '')
          })));
          if (data.chapters.length < 300) break;
          page++;
        }
      } catch (e) {
        console.error("ComicK chapters fetch failed:", e);
      }
    }

    // 2. MangaDex (always fetch to ensure we have fallbacks)
    if (manga.mangadexId) {
      try {
        let offset = 0;
        let mdPage = 0;
        while (mdPage < 10) {
          const data = await fetchJson(`/api/proxy/mangadex/manga/${manga.mangadexId}/feed?order[chapter]=asc&limit=500&offset=${offset}&translatedLanguage[]=en&includes[]=scanlation_group`);
          if (!data || !data.data || data.data.length === 0) break;
          allChapters.push(...data.data.filter((c: any) => c.attributes.pages > 0 || !c.attributes.externalUrl).map((c: any) => {
            const group = c.relationships.find((r: any) => r.type === 'scanlation_group');
            return {
              id: c.id,
              number: parseFloat(c.attributes.chapter),
              title: c.attributes.title || `Chapter ${c.attributes.chapter}`,
              date: c.attributes.updatedAt,
              source: 'mangadex',
              mangaSlug: manga.mangadexId!,
              group: (group?.attributes?.name || 'Unknown') + ` (${c.attributes.translatedLanguage || 'en'})`
            };
          }));
          if (offset + 500 >= (data.total || 0)) break;
          offset += 500;
          mdPage++;
        }
      } catch (e) {}
    }

    // 3. MangaPill
    if (manga.mangapillId) {
      try {
         const data = await fetchJson(`/api/mangapill/manga/${encodeURIComponent(manga.mangapillId)}`);
         if (data && data.chapters) {
             const mpChapters = data.chapters.map((c: any, index: number) => {
                 const chStr = c.title.replace(/[^0-9.]/g, '');
                 const number = parseFloat(chStr) || (data.chapters.length - index);
                 return {
                    id: `mangapill_${c.id}`,
                    number: number,
                    title: c.title,
                    date: new Date().toISOString(),
                    source: 'mangapill',
                    mangaSlug: manga.mangapillId!,
                    group: 'MangaPill'
                 };
             });
             allChapters.push(...mpChapters);
         }
      } catch (e) {
          console.error("MangaPill chapters failed:", e);
      }
    }

    // Group chapters by number 
    const grouped = new Map<number, Chapter[]>();
    
    // Sort all by date desc so newer ones come first
    allChapters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    allChapters.forEach(ch => {
      if (ch.number && !isNaN(ch.number)) {
        if (!grouped.has(ch.number)) {
          grouped.set(ch.number, []);
        }
        grouped.get(ch.number)!.push(ch);
      }
    });
    
    const uniqueChapters: Chapter[] = [];
    grouped.forEach((variants, num) => {
      // Prioritize mangadex over comick
      variants.sort((a, b) => {
        if (a.source === 'mangadex' && b.source !== 'mangadex') return -1;
        if (b.source === 'mangadex' && a.source !== 'mangadex') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      const primary = variants[0];
      primary.variants = variants;
      uniqueChapters.push(primary);
    });
    
    return uniqueChapters.sort((a, b) => a.number - b.number);
  }
};
