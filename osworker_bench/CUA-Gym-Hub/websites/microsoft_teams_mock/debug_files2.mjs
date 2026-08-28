import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // First load the SPA at /chat, then navigate to /files using the left rail
  await page.goto('http://localhost:7789/chat', { waitUntil: 'networkidle', timeout: 15000 });

  // Click the Files rail item
  const railItems = await page.$$('.rail-item');
  console.log('Rail items:', railItems.length);
  for (const ri of railItems) {
    const label = await ri.$eval('.rail-label', el => el.textContent).catch(() => '');
    if (label === 'Files') {
      await ri.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  console.log('URL after clicking Files:', page.url());

  const tables = await page.$$('.files-table');
  console.log('Files tables found:', tables.length);

  const rows = await page.$$('.files-table tbody tr');
  console.log('File rows:', rows.length);

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text (first 500):', bodyText.slice(0, 500));

  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/microsoft_teams_mock/assets/screenshots/debug_files_spa.png', fullPage: true });

  // Also check /go from SPA
  for (const ri of await page.$$('.rail-item')) {
    const label = await ri.$eval('.rail-label', el => el.textContent).catch(() => '');
    if (label === 'Chat') { await ri.click(); break; }
  }
  await new Promise(r => setTimeout(r, 500));

  // Send a message to create state change
  const ci = await page.$$('.chat-item');
  if (ci.length > 0) await ci[0].click();
  await new Promise(r => setTimeout(r, 300));
  const comp = await page.$('.composer-input');
  if (comp) {
    await comp.fill('Go test message');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 500));
  }

  // Now check /go
  const goResp = await page.evaluate(async () => {
    const r = await fetch('/go');
    return await r.text();
  });
  console.log('GO response (first 500):', goResp.slice(0, 500));

  await browser.close();
})();
