import fetch from "node-fetch";

async function run() {
  const url = "https://comick.io/chapter/r2b8Ca5p";
  const res = await fetch(url, { redirect: "manual" });
  console.log(res.status);
  console.log(res.headers.get("location"));
}
run();
