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
  const visited = new Set([seed]);
  let currentLevel = [seed];

  for (let depth = 0; depth <= maxDepth && currentLevel.length > 0; depth++) {
    const nextLevel = [];

    await Promise.all(
      currentLevel.map(async (url) => {
        console.log(`Fetching: ${url} (depth ${depth})`);
        try {
          const html = await fetchPage(url);
          if (depth < maxDepth) {
            for (const link of parseLinks(html, url)) {
              if (!visited.has(link)) {
                visited.add(link);
                nextLevel.push(link);
              }
            }
          }
        } catch (err) {
          console.error(`Error fetching ${url}:`, err.message);
        }
      })
    );

    currentLevel = nextLevel;
  }

  const elapsed = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`Crawled ${visited.size} pages in ${elapsed}s`);
}

crawl();