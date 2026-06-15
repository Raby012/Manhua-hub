import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { MANGA } from "@consumet/extensions";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const safeFetch = async (url: string, domain?: string) => {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "application/json"
    };

    if (domain && domain.includes("comick")) {
      headers["Referer"] = "https://comick.io";
    }

    const response = await fetch(url, {
      headers,
      timeout: 15000 // Increased timeout for slow upstream
    });
    
    // Handle special cases
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
       throw new Error(`Upstream returned ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    const text = await response.text();
    
    if (contentType && contentType.includes("application/json")) {
      try {
        return JSON.parse(text);
      } catch (e) {
        // Continue to fallback
      }
    }
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error(`Non-JSON response from ${url} (${contentType}): ${text.substring(0, 100)}`);
      throw new Error("Target returned non-JSON response (likely a block or error page)");
    }
  };

  // Proxy for ComicK
  app.get("/api/proxy/comick/*", async (req, res) => {
    const path = req.params[0] + (req.url.includes("?") ? "?" + req.url.split("?")[1] : "");
    const domains = [
      "api.comick.fun",
      "api.comick.io",
      "api.comick.cc",
      "api.comick.dev",
      "api.comick.app",
      "api.comick.ink",
    ];
    
    let lastError = "";
    let received404 = false;

    for (const domain of domains) {
      try {
        const url = `https://${domain}/${path}`;
        const data = await safeFetch(url, domain);
        if (data === null) {
          received404 = true;
          continue; // Don't abort immediately. The domain itself might be configured to return 404 on block.
        }
        return res.json(data);
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        // Continue trying next domain
      }
    }
    
    // Return graceful empty response to avoid UI crashes
    if (received404) {
      return res.status(404).json(null);
    }
    if (path.includes('search') || path.includes('latest')) {
      return res.json([]);
    } else {
      return res.json(null);
    }
  });

  // Proxy for MangaDex
  app.get("/api/proxy/mangadex/*", async (req, res) => {
    try {
      const url = `https://api.mangadex.org/${req.params[0]}${req.url.includes("?") ? "?" + req.url.split("?")[1] : ""}`;
      const data = await safeFetch(url, "api.mangadex.org");
      res.json(data);
    } catch (error) {
       res.status(502).json({ error: "MangaDex offline" });
    }
  });

  // Direct Chapter Proxy (MangaDex, then Comick)
  app.get('/api/proxy/chapter/:chapterId(*)', async (req, res) => {
    const { chapterId } = req.params;
    const chapterNum = req.query.num;
    const mangaId = req.query.mangaId;
    
    console.log(`[PROXY] Chapter ID: ${chapterId}, Num: ${chapterNum}, Manga: ${mangaId}`);

    let realChapterId = chapterId;
    let isComickId = false;
    if (chapterId.startsWith('comick_')) {
        isComickId = true;
        realChapterId = chapterId.replace('comick_', '');
    } else if (chapterId.startsWith('mangapill_')) {
        // Handle mangapill directly
        const mpId = chapterId.replace('mangapill_', '');
        try {
           const fRes = await fetch(`https://mangapill.com/chapters/${mpId}`, {
              headers: { 'User-Agent': 'Mozilla/5.0' }
           });
           const html = await fRes.text();
           const $ = cheerio.load(html);
           const images: string[] = [];
           $('picture img').each((i, el) => {
               const src = $(el).attr('data-src') || $(el).attr('src');
               if (src) images.push(src);
           });
           if (images.length > 0) {
               return res.json({ pages: images, source: 'mangapill', total: images.length });
           }
        } catch (e) {
           console.error("MangaPill proxy chapter failed:", e);
        }
        // Fallback below if mangapill fails
    }

    const comickDomains = [
      "api.comick.dev",
      "api.comick.app",
      "api.comick.cc",
      "api.comick.ink",
      "api.comick.fun",
      "api.comick.one",
      "api.comick.xyz"
    ];

    const fetchComick = async (endpoint: string) => {
      for (const domain of comickDomains) {
        try {
          const url = `https://${domain}${endpoint}`;
          console.log(`[fetchComick] trying ${url}`);
          const data = await safeFetch(url, domain);
          console.log(`[fetchComick] ${domain} returned:`, (data !== null ? 'success' : 'null'));
          if (data !== null) return data;
        } catch (error) {
          console.log(`[fetchComick] ${domain} error:`, error instanceof Error ? error.message : String(error));
          // ignore and try next domain
        }
      }
      return null;
    };

    try {
      if (!isComickId) {
        // Direct MangaDex call
        console.log(`[PROXY] Trying MangaDex for ${realChapterId}`);
        const mdRes = await fetch(
          `https://api.mangadex.org/at-home/server/${realChapterId}`,
          { headers: { 'Accept': 'application/json' }, timeout: 15000 }
        );
        
        if (mdRes.ok) {
          const data: any = await mdRes.json();
          if (data && data.chapter) {
            const { baseUrl, chapter } = data;
            const pageArray = chapter.dataSaver?.length > 0 ? chapter.dataSaver : chapter.data;
            const quality = chapter.dataSaver?.length > 0 ? 'data-saver' : 'data';
            const pages = pageArray.map((f: string) => 
              `${baseUrl}/${quality}/${chapter.hash}/${f}`
            );
            
            if (pages.length > 0) {
              console.log(`[PROXY] Found ${pages.length} pages from MangaDex`);
              return res.json({ pages, source: 'mangadex', total: pages.length });
            }
          }
        } else {
          console.log(`[PROXY] MangaDex returned false: ${mdRes.status}`);
        }
      }
    } catch(e: any) {
      console.log('MangaDex proxy failed:', e.message);
    }
    
    // Comick fallback
    try {
      console.log(`[PROXY] Trying Comick fallback for ${realChapterId}`);
      if (isComickId || (mangaId && chapterNum)) {
        let title = (req.query.title as string) || '';
        console.log(`[PROXY] Comick fallback title: ${title}`);
        if (!title && !isComickId) {
          // Get manga info for title
          const infoRes = await fetch(
            `https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`,
            { headers: { 'Accept': 'application/json' }, timeout: 15000 }
          );
          if (infoRes.ok) {
            const infoData: any = await infoRes.json();
            const titleObj = infoData.data?.attributes?.title || {};
            const altTitles = infoData.data?.attributes?.altTitles || [];
            for (const alt of altTitles) {
              if (alt.en) { title = alt.en; break; }
            }
            if (!title) title = titleObj.en || Object.values(titleObj)[0] || '';
          }
        }

        let targetHid = isComickId ? realChapterId : null;

        const attemptComickSearch = async (searchQuery: string) => {
          if (!searchQuery) return null;
          console.log(`[PROXY] Searching Comick for: ${searchQuery}`);
          const searchData: any = await fetchComick(`/v1.0/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
          if (searchData && searchData.length > 0) {
            const hid = searchData[0].hid;
            const chapData: any = await fetchComick(`/comic/${hid}/chapters?limit=500&lang=en`);
            if (chapData && chapData.chapters) {
              const target = chapData.chapters.find((c: any) => parseFloat(c.chap) === parseFloat(chapterNum as string));
              if (target) return target.hid;
            }
          }
          return null;
        };

        if (title && !targetHid) {
          targetHid = await attemptComickSearch(title);
        }

        if (!targetHid && !isComickId && typeof mangaId === 'string' && mangaId.length === 36 && mangaId.includes('-')) {
          console.log(`[PROXY] Fallback title search failed. Fetching MangaDex details for EN title...`);
          const infoRes = await fetch(
            `https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`,
            { headers: { 'Accept': 'application/json' }, timeout: 15000 }
          );
          if (infoRes.ok) {
            const infoData: any = await infoRes.json();
            const altTitles = infoData.data?.attributes?.altTitles || [];
            let enTitle = '';
            for (const alt of altTitles) {
              if (alt.en) { enTitle = alt.en; break; }
            }
            if (!enTitle) {
               const titleObj = infoData.data?.attributes?.title || {};
               enTitle = titleObj.en || '';
            }
            if (enTitle && enTitle !== title) {
               targetHid = await attemptComickSearch(enTitle);
            }
          }
        }

        if (targetHid) {
          const imgData: any = await fetchComick(`/chapter/${targetHid}`);
          if (imgData && imgData.chapter) {
            // If ComicK provides an mdid (MangaDex UUID), proxy to MangaDex instead
            if (imgData.chapter.mdid) {
              console.log(`[PROXY] Comick provided mdid ${imgData.chapter.mdid}, proxying to MangaDex`);
              const mdRes = await fetch(
                `https://api.mangadex.org/at-home/server/${imgData.chapter.mdid}`,
                { headers: { 'Accept': 'application/json' }, timeout: 15000 }
              );
              if (mdRes.ok) {
                const data: any = await mdRes.json();
                if (data && data.chapter) {
                  const { baseUrl, chapter } = data;
                  const pageArray = chapter.dataSaver?.length > 0 ? chapter.dataSaver : chapter.data;
                  const quality = chapter.dataSaver?.length > 0 ? 'data-saver' : 'data';
                  const pages = pageArray.map((f: string) => 
                    `${baseUrl}/${quality}/${chapter.hash}/${f}`
                  );
                  if (pages.length > 0) {
                    return res.json({ pages, source: 'comick->mangadex', total: pages.length });
                  }
                }
              }
            }

            // Otherwise check if Comick actually gave us images (rare now)
            const images = imgData.chapter?.images || imgData.images || [];
            
            if (images.length > 0) {
              const pages = images.map((img: any) => 
                `https://meo.comick.pictures/${img.b2key}`
              );
              return res.json({ pages, source: 'comick', total: pages.length });
            }

            // Return a fallback external URL to read on Comick Website
            const comickUrl = `https://comick.io/chapter/${realChapterId}`;
            return res.json({ pages: [], source: 'comick', fallbackUrl: comickUrl });
          }
        }
      }
    } catch(e: any) {
      console.log('Comick fallback failed:', e.message);
    }
    
    // Final WeebCentral Fallback
    try {
      if (req.query.title && chapterNum) {
         console.log(`[PROXY] Trying WeebCentral fallback for ${req.query.title} Chapter ${chapterNum}`);
         const provider = new MANGA.WeebCentral();
         const searchRes = await provider.search(req.query.title as string);
         if (searchRes.results && searchRes.results.length > 0) {
            const info = await provider.fetchMangaInfo(searchRes.results[0].id);
            if (info.chapters && info.chapters.length > 0) {
               const targetStr = `Chapter ${parseFloat(chapterNum as string)}`;
               let targetCh = info.chapters.find(c => c.title === targetStr);
               if (!targetCh) {
                   targetCh = info.chapters.find(c => {
                       const t = c.title || "";
                       const regex = new RegExp(`\\b${parseFloat(chapterNum as string)}\\b`);
                       return regex.test(t);
                   });
               }
               if (targetCh) {
                   console.log(`[PROXY] Found WeebCentral chapter: ${targetCh.id}`);
                   const pagesData = await provider.fetchChapterPages(targetCh.id);
                   const pages = pagesData.map(p => p.img || p.url || p);
                   if (pages && pages.length > 0) {
                     return res.json({ pages, source: 'weebcentral', total: pages.length });
                   }
               }
            }
         }
      }
    } catch(e: any) {
      console.log('WeebCentral fallback failed:', e.message);
    }

    // Nothing worked
    return res.json({ pages: [], source: 'none', total: 0 });
  });

  // Proxy images to bypass hotlinking and cloudflare restrictions
  app.get('/api/proxy/image', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).send('Missing url parameter');
    }
    
    try {
      const isMangapill = url.includes('mangapill') || url.includes('readdetectiveconan');
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': isMangapill ? 'https://mangapill.com/' : (url.includes('mangadex') ? 'https://mangadex.org/' : (url.includes('comick') ? 'https://comick.io/' : 'https://google.com/')),
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      });
      
      if (!response.ok) {
          return res.status(response.status).send('Failed to fetch image');
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      // Pipe the image data to the response
      const buf = await response.arrayBuffer();
      res.end(Buffer.from(buf));
    } catch (error) {
      console.error(`Image proxy error for ${url}:`, error);
      res.status(500).send('Error proxying image');
    }
  });

  // Mangapill scraping endpoints
  app.get('/api/mangapill/search', async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) return res.json([]);
      const fRes = await fetch(`https://mangapill.com/search?q=${encodeURIComponent(q)}`, {
         headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const html = await fRes.text();
      const $ = cheerio.load(html);
      const results: any[] = [];
      $('div.grid.grid-cols-2 > div, div.grid.grid-cols-1 > div, div.my-3.grid > div').each((i, el) => {
         const a = $(el).find('a').first();
         const url = a.attr('href');
         const cover = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
         const title = $(el).find('.font-bold').text().trim() || $(el).find('div.mt-3.font-bold').text().trim() || $(el).find('.text-sm').text().trim();
         if (url && url.includes('/manga/')) {
            results.push({ url, title, cover, id: url.replace('/manga/', '') });
         }
      });
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  app.get('/api/mangapill/manga/:id(*)', async (req, res) => {
     try {
         const fRes = await fetch(`https://mangapill.com/manga/${req.params.id}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
         });
         const html = await fRes.text();
         const $ = cheerio.load(html);
         const chapters: any[] = [];
         $('#chapters a').each((i, el) => {
             const title = $(el).text().trim();
             const url = $(el).attr('href');
             if (url) {
                chapters.push({ title, url, id: url.replace('/chapters/', '') });
             }
         });
         const desc = $('div.text-sm.text-secondary').text().trim();
         res.json({ chapters, description: desc });
     } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Manga detail failed' });
     }
  });

  app.get('/api/mangapill/chapter/:id(*)', async (req, res) => {
     try {
         const fRes = await fetch(`https://mangapill.com/chapters/${req.params.id}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
         });
         const html = await fRes.text();
         const $ = cheerio.load(html);
         const images: string[] = [];
         $('picture img').each((i, el) => {
             const src = $(el).attr('data-src') || $(el).attr('src');
             if (src) images.push(src);
         });
         res.json({ pages: images });
     } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Chapter failed' });
     }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
