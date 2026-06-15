import fetch from "node-fetch";
import * as cheerio from "cheerio";
async function run() {
    const fRes = await fetch("https://mangapill.com/search?q=solo%20leveling");
    const html = await fRes.text();
    const $ = cheerio.load(html);
    $('div.grid > div').each((i, el) => {
        const titleNode = $(el).find('a.mb-2, div.font-bold, a.font-bold, div[class*="font-bold"]').first();
        const a = $(el).find('a').first();
        const url = a.attr('href');
        if (url && url.includes('/manga/')) {
            console.log("URL:", url);
            console.log("Title A/Div text:", titleNode.text().trim());
            console.log("All text:", $(el).text().replace(/\s+/g, ' ').substring(0, 100));
        }
    });
}
run();
