import fetch from 'node-fetch';
async function run() {
   try {
      const res = await fetch('https://api.mangahook.org/search?q=solo%20leveling');
      console.log(res.status);
      const text = await res.text();
      console.log(text.substring(0, 100));
   } catch(e) { console.log("Failed:", e.message); }
}
run();
