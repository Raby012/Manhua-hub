import fetch from "node-fetch";

async function run() {
    try {
      const res = await fetch('https://mangakatana.com/search?search=' + encodeURIComponent('solo leveling'));
      console.log(res.status);
    } catch(e) { console.log("Mangakatana error:", e.message); }
    
    try {
      const res2 = await fetch('https://bato.to/search?word=solo%20leveling');
      console.log("Bato:", res2.status);
    } catch(e) { console.log("Bato error:", e.message); }
}
run();
