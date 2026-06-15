async function run() {
    const res = await fetch('https://mangapill.com/search?q=solo%20leveling', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
    const text = await res.text();
    if (!res.ok) {
        console.log("Failed:", res.status, text.substring(0, 100));
        return;
    }
    const data = JSON.parse(text);
    console.log("KEYS:", Object.keys(data));
    if (data.chapter) {
        console.log("CHAPTER KEYS:", Object.keys(data.chapter));
        console.log("CHAPTER IMAGES:", data.chapter.images ? data.chapter.images.length : 'undefined');
        console.log("MDID:", data.chapter.mdid);
    }
}
run();
