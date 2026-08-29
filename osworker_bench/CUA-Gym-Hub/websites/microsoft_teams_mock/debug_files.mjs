import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:7789/files', { waitUntil: 'networkidle', timeout: 15000 });
  const html = await page.evaluate(() => document.querySelector('#root')?.innerHTML?.slice(0, 3000) || 'EMPTY');
  console.log('FILES PAGE ROOT HTML:', html);
  const title = await page.evaluate(() => document.title);
  console.log('TITLE:', title);
  const tables = await page.$$('.files-table');
  console.log('FILES TABLES:', tables.length);
  const allText = await page.evaluate(() => document.body.innerText);
  console.log('BODY TEXT:', allText.slice(0, 1000));
  await page.screenshot({ path: '/cpfs02/data/shared/Group-m6/bowen.wbw/openrlvr-mock/microsoft_teams_mock/assets/screenshots/debug_files.png', fullPage: true });
  await browser.close();
})();
