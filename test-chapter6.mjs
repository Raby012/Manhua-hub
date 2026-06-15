import fetch from "node-fetch";

async function run() {
    const chUrl = `https://api.comick.dev/chapter/vrKJCNIn`;
    console.log('fetching', chUrl);
    const res = await fetch(chUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await res.json();
    console.log(JSON.stringify(data).slice(0, 500));
    console.log('images:', data.chapter?.images?.length);
    console.log('images list:', data.chapter?.images);
}
run();
