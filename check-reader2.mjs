import fetch from "node-fetch";

async function run() {
    const res = await fetch('http://localhost:3000/api/mangapill/search?q=solo%20leveling');
    const data = await res.json();
    console.log("Mangapill search:", data.map(d => d.title));
}
run();
