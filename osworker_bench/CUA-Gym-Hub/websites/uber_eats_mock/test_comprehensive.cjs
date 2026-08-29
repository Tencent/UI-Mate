const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const results = { pass: [], fail: [] };

  function log(status, test, detail) {
    detail = detail || '';
    console.log(status + ': ' + test + (detail ? ' - ' + detail : ''));
    if (status === 'PASS') results.pass.push({ test, detail });
    else results.fail.push({ test, detail });
  }

  try {
    // =========== STEP 1: Homepage ===========
    console.log('\n=== STEP 1: Homepage ===');
    await page.goto('http://localhost:5180/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: 'assets/screenshots/mock_homepage.png', fullPage: true });

    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
    log(bodyText.includes('Uber Eats') ? 'PASS' : 'FAIL', 'Homepage loads without white screen');
    log(consoleErrors.length === 0 ? 'PASS' : 'FAIL', 'No console errors on homepage load', consoleErrors.join('; '));

    // Header checks
    const hasLogo = await page.locator('a:has-text("Uber Eats")').first().isVisible();
    log(hasLogo ? 'PASS' : 'FAIL', 'Header: Logo visible and is a link');

    const hasDelivery = await page.locator('button:has-text("Delivery")').isVisible();
    log(hasDelivery ? 'PASS' : 'FAIL', 'Header: Delivery toggle visible');

    const hasPickup = await page.locator('button:has-text("Pickup")').isVisible();
    log(hasPickup ? 'PASS' : 'FAIL', 'Header: Pickup toggle visible');

    const hasSearch = await page.locator('input[placeholder="Search Uber Eats"]').isVisible();
    log(hasSearch ? 'PASS' : 'FAIL', 'Header: Search bar visible');

    const hasCartBtn = await page.locator('button:has-text("Cart")').isVisible();
    log(hasCartBtn ? 'PASS' : 'FAIL', 'Header: Cart button visible');

    const hasAddress = await page.locator('button:has-text("123 Main St")').isVisible();
    log(hasAddress ? 'PASS' : 'FAIL', 'Header: Address display visible');

    const hasAvatar = await page.locator('a:has-text("AJ")').isVisible();
    log(hasAvatar ? 'PASS' : 'FAIL', 'Header: User avatar (AJ) visible');

    // Category carousel
    const catCount = await page.locator('a[href*="/search?category="]').count();
    log(catCount >= 15 ? 'PASS' : 'FAIL', 'Category carousel has 15 categories', catCount + ' found');

    // Promo banners
    const promoCount = await page.evaluate(() => {
      return document.querySelectorAll('.promo-card, [class*="promo"]').length;
    });
    log(promoCount >= 2 ? 'PASS' : 'FAIL', 'Promo banners present', promoCount + ' found');

    // Restaurant cards
    const restLinks = await page.locator('a[href*="/store/"]').count();
    log(restLinks > 0 ? 'PASS' : 'FAIL', 'Restaurant cards visible', restLinks + ' store links found');

    // Filter bar
    const hasSortBtn = await page.locator('button:has-text("Sort")').isVisible();
    log(hasSortBtn ? 'PASS' : 'FAIL', 'Filter bar: Sort button visible');

    // Sections
    const hasFeatured = await page.locator('text=Featured on Uber Eats').isVisible();
    log(hasFeatured ? 'PASS' : 'FAIL', 'Section: Featured on Uber Eats');

    const hasPopular = await page.locator('text=Popular near you').isVisible();
    log(hasPopular ? 'PASS' : 'FAIL', 'Section: Popular near you');

    // =========== STEP 1b: Delivery/Pickup Toggle ===========
    console.log('\n=== Test Delivery/Pickup Toggle ===');
    await page.locator('button:has-text("Pickup")').click();
    await page.waitForTimeout(500);
    const pickupClass = await page.locator('button:has-text("Pickup")').evaluate(el => el.className);
    log(pickupClass.includes('active') ? 'PASS' : 'FAIL', 'Pickup toggle activates on click', 'class: ' + pickupClass);

    await page.locator('button:has-text("Delivery")').click();
    await page.waitForTimeout(300);

    // =========== STEP 1c: Filter Buttons ===========
    console.log('\n=== Test Filter Buttons ===');
    await page.locator('button:text-is("$$")').first().click();
    await page.waitForTimeout(500);
    const filterClass = await page.locator('button:text-is("$$")').first().evaluate(el => el.className);
    log(filterClass.includes('active') ? 'PASS' : 'FAIL', 'Price filter $$ toggles on click', 'class: ' + filterClass);
    // Clear
    await page.locator('button:text-is("$$")').first().click();
    await page.waitForTimeout(300);

    // Deals filter
    await page.locator('button:has-text("Deals")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'assets/screenshots/mock_deals_filter.png', fullPage: true });
    const dealsClass = await page.locator('button:has-text("Deals")').evaluate(el => el.className);
    log(dealsClass.includes('active') ? 'PASS' : 'FAIL', 'Deals filter toggles', 'class: ' + dealsClass);
    await page.locator('button:has-text("Deals")').click();
    await page.waitForTimeout(300);

    // =========== STEP 1d: Favorite Heart Button ===========
    console.log('\n=== Test Favorite Heart Button ===');
    const heartButtons = await page.locator('button[class*="favorite"], button[class*="heart"]').count();
    if (heartButtons > 0) {
      await page.locator('button[class*="favorite"], button[class*="heart"]').first().click();
      await page.waitForTimeout(500);
      log('PASS', 'Favorite heart button clickable');
    } else {
      // Try finding it differently
      const hearts = await page.locator('.restaurant-card button, .card-image button').count();
      if (hearts > 0) {
        await page.locator('.restaurant-card button, .card-image button').first().click();
        await page.waitForTimeout(500);
        log('PASS', 'Heart button clickable', hearts + ' found');
      } else {
        log('FAIL', 'Favorite heart button not found on restaurant cards');
      }
    }

    // =========== STEP 2: Click Restaurant Card -> Store Page ===========
    console.log('\n=== STEP 2: Store Page ===');
    await page.goto('http://localhost:5180/', { waitUntil: 'networkidle', timeout: 15000 });

    // Click first restaurant card
    const firstRestLink = await page.locator('a[href*="/store/"]').first();
    const restName = await firstRestLink.innerText().catch(() => 'unknown');
    console.log('Clicking restaurant: ' + restName.substring(0, 50));
    await firstRestLink.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'assets/screenshots/mock_store_page.png', fullPage: true });

    const storeUrl = page.url();
    log(storeUrl.includes('/store/') ? 'PASS' : 'FAIL', 'Restaurant card navigates to store page', storeUrl);

    // Check store page elements
    const storeContent = await page.evaluate(() => {
      return {
        hasHero: !!document.querySelector('.store-hero, .hero, [class*="hero"]'),
        h1: document.querySelector('h1')?.innerText || '',
        h2s: Array.from(document.querySelectorAll('h2')).map(h => h.innerText).slice(0, 10),
        menuItems: document.querySelectorAll('[class*="menu-item"], [class*="menuItem"], [class*="MenuItem"]').length,
      };
    });
    log(storeContent.h1 ? 'PASS' : 'FAIL', 'Store page: Restaurant name (h1)', storeContent.h1);
    log(storeContent.h2s.length > 0 ? 'PASS' : 'FAIL', 'Store page: Menu sections', storeContent.h2s.join(', '));
    log(storeContent.menuItems > 0 ? 'PASS' : 'FAIL', 'Store page: Menu items visible', storeContent.menuItems + ' items');

    // Check rating, delivery info
    const hasRating = await page.evaluate(() => document.body.innerText.includes('rating'));
    const hasDeliveryFee = await page.evaluate(() => document.body.innerText.includes('Delivery Fee'));
    log(hasDeliveryFee ? 'PASS' : 'FAIL', 'Store page: Delivery fee info visible');

    // Check sticky category nav
    const hasCategoryNav = await page.evaluate(() => {
      return document.querySelectorAll('.category-nav a, .category-nav button, [class*="categoryNav"], [class*="menu-nav"]').length > 0;
    });
    log(hasCategoryNav ? 'PASS' : 'FAIL', 'Store page: Category navigation');

    // =========== STEP 3: Click Menu Item -> Item Modal ===========
    console.log('\n=== STEP 3: Item Detail Modal ===');

    // Click a menu item
    const menuItemEl = await page.locator('[class*="menu-item"], [class*="menuItem"], [class*="MenuItem"]').first();
    const menuItemExists = await menuItemEl.count() > 0;

    if (menuItemExists) {
      await menuItemEl.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'assets/screenshots/mock_item_modal.png', fullPage: true });

      // Check modal elements
      const modalContent = await page.evaluate(() => {
        const modal = document.querySelector('[class*="modal"], [class*="overlay"], [class*="Modal"]');
        if (!modal) return { found: false };
        return {
          found: true,
          text: modal.innerText.substring(0, 500),
          hasClose: !!modal.querySelector('button[class*="close"], .close-btn, [aria-label="Close"]'),
          hasQuantity: modal.innerText.includes('+') && modal.innerText.includes('-'),
          hasAddToCart: modal.innerText.includes('Add to Cart'),
        };
      });

      log(modalContent.found ? 'PASS' : 'FAIL', 'Item modal opens on click');

      if (modalContent.found) {
        log(modalContent.hasAddToCart ? 'PASS' : 'FAIL', 'Item modal: Add to Cart button');
        log(modalContent.hasQuantity ? 'PASS' : 'FAIL', 'Item modal: Quantity selector (+/-)');

        // Test quantity increment
        const plusBtn = page.locator('[class*="modal"] button:has-text("+"), [class*="Modal"] button:has-text("+"), [class*="overlay"] button:has-text("+")').first();
        if (await plusBtn.count() > 0) {
          await plusBtn.click();
          await page.waitForTimeout(300);
          log('PASS', 'Item modal: Quantity + button clickable');
        }

        // Test Add to Cart
        const addBtn = page.locator('button:has-text("Add to Cart")').first();
        if (await addBtn.count() > 0) {
          await addBtn.click();
          await page.waitForTimeout(800);
          log('PASS', 'Item modal: Add to Cart button clicked');

          // Check cart badge updated
          const cartBadge = await page.evaluate(() => {
            const badge = document.querySelector('[class*="badge"], [class*="cart-count"]');
            return badge ? badge.innerText : null;
          });
          log(cartBadge ? 'PASS' : 'FAIL', 'Cart badge shows item count after adding', 'badge: ' + cartBadge);
        } else {
          log('FAIL', 'Add to Cart button not found');
        }
      }
    } else {
      log('FAIL', 'No menu items found on store page');
    }

    // Add one more item
    console.log('\n=== Adding second item to cart ===');
    const menuItem2 = await page.locator('[class*="menu-item"], [class*="menuItem"], [class*="MenuItem"]').nth(1);
    if (await menuItem2.count() > 0) {
      await menuItem2.click();
      await page.waitForTimeout(800);
      const addBtn2 = page.locator('button:has-text("Add to Cart")').first();
      if (await addBtn2.count() > 0) {
        await addBtn2.click();
        await page.waitForTimeout(800);
        log('PASS', 'Second item added to cart');
      }
    }

    // =========== STEP 4: Cart Panel ===========
    console.log('\n=== STEP 4: Cart Panel ===');
    await page.locator('button:has-text("Cart")').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'assets/screenshots/mock_cart_panel.png', fullPage: true });

    const cartContent = await page.evaluate(() => {
      const panel = document.querySelector('[class*="cart-panel"], [class*="cartPanel"], [class*="CartPanel"]');
      if (!panel) return { found: false, bodyText: document.body.innerText.substring(0, 300) };
      return {
        found: true,
        text: panel.innerText.substring(0, 500),
        hasCheckout: panel.innerText.includes('Checkout'),
        hasSubtotal: panel.innerText.includes('Subtotal'),
        hasClose: !!panel.querySelector('button'),
        itemCount: panel.querySelectorAll('[class*="cart-item"], [class*="cartItem"]').length,
      };
    });

    log(cartContent.found ? 'PASS' : 'FAIL', 'Cart panel opens on cart button click');
    if (cartContent.found) {
      log(cartContent.hasSubtotal ? 'PASS' : 'FAIL', 'Cart panel: Subtotal visible');
      log(cartContent.hasCheckout ? 'PASS' : 'FAIL', 'Cart panel: Checkout button visible');
      log(cartContent.itemCount > 0 ? 'PASS' : 'FAIL', 'Cart panel: Items listed', cartContent.itemCount + ' items');

      // Test quantity controls in cart
      const cartPlusBtn = page.locator('[class*="cart-panel"] button:has-text("+"), [class*="cartPanel"] button:has-text("+")').first();
      if (await cartPlusBtn.count() > 0) {
        await cartPlusBtn.click();
        await page.waitForTimeout(300);
        log('PASS', 'Cart panel: Quantity + button works');
      }

      // Click Go to Checkout
      const checkoutBtn = page.locator('button:has-text("Checkout")').first();
      if (await checkoutBtn.count() > 0) {
        await checkoutBtn.click();
        await page.waitForTimeout(1000);
        log('PASS', 'Cart panel: Checkout button clicked');
      }
    }

    // =========== STEP 5: Checkout Page ===========
    console.log('\n=== STEP 5: Checkout Page ===');

    // Navigate to checkout if not already there
    if (!page.url().includes('/checkout')) {
      await page.goto('http://localhost:5180/checkout', { waitUntil: 'networkidle', timeout: 15000 });
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'assets/screenshots/mock_checkout.png', fullPage: true });

    const checkoutUrl = page.url();
    log(checkoutUrl.includes('/checkout') ? 'PASS' : 'FAIL', 'Checkout page loads', checkoutUrl);

    const checkoutContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasAddress: text.includes('123 Main St') || text.includes('address') || text.includes('Address'),
        hasTip: text.includes('tip') || text.includes('Tip'),
        hasTotal: text.includes('Total'),
        hasPlaceOrder: text.includes('Place Order'),
        hasSubtotal: text.includes('Subtotal'),
        hasTax: text.includes('Tax'),
        hasServiceFee: text.includes('Service Fee'),
        hasDeliveryFee: text.includes('Delivery Fee'),
        hasPayment: text.includes('Visa') || text.includes('Payment') || text.includes('4242'),
        fullText: text.substring(0, 1000),
      };
    });

    log(checkoutContent.hasAddress ? 'PASS' : 'FAIL', 'Checkout: Delivery address section');
    log(checkoutContent.hasTip ? 'PASS' : 'FAIL', 'Checkout: Tip section');
    log(checkoutContent.hasSubtotal ? 'PASS' : 'FAIL', 'Checkout: Subtotal visible');
    log(checkoutContent.hasTax ? 'PASS' : 'FAIL', 'Checkout: Tax visible');
    log(checkoutContent.hasServiceFee ? 'PASS' : 'FAIL', 'Checkout: Service fee visible');
    log(checkoutContent.hasDeliveryFee ? 'PASS' : 'FAIL', 'Checkout: Delivery fee visible');
    log(checkoutContent.hasTotal ? 'PASS' : 'FAIL', 'Checkout: Total visible');
    log(checkoutContent.hasPlaceOrder ? 'PASS' : 'FAIL', 'Checkout: Place Order button');
    log(checkoutContent.hasPayment ? 'PASS' : 'FAIL', 'Checkout: Payment method visible');

    // Test tip buttons
    const tipBtn = page.locator('button:has-text("18%")').first();
    if (await tipBtn.count() > 0) {
      await tipBtn.click();
      await page.waitForTimeout(300);
      log('PASS', 'Checkout: Tip button clickable');
    } else {
      log('FAIL', 'Checkout: Tip buttons not found');
    }

    // Test Place Order
    const placeOrderBtn = page.locator('button:has-text("Place Order")').first();
    if (await placeOrderBtn.count() > 0) {
      await placeOrderBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'assets/screenshots/mock_order_placed.png', fullPage: true });
      const afterOrderUrl = page.url();
      log(afterOrderUrl.includes('/orders/') ? 'PASS' : 'FAIL', 'Place Order navigates to order tracking', afterOrderUrl);
    } else {
      log('FAIL', 'Place Order button not found');
    }

    // =========== STEP 6: Order Tracking Page ===========
    console.log('\n=== STEP 6: Order Tracking Page ===');

    const trackingContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasStepper: text.includes('Order Received') || text.includes('Preparing') || text.includes('Out for Delivery'),
        hasMap: !!document.querySelector('[class*="map"]'),
        hasEstimate: text.includes('Estimated') || text.includes('arrival'),
        hasOrderDetails: text.includes('Order Details') || text.includes('ordered'),
        fullText: text.substring(0, 1000),
      };
    });

    log(trackingContent.hasStepper ? 'PASS' : 'FAIL', 'Order tracking: Progress stepper visible');
    log(trackingContent.hasMap ? 'PASS' : 'FAIL', 'Order tracking: Map placeholder visible');
    log(trackingContent.hasEstimate ? 'PASS' : 'FAIL', 'Order tracking: Estimated arrival visible');

    // Wait for status progression
    await page.waitForTimeout(4000);
    const status2 = await page.evaluate(() => document.body.innerText.includes('Confirmed') || document.body.innerText.includes('confirmed'));
    log(status2 ? 'PASS' : 'FAIL', 'Order tracking: Status progresses (to confirmed)');

    await page.screenshot({ path: 'assets/screenshots/mock_order_tracking.png', fullPage: true });

    // =========== STEP 7: Past Orders Page ===========
    console.log('\n=== STEP 7: Past Orders Page ===');
    await page.goto('http://localhost:5180/orders', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'assets/screenshots/mock_orders.png', fullPage: true });

    const ordersContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasOrders: text.includes('Delivered') || text.includes('Cancelled'),
        hasViewReceipt: text.includes('View Receipt') || text.includes('receipt'),
        hasReorder: text.includes('Reorder'),
        hasRating: text.includes('Rate') || document.querySelectorAll('[class*="star"]').length > 0,
        orderCards: document.querySelectorAll('[class*="order-card"], [class*="orderCard"]').length,
        fullText: text.substring(0, 1000),
      };
    });

    log(ordersContent.hasOrders ? 'PASS' : 'FAIL', 'Orders page: Order list with status badges');
    log(ordersContent.orderCards > 0 || ordersContent.hasOrders ? 'PASS' : 'FAIL', 'Orders page: Order cards visible');
    log(ordersContent.hasViewReceipt ? 'PASS' : 'FAIL', 'Orders page: View Receipt links');
    log(ordersContent.hasReorder ? 'PASS' : 'FAIL', 'Orders page: Reorder button');

    // Test View Receipt click
    const viewReceiptLink = page.locator('text=View Receipt').first();
    if (await viewReceiptLink.count() > 0) {
      await viewReceiptLink.click();
      await page.waitForTimeout(1000);
      const receiptUrl = page.url();
      log(receiptUrl.includes('/orders/') ? 'PASS' : 'FAIL', 'View Receipt navigates to order detail', receiptUrl);
      await page.goBack();
      await page.waitForTimeout(500);
    }

    // =========== STEP 8: Search Page ===========
    console.log('\n=== STEP 8: Search Page ===');
    await page.goto('http://localhost:5180/search', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('pizza');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'assets/screenshots/mock_search.png', fullPage: true });

      const searchResults = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
          hasResults: text.toLowerCase().includes('pizza') || text.toLowerCase().includes('bella'),
          url: window.location.href,
          storeLinks: document.querySelectorAll('a[href*="/store/"]').length,
          fullText: text.substring(0, 500),
        };
      });

      log(searchResults.hasResults ? 'PASS' : 'FAIL', 'Search: Results appear for "pizza"', searchResults.storeLinks + ' store links');
      log(searchResults.url.includes('q=') ? 'PASS' : 'FAIL', 'Search: URL updates with query', searchResults.url);
    } else {
      log('FAIL', 'Search page: Search input not found');
    }

    // =========== STEP 9: Favorites Page ===========
    console.log('\n=== STEP 9: Favorites Page ===');
    await page.goto('http://localhost:5180/favorites', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'assets/screenshots/mock_favorites.png', fullPage: true });

    const favContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        loaded: text.length > 50,
        hasCards: document.querySelectorAll('a[href*="/store/"]').length,
        fullText: text.substring(0, 500),
      };
    });

    log(favContent.loaded ? 'PASS' : 'FAIL', 'Favorites page loads');

    // =========== STEP 10: Account Page ===========
    console.log('\n=== STEP 10: Account Page ===');
    await page.goto('http://localhost:5180/account', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'assets/screenshots/mock_account.png', fullPage: true });

    const accountContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasName: text.includes('Alex') || text.includes('Johnson'),
        hasEmail: text.includes('email') || text.includes('alex'),
        hasAddress: text.includes('Main St') || text.includes('Address'),
        hasPayment: text.includes('Visa') || text.includes('Payment') || text.includes('4242'),
        fullText: text.substring(0, 500),
      };
    });

    log(accountContent.hasName ? 'PASS' : 'FAIL', 'Account page: User name visible');
    log(accountContent.hasAddress ? 'PASS' : 'FAIL', 'Account page: Addresses visible');
    log(accountContent.hasPayment ? 'PASS' : 'FAIL', 'Account page: Payment methods visible');

    // =========== STEP 11: /go Debug Endpoint ===========
    console.log('\n=== STEP 11: /go Debug Endpoint ===');
    await page.goto('http://localhost:5180/go', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'assets/screenshots/mock_go.png' });

    const goContent = await page.evaluate(() => {
      const text = document.body.innerText;
      try {
        const json = JSON.parse(text);
        return {
          isJson: true,
          hasInitial: !!json.initial_state,
          hasCurrent: !!json.current_state,
          hasDiff: json.hasOwnProperty('state_diff'),
          diffNonEmpty: json.state_diff && Object.keys(json.state_diff).length > 0,
          keys: Object.keys(json),
        };
      } catch(e) {
        return { isJson: false, text: text.substring(0, 300) };
      }
    });

    log(goContent.isJson ? 'PASS' : 'FAIL', '/go endpoint: Returns valid JSON');
    if (goContent.isJson) {
      log(goContent.hasInitial ? 'PASS' : 'FAIL', '/go endpoint: Has initial_state');
      log(goContent.hasCurrent ? 'PASS' : 'FAIL', '/go endpoint: Has current_state');
      log(goContent.hasDiff ? 'PASS' : 'FAIL', '/go endpoint: Has state_diff');
      log(goContent.diffNonEmpty ? 'PASS' : 'FAIL', '/go endpoint: state_diff is non-empty after interactions');
    }

    // Also check the API endpoint
    console.log('\n=== Check /go API endpoint ===');
    const goApiResponse = await page.evaluate(async () => {
      const resp = await fetch('/go');
      const text = await resp.text();
      try {
        return { status: resp.status, json: JSON.parse(text), isJson: true };
      } catch(e) {
        return { status: resp.status, text: text.substring(0, 200), isJson: false };
      }
    });

    if (goApiResponse.isJson && goApiResponse.json.initial_state) {
      log('PASS', '/go API endpoint returns JSON with state');
    } else {
      log('FAIL', '/go API endpoint', JSON.stringify(goApiResponse).substring(0, 200));
    }

    // =========== STEP 12: Test Header Features ===========
    console.log('\n=== STEP 12: Header Features ===');
    await page.goto('http://localhost:5180/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);

    // Test address dropdown
    const addressBtn = page.locator('button:has-text("123 Main St")');
    if (await addressBtn.count() > 0) {
      await addressBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'assets/screenshots/mock_address_dropdown.png' });

      const hasDropdown = await page.evaluate(() => {
        return document.querySelectorAll('[class*="dropdown"], [class*="address-select"]').length > 0 ||
               document.body.innerText.includes('456 Market St') ||
               document.body.innerText.includes('Work');
      });
      log(hasDropdown ? 'PASS' : 'FAIL', 'Header: Address dropdown opens on click');

      // Close dropdown by clicking elsewhere
      await page.locator('body').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);
    }

    // Test search bar navigation
    const searchBarHeader = page.locator('input[placeholder="Search Uber Eats"]');
    if (await searchBarHeader.count() > 0) {
      await searchBarHeader.click();
      await searchBarHeader.fill('burger');
      await page.waitForTimeout(1000);

      const searchNav = page.url().includes('/search');
      log(searchNav ? 'PASS' : 'FAIL', 'Header search navigates to /search', page.url());
    }

    // Test logo navigation
    await page.locator('a:has-text("Uber")').first().click();
    await page.waitForTimeout(500);
    log(page.url() === 'http://localhost:5180/' ? 'PASS' : 'FAIL', 'Logo click navigates to homepage', page.url());

    // =========== FINAL RESULTS ===========
    console.log('\n\n========== FINAL RESULTS ==========');
    console.log('PASS: ' + results.pass.length);
    console.log('FAIL: ' + results.fail.length);
    console.log('Console errors: ' + consoleErrors.length);

    if (results.fail.length > 0) {
      console.log('\n--- FAILURES ---');
      results.fail.forEach(f => console.log('  FAIL: ' + f.test + (f.detail ? ' - ' + f.detail : '')));
    }

    if (consoleErrors.length > 0) {
      console.log('\n--- CONSOLE ERRORS ---');
      consoleErrors.forEach(e => console.log('  ' + e));
    }

    console.log('\nJSON_RESULTS:' + JSON.stringify({ pass: results.pass, fail: results.fail, consoleErrors }));

  } catch(err) {
    console.error('FATAL ERROR:', err.message, err.stack);
  } finally {
    await browser.close();
  }
})();
