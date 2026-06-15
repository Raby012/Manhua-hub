import fetch from "node-fetch";
import * as cheerio from "cheerio";
async function run() {
    // try different search terms for mangapill
    const queries = ["i alone level up", "ore dake"];
    for (const q of queries) {
        console.log("== Search:", q);
        const fRes = await fetch("https://mangapill.com/search?q=" + encodeURIComponent(q));
        const html = await fRes.text();
        const $ = cheerio.load(html);
        $('div.grid > div').each((i, el) => {
            const titleNode = $(el).find('a.mb-2, div.font-bold, a.font-bold, div[class*="font-bold"]').first();
            const a = $(el).find('a').first();
            const url = a.attr('href');
            if (url && url.includes('/manga/')) {
                const title = titleNode.text().trim();
                console.log(title, "->", url);
            }
        });
    }
}
run();
