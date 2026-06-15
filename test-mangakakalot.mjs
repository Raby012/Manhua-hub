import fetch from "node-fetch";

async function run() {
  const query = "mad dog";
  const url = `https://mangakakalot.com/search/story/${query.replace(/ /g, '_')}`;
  console.log('fetching', url);
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML length', html.length);
  if (html.includes('Just a moment')) {
    console.log('Cloudflare blocked');
  } else {
    console.log('Success, titles:');
    const regex = /<h3 class="story_name">\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let m;
    while ((m = regex.exec(html)) !== null) {
      console.log(m[1], m[2]);
    }
  }
}
run();
