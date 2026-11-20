import http from 'node:http';

const pages = Number(process.env.PAGES ?? 200);

http.createServer((req, res) => {
  const n = Number(new URL(req.url, 'http://x').pathname.slice(1)) || 0;
  const links = [n * 2 + 1, n * 2 + 2]
    .filter(x => x < pages)
    .map(x => `<a href="/${x}">p${x}</a>`)
    .join(' ');

  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<html><body>Page ${n} ${links}</body></html>`);
  }, 100 + Math.random() * 200);
}).listen(4000, () => console.log('Mock server listening on http://localhost:4000'));