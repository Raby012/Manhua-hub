import fetch from "node-fetch";

async function run() {
    try {
        console.log("Mangakakalot unofficials:");
        const urls = [
            "https://chapmanganato.to/search/story/solo_leveling",
            "https://mangasee123.com/",
            "https://mangabuddy.com/",
            "https://www.mangaread.org/?s=solo+leveling&post_type=wp-manga"
        ];
        for (let u of urls) {
            try { 
                const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0'} });
                console.log(u, r.status);
            } catch(e) { console.log(u, "failed:", e.message); }
        }
    } catch(e) {}
}
run();
