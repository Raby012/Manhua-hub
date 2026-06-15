import fetch from "node-fetch";
import * as cheerio from "cheerio";
async function run() {
    const fRes = await fetch("https://mangapill.com/search?q=solo%20leveling");
    const html = await fRes.text();
    const $ = cheerio.load(html);
    $('div.grid > div').each((i, el) => {
        const a = $(el).find('a').first();
        console.log("Found:", $(el).text().replace(/\s+/g, ' ').substring(0, 50));
        console.log("Title A text:", a.text());
        console.log("Title div:", $(el).find('div').text().replace(/\s+/g, ' ').substring(0, 50));
    });
}
run();
