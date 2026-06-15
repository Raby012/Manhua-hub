import { MANGA } from "@consumet/extensions";

async function run() {
    const provider = new MANGA.WeebCentral();
    const res = await provider.search("solo leveling");
    console.log("Manga ID:", res.results[0].id);
    const info = await provider.fetchMangaInfo(res.results[0].id);
    // find chapter 1
    const idx = info.chapters.findIndex(c => {
        const title = c.title || "";
        console.log(title)
        return title.includes(" 1") || title === "Chapter 1";
    });
    console.log("Chapter object example:", info.chapters[info.chapters.length - 1]);
}
run();
