import fetch from "node-fetch";
async function run() {
    try {
        const res = await fetch("https://api.comick.cc/chapter/F0BvVv8t", {
           headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const html = await res.text();
        console.log(html);
    } catch(e) { console.log(e.message); }
}
run();
