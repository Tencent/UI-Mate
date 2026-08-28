const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:5180/results?origin=SFO&destination=JFK&tripType=roundtrip', { waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 1500));
  
  const allText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  console.log('RESULTS TEXT:', allText);
  
  // Check for flight cards
  const cards = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const withAMPM = all.filter(el => /\d+(:\d+)?\s*(AM|PM)/i.test(el.textContent) && el.children.length > 0 && el.children.length < 15);
    return withAMPM.slice(0, 5).map(el => ({ tag: el.tagName, text: el.textContent.substring(0, 100), classname: el.className }));
  });
  console.log('Elements with AM/PM:', JSON.stringify(cards, null, 2));
  
  // Check if price insights visible
  const banner = await page.evaluate(() => {
    const match = document.body.innerText.match(/Prices are currently.{0,50}/);
    return match ? match[0] : 'NOT FOUND';
  });
  console.log('Price insights:', banner);
  
  await browser.close();
})().catch(e => console.error('ERROR:', e.message));
