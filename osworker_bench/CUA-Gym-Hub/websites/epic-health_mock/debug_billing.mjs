import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:5188/billing');
await p.waitForLoadState('networkidle');

// Navigate to first billing detail
const rows = await p.$$('tbody tr');
console.log('Billing rows:', rows.length);
if (rows.length > 0) {
  await rows[0].click();
  await p.waitForTimeout(600);
  console.log('URL after row click:', p.url());
  
  // Look for back button
  const backBtn = await p.$('button.back-btn');
  if (backBtn) {
    const txt = await backBtn.textContent();
    console.log('Back button text:', txt.trim());
    await backBtn.click();
    await p.waitForTimeout(400);
    console.log('URL after back click:', p.url());
  } else {
    console.log('No .back-btn found');
    const allBtns = await p.$$('button');
    for (const btn of allBtns.slice(0, 15)) {
      const txt = await btn.textContent();
      const cls = await btn.getAttribute('class');
      console.log('  button:', txt.trim().substring(0,30), '| class:', cls);
    }
  }
}
await b.close();
