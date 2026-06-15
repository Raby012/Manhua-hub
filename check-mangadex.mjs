import fetch from "node-fetch";

async function run() {
    // try to fetch a manga dex chapter
    // Chapter 1 of Solo Leveling in English
    const mangadexId = "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0"; 
    
    const feedRes = await fetch(`https://api.mangadex.org/manga/${mangadexId}/feed?translatedLanguage[]=en`);
    const feedData = await feedRes.json();
    console.log("Feed total:", feedData.total);
    console.log("Chapters length:", feedData.data ? feedData.data.length : 0);
    
    if (feedData.data && feedData.data.length > 0) {
        const firstChId = feedData.data[0].id;
        console.log("First chapter ID:", firstChId);
        
        const atHomeRes = await fetch(`https://api.mangadex.org/at-home/server/${firstChId}`);
        const atHomeData = await atHomeRes.json();
        console.log("AtHome Server:", atHomeData.result);
        if (atHomeData.chapter) {
            console.log("Images count:", atHomeData.chapter.data.length);
        }
    }
}
run();
