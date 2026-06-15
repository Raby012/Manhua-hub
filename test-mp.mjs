import https from 'https';

https.get('https://mangapill.com/search?q=solo%20leveling', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data.length));
});
