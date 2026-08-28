import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', m => console.log('CONSOLE:', m.type(), m.text()));
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));

  console.log('--- Loading /chat ---');
  await page.goto('http://localhost:5180/chat', { waitUntil: 'networkidle', timeout: 15000 });

  const html = await page.evaluate(() => document.documentElement.outerHTML);
  console.log('HTML length:', html.length);
  console.log('HTML (first 3000 chars):', html.slice(0, 3000));

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\nBody text:', bodyText.slice(0, 1000));

  // Check what's in #root
  const rootContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return 'NO ROOT';
    return root.innerHTML.slice(0, 2000);
  });
  console.log('\n#root innerHTML:', rootContent);

  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/microsoft_teams_mock/assets/screenshots/debug_chat.png', fullPage: true });

  await browser.close();
})();
