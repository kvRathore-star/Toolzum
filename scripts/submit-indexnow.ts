/** Submits sitemap URLs to the IndexNow API (Bing/Yandex) after deploy. Requires no secrets (key is public by design). */
const INDEXNOW_KEY = '71a78a2efbe244249625d4740fd91311';
const SITEMAP_URL = 'https://toolzum.com/sitemap.xml';
const INDEXNOW_API = 'https://api.indexnow.org/indexnow';

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL);
  const xml = await res.text();
  const urls: string[] = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]!);
  }
  return urls;
}

async function submitBatch(urls: string[]): Promise<void> {
  const body = {
    host: 'toolzum.com',
    key: INDEXNOW_KEY,
    keyLocation: `https://toolzum.com/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  const res = await fetch(INDEXNOW_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  API error ${res.status}: ${text}`);
    process.exitCode = 1;
  } else {
    console.log(`  Submitted ${urls.length} URLs (HTTP ${res.status})`);
  }
}

async function main() {
  console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
  const urls = await fetchSitemapUrls();
  if (urls.length === 0) {
    console.error('Refusing to submit an empty URL list (sitemap fetch failed or parsed zero URLs).');
    process.exit(1);
  }
  console.log(`Found ${urls.length} URLs in sitemap.\n`);

  const BATCH_SIZE = 10000;
  let submitted = 0;

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(urls.length / BATCH_SIZE)}:`);
    await submitBatch(batch);
    submitted += batch.length;
  }

  console.log(`\nDone. ${submitted} URLs submitted to IndexNow.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
