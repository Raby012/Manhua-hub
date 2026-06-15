import fetch from 'node-fetch';
import * as cheerio from "cheerio";
async function run() {
    const res = await fetch("https://mangapill.com/manga/4946/solo-leveling");
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log("Title:", $('h1').text());
    const chapters = [];
    $('#chapters a').each((i, el) => {
        chapters.push($(el).attr('href'));
    });
    console.log("Chapters length:", chapters.length);
    if(chapters.length > 0) {
        console.log("Last chapter:", chapters[chapters.length - 1]);
        const chUrl = chapters[chapters.length - 1];
        const res2 = await fetch("https://mangapill.com" + chUrl);
        const html2 = await res2.text();
        const $2 = cheerio.load(html2);
        console.log("Images:");
        $2('picture img').each((i, el) => {
            console.log($2(el).attr('data-src'));
        });
    }
}
run();
