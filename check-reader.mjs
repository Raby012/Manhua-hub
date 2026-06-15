import fetch from "node-fetch";

async function run() {
    const res = await fetch('http://localhost:3000/api/mangapill/search?q=solo%20leveling');
    const data = await res.json();
    console.log("Mangapill search:", data);
    
    if (data.length > 0) {
        const mangaId = data[0].id;
        const res2 = await fetch('http://localhost:3000/api/mangapill/manga/' + encodeURIComponent(mangaId));
        const data2 = await res2.json();
        console.log("Manga detail:", data2);
        
        if (data2.chapters && data2.chapters.length > 0) {
            const chapId = data2.chapters[data2.chapters.length - 1].id;
            console.log("First chapter ID:", chapId);
            const res3 = await fetch('http://localhost:3000/api/mangapill/chapter/' + encodeURIComponent(chapId));
            const data3 = await res3.json();
            console.log("Chapter images:", data3.pages ? data3.pages.slice(0, 3) : data3);
            
            // Now test the unified proxy endpoint
            const res4 = await fetch('http://localhost:3000/api/proxy/chapter/mangapill_' + encodeURIComponent(chapId));
            const data4 = await res4.json();
            console.log("Unified Proxy endpoint:", data4.pages ? data4.pages.slice(0, 3) : data4);
        }
    }
}
run();
