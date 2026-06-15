import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function run() {
    const q = encodeURIComponent("solo leveling");
    const res = await fetch(`https://manganato.com/search/story/${q}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $('.search-story-item').each((i, el) => {
        const a = $(el).find('a.item-title');
        const title = a.text().trim();
        const url = a.attr('href');
        const img = $(el).find('img').attr('src');
        results.push({ title, url, img });
    });
    console.log("Manganato search:", results);
    
    if (results.length > 0) {
        const mangaUrl = results[0].url;
        console.log("Fetching manga:", mangaUrl);
        const res2 = await fetch(mangaUrl);
        const html2 = await res2.text();
        const $2 = cheerio.load(html2);
        const chapters = [];
        $2('.chapter-name').each((i, el) => {
            chapters.push({
                title: $2(el).text().trim(),
                url: $2(el).attr('href')
            });
        });
        console.log("Chapters:", chapters.slice(0, 3));
        
        if (chapters.length > 0) {
            const chapterUrl = chapters[0].url;
            console.log("Fetching chapter:", chapterUrl);
            const res3 = await fetch(chapterUrl, {
               headers: { 'Referer': 'https://manganato.com/' }
            });
            const html3 = await res3.text();
            const $3 = cheerio.load(html3);
            const images = [];
            $3('.container-chapter-reader img').each((i, el) => {
                images.push($3(el).attr('src'));
            });
            console.log("Images:", images.slice(0, 3));
        }
    }
}
run();
