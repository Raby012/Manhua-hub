import fetch from "node-fetch";
async function run() {
    const urls = [
        "https://ww5.manganelo.tv/search/solo_leveling",
        "https://ww6.manganelo.tv/search/solo_leveling",
        "https://mangasee123.com/search/?name=solo%20leveling"
    ];
    for (const url of urls) {
        try {
            console.log("Fetching", url);
            const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0"} });
            console.log("Status:", res.status);
        } catch(e) {
            console.log("Error:", e.message);
        }
    }
}
run();
