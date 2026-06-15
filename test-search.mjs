import fetch from "node-fetch";

async function run() {
  const res = await fetch("https://api.mangadex.org/manga?title=Cheon%20Clan&limit=5");
  const data = await res.json();
  console.log(data.data.map(m => m.attributes.title));
}
run();
