import fetch from 'node-fetch';
async function testMangaHook() {
   try {
      const res = await fetch('https://api.mangahook.org/search?q=The+Cheon+Clan');
      console.log(res.status);
   } catch(e) {}
}
testMangaHook();
