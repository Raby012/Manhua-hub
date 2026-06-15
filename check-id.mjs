import fetch from 'node-fetch';
async function run() {
    const res = await fetch("https://mangapill.com/manga/4946/solo-leveling");
    console.log(res.status);
    const res2 = await fetch("https://mangapill.com/manga/4041/solo-leveling");
    console.log(res2.status);
    const res3 = await fetch("https://mangapill.com/manga/2/solo-leveling");
    console.log(res3.status);
}
run();
