export interface Manga {
  id: string; // Internal unique ID (slug or mangadex id)
  slug: string;
  title: string;
  altTitles?: string[];
  description: string;
  coverImage: string;
  rating: number;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  type: 'manhwa' | 'manga' | 'manhua' | 'other';
  author: string;
  artist?: string;
  genres: string[];
  lastChapter?: string | number;
  latestChapterDate?: string;
  mangadexId?: string;
  comickSlug?: string;
  comickId?: string;
  jujuSlug?: string;
  mangahookId?: string;
  mangapillId?: string;
  source: 'comick' | 'mangadex' | 'juju' | 'mangahook' | 'scraper' | 'merged' | 'railway' | 'mangapill';
}

export interface Chapter {
  id: string; // Source-specific chapter ID
  number: number;
  title: string;
  date: string;
  source: string;
  mangaSlug: string;
  group?: string;
  variants?: Chapter[];
}

export interface MangaResult {
  manga: Manga;
  chapters?: Chapter[];
}
