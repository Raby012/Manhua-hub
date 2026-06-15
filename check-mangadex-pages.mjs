import fetch from "node-fetch";

async function run() {
    const mangadexId = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0"; 
    let offset = 0;
    while(offset < 25) {
        const feedRes = await fetch(`https://api.mangadex.org/manga/${mangadexId}/feed?translatedLanguage[]=en&limit=500&offset=${offset}`);
        const feedData = await feedRes.json();
        if (!feedData.data || feedData.data.length === 0) break;
        const valid = feedData.data.filter(c => c.attributes.pages > 0);
        console.log("Found valid chapters:", valid.length, "out of", feedData.data.length);
        offset += 500;
        break;
    }
}
run();
