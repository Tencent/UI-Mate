const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Intercept console logs
  page.on('console', msg => {
    if (msg.text().startsWith('[DEBUG]')) console.log(msg.text());
  });

  // Clear state
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Navigate to /go and inject debugging
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check state through the React fiber tree
  const debugInfo = await page.evaluate(() => {
    // Get the pre element content
    const pre = document.querySelector('pre');
    const preContent = pre ? pre.textContent.substring(0, 100) : 'no pre';

    // Check if there's actual state data in any form
    const allText = document.body.textContent;
    const hasDocuments = allText.includes('documents');
    const hasShapes = allText.includes('shapes');

    // Check localStorage
    const ls = localStorage.getItem('lucidchart_mock_state');
    const parsed = ls ? JSON.parse(ls) : null;

    return {
      preContent,
      hasDocuments,
      hasShapes,
      lsExists: !!ls,
      lsParsedKeys: parsed ? Object.keys(parsed) : [],
      lsDocsCount: parsed?.documents?.length
    };
  });
  console.log('Debug info: ' + JSON.stringify(debugInfo, null, 2));

  // The issue is likely that Go component renders before state is loaded
  // Or that `state` in context is somehow different from what's in localStorage
  // Let me check by navigating with js
  await page.goto('http://127.0.0.1:5555/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Get state on dashboard
  const dashboardState = await page.evaluate(() => {
    const pre = document.querySelector('pre');
    return pre ? pre.textContent.substring(0, 50) : 'no pre on dashboard';
  });
  console.log('Dashboard pre: ' + dashboardState);

  // Now click to navigate to /go via React Router (not full page navigation)
  // This should preserve the AppProvider context
  await page.evaluate(() => {
    window.history.pushState({}, '', '/go');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await page.waitForTimeout(2000);

  const goAfterPushState = await page.evaluate(() => {
    const pre = document.querySelector('pre');
    return pre ? pre.textContent.substring(0, 200) : 'no pre';
  });
  console.log('Go after pushState: ' + goAfterPushState);

  // Try navigating programmatically
  await page.goto('http://127.0.0.1:5555/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Navigate via link
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const goFinal = await page.evaluate(() => {
    const pre = document.querySelector('pre');
    return {
      preText: pre ? pre.textContent.substring(0, 300) : 'no pre',
      bodyText: document.body.textContent.substring(0, 200)
    };
  });
  console.log('Final /go check: ' + JSON.stringify(goFinal));

  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
