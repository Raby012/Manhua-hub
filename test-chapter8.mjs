import fetch from "node-fetch";

async function run() {
    const chUrl = `http://localhost:3000/api/proxy/comick/chapter/vrKJCNIn?tachiyomi=true`;
    console.log('fetching', chUrl);
    const res = await fetch(chUrl);
    const data = await res.json();
    console.log('md_chapters_groups:', JSON.stringify(data.chapter?.md_chapters_groups, null, 2));
}
run();
