import fetch from "node-fetch";
async function run() {
    const res = await fetch("http://localhost:3000/api/proxy/mangadex/manga?limit=32");
    console.log("Status:", res.status);
    console.log("ContentType:", res.headers.get("content-type"));
    const text = await res.text();
    console.log(text.substring(0, 100));
}
run();
