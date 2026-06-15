import fetch from "node-fetch";

async function run() {
    const mangadexId = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0"; 
    const mdRes = await fetch(`https://api.mangadex.org/manga/${mangadexId}/feed?limit=500&order[chapter]=asc`);
    const feedData = await mdRes.json();
    if (!feedData.data) return console.log("No data");
    const valid = feedData.data.filter(c => c.attributes.pages > 0);
    console.log("Valid chapters with pages:", valid.length);
    if (valid.length > 0) {
        const languages = new Set(valid.map(c => c.attributes.translatedLanguage));
        console.log("Languages available:", Array.from(languages));
    }
}
run();
