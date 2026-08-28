import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });

// Do some interactions first
await p.goto('http://localhost:5188/');
await p.waitForLoadState('networkidle');

// Send a message
await p.goto('http://localhost:5188/messages/compose');
await p.waitForLoadState('networkidle');
const subj = await p.$('input[placeholder*="subject"], input[placeholder*="Subject"]');
if (subj) await subj.fill('Test subject');
const body = await p.$('textarea');
if (body) await body.fill('Test body');
const sendBtn = await p.$('button:has-text("Send")');
if (sendBtn) { await sendBtn.click(); await p.waitForTimeout(800); }

// Check /go
await p.goto('http://localhost:5188/go');
await p.waitForLoadState('networkidle');
const goData = await p.evaluate(async () => {
  const r = await fetch('/go');
  return r.json();
});
console.log('state_diff keys:', Object.keys(goData.state_diff || {}));
console.log('state_diff length:', Object.keys(goData.state_diff || {}).length);
if (goData.state_diff && Object.keys(goData.state_diff).length > 0) {
  console.log('First 5 diff keys:', Object.keys(goData.state_diff).slice(0, 5));
}
await b.close();
