import { JSDOM } from 'jsdom';

const seed = 'http://localhost:4000/0';
const maxDepth = 3;

async function fetchPage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return await response.text();
}

function parseLinks(html, baseUrl) {
  const origin = new URL(baseUrl).origin;
  const dom = new JSDOM(html);
  return [...dom.window.document.querySelectorAll('a')]
    .map(a => new URL(a.href, baseUrl).toString())
    .filter(url => url.startsWith(origin));
}

async function crawl() {
  const start = performance.now();
  const visited = new Set();
  const queue = [{ url: seed, depth: 0 }];

  while (queue.length > 0) {
    const { url, depth } = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    console.log(`Fetching: ${url} (depth ${depth})`);
    try {
      const html = await fetchPage(url);
      if (depth < maxDepth) {
        for (const link of parseLinks(html, url)) {
          if (!visited.has(link)) queue.push({ url: link, depth: depth + 1 });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  const elapsed = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`Crawled ${visited.size} pages in ${elapsed}s`);
}

crawl();