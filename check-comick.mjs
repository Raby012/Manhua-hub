import fetch from "node-fetch";
async function run() {
    const urls = [
        "https://api.comick.fun/chapter/F0BvVv8t",
        "https://api.comick.io/chapter/F0BvVv8t",
        "https://api.comick.cc/chapter/F0BvVv8t",
        "https://api.comick.app/chapter/F0BvVv8t"
    ];
    for (const url of urls) {
        try {
            console.log("Trying", url);
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log(res.status);
            const text = await res.text();
            console.log(text.substring(0, 50));
        } catch (e) {
            console.log(e.message);
        }
    }
}
run();
