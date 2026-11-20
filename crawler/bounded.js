import { JSDOM } from 'jsdom';

const seed = 'http://localhost:4000/0';
const maxDepth = 3;
const concurrency = 5;

const visited = new Set();
const queue = [];
let active = 0;

async function fetchPage(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Fetch error ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseLinks(html, baseUrl) {
  const origin = new URL(baseUrl).origin;
  const dom = new JSDOM(html);
  return [...dom.window.document.querySelectorAll('a')]
    .map(a => new URL(a.href, baseUrl).toString())
    .filter(url => url.startsWith(origin));
}

async function worker() {
  while (true) {
    const item = queue.shift();
    if (!item) {
      if (active === 0) return;
      await new Promise(r => setTimeout(r, 10));
      continue;
    }

    active++;
    try {
      console.log(`Fetching ${item.url} (depth ${item.depth})`);
      const html = await fetchPage(item.url);
      if (item.depth < maxDepth) {
        for (const link of parseLinks(html, item.url)) {
          if (!visited.has(link)) {
            visited.add(link);
            queue.push({ url: link, depth: item.depth + 1 });
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching ${item.url}:`, e.message);
    } finally {
      active--;
    }
  }
}

async function crawl() {
  const start = performance.now();
  queue.push({ url: seed, depth: 0 });
  visited.add(seed);

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const elapsed = ((performance.now() - start) / 1000).toFixed(2);
  console.log(`Crawled ${visited.size} pages in ${elapsed}s`);
}

crawl();