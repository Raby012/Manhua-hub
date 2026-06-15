import fetch from "node-fetch";
async function run() {
    try {
        const res = await fetch("https://api.comick.cc/chapter/F0BvVv8t", {
           headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json, text/plain, */*' }
        });
        console.log("Status:", res.status);
        console.log("Content-Type:", res.headers.get("content-type"));
        const text = await res.text();
        console.log("Content:", text.substring(0, 100));
    } catch(e) { console.log(e.message); }
}
run();
