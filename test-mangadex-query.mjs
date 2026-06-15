import fetch from "node-fetch";

async function run() {
  const q = "The Cheon Clan";
  const url = `https://api.mangadex.org/manga?title=${encodeURIComponent(q)}&limit=10&includes[]=cover_art`;
  console.log('fetching', url);
  const res = await fetch(url);
  const data = await res.json();
  data.data.forEach(m => {
     console.log(m.attributes.title);
  });
}
run();
