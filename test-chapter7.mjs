import fetch from "node-fetch";

async function run() {
    const chUrl = `http://localhost:3000/api/proxy/comick/chapter/vrKJCNIn?tachiyomi=true`;
    console.log('fetching', chUrl);
    const res = await fetch(chUrl);
    const data = await res.json();
    console.log('chapter object keys:', Object.keys(data.chapter));
    if (data.chapter.md_images !== undefined) {
       console.log('md_images:', data.chapter.md_images);
    }
    if (data.chapter.images !== undefined) {
       console.log('images:', data.chapter.images);
    }
}
run();
