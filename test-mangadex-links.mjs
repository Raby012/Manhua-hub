import fetch from "node-fetch";

async function run() {
  const url = `http://localhost:3000/api/proxy/comick/comic/MRHPGkG4`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.comic.links);
}
run();
