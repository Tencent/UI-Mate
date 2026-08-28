
    // Generators for initial data
    const CUISINES = ['American', 'Italian', 'Japanese', 'Mexican', 'Indian', 'Thai', 'Burgers', 'Pizza'];

    const MODIFIERS = {
      size: {
        id: 'size',
        name: 'Size',
        type: 'radio',
        required: true,
        options: [
          { name: 'Small', price: 0 },
          { name: 'Medium', price: 2.50 },
          { name: 'Large', price: 4.00 }
        ]
      },
      extras: {
        id: 'extras',
        name: 'Add-ons',
        type: 'checkbox',
        required: false,
        options: [
          { name: 'Extra Cheese', price: 1.50 },
          { name: 'Bacon', price: 2.00 },
          { name: 'Avocado', price: 2.50 },
          { name: 'Spicy Sauce', price: 0.50 }
        ]
      }
    };

    const generateMenuItems = (restaurantId, cuisine) => {
      const items = [];
      const categories = ['Popular', 'Mains', 'Sides', 'Drinks'];

      categories.forEach((cat, catIdx) => {
        for (let i = 1; i <= 4; i++) {
          const isVeg = Math.random() > 0.7;
          const isGF = Math.random() > 0.8;

          items.push({
            id: `item-${restaurantId}-${catIdx}-${i}`,
            restaurantId,
            name: `${cuisine} ${cat} Item ${i}`,
            description: `Delicious authentic ${cuisine.toLowerCase()} dish prepared with fresh ingredients.`,
            price: 10 + Math.floor(Math.random() * 15),
            image: `https://picsum.photos/300/300?random=${restaurantId}${catIdx}${i}`,
            category: cat,
            dietary: [
              ...(isVeg ? ['Vegetarian'] : []),
              ...(isGF ? ['Gluten-Free'] : [])
            ],
            modifiers: [MODIFIERS.size, MODIFIERS.extras]
          });
        }
      });
      return items;
    };

    export const generateInitialState = () => {
      const restaurants = [];
      const allMenuItems = [];

      for (let i = 1; i <= 10; i++) {
        const cuisine = CUISINES[Math.floor(Math.random() * CUISINES.length)];
        const restaurantId = `rest-${i}`;

        restaurants.push({
          id: restaurantId,
          name: `${cuisine} Bistro ${i}`,
          cuisine: cuisine,
          rating: (3.5 + Math.random() * 1.5).toFixed(1),
          deliveryTime: `${20 + Math.floor(Math.random() * 40)} min`,
          deliveryFee: Math.floor(Math.random() * 500) / 100, // 0.00 to 4.99
          image: `https://picsum.photos/400/300?random=restaurant${i}`,
          hours: "10:00 AM - 10:00 PM",
          address: `${100 + i} Main St, Food City`,
          tags: [cuisine, 'Fast Delivery', 'Top Rated']
        });

        allMenuItems.push(...generateMenuItems(restaurantId, cuisine));
      }

      return {
        user: {
          id: 'user-1',
          name: 'Demo User',
          email: 'demo@example.com',
          avatar: 'https://picsum.photos/100/100?random=user1',
          addresses: ['123 Home St, Apt 4B', '456 Work Blvd, Suite 200']
        },
        restaurants,
        menuItems: allMenuItems,
        cart: {
          restaurantId: null,
          items: []
        },
        orders: [],
        favorites: []
      };
    };

    // --- Session-aware storage functions ---

    const BASE_STORAGE_KEY = 'food_delivery_state';
    const BASE_INITIAL_KEY = 'food_delivery_initialState';

    function storageKey(sid) {
      return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
    }
    function initialKey(sid) {
      return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
    }

    export const getSessionId = () => {
      const params = new URLSearchParams(window.location.search);
      const urlSid = params.get('sid');
      if (urlSid) {
        sessionStorage.setItem('mock_sid', urlSid);
        return urlSid;
      }
      return sessionStorage.getItem('mock_sid') || null;
    };

    export const fetchCustomState = async (sid = null) => {
      try {
        const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.has_custom_state && data.stored_state) return data.stored_state;
        }
      } catch (e) { console.log('No custom state available'); }
      return null;
    };

    export const saveState = (state, sid = null) => {
      localStorage.setItem(storageKey(sid), JSON.stringify(state));

      const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {
        // LocalStorage remains the browser source of truth if the mock server is unavailable.
      });
    };

    export const getInitialState = (sid = null) => {
      const stored = localStorage.getItem(initialKey(sid));
      return stored ? JSON.parse(stored) : null;
    };

    // --- Array item normalizers ---

    function normalizeCartItem(item, index) {
      return {
        cartItemId: item.cartItemId || item.id || `cart_item_${index}`,
        menuItem: item.menuItem || item.item || {},
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        modifiers: item.modifiers || {},
        instructions: item.instructions || item.notes || '',
      };
    }

    function normalizeOrderItem(item, index) {
      return {
        cartItemId: item.cartItemId || item.id || `order_item_${index}`,
        menuItem: item.menuItem || item.item || {},
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        modifiers: item.modifiers || {},
        instructions: item.instructions || item.notes || '',
      };
    }

    function normalizeOrder(order, index) {
      const rawItems = Array.isArray(order.items) ? order.items : [];
      return {
        id: order.id || `order_custom_${index}`,
        userId: order.userId || order.user || 'user-1',
        restaurantId: order.restaurantId || order.restaurant || null,
        items: rawItems.map((item, i) => normalizeOrderItem(item, i)),
        status: order.status || 'preparing',
        created: order.created || order.createdAt || Date.now(),
        deliveryDetails: order.deliveryDetails || {},
        total: order.total || { subtotal: 0, fee: 0, tax: 0, total: 0 },
      };
    }

    function normalizeRestaurant(rest, index) {
      return {
        id: rest.id || `rest_custom_${index}`,
        name: rest.name || `Restaurant ${index}`,
        cuisine: rest.cuisine || rest.type || 'American',
        rating: rest.rating || '4.0',
        deliveryTime: rest.deliveryTime || rest.delivery_time || '30 min',
        deliveryFee: typeof rest.deliveryFee === 'number' ? rest.deliveryFee : 2.99,
        image: rest.image || rest.img || '',
        hours: rest.hours || '10:00 AM - 10:00 PM',
        address: rest.address || rest.location || '',
        tags: Array.isArray(rest.tags) ? rest.tags : [],
      };
    }

    function normalizeMenuItem(item, index) {
      return {
        id: item.id || `item_custom_${index}`,
        restaurantId: item.restaurantId || item.restaurant || null,
        name: item.name || item.title || `Item ${index}`,
        description: item.description || item.desc || '',
        price: typeof item.price === 'number' ? item.price : 10,
        image: item.image || item.img || '',
        category: item.category || item.cat || 'Mains',
        dietary: Array.isArray(item.dietary) ? item.dietary : [],
        modifiers: Array.isArray(item.modifiers) ? item.modifiers : [MODIFIERS.size, MODIFIERS.extras],
      };
    }

    const arrayNormalizers = {
      restaurants: normalizeRestaurant,
      menuItems: normalizeMenuItem,
      orders: normalizeOrder,
      favorites: null, // favorites is string array, no normalization needed
    };

    function deepMergeWithDefaults(defaults, custom) {
      if (!custom) return defaults;
      const result = { ...defaults };
      for (const key in custom) {
        if (custom[key] !== null && custom[key] !== undefined) {
          if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
            result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
          } else if (key === 'cart' && typeof custom[key] === 'object') {
            // Normalize cart specially
            const customCart = custom[key];
            result[key] = {
              restaurantId: customCart.restaurantId || null,
              items: Array.isArray(customCart.items) ? customCart.items.map((item, i) => normalizeCartItem(item, i)) : [],
            };
          } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
            result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
          } else {
            result[key] = custom[key];
          }
        }
      }
      return result;
    }

    export const initializeData = (sid = null, customState = null) => {
      const sk = storageKey(sid);
      const ik = initialKey(sid);

      if (customState) {
        const initialData = deepMergeWithDefaults(generateInitialState(), customState);
        localStorage.setItem(sk, JSON.stringify(initialData));
        localStorage.setItem(ik, JSON.stringify(initialData));
        return initialData;
      }

      const stored = localStorage.getItem(sk);
      if (stored) {
        if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
        return JSON.parse(stored);
      }

      const initialData = generateInitialState();
      localStorage.setItem(sk, JSON.stringify(initialData));
      localStorage.setItem(ik, JSON.stringify(initialData));
      return initialData;
    };
