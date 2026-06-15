import fetch from "node-fetch";

async function run() {
    const atHomeRes = await fetch(`https://api.mangadex.org/chapter/3d12db58-05fd-4678-bbd4-5d182daf26b6`);
    const atHomeData = await atHomeRes.json();
    console.log("Chapter data:", atHomeData.data.attributes);
}
run();
