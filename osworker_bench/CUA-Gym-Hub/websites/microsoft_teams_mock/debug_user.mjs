import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }});
  await page.goto('http://localhost:7789/chat', { waitUntil: 'networkidle', timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));

  // Check what state.currentUser.userId is
  const currentUser = await page.evaluate(() => {
    // Access React context  - find root fiber
    const root = document.getElementById('root');
    const fiber = root?._reactRootContainer?._internalRoot?.current;
    return 'Cannot access directly';
  });
  console.log('currentUser:', currentUser);

  // Check the Go page for userId
  const goPage = await page.evaluate(async () => {
    const resp = await fetch('/go');
    return await resp.text();
  });
  console.log('Go response (first 200):', goPage.slice(0, 200));

  // Check data file
  await browser.close();
})();
