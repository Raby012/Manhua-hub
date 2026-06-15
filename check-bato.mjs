import fetch from "node-fetch";
async function run() {
    try {
      console.log("Fetching Bato...");
      const res = await fetch('https://bato.to/search?word=solo%20leveling', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 5000
      });
      console.log("Bato:", res.status);
      const text = await res.text();
      console.log(text.substring(0,200));
    } catch(e) { console.log("Bato error:", e.message); }
}
run();
