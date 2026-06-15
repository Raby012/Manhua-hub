import fetch from "node-fetch";

async function run() {
    const chUrl = `https://api.comick.dev/chapter/vrKJCNIn?tachiyomi=true`;
    console.log('fetching', chUrl);
    const res = await fetch(chUrl, { headers: { "User-Agent": "Tachiyomi/1.0" } });
    const data = await res.json();
    console.log('Top level:', Object.keys(data));
}
run();
