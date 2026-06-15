import { MANGA } from "@consumet/extensions";

async function run() {
    let title = "Solo Leveling";
    let chapterNum = "1";
    try {
        const provider = new MANGA.WeebCentral();
        const searchRes = await provider.search(title);
        if (searchRes.results && searchRes.results.length > 0) {
           console.log("Found:", searchRes.results[0].title);
           const info = await provider.fetchMangaInfo(searchRes.results[0].id);
           if (info.chapters && info.chapters.length > 0) {
               const targetStr = `Chapter ${parseFloat(chapterNum)}`;
               let targetCh = info.chapters.find(c => c.title === targetStr);
               
               if (!targetCh) {
                   targetCh = info.chapters.find(c => {
                       const t = c.title || "";
                       const regex = new RegExp(`\\b${chapterNum}\\b`);
                       return regex.test(t);
                   });
               }
               console.log("Target chapter:", targetCh);
               if (targetCh) {
                   const pages = await provider.fetchChapterPages(targetCh.id);
                   const imageUrls = pages.map(p => p.img || p.url || p);
                   console.log("Image urls:", imageUrls.slice(0, 2));
               }
           }
        }
    } catch(e) { console.log(e); }
}
run();
