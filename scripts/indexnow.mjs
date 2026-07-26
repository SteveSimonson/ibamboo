// IndexNow submission: POSTs every sitemap URL to api.indexnow.org so
// Bing/Yandex crawl them immediately. Requires the key file
// public/<KEY>.txt to be deployed and reachable at https://ibamboo.com/<KEY>.txt.
// Usage: npm run indexnow
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const HOST = 'ibamboo.com';

// Locate the IndexNow key file: public/<32-hex-chars>.txt
const keyFile = readdirSync(publicDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error('No IndexNow key file found in public/ (expected a 32-hex-char .txt file).');
  process.exit(1);
}
const key = readFileSync(path.join(publicDir, keyFile), 'utf8').trim();

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/g)].map((m) => m[1]);
}

async function loadUrls() {
  try {
    const res = await fetch(`https://${HOST}/sitemap.xml`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const urls = extractLocs(await res.text());
    if (urls.length === 0) throw new Error('no <loc> entries');
    console.log(`Fetched live sitemap: ${urls.length} URLs`);
    return urls;
  } catch (err) {
    console.warn(`Live sitemap fetch failed (${err.message}); falling back to public/sitemap.xml`);
    const urls = extractLocs(readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8'));
    console.log(`Parsed local sitemap: ${urls.length} URLs`);
    return urls;
  }
}

const urlList = await loadUrls();
const body = {
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${keyFile}`,
  urlList,
};

console.log(`Submitting ${urlList.length} URLs to IndexNow (key file: ${keyFile})...`);
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
const text = await res.text();
console.log(`HTTP ${res.status}`);
if (text) console.log(text);
// 200 = submitted OK, 202 = accepted pending key validation, 4xx = error
if (res.status === 200 || res.status === 202) {
  console.log('IndexNow submission accepted.');
} else {
  console.error('IndexNow submission failed — check status meaning at https://www.indexnow.org/documentation');
  process.exit(1);
}
