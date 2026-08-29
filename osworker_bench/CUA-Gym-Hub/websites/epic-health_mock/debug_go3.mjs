import { chromium } from 'playwright';

const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });

// Do interactions first
await p.goto('http://localhost:5188/');
await p.waitForLoadState('networkidle');

// Send a message - same browser context
await p.goto('http://localhost:5188/messages/compose');
await p.waitForLoadState('networkidle');
const subj = await p.$('input[placeholder*="subject"], input[placeholder*="Subject"]');
if (subj) await subj.fill('Test subject');
const body = await p.$('textarea');
if (body) await body.fill('Test body');
const sendBtn = await p.$('button:has-text("Send")');
if (sendBtn) { await sendBtn.click(); await p.waitForTimeout(800); }

// Check /go in same browser context (shares localStorage)
await p.goto('http://localhost:5188/go');
await p.waitForLoadState('networkidle');

const bodyText = await p.textContent('body');
try {
  const goData = JSON.parse(bodyText);
  const diffKeys = Object.keys(goData.state_diff || {});
  console.log('state_diff keys:', diffKeys);
  console.log('state_diff length:', diffKeys.length);
  
  // Check current_state messages
  const currMessages = goData.current_state?.messages;
  const initMessages = goData.initial_state?.messages;
  console.log('Initial messages count:', initMessages?.length);
  console.log('Current messages count:', currMessages?.length);
} catch(e) {
  console.log('Parse error:', e.message);
  console.log('Raw:', bodyText.substring(0, 200));
}
await b.close();
