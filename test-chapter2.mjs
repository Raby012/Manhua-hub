import fetch from "node-fetch";

async function run() {
    const list = [ 'n854UBAE', 'Hk5qKl18', 'vrKJCNIn', '0MNZmrv5', 'm3A_wajY' ];
    for(const hid of list) {
      const chUrl = `http://localhost:3000/api/proxy/comick/chapter/${hid}?tachiyomi=true`;
      console.log('fetching', chUrl);
      const res = await fetch(chUrl);
      const data = await res.json();
      console.log(hid, 'has md_images', !!data.chapter.md_images, 'images', !!data.chapter.images);
    }
}
run();
