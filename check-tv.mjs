import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function run() {
    // Try scraping mangakakalot.tv
    const q = "solo leveling";
    const res = await fetch(`https://ww8.mangakakalot.tv/search/${q.replace(/ /g, '_')}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $('.story_item').each((i, el) => {
        const title = $(el).find('.story_name a').text().trim();
        const url = $(el).find('.story_name a').attr('href');
        if (url) results.push({ title, url });
    });
    console.log("Results:", results);
    
    if (results.length > 0) {
        const mangaUrl = 'https://ww8.mangakakalot.tv' + results[0].url;
        console.log("Manga URL:", mangaUrl);
        const res2 = await fetch(mangaUrl);
        const html2 = await res2.text();
        const $2 = cheerio.load(html2);
        const chapters = [];
        $2('.chapter-list .row span a').each((i, el) => {
            chapters.push({
                title: $2(el).text().trim(),
                url: 'https://ww8.mangakakalot.tv' + $2(el).attr('href')
            });
        });
        console.log("Chapters:", chapters.slice(0, 3));
        
        if (chapters.length > 0) {
            const chUrl = chapters[chapters.length - 1].url;
            console.log("Chapter URL:", chUrl);
            const res3 = await fetch(chUrl);
            const html3 = await res3.text();
            const $3 = cheerio.load(html3);
            const images = [];
            $3('#vungdoc img').each((i, el) => {
                images.push($3(el).attr('data-src'));
            });
            console.log("Images:", images.slice(0, 3));
        }
    }
}
run();
