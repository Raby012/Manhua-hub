import fetch from "node-fetch";

async function run() {
  const query = "mad dog";
  const url = `https://bato.to/search?word=${encodeURIComponent(query)}`;
  console.log('fetching', url);
  const res = await fetch(url);
  const html = await res.text();
  console.log('HTML length', html.length);
  if (html.includes('Just a moment')) {
    console.log('Cloudflare blocked');
  } else {
    console.log('Success!');
  }
}
run();
