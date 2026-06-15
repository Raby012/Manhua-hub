import fetch from "node-fetch";

async function run() {
  const url = `http://localhost:3000/api/proxy/comick/comic/MRHPGkG4/chapters?lang=en&limit=300&page=1`;
  const res = await fetch(url);
  const data = await res.json();
  const ch12 = data.chapters.find(c => c.chap === '12');
  console.log('Chapter 12:', ch12);
  
  if (ch12) {
      const chUrl = `http://localhost:3000/api/proxy/comick/chapter/${ch12.hid}?tachiyomi=true`;
      console.log('fetching', chUrl);
      const res2 = await fetch(chUrl);
      console.log('status', res2.status);
      const data2 = await res2.json();
      console.log(data2);
  }
}
run();
