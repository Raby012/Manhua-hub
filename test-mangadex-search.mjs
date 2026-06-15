import fetch from "node-fetch";

async function run() {
  const query = "Becoming the Cheon Clan's Mad Dog";
  try {
     const title = encodeURIComponent(query);
     const url = `http://localhost:3000/api/proxy/mangadex/manga?title=${title}&limit=5`;
     console.log('fetching', url);
     const res = await fetch(url);
     console.log(res.status);
     const data = await res.json();
     console.log('Got', data.data?.length, 'results');
     if (data.data?.length) {
         console.log(data.data[0]);
     }
  } catch(e) {}
}
run();
