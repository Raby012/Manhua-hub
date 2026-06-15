import fetch from "node-fetch";

async function run() {
    const urls = [
        "https://corsproxy.io/?https://api.comick.cc/chapter/F0BvVv8t",
        "https://api.allorigins.win/get?url=" + encodeURIComponent("https://api.comick.cc/chapter/F0BvVv8t")
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
