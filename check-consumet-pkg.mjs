import { MANGA } from "@consumet/extensions";

async function run() {
    try {
        const provider = new MANGA.MangaDex();
        console.log("Searching MangaDex...");
        const res = await provider.search("solo leveling");
        console.log(res.results.slice(0, 1).map(r => r.title));
    } catch(e) { console.log(e.message); }
    
    try {
        const provider = new MANGA.MangaHere();
        console.log("Searching MangaHere...");
        const res = await provider.search("solo leveling");
        console.log(res.results.slice(0, 1).map(r => r.title));
        if (res.results.length > 0) {
            const info = await provider.fetchMangaInfo(res.results[0].id);
             console.log("Chapters length:", info.chapters?.length);
             if (info.chapters?.length > 0) {
                 const pages = await provider.fetchChapterPages(info.chapters[0].id);
                 console.log("Pages:", pages.slice(0, 2));
             }
        }
    } catch(e) { console.log("MangaHere error:", e.message); }
}
run();
