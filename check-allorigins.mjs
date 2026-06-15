import fetch from "node-fetch";

async function run() {
    const jsonUrl = encodeURIComponent("https://api.comick.app/chapter/F0BvVv8t");
    try {
        const res = await fetch("https://api.allorigins.win/get?url=" + jsonUrl);
        console.log("Status:", res.status);
        const text = await res.json();
        console.log("Response starts with:", text.contents.substring(0, 100));
    } catch(e) {
        console.log("Error:", e.message);
    }
}
run();
