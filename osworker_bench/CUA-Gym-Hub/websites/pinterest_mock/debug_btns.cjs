const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5777');
  await page.waitForTimeout(3000);

  // Debug: get all nav buttons and their SVG content
  const navBtns = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    if (!nav) return 'no nav';
    const btns = nav.querySelectorAll('button');
    return Array.from(btns).map((btn, i) => ({
      idx: i,
      text: btn.textContent.trim().substring(0, 30),
      svgSnippet: btn.querySelector('svg')?.outerHTML?.substring(0, 200) || 'no svg',
      classes: btn.className.substring(0, 100),
      parentRelative: btn.parentElement.classList.contains('relative'),
    }));
  });
  console.log('Nav buttons:');
  console.log(JSON.stringify(navBtns, null, 2));

  // Debug: Check PinCard heart button structure
  const cardBtns = await page.evaluate(() => {
    const cards = document.querySelectorAll('.break-inside-avoid');
    const card = cards[0];
    if (!card) return 'no cards';
    const btns = card.querySelectorAll('button');
    return Array.from(btns).map((btn, i) => ({
      idx: i,
      text: btn.textContent.trim().substring(0, 30),
      inAbsolute: !!btn.closest('.absolute'),
      classes: btn.className.substring(0, 100),
    }));
  });
  console.log('\nCard buttons for first pin card:');
  console.log(JSON.stringify(cardBtns, null, 2));

  // Click pin card to open modal
  const cards = await page.$$('.break-inside-avoid');
  await cards[2].click();
  await page.waitForTimeout(1500);

  const modalBtns = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (!modal) return 'no modal';
    const btns = modal.querySelectorAll('button');
    return Array.from(btns).slice(0, 15).map((btn, i) => ({
      idx: i,
      text: btn.textContent.trim().substring(0, 40),
      classes: btn.className.substring(0, 100),
      svgSnippet: btn.querySelector('svg')?.outerHTML?.substring(0, 100) || 'no svg',
    }));
  });
  console.log('\nModal buttons:');
  console.log(JSON.stringify(modalBtns, null, 2));

  await browser.close();
})();
