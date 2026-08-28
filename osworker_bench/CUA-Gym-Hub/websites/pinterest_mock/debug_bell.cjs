const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5777');
  await page.waitForTimeout(3000);

  // Check the exact SVG class of the bell button
  const bellSvgClass = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const btns = nav.querySelectorAll('button');
    return Array.from(btns).map(btn => {
      const svg = btn.querySelector('svg');
      return svg ? svg.className.baseVal || svg.getAttribute('class') || 'no class' : 'no svg';
    });
  });
  console.log('SVG classes:', JSON.stringify(bellSvgClass));

  // Try clicking the bell (idx 1)
  const result = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const btns = nav.querySelectorAll('button');
    if (btns.length > 1) {
      btns[1].click();
      return 'clicked btn 1';
    }
    return 'not enough buttons';
  });
  console.log(result);

  await page.waitForTimeout(500);

  const updatesVisible = await page.evaluate(() => document.body.innerText.includes('Updates'));
  console.log('Updates visible:', updatesVisible);

  const markAll = await page.evaluate(() => document.body.innerText.includes('Mark all as read'));
  console.log('Mark all visible:', markAll);

  // Check the exact heart button in modal
  const cards = await page.$$('.break-inside-avoid');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Click outside to close any open dropdown
  await page.mouse.click(200, 600);
  await page.waitForTimeout(300);

  await cards[2].click();
  await page.waitForTimeout(1500);

  const heartCheck = await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (!modal) return 'no modal';
    const btns = modal.querySelectorAll('button');
    // Button idx 4 should be heart
    const btn4 = btns[4];
    if (!btn4) return 'no btn4';
    const svg = btn4.querySelector('svg');
    const svgClass = svg ? (svg.className.baseVal || svg.getAttribute('class') || 'no class') : 'no svg';
    return { text: btn4.textContent.trim(), classes: btn4.className, svgClass };
  });
  console.log('\nHeart button check:', JSON.stringify(heartCheck, null, 2));

  await browser.close();
})();
