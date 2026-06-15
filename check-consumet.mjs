import fetch from "node-fetch";

async function run() {
    const r = await fetch("https://api.consumet.org/");
    console.log(r.status);
}
run();
