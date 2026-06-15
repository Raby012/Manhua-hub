import fetch from "node-fetch";

async function run() {
    const urls = [
        "https://comick.io/api/get_chapter?hid=F0BvVv8t",
        "https://comick.io/api/chapter/F0BvVv8t"
    ];
    for (const url of urls) {
        try {
            console.log("Trying", url);
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            console.log(res.status);
        } catch (e) {
            console.log(e.message);
        }
    }
}
run();
