import fetch from "node-fetch";

async function run() {
  const query = "solo_leveling";
  const url = `https://mangakakalot.com/search/story/${query}`;
  console.log('fetching', url);
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML length', html.length);
  if (html.includes('Just a moment')) {
    console.log('Cloudflare blocked');
  } else {
    console.log('Success, titles:');
    const regex = /<h3 class="story_name"><a href="([^"]+)".*?>([^<]+)<\/a>/g;
    let m;
    let mangaUrl = null;
    while ((m = regex.exec(html)) !== null) {
      console.log(m[1], m[2]);
      if (!mangaUrl) mangaUrl = m[1];
    }
    
    if (mangaUrl) {
       console.log('Fetching', mangaUrl);
       const r2 = await fetch(mangaUrl);
       const h2 = await r2.text();
       const chRegex = /<a href="([^"]+)" class="chapter-name text-nowrap".*?>([^<]+)<\/a>/g;
       let m2;
       while((m2 = chRegex.exec(h2)) !== null) {
           console.log("Chapter:", m2[1], m2[2]);
           break;
       }
    }
  }
}
run();
