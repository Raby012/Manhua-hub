import fetch from "node-fetch";
async function run() {
    try {
        const query = `
        query {
            search(q: "solo leveling", limit: 5) {
                rows { id title }
            }
        }`;
        const res = await fetch("https://api.mangahub.io/graphql", {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({query})
        });
        console.log(res.status, await res.text());
    } catch(e) { console.log(e.message); }
}
run();
