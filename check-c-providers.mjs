import { MANGA } from "@consumet/extensions";

async function run() {
    for (const Provider of [MANGA.MangaReader, MANGA.WeebCentral, MANGA.AsuraScans, MANGA.ComicK]) {
        try {
            const provider = new Provider();
            const res = await provider.search("solo leveling");
            console.log(Provider.name, "search:", res.results.slice(0, 1).map(r => r.title));
            if (res.results.length > 0) {
                const info = await provider.fetchMangaInfo(res.results[0].id);
                console.log(Provider.name, "Chapters:", info.chapters?.length);
                if (info.chapters?.length > 0) {
                    const chId = info.chapters[info.chapters.length - 1].id;
                    const pages = await provider.fetchChapterPages(chId);
                    console.log(Provider.name, "Pages count:", pages?.length);
                    console.log("first image", pages[0].img || pages[0].url || pages[0]);
                }
            }
        } catch(e) { console.log(Provider.name, "error:", e.message); }
    }
}
run();
