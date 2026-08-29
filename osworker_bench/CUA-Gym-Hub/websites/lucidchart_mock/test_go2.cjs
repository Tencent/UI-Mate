const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Clear state and load fresh
  await page.goto('http://127.0.0.1:5555/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const results = [];

  // Check what's in localStorage after initial load
  const lsKeys = await page.evaluate(() => Object.keys(localStorage));
  results.push('localStorage keys after load: ' + JSON.stringify(lsKeys));

  // Check state in context
  const stateCheck = await page.evaluate(() => {
    // Try to get state from React internals - won't work in prod
    const ls = localStorage.getItem('lucidchart_mock_state');
    const is = localStorage.getItem('lucidchart_mock_initialState');
    return {
      hasState: !!ls,
      stateLen: ls?.length,
      hasInitial: !!is,
      initialLen: is?.length,
      stateKeys: ls ? Object.keys(JSON.parse(ls)) : [],
      initialKeys: is ? Object.keys(JSON.parse(is)) : []
    };
  });
  results.push('State in localStorage: ' + JSON.stringify(stateCheck));

  // Now navigate to /go
  await page.goto('http://127.0.0.1:5555/go');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check localStorage on /go page
  const lsOnGo = await page.evaluate(() => {
    const ls = localStorage.getItem('lucidchart_mock_state');
    const is = localStorage.getItem('lucidchart_mock_initialState');
    return {
      hasState: !!ls,
      stateLen: ls?.length,
      hasInitial: !!is,
      initialLen: is?.length,
      stateKeys: ls ? Object.keys(JSON.parse(ls)) : [],
    };
  });
  results.push('localStorage on /go: ' + JSON.stringify(lsOnGo));

  // Get the actual pre content
  const preContent = await page.textContent('pre');
  results.push('Pre content first 200 chars: ' + (preContent ? preContent.substring(0, 200) : 'NO PRE'));

  // Check if the state has loaded correctly via React context
  const contextState = await page.evaluate(() => {
    // The Go component uses useAppContext which gives state and initialState
    // Let's see if the loading state is still active
    const loadingEl = document.querySelector('div[style*="center"]');
    return {
      hasLoading: loadingEl ? loadingEl.textContent : null,
      hasPre: !!document.querySelector('pre'),
      preText: document.querySelector('pre')?.textContent?.substring(0, 100)
    };
  });
  results.push('Context state check: ' + JSON.stringify(contextState));

  console.log(results.join('\n'));
  await browser.close();
})().catch(e => { console.error('TEST ERROR:', e.message); process.exit(1); });
