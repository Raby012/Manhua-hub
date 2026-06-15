import fetch from "node-fetch";
import * as cheerio from "cheerio";
async function run() {
    try {
        const res = await fetch("https://api.comick.cc/chapter/F0BvVv8t", {
           headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const html = await res.text();
        const $ = cheerio.load(html);
        const data = $('#__NEXT_DATA__').text();
        if (data) {
           const json = JSON.parse(data);
           console.log("Found NEXT DATA!");
           if (json.props.pageProps.chapter) {
              const images = json.props.pageProps.chapter.images;
              console.log("Images found:", images && images.length);
           }
        } else {
           console.log("No NEXT_DATA.");
           console.log(html.substring(0, 200));
        }
    } catch(e) { console.log(e.message); }
}
run();
