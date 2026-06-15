import fetch from "node-fetch";

async function run() {
    try {
        const res = await fetch("https://api.comick.app/chapter/F0BvVv8t", {
            method: "OPTIONS",
            headers: {
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET"
            }
        });
        console.log(res.status);
        console.log(res.headers.raw());
    } catch (e) { console.log("Failed:", e.message); }
}
run();
