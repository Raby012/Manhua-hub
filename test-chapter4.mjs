import fetch from "node-fetch";

async function run() {
    const chUrl = `http://localhost:3000/api/proxy/comick/chapter/vrKJCNIn`;
    console.log('fetching', chUrl);
    const res = await fetch(chUrl);
    const data = await res.json();
    console.log(Object.keys(data.chapter));
}
run();
