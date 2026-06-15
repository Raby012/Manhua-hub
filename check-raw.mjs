import fetch from 'node-fetch';
async function run() {
    const urls = [
        "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://api.comick.app/chapter/F0BvVv8t"),
        "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://api.mangadex.org/chapter/3d12db58-05fd-4678-bbd4-5d182daf26b6")
    ];
    for (const url of urls) {
        try {
            console.log("Fetching", url);
            const res = await fetch(url);
            console.log("Status:", res.status);
            const text = await res.text();
            console.log(text.substring(0, 100));
        } catch(e) {
            console.log("Error:", e.message);
        }
    }
}
run();
