/** Puppeteer smoke test: loads the homepage headless and pipes console logs. Not wired into CI. */
const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();

  // Pipe the browser's console logs to our terminal
  page.on('console', msg => {
    const type = msg.type().toUpperCase();
    const text = msg.text();
    if (type === 'ERROR') {
      console.error(`[BROWSER-ERROR] ${text}`);
    } else if (type === 'WARNING') {
      console.warn(`[BROWSER-WARN] ${text}`);
    } else {
      console.log(`[BROWSER-LOG] ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER-EXCEPTION] ${err.toString()}`);
  });

  console.log('Navigating to http://localhost:3000/?test=all ...');
  
  try {
    // Wait until the network is somewhat idle so JS executes
    await page.goto('http://localhost:3000/?test=all', { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Give it a few seconds to let the async compression workers and WebAssembly finish
    console.log('Waiting 5 seconds for web workers to complete execution...');
    await new Promise(r => setTimeout(r, 5000));
    
  } catch (error) {
    console.error('Failed to navigate or execute:', error);
  } finally {
    await browser.close();
    console.log('Browser test complete.');
  }
})();
