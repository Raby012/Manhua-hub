import fetch from "node-fetch";
import fs from "fs";
async function run() {
  const query = "mad_dog";
  const url = `https://manganato.com/search/story/${query}`;
  console.log('fetching', url);
  const res = await fetch(url);
  const html = await res.text();
  fs.writeFileSync('manganato.html', html);
  console.log('saved');
}
run();
