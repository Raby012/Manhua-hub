import fetch from 'node-fetch';
import * as cheerio from "cheerio";
async function run() {
    const res = await fetch("https://mangapill.com/manga/2/solo-leveling");
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log("Title:", $('h1').text());
}
run();
