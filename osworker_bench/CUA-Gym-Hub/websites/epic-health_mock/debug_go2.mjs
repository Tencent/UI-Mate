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

// Get raw page content
const bodyText = await p.textContent('body');
console.log('Body first 500 chars:', bodyText.substring(0, 500));
await b.close();
