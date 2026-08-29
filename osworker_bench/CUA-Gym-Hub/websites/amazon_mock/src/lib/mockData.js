export const CATEGORIES = [
  "Electronics", "Books", "Home & Kitchen", "Fashion", "Toys & Games", "Beauty"
];

const HAND_CRAFTED_PRODUCTS = [
  // Electronics (p1-p10)
  {
    id: "p1", category: "Electronics", brand: "Samsung", title: "Samsung Galaxy Buds Pro - True Wireless Bluetooth Noise Cancelling Earbuds",
    price: 149.99, originalPrice: 199.99, rating: 4.5, reviewCount: 12847, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p1/400/400",
    images: ["https://picsum.photos/seed/p1/400/400","https://picsum.photos/seed/p1b/400/400","https://picsum.photos/seed/p1c/400/400","https://picsum.photos/seed/p1d/400/400"],
    description: "Experience premium sound with Samsung Galaxy Buds Pro featuring Intelligent Active Noise Cancellation and immersive 360 Audio.",
    bulletPoints: ["Intelligent Active Noise Cancellation blocks out ambient sound","360 Audio with head tracking for immersive experience","11mm woofer + 6.5mm tweeter for rich, detailed sound","IPX7 water resistance for workout protection","Up to 28 hours battery life with charging case","Seamless connection with Samsung Galaxy devices","Voice Detect automatically switches to ambient mode when you speak"],
    specs: {"Brand":"Samsung","Model":"SM-R190","Connectivity":"Bluetooth 5.0","Battery Life":"5 hrs (28 hrs with case)","Water Resistance":"IPX7","Weight":"6.3g per earbud","Color":"Phantom Black"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p2", category: "Electronics", brand: "Apple", title: "Apple MacBook Air 13-inch with M2 chip - 8GB RAM, 256GB SSD",
    price: 999.00, originalPrice: null, rating: 4.8, reviewCount: 8342, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller", "Xmazon's Choice"],
    image: "https://picsum.photos/seed/p2/400/400",
    images: ["https://picsum.photos/seed/p2/400/400","https://picsum.photos/seed/p2b/400/400","https://picsum.photos/seed/p2c/400/400"],
    description: "The redesigned MacBook Air with the blazing-fast M2 chip delivers up to 18 hours of battery life in a strikingly thin design.",
    bulletPoints: ["Apple M2 chip with 8-core CPU and 8-core GPU","8GB unified memory for seamless multitasking","256GB fast SSD storage","13.6-inch Liquid Retina display with 500 nits brightness","Up to 18 hours battery life","MagSafe charging and two Thunderbolt ports","1080p FaceTime HD camera"],
    specs: {"Brand":"Apple","Processor":"Apple M2","RAM":"8GB Unified Memory","Storage":"256GB SSD","Display":"13.6-inch Liquid Retina","Battery":"Up to 18 hours","Weight":"2.7 lbs","OS":"macOS"},
    createdAt: "2024-02-10T00:00:00.000Z"
  },
  {
    id: "p3", category: "Electronics", brand: "Sony", title: "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones",
    price: 348.00, originalPrice: 399.99, rating: 4.7, reviewCount: 21634, prime: true, inStock: true, stockCount: null,
    seller: "Sony", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p3/400/400",
    images: ["https://picsum.photos/seed/p3/400/400","https://picsum.photos/seed/p3b/400/400","https://picsum.photos/seed/p3c/400/400","https://picsum.photos/seed/p3d/400/400"],
    description: "Industry-leading noise canceling with two processors and 8 microphones for unparalleled sound quality and crystal-clear calls.",
    bulletPoints: ["Industry-leading noise cancellation with 8 microphones and 2 processors","30-hour battery life with quick charging (3 min = 3 hrs)","Crystal clear hands-free calling with precise voice pickup","Multipoint connection for two devices simultaneously","LDAC codec for high-quality wireless audio","Soft-fit leather headband for all-day comfort","Speak-to-Chat technology pauses music when you talk"],
    specs: {"Brand":"Sony","Model":"WH-1000XM5","Connectivity":"Bluetooth 5.2","Battery Life":"30 hours","Noise Cancellation":"Active (ANC)","Driver":"30mm","Weight":"250g","Color":"Black"},
    createdAt: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "p4", category: "Electronics", brand: "Anker", title: "Anker PowerCore 26800mAh Portable Charger with 5V/3A Output",
    price: 49.99, originalPrice: 65.99, rating: 4.6, reviewCount: 33421, prime: true, inStock: true, stockCount: 7,
    seller: "Anker", badges: [],
    image: "https://picsum.photos/seed/p4/400/400",
    images: ["https://picsum.photos/seed/p4/400/400","https://picsum.photos/seed/p4b/400/400","https://picsum.photos/seed/p4c/400/400"],
    description: "Anker's highest capacity portable charger with 26800mAh to charge your iPhone 15 almost 6 times or your Samsung S24 over 5 times.",
    bulletPoints: ["Massive 26800mAh capacity charges iPhone 15 nearly 6 times","Dual USB-A output ports for charging two devices simultaneously","5V/3A input allows full recharge in just 6.5 hours","PowerIQ and VoltageBoost technologies for fastest possible charge","LED indicator shows remaining battery percentage","Compact design fits easily in backpack or luggage","Compatible with all USB devices including phones, tablets, and earbuds"],
    specs: {"Brand":"Anker","Capacity":"26800mAh","Input":"Micro USB 5V/2A","Output":"Dual USB-A 5V/3A","Charge Cycles":"500+","Weight":"454g","Dimensions":"6.5 x 3.2 x 0.9 inches"},
    createdAt: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "p5", category: "Electronics", brand: "Logitech", title: "Logitech MX Master 3S Wireless Performance Mouse with Ultra-fast Scrolling",
    price: 89.99, originalPrice: null, rating: 4.7, reviewCount: 18923, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p5/400/400",
    images: ["https://picsum.photos/seed/p5/400/400","https://picsum.photos/seed/p5b/400/400","https://picsum.photos/seed/p5c/400/400"],
    description: "The MX Master 3S features near-silent clicks, an 8K DPI sensor for pixel-precise tracking, and MagSpeed electromagnetic scrolling.",
    bulletPoints: ["8,000 DPI high-precision sensor tracks on any surface including glass","MagSpeed electromagnetic scrolling — whisper quiet","Quiet clicks 90% less noise vs standard mouse","USB-C charging — 1 minute of charge provides 3 hours of use","Connect up to 3 devices with Easy-Switch button","Customizable buttons with Logitech Options+ app","Ergonomic shape designed for all-day use"],
    specs: {"Brand":"Logitech","Sensor":"Darkfield 8000 DPI","Connectivity":"Bluetooth or USB receiver","Battery":"70 days (full charge)","Buttons":"7 customizable","OS":"Windows, macOS, Linux","Weight":"141g"},
    createdAt: "2024-02-01T00:00:00.000Z"
  },
  {
    id: "p6", category: "Electronics", brand: "Samsung", title: "Samsung 27-inch ViewFinity S7 4K UHD Monitor with HDR600",
    price: 279.99, originalPrice: 329.99, rating: 4.4, reviewCount: 6732, prime: true, inStock: true, stockCount: null,
    seller: "Samsung", badges: [],
    image: "https://picsum.photos/seed/p6/400/400",
    images: ["https://picsum.photos/seed/p6/400/400","https://picsum.photos/seed/p6b/400/400","https://picsum.photos/seed/p6c/400/400"],
    description: "Elevate your workspace with 4K UHD resolution and HDR600 display technology for stunning image quality.",
    bulletPoints: ["4K UHD (3840x2160) resolution for ultra-sharp details","HDR600 for vibrant colors and deep contrast","IPS panel with wide 178° viewing angle","USB-C with 65W power delivery charges your laptop","AMD FreeSync for smooth gaming with no screen tearing","Height, tilt, swivel, and pivot adjustment","3-sided borderless design for multi-monitor setups"],
    specs: {"Brand":"Samsung","Resolution":"3840x2160 (4K UHD)","Panel":"IPS","Refresh Rate":"60Hz","Response Time":"5ms","Ports":"HDMI, DisplayPort, USB-C","HDR":"HDR600"},
    createdAt: "2024-01-25T00:00:00.000Z"
  },
  {
    id: "p7", category: "Electronics", brand: "Apple", title: "Apple iPad 10th Generation 10.9-inch Wi-Fi 64GB",
    price: 349.00, originalPrice: null, rating: 4.6, reviewCount: 14521, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p7/400/400",
    images: ["https://picsum.photos/seed/p7/400/400","https://picsum.photos/seed/p7b/400/400","https://picsum.photos/seed/p7c/400/400","https://picsum.photos/seed/p7d/400/400"],
    description: "The all-new iPad with a beautiful 10.9-inch Liquid Retina display, A14 Bionic chip, and the versatility of USB-C.",
    bulletPoints: ["10.9-inch Liquid Retina display with True Tone technology","A14 Bionic chip for fast and powerful performance","12MP front camera with Center Stage for video calls","12MP back camera with 4K video recording","USB-C connector for charging and accessories","Wi-Fi 6 support for fast wireless connectivity","All-day 10-hour battery life"],
    specs: {"Brand":"Apple","Chip":"A14 Bionic","Display":"10.9-inch Liquid Retina","Storage":"64GB","Camera":"12MP front + 12MP rear","Connectivity":"Wi-Fi 6, Bluetooth 5.2","Battery":"Up to 10 hours"},
    createdAt: "2024-02-15T00:00:00.000Z"
  },
  {
    id: "p8", category: "Electronics", brand: "Bose", title: "Bose SoundLink Flex Bluetooth Portable Speaker, Waterproof",
    price: 129.00, originalPrice: 149.00, rating: 4.7, reviewCount: 9845, prime: true, inStock: true, stockCount: 5,
    seller: "Bose", badges: [],
    image: "https://picsum.photos/seed/p8/400/400",
    images: ["https://picsum.photos/seed/p8/400/400","https://picsum.photos/seed/p8b/400/400","https://picsum.photos/seed/p8c/400/400"],
    description: "Take the party anywhere with the SoundLink Flex, a waterproof Bluetooth speaker with bold sound and up to 12 hours of battery life.",
    bulletPoints: ["PositionIQ technology optimizes sound automatically based on orientation","IP67 waterproof and dustproof for outdoor adventures","12-hour battery life with USB-C charging","Rip-resistant fabric and steel mesh protect from impact","Built-in speakerphone for hands-free calls","Party Mode for pairing multiple Bose speakers","Connect to two devices simultaneously"],
    specs: {"Brand":"Bose","Waterproof":"IP67","Battery":"12 hours","Connectivity":"Bluetooth 5.1","Dimensions":"9.1 x 3.9 x 3.0 inches","Weight":"590g"},
    createdAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "p9", category: "Electronics", brand: "Xmazon", title: "Fire TV Stick 4K Max Streaming Device with Alexa Voice Remote",
    price: 39.99, originalPrice: 59.99, rating: 4.5, reviewCount: 45123, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p9/400/400",
    images: ["https://picsum.photos/seed/p9/400/400","https://picsum.photos/seed/p9b/400/400","https://picsum.photos/seed/p9c/400/400"],
    description: "The most powerful 4K Max streaming stick from Xmazon with Wi-Fi 6E support and an Alexa Voice Remote with live TV controls.",
    bulletPoints: ["Supports 4K Ultra HD, HDR10+, Dolby Vision, and Dolby Atmos audio","40% more powerful than Fire TV Stick 4K with Wi-Fi 6E support","Alexa Voice Remote with live TV and app buttons","Find, launch, and control content with your voice","Works with popular streaming services Netflix, Prime Video, Disney+","Picture-in-Picture mode for multitasking","Parental controls to set content restrictions"],
    specs: {"Brand":"Xmazon","Resolution":"4K Ultra HD","HDR":"HDR10+, Dolby Vision","Audio":"Dolby Atmos","Wi-Fi":"Wi-Fi 6E (802.11ax)","Processor":"Octa-core 1.8GHz"},
    createdAt: "2024-01-12T00:00:00.000Z"
  },
  {
    id: "p10", category: "Electronics", brand: "Ring", title: "Ring Video Doorbell (2nd Gen) - 1080p HD Video, motion-activated alerts",
    price: 99.99, originalPrice: null, rating: 4.4, reviewCount: 28764, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p10/400/400",
    images: ["https://picsum.photos/seed/p10/400/400","https://picsum.photos/seed/p10b/400/400","https://picsum.photos/seed/p10c/400/400"],
    description: "See, hear, and speak to visitors from your phone, tablet, or PC with crisp 1080p HD video and two-way talk.",
    bulletPoints: ["1080p HD video with improved motion detection zones","Live View lets you check in on your home anytime","Improved motion detection reduces false alerts","Two-way talk with noise cancellation","Works with Alexa for voice control","Easy DIY installation with included tools","Requires subscription for video recording history"],
    specs: {"Brand":"Ring","Video":"1080p HD","Field of View":"155° horizontal, 90° vertical","Night Vision":"Color","Power":"Battery or hardwired","Connectivity":"Wi-Fi 802.11n"},
    createdAt: "2024-02-05T00:00:00.000Z"
  },

  // Books (p11-p20)
  {
    id: "p11", category: "Books", brand: "Penguin Random House", title: "Atomic Habits: An Easy & Proven Way to Build Good Habits by James Clear",
    price: 16.99, originalPrice: 27.00, rating: 4.8, reviewCount: 94312, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller", "Xmazon's Choice"],
    image: "https://picsum.photos/seed/p11/400/400",
    images: ["https://picsum.photos/seed/p11/400/400","https://picsum.photos/seed/p11b/400/400","https://picsum.photos/seed/p11c/400/400"],
    description: "The #1 New York Times bestseller. Over 15 million copies sold. Transform your life with tiny changes in behavior.",
    bulletPoints: ["#1 New York Times Bestseller — over 15 million copies sold","Learn the Four Laws of Behavior Change framework","Discover how 1% improvements compound into remarkable results","Based on proven scientific research and real-world examples","Clear's system works regardless of where you start","Paperback: 320 pages, ISBN 978-0735224292","Perfect for anyone looking to improve their productivity and habits"],
    specs: {"Author":"James Clear","Publisher":"Avery","Pages":"320","Language":"English","ISBN":"978-0735224292","Format":"Paperback","Dimensions":"5.5 x 0.9 x 8.4 inches"},
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "p12", category: "Books", brand: "Ballantine Books", title: "Project Hail Mary: A Novel by Andy Weir",
    price: 14.99, originalPrice: 28.00, rating: 4.9, reviewCount: 62145, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p12/400/400",
    images: ["https://picsum.photos/seed/p12/400/400","https://picsum.photos/seed/p12b/400/400","https://picsum.photos/seed/p12c/400/400"],
    description: "A lone astronaut must save the earth from disaster in this propulsive, near-future thriller from the #1 bestselling author of The Martian.",
    bulletPoints: ["#1 New York Times Bestseller by Andy Weir","A standalone sci-fi thriller perfect for fans of The Martian","Ryland Grace wakes up alone on a spaceship with no memory","Science-based fiction with page-turning suspense","Optioned for major motion picture","Paperback: 496 pages","Named one of the best books of 2021 by Time Magazine"],
    specs: {"Author":"Andy Weir","Publisher":"Ballantine Books","Pages":"496","Language":"English","ISBN":"978-0593135204","Format":"Paperback","Dimensions":"5.2 x 1.1 x 8.0 inches"},
    createdAt: "2024-01-03T00:00:00.000Z"
  },
  {
    id: "p13", category: "Books", brand: "Viking", title: "The Midnight Library: A Novel by Matt Haig",
    price: 13.99, originalPrice: 26.00, rating: 4.5, reviewCount: 41237, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p13/400/400",
    images: ["https://picsum.photos/seed/p13/400/400","https://picsum.photos/seed/p13b/400/400"],
    description: "Between life and death there is a library. Nora Seed discovers a library that contains books of lives she could have lived.",
    bulletPoints: ["New York Times bestseller","A beautiful meditation on regret, hope, and second chances","Goodreads Choice Award winner for Fiction","Perfect book club selection with universal themes","Translated into 40+ languages worldwide","Paperback: 304 pages","Named a Top Book of 2020 by Time, NPR, and more"],
    specs: {"Author":"Matt Haig","Publisher":"Viking","Pages":"304","Language":"English","ISBN":"978-0525559474","Format":"Paperback"},
    createdAt: "2024-01-08T00:00:00.000Z"
  },
  {
    id: "p14", category: "Books", brand: "Random House", title: "Educated: A Memoir by Tara Westover",
    price: 15.99, originalPrice: 18.00, rating: 4.7, reviewCount: 78432, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p14/400/400",
    images: ["https://picsum.photos/seed/p14/400/400","https://picsum.photos/seed/p14b/400/400"],
    description: "A memoir about a young girl who grows up in the mountains of Idaho, goes on to earn a PhD from Cambridge, and builds a life of her own.",
    bulletPoints: ["#1 New York Times Bestseller for over 150 weeks","A Pulitzer Prize finalist","Selected by Bill Gates, Barack Obama, and Oprah as a top read","A story of family, love, and the power of education","Over 5 million copies in print","Paperback: 352 pages","Named one of the ten best books of 2018 by NYT Book Review"],
    specs: {"Author":"Tara Westover","Publisher":"Random House","Pages":"352","Language":"English","ISBN":"978-0399590504","Format":"Paperback"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p15", category: "Books", brand: "Ace", title: "Dune by Frank Herbert - The Sci-Fi Classic (Deluxe Edition)",
    price: 10.99, originalPrice: null, rating: 4.7, reviewCount: 103456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p15/400/400",
    images: ["https://picsum.photos/seed/p15/400/400","https://picsum.photos/seed/p15b/400/400","https://picsum.photos/seed/p15c/400/400"],
    description: "The greatest science fiction novel of all time. Set in the far future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides.",
    bulletPoints: ["Winner of Hugo and Nebula Awards for Best Novel","The bestselling science fiction novel of all time","Basis for the award-winning 2021 and 2024 film adaptations","Epic story of politics, religion, ecology, and human potential","Introduction to the Dune universe spanning 6 novels","Paperback: 896 pages","Includes appendices, glossary, and maps"],
    specs: {"Author":"Frank Herbert","Publisher":"Ace","Pages":"896","Language":"English","ISBN":"978-0441013593","Format":"Paperback"},
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "p16", category: "Books", brand: "O'Reilly Media", title: "JavaScript: The Good Parts by Douglas Crockford",
    price: 29.99, originalPrice: 34.99, rating: 4.5, reviewCount: 18743, prime: true, inStock: true, stockCount: 4,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p16/400/400",
    images: ["https://picsum.photos/seed/p16/400/400","https://picsum.photos/seed/p16b/400/400"],
    description: "Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad. This book shows you the best.",
    bulletPoints: ["Written by Douglas Crockford, the inventor of JSON","Reveals the elegant subset of JavaScript that makes it great","Covers functions, loose typing, and prototypal inheritance","Essential reading for any serious JavaScript developer","Covers how to avoid JavaScript's bad parts","Paperback: 172 pages","The O'Reilly animal book every web developer should own"],
    specs: {"Author":"Douglas Crockford","Publisher":"O'Reilly Media","Pages":"172","Language":"English","ISBN":"978-0596517748","Format":"Paperback"},
    createdAt: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "p17", category: "Books", brand: "Harper Perennial", title: "Sapiens: A Brief History of Humankind by Yuval Noah Harari",
    price: 17.99, originalPrice: 26.99, rating: 4.6, reviewCount: 67234, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p17/400/400",
    images: ["https://picsum.photos/seed/p17/400/400","https://picsum.photos/seed/p17b/400/400"],
    description: "A groundbreaking narrative of humanity's creation and evolution that explores how biology and history have defined us.",
    bulletPoints: ["New York Times bestseller for over 3 years","A sweeping look at human history from 70,000 years ago to today","Named a top book by Barack Obama, Bill Gates, and Mark Zuckerberg","Covers how Homo sapiens came to rule the planet","Explores cognitive, agricultural, and scientific revolutions","Paperback: 464 pages","Translated into 65+ languages worldwide"],
    specs: {"Author":"Yuval Noah Harari","Publisher":"Harper Perennial","Pages":"464","Language":"English","ISBN":"978-0062316097","Format":"Paperback"},
    createdAt: "2024-01-12T00:00:00.000Z"
  },
  {
    id: "p18", category: "Books", brand: "G.P. Putnam's Sons", title: "Where the Crawdads Sing by Delia Owens",
    price: 12.99, originalPrice: null, rating: 4.8, reviewCount: 221456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p18/400/400",
    images: ["https://picsum.photos/seed/p18/400/400","https://picsum.photos/seed/p18b/400/400"],
    description: "The stunning coming-of-age story of Kya Clark, abandoned by her family in the wild marshes of North Carolina, becomes the center of a murder investigation.",
    bulletPoints: ["#1 New York Times Bestseller for 200+ weeks","Over 12 million copies sold in the US alone","Named one of the best novels of 2018","Adapted into a major motion picture","A gripping mystery and coming-of-age story","Paperback: 384 pages","Book club favorite across the country"],
    specs: {"Author":"Delia Owens","Publisher":"G.P. Putnam's Sons","Pages":"384","Language":"English","ISBN":"978-0735224292","Format":"Paperback"},
    createdAt: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "p19", category: "Books", brand: "HarperOne", title: "The Alchemist by Paulo Coelho - 25th Anniversary Edition",
    price: 11.99, originalPrice: 17.99, rating: 4.7, reviewCount: 189234, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p19/400/400",
    images: ["https://picsum.photos/seed/p19/400/400","https://picsum.photos/seed/p19b/400/400"],
    description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
    bulletPoints: ["One of the most-read books of the 20th century","Translated into 80 languages and sold over 150 million copies","25th Anniversary Edition with special foreword by the author","A spiritual classic about following your dreams","Named a Life-Changing Novel by Entertainment Weekly","Paperback: 208 pages","Beloved by readers worldwide for over 30 years"],
    specs: {"Author":"Paulo Coelho","Publisher":"HarperOne","Pages":"208","Language":"English","ISBN":"978-0061122415","Format":"Paperback"},
    createdAt: "2024-01-18T00:00:00.000Z"
  },
  {
    id: "p20", category: "Books", brand: "Pearson Education", title: "Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin",
    price: 39.99, originalPrice: 49.99, rating: 4.6, reviewCount: 24567, prime: true, inStock: true, stockCount: 6,
    seller: "Amazon.com", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p20/400/400",
    images: ["https://picsum.photos/seed/p20/400/400","https://picsum.photos/seed/p20b/400/400"],
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    bulletPoints: ["Written by 'Uncle Bob' Robert C. Martin","Essential reading for professional software developers","Learn how to write code that humans can read and maintain","Covers naming, functions, comments, formatting, and more","Contains numerous case studies with detailed walkthroughs","Paperback: 464 pages","Part of the Robert C. Martin Series on clean code practices"],
    specs: {"Author":"Robert C. Martin","Publisher":"Pearson Education","Pages":"464","Language":"English","ISBN":"978-0132350884","Format":"Paperback"},
    createdAt: "2024-01-22T00:00:00.000Z"
  },

  // Home & Kitchen (p21-p30)
  {
    id: "p21", category: "Home & Kitchen", brand: "Ninja", title: "Ninja AF101 Air Fryer that Cooks, Crisps and Dehydrates, 4 Quart",
    price: 89.99, originalPrice: 109.99, rating: 4.8, reviewCount: 67234, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller", "Xmazon's Choice"],
    image: "https://picsum.photos/seed/p21/400/400",
    images: ["https://picsum.photos/seed/p21/400/400","https://picsum.photos/seed/p21b/400/400","https://picsum.photos/seed/p21c/400/400","https://picsum.photos/seed/p21d/400/400"],
    description: "Air fry, roast, reheat, and dehydrate with Ninja's 4-quart ceramic coated basket that holds up to 2 lbs of fries.",
    bulletPoints: ["Uses 75% less fat than traditional frying methods","4-quart ceramic coated basket fits up to 2 lbs of French fries","4-in-1 versatility: Air Fry, Roast, Reheat, Dehydrate","Wide temperature range 105°F to 400°F","Dishwasher-safe parts for easy cleanup","1550-watt motor for powerful circulation","45-recipe inspiration guide included"],
    specs: {"Brand":"Ninja","Capacity":"4 Quarts","Wattage":"1550W","Temperature Range":"105-400°F","Dimensions":"13.4 x 9.4 x 11.4 inches","Weight":"7.9 lbs","Dishwasher Safe":"Yes"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p22", category: "Home & Kitchen", brand: "Keurig", title: "Keurig K-Classic Coffee Maker K-Cup Pod, Single Serve, Programmable",
    price: 79.99, originalPrice: 109.99, rating: 4.5, reviewCount: 45678, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p22/400/400",
    images: ["https://picsum.photos/seed/p22/400/400","https://picsum.photos/seed/p22b/400/400","https://picsum.photos/seed/p22c/400/400"],
    description: "Brew the perfect cup with Keurig's K-Classic coffee maker. Compatible with all K-Cup pods for over 400 varieties of coffee, tea, hot cocoa, and more.",
    bulletPoints: ["Brew 6, 8, or 10 oz cup sizes with the touch of a button","Compatible with all K-Cup pods — hundreds of varieties","Large 48 oz removable water reservoir brews up to 6 cups","Programmable auto-on to have your coffee ready when you wake up","Brews in under one minute for your morning convenience","Quiet brew technology","Energy-saving auto-off feature"],
    specs: {"Brand":"Keurig","Model":"K55/K-Classic","Reservoir":"48 oz removable","Cup Sizes":"6, 8, 10 oz","Dimensions":"13.0 x 9.8 x 13.3 inches","Weight":"7.2 lbs","Color":"Black"},
    createdAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "p23", category: "Home & Kitchen", brand: "Instant Pot", title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart",
    price: 69.99, originalPrice: 99.95, rating: 4.7, reviewCount: 123456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p23/400/400",
    images: ["https://picsum.photos/seed/p23/400/400","https://picsum.photos/seed/p23b/400/400","https://picsum.photos/seed/p23c/400/400","https://picsum.photos/seed/p23d/400/400"],
    description: "The Instant Pot Duo is the #1 selling multi-cooker. 7-in-1 functionality: Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Saute, Yogurt Maker, Warmer.",
    bulletPoints: ["7-in-1 multi-use: Pressure Cooker, Slow Cooker, Rice/Grain Cooker, Steamer, Sauté/Searing, Yogurt Maker, and Warmer","Cooks up to 70% faster than traditional cooking","13 customizable Smart Programs for everyday favorites","6-quart capacity for cooking family-size meals","Stainless steel inner pot for food-grade safety","Easy-to-use safety mechanisms — 10+ safety features","Easy-seal lid automatically seals when cooking begins"],
    specs: {"Brand":"Instant Pot","Model":"Duo","Capacity":"6 Quarts","Wattage":"1000W","Dimensions":"13.4 x 12.2 x 12.5 inches","Weight":"11.8 lbs","Includes":"Recipe book"},
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "p24", category: "Home & Kitchen", brand: "iRobot", title: "iRobot Roomba 694 Robot Vacuum with Wi-Fi Connectivity",
    price: 179.99, originalPrice: 274.99, rating: 4.4, reviewCount: 34521, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p24/400/400",
    images: ["https://picsum.photos/seed/p24/400/400","https://picsum.photos/seed/p24b/400/400","https://picsum.photos/seed/p24c/400/400"],
    description: "The Roomba 694 robot vacuum picks up pet hair, dust, and debris on all floor types with its 3-Stage Cleaning System.",
    bulletPoints: ["3-Stage Cleaning System loosens, lifts, and suctions dirt","Wi-Fi connected — schedule and monitor from the iRobot Home App","Compatible with Alexa and Google Assistant voice control","Dual multi-surface rubber brushes adjust to different floor types","Edge-Sweeping Brush cleans along walls and corners","Automatically recharges when battery is low","Works on carpets, tile, hardwood, and more"],
    specs: {"Brand":"iRobot","Model":"Roomba 694","Connectivity":"Wi-Fi 802.11 b/g/n","Battery Life":"90 minutes","Surface":"All floor types","Dimensions":"13.4 x 13.4 x 3.5 inches","Weight":"6.8 lbs"},
    createdAt: "2024-02-01T00:00:00.000Z"
  },
  {
    id: "p25", category: "Home & Kitchen", brand: "Crock-Pot", title: "Crock-Pot 7 Quart Oval Manual Slow Cooker, Stainless Steel",
    price: 39.99, originalPrice: null, rating: 4.7, reviewCount: 28934, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p25/400/400",
    images: ["https://picsum.photos/seed/p25/400/400","https://picsum.photos/seed/p25b/400/400"],
    description: "Cook hearty, flavorful meals with the Crock-Pot 7-Quart slow cooker. Large enough to feed a crowd with three heat settings.",
    bulletPoints: ["7-quart oval stoneware fits a 7-lb roast or whole chicken","Three simple heat settings: low, high, and warm","Dishwasher-safe stoneware and lid for easy cleanup","Stay-cool handles for safe transportation","Locking lid for transport and serving","Made in the USA with quality materials","Perfect for soups, stews, casseroles, and pot roasts"],
    specs: {"Brand":"Crock-Pot","Capacity":"7 Quarts","Settings":"Low, High, Warm","Dimensions":"14.5 x 9.8 x 8.9 inches","Weight":"8 lbs","Dishwasher Safe":"Yes (insert and lid)"},
    createdAt: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "p26", category: "Home & Kitchen", brand: "Mellanni", title: "Mellanni Queen Bed Sheet Set - 4 PC Brushed Microfiber 1800 Bedding",
    price: 49.99, originalPrice: null, rating: 4.5, reviewCount: 41235, prime: true, inStock: true, stockCount: null,
    seller: "Mellanni", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p26/400/400",
    images: ["https://picsum.photos/seed/p26/400/400","https://picsum.photos/seed/p26b/400/400","https://picsum.photos/seed/p26c/400/400"],
    description: "Ultra-soft luxury bed sheets made from premium 1800 thread count microfiber that resist wrinkles, stains, and fading.",
    bulletPoints: ["1800 thread count premium microfiber — 3x softer than cotton","4-piece set includes: 1 flat sheet, 1 fitted sheet, 2 pillowcases","Deep pocket fitted sheet fits mattresses up to 16 inches deep","Wrinkle, stain, and fade resistant for lasting freshness","Machine washable and dries quickly","Available in 40+ colors","OEKO-TEX Standard 100 certified safe for all ages"],
    specs: {"Brand":"Mellanni","Material":"Brushed Microfiber","Thread Count":"1800","Set Includes":"4 pieces","Sizes":"Twin, Full, Queen, King, Cal King","Wash":"Machine washable"},
    createdAt: "2024-01-25T00:00:00.000Z"
  },
  {
    id: "p27", category: "Home & Kitchen", brand: "KitchenAid", title: "KitchenAid Artisan Series 5-Qt. Tilt-Head Stand Mixer with Pouring Shield",
    price: 329.99, originalPrice: 449.99, rating: 4.8, reviewCount: 15432, prime: true, inStock: true, stockCount: 3,
    seller: "KitchenAid", badges: [],
    image: "https://picsum.photos/seed/p27/400/400",
    images: ["https://picsum.photos/seed/p27/400/400","https://picsum.photos/seed/p27b/400/400","https://picsum.photos/seed/p27c/400/400","https://picsum.photos/seed/p27d/400/400"],
    description: "The iconic KitchenAid Stand Mixer with 5-quart stainless steel bowl and 10 speeds for making pastry doughs to meringues.",
    bulletPoints: ["59-point planetary mixing action for thorough ingredient incorporation","5-quart stainless steel mixing bowl with handle","10 speeds for nearly any task or recipe","Tilt-Head design allows easy access to bowl","Includes flat beater, dough hook, and wire whip attachments","Power Hub turns mixer into a culinary center with 15+ attachments","Pouring shield included to minimize splatter"],
    specs: {"Brand":"KitchenAid","Model":"KSM150PS","Capacity":"5 Quarts","Speeds":"10","Wattage":"325W","Dimensions":"14.1 x 8.7 x 13.9 inches","Weight":"26 lbs"},
    createdAt: "2024-02-10T00:00:00.000Z"
  },
  {
    id: "p28", category: "Home & Kitchen", brand: "Vitamix", title: "Vitamix 5200 Blender Professional-Grade, Self-Cleaning 64 oz Container",
    price: 349.99, originalPrice: 549.95, rating: 4.8, reviewCount: 8923, prime: true, inStock: true, stockCount: null,
    seller: "Vitamix", badges: [],
    image: "https://picsum.photos/seed/p28/400/400",
    images: ["https://picsum.photos/seed/p28/400/400","https://picsum.photos/seed/p28b/400/400","https://picsum.photos/seed/p28c/400/400"],
    description: "The Vitamix 5200 blender heats soups in minutes and allows you to adjust blade speeds to create textures from chunky to smooth.",
    bulletPoints: ["Variable speed control lets you refine every texture with culinary precision","64 oz low-profile container for blending large batches","Self-cleaning takes 30-60 seconds with warm water and a drop of soap","Hardened stainless steel blades create enough friction to heat soup","10-year full warranty — the longest warranty in its class","Aircraft-grade stainless steel blade handles tough ingredients","Radial cooling fan and thermal protection system for longevity"],
    specs: {"Brand":"Vitamix","Model":"5200","Container":"64 oz","Motor":"2.0 HP","Speeds":"Variable (Low to High) + High","Dimensions":"8.75 x 7.25 x 20.5 inches","Weight":"10.56 lbs","Warranty":"10 years"},
    createdAt: "2024-02-05T00:00:00.000Z"
  },
  {
    id: "p29", category: "Home & Kitchen", brand: "Lodge", title: "Lodge 10.25 Inch Cast Iron Pre-Seasoned Skillet",
    price: 34.99, originalPrice: null, rating: 4.8, reviewCount: 89234, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p29/400/400",
    images: ["https://picsum.photos/seed/p29/400/400","https://picsum.photos/seed/p29b/400/400","https://picsum.photos/seed/p29c/400/400"],
    description: "Lodge cast iron cookware has been made in South Pittsburg, Tennessee since 1896. Pre-seasoned with natural vegetable oil.",
    bulletPoints: ["Pre-seasoned with vegetable oil — no synthetic coatings","Cast iron construction distributes heat evenly and retains it","Works on any cooking surface: induction, ceramic, gas, electric, campfire","Oven safe to 500°F for versatile cooking","Gets better with use as the seasoning builds up over time","Two helper handles for safe transport","Made in the USA — American craftsmanship since 1896"],
    specs: {"Brand":"Lodge","Size":"10.25 inches","Material":"Cast Iron","Pre-Seasoned":"Yes","Oven Safe":"500°F","Compatible":"All cooktops including induction","Weight":"4.69 lbs","Made In":"USA"},
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "p30", category: "Home & Kitchen", brand: "Dyson", title: "Dyson V15 Detect Cordless Vacuum Cleaner with Laser Dust Detection",
    price: 649.99, originalPrice: 749.99, rating: 4.7, reviewCount: 12341, prime: true, inStock: true, stockCount: 4,
    seller: "Dyson", badges: [],
    image: "https://picsum.photos/seed/p30/400/400",
    images: ["https://picsum.photos/seed/p30/400/400","https://picsum.photos/seed/p30b/400/400","https://picsum.photos/seed/p30c/400/400","https://picsum.photos/seed/p30d/400/400"],
    description: "Dyson's most powerful cordless vacuum with laser that reveals invisible dust and an acoustic piezo sensor that counts and sizes particles.",
    bulletPoints: ["Laser Slim Fluffy cleaner head reveals invisible dust on hard floors","Acoustic piezo sensor counts and sizes microscopic particles","Automatically increases suction when more dust is detected","Up to 60 minutes run time on a single charge","Dyson's most powerful cordless suction ever — 240AW","HEPA filtration captures allergens and expels clean air","LCD screen shows run time countdown, performance mode, and filter maintenance"],
    specs: {"Brand":"Dyson","Model":"V15 Detect","Suction":"240AW","Run Time":"60 min max","Filtration":"HEPA","Bin Volume":"0.77L","Weight":"3.1 kg","Charger":"Wall mounted dock"},
    createdAt: "2024-02-15T00:00:00.000Z"
  },

  // Fashion (p31-p40)
  {
    id: "p31", category: "Fashion", brand: "Nike", title: "Nike Air Force 1 '07 Men's Shoe - Classic White Leather",
    price: 110.00, originalPrice: null, rating: 4.7, reviewCount: 34521, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller", "Xmazon's Choice"],
    image: "https://picsum.photos/seed/p31/400/400",
    images: ["https://picsum.photos/seed/p31/400/400","https://picsum.photos/seed/p31b/400/400","https://picsum.photos/seed/p31c/400/400","https://picsum.photos/seed/p31d/400/400"],
    description: "Letting you ride in comfort every day, the Nike Air Force 1 '07 is a modern take on the iconic AF1 silhouette.",
    bulletPoints: ["Full-grain leather upper adds durability and an unmistakable look","Nike Air cushioning provides lightweight, all-day comfort","Padded low-cut collar adds comfort and a sleek look","Rubber outsole delivers durable traction","Perforations on the toe box for breathability","Classic lace closure with metal dubrae","Available in multiple colorways and sizes"],
    specs: {"Brand":"Nike","Model":"Air Force 1 '07","Material":"Full-grain leather","Sole":"Rubber","Closure":"Lace-up","Width":"Regular (D)","Country of Origin":"Indonesia"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p32", category: "Fashion", brand: "Levi's", title: "Levi's Men's 501 Original Fit Jeans - Classic Straight Leg",
    price: 69.50, originalPrice: 79.50, rating: 4.5, reviewCount: 28765, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p32/400/400",
    images: ["https://picsum.photos/seed/p32/400/400","https://picsum.photos/seed/p32b/400/400","https://picsum.photos/seed/p32c/400/400"],
    description: "The original Levi's jean. Button fly, straight through the hip and thigh, with the original Levi's fit that's been around since 1873.",
    bulletPoints: ["The original jean — Levi's 501 has been around since 1873","Classic button fly and straight fit through hip and thigh","100% cotton denim for authentic look and feel","Sits at the waist for a classic silhouette","Available in multiple washes from dark indigo to stonewash","Machine washable for easy care","Features the iconic leather patch and rivets"],
    specs: {"Brand":"Levi's","Style":"501 Original Fit","Material":"100% Cotton Denim","Fit":"Straight","Rise":"Mid Rise","Closure":"Button fly","Machine Wash":"Yes"},
    createdAt: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "p33", category: "Fashion", brand: "Ray-Ban", title: "Ray-Ban RB3025 Aviator Classic Sunglasses",
    price: 161.00, originalPrice: null, rating: 4.7, reviewCount: 12345, prime: true, inStock: true, stockCount: null,
    seller: "Luxottica", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p33/400/400",
    images: ["https://picsum.photos/seed/p33/400/400","https://picsum.photos/seed/p33b/400/400","https://picsum.photos/seed/p33c/400/400"],
    description: "The original Ray-Ban Aviator Classic sunglasses, first introduced in 1937 for American military pilots. An icon of style.",
    bulletPoints: ["Classic teardrop shaped crystal lenses for maximum eye coverage","Gold metal frame with spring-loaded hinges for comfort and durability","100% UV protection — passes ANSI Z80.3 standard","Anti-reflective green lenses reduce glare without distortion","Iconic thin metal frame with adjustable nose pads","Comes with original Ray-Ban case and cleaning cloth","Made in Italy — authentic craftsmanship"],
    specs: {"Brand":"Ray-Ban","Model":"RB3025 Aviator Classic","Lens Width":"58mm","Bridge":"14mm","Temple Length":"135mm","Material":"Metal frame, Crystal lens","UV Protection":"100%","Made In":"Italy"},
    createdAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "p34", category: "Fashion", brand: "Champion", title: "Champion Men's Powerblend Fleece Pullover Hoodie",
    price: 45.00, originalPrice: 55.00, rating: 4.6, reviewCount: 23456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p34/400/400",
    images: ["https://picsum.photos/seed/p34/400/400","https://picsum.photos/seed/p34b/400/400","https://picsum.photos/seed/p34c/400/400"],
    description: "Champion Powerblend fleece is pill-resistant and the logo won't crack or peel. A classic athletic look that's built to last.",
    bulletPoints: ["Powerblend fleece reduced-pill finish for long-lasting look","Pill-resistant exterior retains original look after washing","Attached hood with drawstring for adjustable coverage","Front kangaroo pocket for warmth and storage","Rib-knit cuffs and waistband retain shape","Embroidered 'C' logo on left chest for iconic look","Machine washable — easy care"],
    specs: {"Brand":"Champion","Material":"50% cotton, 50% polyester","Fit":"Regular","Hood":"Yes","Pockets":"Kangaroo front pocket","Machine Wash":"Yes","Style":"Pullover Hoodie"},
    createdAt: "2024-01-25T00:00:00.000Z"
  },
  {
    id: "p35", category: "Fashion", brand: "Adidas", title: "Adidas Ultraboost 22 Running Shoes for Men",
    price: 190.00, originalPrice: null, rating: 4.6, reviewCount: 9876, prime: true, inStock: true, stockCount: null,
    seller: "Adidas", badges: [],
    image: "https://picsum.photos/seed/p35/400/400",
    images: ["https://picsum.photos/seed/p35/400/400","https://picsum.photos/seed/p35b/400/400","https://picsum.photos/seed/p35c/400/400"],
    description: "The Ultraboost 22 delivers legendary comfort and energy return with a reimagined upper that moves with your foot.",
    bulletPoints: ["BOOST midsole technology for maximum energy return with every stride","Stretchweb outsole bends naturally with foot movement","Linear Energy Push system for efficient forward motion","Primeknit+ upper adapts to foot shape as you run","Linear Energy Push TPU bedframe improves stability","OrthoLite sockliner for extra comfort and cushioning","Available in multiple colorways"],
    specs: {"Brand":"Adidas","Model":"Ultraboost 22","Midsole":"BOOST","Upper":"Primeknit+","Surface":"Road","Drop":"10mm","Width":"Regular","Country":"Indonesia"},
    createdAt: "2024-02-01T00:00:00.000Z"
  },
  {
    id: "p36", category: "Fashion", brand: "Calvin Klein", title: "Calvin Klein Men's Classic Fit Crewneck T-Shirt (Pack of 3)",
    price: 39.99, originalPrice: 54.99, rating: 4.5, reviewCount: 18765, prime: true, inStock: true, stockCount: null,
    seller: "Calvin Klein", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p36/400/400",
    images: ["https://picsum.photos/seed/p36/400/400","https://picsum.photos/seed/p36b/400/400"],
    description: "Classic Calvin Klein crewneck t-shirts in a comfortable 3-pack. Made from soft cotton for all-day wear.",
    bulletPoints: ["Pack of 3 premium crewneck t-shirts","100% ring-spun cotton for soft, breathable comfort","Classic fit that's comfortable without being baggy","Reinforced neck and side seams for durability","Pre-shrunk to maintain size after washing","CK brand label at interior back neck","Available in multiple color combinations"],
    specs: {"Brand":"Calvin Klein","Pack":"3","Material":"100% Ring-spun cotton","Fit":"Classic","Neckline":"Crew neck","Machine Wash":"Yes","Shrink":"Pre-shrunk"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p37", category: "Fashion", brand: "Herschel", title: "Herschel Supply Co. Classic Backpack, Black, 25.5L",
    price: 74.99, originalPrice: null, rating: 4.6, reviewCount: 14321, prime: true, inStock: true, stockCount: null,
    seller: "Herschel Supply Co.", badges: [],
    image: "https://picsum.photos/seed/p37/400/400",
    images: ["https://picsum.photos/seed/p37/400/400","https://picsum.photos/seed/p37b/400/400","https://picsum.photos/seed/p37c/400/400"],
    description: "The Classic backpack is a timeless everyday carry. Spacious 25.5L capacity with a dedicated laptop sleeve and signature striped liner.",
    bulletPoints: ["25.5-liter capacity fits 15-inch laptop in padded sleeve","Signature striped fabric liner and woven label detail","Padded and breathable shoulder straps for all-day comfort","Side water bottle pockets for hydration on the go","Front accessory pocket organizes your everyday essentials","Magnetic closure clip for quick access","Available in 40+ color combinations"],
    specs: {"Brand":"Herschel","Model":"Classic","Volume":"25.5L","Laptop":"Up to 15 inches","Material":"600D Polyester","Dimensions":"18.0 x 11.5 x 6.0 inches","Weight":"0.69 kg"},
    createdAt: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "p38", category: "Fashion", brand: "Timex", title: "Timex Men's Weekender 40mm Watch with Stainless Steel Expansion Band",
    price: 35.00, originalPrice: null, rating: 4.5, reviewCount: 21345, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p38/400/400",
    images: ["https://picsum.photos/seed/p38/400/400","https://picsum.photos/seed/p38b/400/400"],
    description: "Timex Weekender with 40mm brass case, white dial, and Timex's iconic INDIGLO night-light for clear time-reading in low light.",
    bulletPoints: ["INDIGLO night-light illuminates the entire dial for easy reading in dark","40mm solid brass case with stainless steel expansion band","Precise quartz movement for accurate timekeeping","Water resistant to 30 meters (99 feet)","Interchangeable strap system — swap bands in seconds","Classic Timex style that pairs with any outfit","1-year limited warranty"],
    specs: {"Brand":"Timex","Model":"Weekender","Case Size":"40mm","Material":"Brass case, stainless steel band","Movement":"Quartz","Water Resistance":"30M","Night Light":"INDIGLO"},
    createdAt: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "p39", category: "Fashion", brand: "The North Face", title: "The North Face Men's Aconcagua 2 Puffer Jacket",
    price: 199.00, originalPrice: null, rating: 4.7, reviewCount: 8765, prime: true, inStock: true, stockCount: null,
    seller: "The North Face", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p39/400/400",
    images: ["https://picsum.photos/seed/p39/400/400","https://picsum.photos/seed/p39b/400/400","https://picsum.photos/seed/p39c/400/400"],
    description: "Lofty comfort meets environmental responsibility in The North Face Aconcagua 2 jacket made with recycled down insulation.",
    bulletPoints: ["700-fill Responsible Down Standard certified insulation for warmth","Packable design — folds into its own pocket for easy storage","Wind and water resistant exterior for weather protection","Recycled materials — body lining and insulation are recycled","Full-zip front with secure-zip chest pocket","Two zip hand pockets for storage and warmth","Machine washable for easy care"],
    specs: {"Brand":"The North Face","Insulation":"700-fill RDS certified down","Recycled":"Yes — lining and insulation","Water Resistance":"DWR finish","Packable":"Yes — packs into own pocket","Machine Wash":"Yes"},
    createdAt: "2024-02-10T00:00:00.000Z"
  },
  {
    id: "p40", category: "Fashion", brand: "New Balance", title: "New Balance Men's 574 V2 Evergreen Sneaker",
    price: 79.99, originalPrice: 89.99, rating: 4.6, reviewCount: 15678, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p40/400/400",
    images: ["https://picsum.photos/seed/p40/400/400","https://picsum.photos/seed/p40b/400/400","https://picsum.photos/seed/p40c/400/400"],
    description: "The New Balance 574 is a classic sneaker that's been in the lineup since 1988. The ENCAP midsole provides exceptional support and durability.",
    bulletPoints: ["ENCAP midsole technology combines EVA with polyurethane rim for support","Suede and mesh upper for comfort and breathability","Classic New Balance silhouette that goes with any outfit","Padded collar for a comfortable fit around the ankle","Available in wide widths for extra comfort","Iconic 'N' logo on the side","Rubber outsole for durable traction"],
    specs: {"Brand":"New Balance","Model":"574 V2","Midsole":"ENCAP","Upper":"Suede and mesh","Closure":"Lace-up","Width":"Regular, Wide","Surface":"All-terrain"},
    createdAt: "2024-01-10T00:00:00.000Z"
  },

  // Toys & Games (p41-p50)
  {
    id: "p41", category: "Toys & Games", brand: "LEGO", title: "LEGO Star Wars Millennium Falcon 75257 Building Kit (1353 Pieces)",
    price: 159.99, originalPrice: 169.99, rating: 4.9, reviewCount: 23456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller", "Xmazon's Choice"],
    image: "https://picsum.photos/seed/p41/400/400",
    images: ["https://picsum.photos/seed/p41/400/400","https://picsum.photos/seed/p41b/400/400","https://picsum.photos/seed/p41c/400/400","https://picsum.photos/seed/p41d/400/400"],
    description: "Build and display the iconic Millennium Falcon, the fastest ship in the galaxy, with this 1353-piece LEGO Star Wars set.",
    bulletPoints: ["1,353 pieces for a highly detailed, authentic Star Wars starship","Includes 7 minifigures: Han Solo, Chewbacca, Leia, C-3PO, and more","Features rotating gun turrets, lowering boarding ramp, and removable hull sections","Detailed interior with seating area, holographic game table, and engine room","Stands over 5 inches high, 17 inches long, and 11 inches wide when complete","For ages 9 and up — great for both kids and adults","Compatible with all LEGO building systems"],
    specs: {"Brand":"LEGO","Theme":"Star Wars","Piece Count":"1353","Minifigures":"7","Dimensions":"5 x 17 x 11 inches (completed)","Age Recommendation":"9+","Item Weight":"4.57 lbs"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p42", category: "Toys & Games", brand: "Hasbro", title: "Monopoly Classic Board Game for 2-6 Players",
    price: 19.99, originalPrice: null, rating: 4.7, reviewCount: 54321, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p42/400/400",
    images: ["https://picsum.photos/seed/p42/400/400","https://picsum.photos/seed/p42b/400/400","https://picsum.photos/seed/p42c/400/400"],
    description: "The world's most popular board game! Buy, sell, and scheme your way to becoming the wealthiest player in classic Monopoly.",
    bulletPoints: ["Classic Monopoly gameplay with original 1935 board design","Includes all classic components: board, dice, tokens, cards, houses, and hotels","Quick version instructions for a shorter 60-minute game","8 tokens including top hat, car, thimble, and more","2-6 players, ages 8+","Family board game night essential for over 85 years","Updated box design with easy-open packaging"],
    specs: {"Brand":"Hasbro","Players":"2-6","Age":"8+","Play Time":"60-180 minutes","Pieces":"Includes tokens, dice, cards, and money","Dimensions":"15.6 x 10.5 x 2.0 inches"},
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "p43", category: "Toys & Games", brand: "Nintendo", title: "Nintendo Switch Joy-Con (L/R) - Neon Blue and Neon Red",
    price: 79.99, originalPrice: null, rating: 4.6, reviewCount: 18923, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p43/400/400",
    images: ["https://picsum.photos/seed/p43/400/400","https://picsum.photos/seed/p43b/400/400","https://picsum.photos/seed/p43c/400/400"],
    description: "Official Nintendo Switch Joy-Con controllers with HD Rumble, IR motion camera, and built-in motion sensors.",
    bulletPoints: ["Official Nintendo Joy-Con pair — includes left and right controllers","HD Rumble provides subtle vibrations for immersive gameplay","IR Motion Camera detects shape and distance of nearby objects","Built-in motion sensors (accelerometer and gyroscope)","Wireless or wired play — attach to Switch or use wirelessly","NFC support for amiibo functionality","Approximately 20 hours of battery life per Joy-Con"],
    specs: {"Brand":"Nintendo","Compatibility":"Nintendo Switch","Color":"Neon Blue (L) / Neon Red (R)","Battery Life":"~20 hours","Connectivity":"Bluetooth","Features":"HD Rumble, IR Camera, NFC","Weight":"49g per controller"},
    createdAt: "2024-02-01T00:00:00.000Z"
  },
  {
    id: "p44", category: "Toys & Games", brand: "Barbie", title: "Barbie Dreamhouse (2023) Dollhouse with Pool, Slide, and 75+ Accessories",
    price: 179.99, originalPrice: 209.99, rating: 4.6, reviewCount: 12456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p44/400/400",
    images: ["https://picsum.photos/seed/p44/400/400","https://picsum.photos/seed/p44b/400/400","https://picsum.photos/seed/p44c/400/400"],
    description: "The ultimate Barbie Dreamhouse with 3 floors, 10 rooms, a working elevator, and over 75 pieces including furniture and accessories.",
    bulletPoints: ["3-story house with 10 play areas including kitchen, bedroom, bathroom, and more","Working elevator (hand-powered) connects all three floors","Pool with water slide for outdoor fun","75+ accessories include furniture, kitchen appliances, and decor","Compatible with all Barbie dolls (dolls sold separately)","Easy snap-together assembly (no tools required)","Lights and sounds in living room (requires batteries)"],
    specs: {"Brand":"Barbie","Floors":"3","Rooms":"10","Accessories":"75+","Height":"43 inches","Width":"41 inches","Depth":"11 inches","Age":"3+"},
    createdAt: "2024-01-25T00:00:00.000Z"
  },
  {
    id: "p45", category: "Toys & Games", brand: "Rubik's", title: "Rubik's Cube, The Original 3x3 Cube Classic Color Matching Puzzle",
    price: 9.99, originalPrice: null, rating: 4.7, reviewCount: 34521, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p45/400/400",
    images: ["https://picsum.photos/seed/p45/400/400","https://picsum.photos/seed/p45b/400/400"],
    description: "The Original Rubik's Cube — the classic 3x3 color-matching puzzle that has sold over 450 million units worldwide.",
    bulletPoints: ["The original 3x3 Rubik's Cube — 1 quintillion possible combinations","Over 450 million cubes sold worldwide since 1974","Smooth, effortless turning mechanism for fast solving","Durable plastic construction with vibrant colors that won't fade","Comes with a solution guide for beginners","Perfect brain-training toy for ages 8 and up","Learn the basic algorithms and impress your friends"],
    specs: {"Brand":"Rubik's","Type":"3x3 Cube","Pieces":"26 cubies","Combinations":"43 quintillion","Material":"ABS plastic","Age":"8+","Solution Guide":"Included"},
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "p46", category: "Toys & Games", brand: "Nerf", title: "Nerf N-Strike Elite AccuStrike AlphaHawk Blaster",
    price: 24.99, originalPrice: 34.99, rating: 4.5, reviewCount: 8765, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p46/400/400",
    images: ["https://picsum.photos/seed/p46/400/400","https://picsum.photos/seed/p46b/400/400"],
    description: "Fire AccuStrike darts for the most accurate Nerf shooting ever. Barrel-fed blaster fires darts one at a time.",
    bulletPoints: ["AccuStrike darts engineered for precision — the most accurate Nerf darts","12 AccuStrike darts included for accurate battling","Barrel-fed blaster accommodates single-dart firing","Flip-up sight for target acquisition","Integrated stock for steady shooting position","Compatible with all standard Nerf Elite darts","Easy prime mechanism for quick action"],
    specs: {"Brand":"Nerf","Series":"AccuStrike","Darts Included":"12","Firing Range":"Up to 75 feet","Compatible":"All standard Elite darts","Age":"8+"},
    createdAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "p47", category: "Toys & Games", brand: "Play-Doh", title: "Play-Doh Modeling Compound 36-Pack Case of Colors Non-Toxic",
    price: 19.99, originalPrice: null, rating: 4.8, reviewCount: 21345, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p47/400/400",
    images: ["https://picsum.photos/seed/p47/400/400","https://picsum.photos/seed/p47b/400/400"],
    description: "36 cans of vibrant Play-Doh compound in a rainbow of colors for imaginative play and creative expression.",
    bulletPoints: ["36 cans of Play-Doh compound in 36 different colors","Each can contains 1 oz of non-toxic Play-Doh","Mix colors to create custom shades and textures","Soft and safe — certified non-toxic and designed for children","Reusable airtight cans keep compound fresh between uses","Classic sensory play activity for creativity development","Perfect for parties, classrooms, and creative play sessions"],
    specs: {"Brand":"Play-Doh","Cans":"36","Size per Can":"1 oz","Non-Toxic":"Yes","Age":"2+","Storage":"Airtight resealable cans","Total Weight":"2.25 lbs"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p48", category: "Toys & Games", brand: "Hot Wheels", title: "Hot Wheels Track Builder Unlimited Rapid Crash Pack",
    price: 29.99, originalPrice: 39.99, rating: 4.5, reviewCount: 7654, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p48/400/400",
    images: ["https://picsum.photos/seed/p48/400/400","https://picsum.photos/seed/p48b/400/400"],
    description: "Build the ultimate crash course with the Hot Wheels Track Builder System. Includes a loop, launcher, and 2 Hot Wheels cars.",
    bulletPoints: ["Track Builder System lets you build, race, and crash","Includes 22-inch track sections, loop, launcher, and 2 cars","Connects to all Hot Wheels Track Builder sets","Adjustable launcher for controlled starts","Built-in stunt features for spectacular crashes","2 Hot Wheels 1:64 scale die-cast vehicles included","Works on floor and table surfaces"],
    specs: {"Brand":"Hot Wheels","Track Length":"22 inches (expandable)","Cars Included":"2","Compatible":"Track Builder System","Scale":"1:64 die-cast cars","Age":"4+"},
    createdAt: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "p49", category: "Toys & Games", brand: "Catan Studio", title: "Catan Board Game (Base Game) for 3-4 Players",
    price: 44.99, originalPrice: null, rating: 4.7, reviewCount: 32456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p49/400/400",
    images: ["https://picsum.photos/seed/p49/400/400","https://picsum.photos/seed/p49b/400/400","https://picsum.photos/seed/p49c/400/400"],
    description: "Trade, build, and settle the island of Catan in this award-winning strategy board game that's been captivating players since 1995.",
    bulletPoints: ["Multiple Strategy Game of the Year award winner","Race to build settlements, roads, and cities to earn 10 victory points","Every game is unique — modular board creates different islands each time","Trade resources with other players for needed materials","Expansion sets available to extend the game with more players","For 3-4 players, ages 10 and up, play time 60-120 minutes","Designed by Klaus Teuber — one of the most influential game designers"],
    specs: {"Brand":"Catan Studio","Players":"3-4 (5-6 with expansion)","Age":"10+","Play Time":"60-120 minutes","Type":"Strategy board game","Components":"Hexagonal tiles, cards, dice, player pieces"},
    createdAt: "2024-01-25T00:00:00.000Z"
  },
  {
    id: "p50", category: "Toys & Games", brand: "Melissa & Doug", title: "Melissa & Doug Wooden Farm Puzzle - 8-Piece Chunky",
    price: 12.99, originalPrice: null, rating: 4.8, reviewCount: 18765, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p50/400/400",
    images: ["https://picsum.photos/seed/p50/400/400","https://picsum.photos/seed/p50b/400/400"],
    description: "Chunky wooden puzzle with 8 farm-themed pieces sized perfectly for little hands. Features peg handles for easy lifting.",
    bulletPoints: ["8 chunky wooden pieces with peg handles for easy grasping","Colorful farm animal artwork encourages learning and recognition","Pieces fit into corresponding shaped holes in the puzzle board","Made from durable wood with non-toxic paint finishes","Helps develop fine motor skills, hand-eye coordination, and problem-solving","Jumbo-sized pieces perfect for toddlers","Ages 2+"],
    specs: {"Brand":"Melissa & Doug","Pieces":"8","Material":"Solid wood with non-toxic paint","Age":"2+","Dimensions":"11 x 8 x 0.75 inches","Weight":"0.75 lbs","Theme":"Farm animals"},
    createdAt: "2024-01-05T00:00:00.000Z"
  },

  // Beauty (p51-p60)
  {
    id: "p51", category: "Beauty", brand: "CeraVe", title: "CeraVe Moisturizing Cream - Daily Face and Body Moisturizer for Dry Skin",
    price: 16.99, originalPrice: null, rating: 4.8, reviewCount: 123456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller", "Xmazon's Choice"],
    image: "https://picsum.photos/seed/p51/400/400",
    images: ["https://picsum.photos/seed/p51/400/400","https://picsum.photos/seed/p51b/400/400","https://picsum.photos/seed/p51c/400/400"],
    description: "Developed with dermatologists, CeraVe Moisturizing Cream has a unique formula that helps restore the protective skin barrier with three essential ceramides.",
    bulletPoints: ["Restores and maintains the natural skin barrier with 3 essential ceramides","Hyaluronic acid retains skin's natural moisture","Non-comedogenic formula suitable for face and body","Fragrance-free, paraben-free, and allergy-tested","MVE technology continuously releases moisturizing ingredients over 24 hours","Suitable for sensitive skin and all skin types","Available in multiple sizes from 8 oz to 19 oz jar"],
    specs: {"Brand":"CeraVe","Size":"16 oz","Skin Type":"All (especially dry/sensitive)","Fragrance":"Fragrance-free","Paraben-free":"Yes","Tested":"Dermatologist tested","Active Ingredients":"Ceramides 1, 3, 6-II; Hyaluronic Acid"},
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "p52", category: "Beauty", brand: "Maybelline", title: "Maybelline Lash Sensational Sky High Washable Mascara",
    price: 11.99, originalPrice: null, rating: 4.5, reviewCount: 67234, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p52/400/400",
    images: ["https://picsum.photos/seed/p52/400/400","https://picsum.photos/seed/p52b/400/400"],
    description: "Sky High mascara with buildable volume and length for limitless lash looks. Flexible brush stretches lashes from root to tip.",
    bulletPoints: ["Bamboo extract formula with 0% parabens, fragrance, and alcohol","Flexible brush stretches to the outer edges for defined, separated lashes","Buildable formula for natural to full lash looks","Washable formula removes easily with warm water and face wash","No clumping, no smudging for all-day wear","Safe for sensitive eyes and contact lens wearers","Available in Blackest Black and Black for full, bold lashes"],
    specs: {"Brand":"Maybelline","Finish":"Volumizing and lengthening","Formula":"Washable","Fragrance":"Fragrance-free","Paraben":"Paraben-free","Eye Type":"Safe for sensitive eyes","Color":"Blackest Black"},
    createdAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "p53", category: "Beauty", brand: "Olaplex", title: "Olaplex No. 3 Hair Perfector - Reduces Breakage & Strengthens Hair",
    price: 30.00, originalPrice: null, rating: 4.6, reviewCount: 34521, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p53/400/400",
    images: ["https://picsum.photos/seed/p53/400/400","https://picsum.photos/seed/p53b/400/400","https://picsum.photos/seed/p53c/400/400"],
    description: "The at-home treatment that reduces breakage and visibly strengthens hair, significantly improving hair's health from the inside out.",
    bulletPoints: ["Patented bond building technology repairs and strengthens hair","Reduces breakage and split ends from the inside out","Used as a weekly treatment on towel-dried hair","Works on all hair types including color-treated and bleached hair","3.3 oz bottle provides approximately 8-10 uses","Free from sulfates, parabens, and phthalates","Salon-quality results at home — the #1 at-home treatment"],
    specs: {"Brand":"Olaplex","Size":"3.3 fl oz","Use":"Weekly treatment","Hair Type":"All types, especially color-treated","Sulfate-free":"Yes","Paraben-free":"Yes","Cruelty-free":"Yes"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p54", category: "Beauty", brand: "Neutrogena", title: "Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 70, 3 oz",
    price: 12.99, originalPrice: null, rating: 4.7, reviewCount: 45678, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p54/400/400",
    images: ["https://picsum.photos/seed/p54/400/400","https://picsum.photos/seed/p54b/400/400"],
    description: "Ultra Sheer Dry-Touch sunscreen with Helioplex technology provides superior sun protection that's light, clean, and non-greasy.",
    bulletPoints: ["SPF 70 broad spectrum protection against UVA and UVB rays","Helioplex technology for superior sun protection","Dry-Touch formula won't feel greasy or heavy on skin","Lightweight, non-comedogenic formula suitable for face and body","Water resistant for 80 minutes of swimming and sweating","Fragrance-free and PABA-free formula","The #1 dermatologist-recommended sunscreen brand"],
    specs: {"Brand":"Neutrogena","SPF":"70","Size":"3 oz","Spectrum":"Broad (UVA/UVB)","Water Resistant":"80 minutes","Fragrance":"Fragrance-free","Skin Type":"All skin types"},
    createdAt: "2024-01-20T00:00:00.000Z"
  },
  {
    id: "p55", category: "Beauty", brand: "Revlon", title: "Revlon One-Step Volumizer Original 1.0 Hair Dryer and Hot Air Brush",
    price: 34.99, originalPrice: 49.99, rating: 4.5, reviewCount: 89234, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Best Seller"],
    image: "https://picsum.photos/seed/p55/400/400",
    images: ["https://picsum.photos/seed/p55/400/400","https://picsum.photos/seed/p55b/400/400","https://picsum.photos/seed/p55c/400/400"],
    description: "Dry and style your hair in one step with this salon-style oval brush dryer that creates bouncy blowout volume.",
    bulletPoints: ["Two-in-one dryer and styler — dry and style simultaneously","Unique oval brush design adds volume and body","Ionic technology reduces frizz for smoother, shinier results","Three heat and speed settings: high, low, and cool shot","Tangle-free nylon bristles protect hair from breakage","75% faster drying time vs air drying","Works on all hair types and lengths"],
    specs: {"Brand":"Revlon","Wattage":"1000W","Heat Settings":"3 (high, low, cool)","Technology":"Ionic","Bristle Type":"Nylon","Cord Length":"7 feet","Weight":"1.0 lbs"},
    createdAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "p56", category: "Beauty", brand: "The Ordinary", title: "The Ordinary Niacinamide 10% + Zinc 1% Face Serum, 30ml",
    price: 12.50, originalPrice: null, rating: 4.4, reviewCount: 56789, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p56/400/400",
    images: ["https://picsum.photos/seed/p56/400/400","https://picsum.photos/seed/p56b/400/400"],
    description: "High-strength vitamin and mineral blemish formula that reduces the appearance of skin blemishes and congestion.",
    bulletPoints: ["10% Niacinamide reduces appearance of blemishes and pores","1% Zinc PCA balances sebum production for healthy-looking skin","Lightweight serum absorbs quickly without greasiness","Suitable for all skin types, especially oily and combination skin","Can be layered with other skincare products","Cruelty-free and vegan formula","Free from oil, silicone, nut allergens, gluten, and fragrance"],
    specs: {"Brand":"The Ordinary","Size":"30ml","Key Ingredients":"Niacinamide 10%, Zinc 1%","Skin Type":"All types (best for oily/combination)","Vegan":"Yes","Cruelty-free":"Yes","Fragrance":"Fragrance-free"},
    createdAt: "2024-01-25T00:00:00.000Z"
  },
  {
    id: "p57", category: "Beauty", brand: "NYX", title: "NYX Professional Makeup Lip Lingerie Push-Up Long-Lasting Lipstick",
    price: 9.99, originalPrice: null, rating: 4.4, reviewCount: 23456, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p57/400/400",
    images: ["https://picsum.photos/seed/p57/400/400","https://picsum.photos/seed/p57b/400/400"],
    description: "Slide on the NYX Lip Lingerie liquid lipstick for an ultra-matte finish in 20 seductive shades that lasts all day long.",
    bulletPoints: ["Ultra-matte liquid lipstick formula for long-lasting color","20+ shades from nude to bold for every skin tone","Lightweight formula won't dry out or crack lips","Precision doe-foot applicator for defined, outlined lips","Vegan formula — free from animal-derived ingredients","Paraben-free, fragrance-free, and dermatologist tested","Long-wearing formula stays put through eating and drinking"],
    specs: {"Brand":"NYX","Finish":"Ultra-matte","Formula":"Liquid lipstick","Vegan":"Yes","Paraben-free":"Yes","Applicator":"Doe-foot","Wear":"Long-lasting"},
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "p58", category: "Beauty", brand: "Dove", title: "Dove Deep Moisture Body Wash with Skin Natural Nourishers, 22 oz (Pack of 3)",
    price: 14.99, originalPrice: 19.99, rating: 4.7, reviewCount: 78234, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p58/400/400",
    images: ["https://picsum.photos/seed/p58/400/400","https://picsum.photos/seed/p58b/400/400"],
    description: "Dove Deep Moisture body wash is formulated with 100% skin natural nourishers and Dove's signature 1/4 moisturizing cream.",
    bulletPoints: ["Pack of 3 — 22 oz bottles each for great value","Made with 100% skin natural nourishers — no harsh chemicals","Dove's signature 1/4 moisturizing cream formula","Creamy lather nourishes skin like a moisturizer while cleaning","Dermatologist recommended and hypoallergenic","Sulfate-free formula gentle enough for sensitive skin","Leaves skin soft, smooth, and moisturized after every wash"],
    specs: {"Brand":"Dove","Pack":"3 x 22 oz","Formula":"Sulfate-free","Skin Type":"All types (especially dry)","Paraben-free":"Yes","Hypoallergenic":"Yes","Scent":"Gentle"},
    createdAt: "2024-01-05T00:00:00.000Z"
  },
  {
    id: "p59", category: "Beauty", brand: "Bioderma", title: "Bioderma Sensibio H2O Micellar Water Makeup Remover, 16.9 fl oz",
    price: 14.99, originalPrice: null, rating: 4.8, reviewCount: 32145, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: [],
    image: "https://picsum.photos/seed/p59/400/400",
    images: ["https://picsum.photos/seed/p59/400/400","https://picsum.photos/seed/p59b/400/400"],
    description: "The #1 micellar water in France, Bioderma Sensibio H2O gently yet effectively cleanses, removes makeup, and soothes sensitive skin.",
    bulletPoints: ["#1 micellar water sold in France for decades","Gently removes all makeup including waterproof mascara","No rinsing required — gentle enough to use with cotton pad","Specifically formulated for sensitive skin — dermatologist tested","Soothing formula respects the natural biology of skin","Fragrance-free, alcohol-free, and hypoallergenic","Works on face, lips, and around eyes safely"],
    specs: {"Brand":"Bioderma","Size":"500ml / 16.9 fl oz","Skin Type":"Sensitive","Fragrance":"Fragrance-free","Alcohol":"Alcohol-free","Hypoallergenic":"Yes","Use":"Makeup remover / cleanser"},
    createdAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "p60", category: "Beauty", brand: "OPI", title: "OPI Nail Lacquer 10-pc Nail Polish Set - Most Popular Colors",
    price: 24.99, originalPrice: 39.90, rating: 4.6, reviewCount: 14523, prime: true, inStock: true, stockCount: null,
    seller: "Amazon.com", badges: ["Xmazon's Choice"],
    image: "https://picsum.photos/seed/p60/400/400",
    images: ["https://picsum.photos/seed/p60/400/400","https://picsum.photos/seed/p60b/400/400","https://picsum.photos/seed/p60c/400/400"],
    description: "A curated set of 10 of OPI's most popular Nail Lacquer shades, featuring the iconic ProWide brush for a flawless, salon-perfect finish.",
    bulletPoints: ["Set of 10 full-size 0.5 fl oz bottles of OPI Nail Lacquer","Features OPI's most iconic and beloved shades","ProWide Brush for full coverage in fewer strokes","Chip-resistant formula lasts up to 7 days without chipping","Built-in base coat for added protection and adhesion","Free from DBP, Toluene, and Formaldehyde","All shades coordinate with OPI Gel Color for gel manicures"],
    specs: {"Brand":"OPI","Set":"10 bottles","Size per Bottle":"0.5 fl oz / 15ml","Finish":"Glossy","Chip Resistant":"Up to 7 days","Toxic Chemicals":"3-Free formula","Brush":"ProWide"},
    createdAt: "2024-01-20T00:00:00.000Z"
  }
];

export const INITIAL_USER = {
  id: "u1",
  name: "Demo User",
  email: "demo@example.com",
  address: {
    id: "addr1",
    fullName: "Demo User",
    street: "123 Mock Lane",
    city: "Seattle",
    state: "WA",
    zip: "98109",
    country: "United States",
    phone: "555-0123",
    isDefault: true
  },
  addresses: [
    {
      id: "addr1",
      fullName: "Demo User",
      street: "123 Mock Lane",
      city: "Seattle",
      state: "WA",
      zip: "98109",
      country: "United States",
      phone: "555-0123",
      isDefault: true
    }
  ],
  paymentMethod: {
    id: "pm1",
    last4: "4242",
    brand: "Visa",
    expiry: "12/26",
    isDefault: true
  },
  paymentMethods: [
    {
      id: "pm1",
      last4: "4242",
      brand: "Visa",
      expiry: "12/26",
      isDefault: true
    }
  ]
};

const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const today = new Date().toISOString();

const SEED_ORDERS = [
  {
    id: "ord-seed-1",
    date: twoWeeksAgo,
    status: "Delivered",
    total: 199.98,
    items: [{ productId: "p1", quantity: 1 }, { productId: "p34", quantity: 1 }],
    shippingAddress: { ...INITIAL_USER.address },
    paymentMethod: { ...INITIAL_USER.paymentMethod },
    trackingNumber: "1Z999AA10123456784",
    estimatedDelivery: null
  },
  {
    id: "ord-seed-2",
    date: threeDaysAgo,
    status: "Shipped",
    total: 49.99,
    items: [{ productId: "p4", quantity: 1 }],
    shippingAddress: { ...INITIAL_USER.address },
    paymentMethod: { ...INITIAL_USER.paymentMethod },
    trackingNumber: "9400111899223404793357",
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  {
    id: "ord-seed-3",
    date: today,
    status: "Processing",
    total: 319.97,
    items: [{ productId: "p7", quantity: 1 }, { productId: "p23", quantity: 1 }, { productId: "p11", quantity: 1 }],
    shippingAddress: { ...INITIAL_USER.address },
    paymentMethod: { ...INITIAL_USER.paymentMethod },
    trackingNumber: null,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
];

const SEED_REVIEWS = [
  { id: "rev-1", productId: "p1", userId: "u1", userName: "TechEnthusiast92", rating: 5, title: "Best earbuds I've ever owned!", content: "The noise cancellation is absolutely incredible. I use these every day on my commute and they block out everything. Battery life is great too — I only charge them once a week.", date: "2024-10-20T00:00:00.000Z", helpful: 47, verifiedPurchase: true },
  { id: "rev-2", productId: "p1", userId: "u2", userName: "MusicLover_PDX", rating: 4, title: "Great sound, minor fit issue", content: "Sound quality is phenomenal and the ANC works well. The only issue is they fall out during intense workouts. For everyday use they're perfect. Would definitely recommend.", date: "2024-11-01T00:00:00.000Z", helpful: 23, verifiedPurchase: true },
  { id: "rev-3", productId: "p3", userId: "u3", userName: "AudioPhile_Jake", rating: 5, title: "Industry-leading noise cancellation — lived up to the hype", content: "I've tried many premium headphones and the Sony XM5 are on a different level. The ANC is genuinely magical. I work in an open office and these have changed my work life. 30-hour battery is a game changer.", date: "2024-09-15T00:00:00.000Z", helpful: 89, verifiedPurchase: true },
  { id: "rev-4", productId: "p11", userId: "u4", userName: "HabitBuilder2024", rating: 5, title: "Life-changing book — read it twice already", content: "Atomic Habits is the most practical self-help book I've read. The Four Laws of Behavior Change give you a real framework to work with. I've applied the principles to exercise, reading, and work habits. Highly recommend to everyone.", date: "2024-08-20T00:00:00.000Z", helpful: 134, verifiedPurchase: true },
  { id: "rev-5", productId: "p11", userId: "u5", userName: "ProductivityNerd", rating: 4, title: "Solid book with great frameworks", content: "Very well written and backed by research. The identity-based habits concept really clicked for me. Some sections feel repetitive but the core message is powerful. Great gift for anyone looking to make positive changes.", date: "2024-09-10T00:00:00.000Z", helpful: 56, verifiedPurchase: true },
  { id: "rev-6", productId: "p21", userId: "u6", userName: "HomeCookSusan", rating: 5, title: "Best kitchen purchase of the year!", content: "This air fryer has completely changed how I cook. French fries come out perfectly crispy with barely any oil. It heats up in under 3 minutes and the ceramic basket is easy to clean. My whole family loves the food that comes out of it.", date: "2024-10-05T00:00:00.000Z", helpful: 78, verifiedPurchase: true },
  { id: "rev-7", productId: "p23", userId: "u7", userName: "BusyParentOf3", rating: 5, title: "Saves so much time during the week", content: "The Instant Pot has transformed weeknight dinners. I can have a full pot roast done in 45 minutes. The yogurt function is a bonus I didn't expect to use but now make yogurt every week. Solidly built and the app has tons of recipes.", date: "2024-07-18T00:00:00.000Z", helpful: 102, verifiedPurchase: true },
  { id: "rev-8", productId: "p23", userId: "u8", userName: "MealPrepQueen", rating: 4, title: "Great for meal prep, slight learning curve", content: "Love this for batch cooking on Sundays. Beans, soups, rice — all come out great. The learning curve for getting the timing right took a few tries. The manual could be clearer. Overall a fantastic purchase for anyone who cooks regularly.", date: "2024-08-30T00:00:00.000Z", helpful: 43, verifiedPurchase: true },
  { id: "rev-9", productId: "p29", userId: "u9", userName: "CastIronConvert", rating: 5, title: "Bought this 3 years ago, still perfect", content: "I was skeptical about cast iron but this Lodge skillet converted me. Sears meat better than any pan I own. Gets better with every use. The seasoning is now absolutely non-stick. Worth every penny and will last a lifetime.", date: "2024-06-12T00:00:00.000Z", helpful: 211, verifiedPurchase: true },
  { id: "rev-10", productId: "p31", userId: "u10", userName: "SneakerCollector", rating: 5, title: "Timeless classic — worth every dollar", content: "AF1s never go out of style. These are my third pair and the quality has remained consistent. The leather is durable, they're comfortable enough to wear all day, and they go with everything. Classic for a reason.", date: "2024-10-15T00:00:00.000Z", helpful: 67, verifiedPurchase: true },
  { id: "rev-11", productId: "p41", userId: "u11", userName: "LEGODadOf2", rating: 5, title: "Amazing build, worth the price", content: "Built this with my 11-year-old over a weekend. The details are incredible — the landing ramp, turrets, and interior really capture the Falcon. My son hasn't stopped playing with it since. The minifigures are great too. LEGO quality never disappoints.", date: "2024-11-20T00:00:00.000Z", helpful: 89, verifiedPurchase: true },
  { id: "rev-12", productId: "p51", userId: "u12", userName: "SkinCareBeliever", rating: 5, title: "My dermatologist recommended this and it's perfect", content: "I've had dry skin issues for years and tried countless moisturizers. CeraVe is the only one that actually fixes the problem rather than just masking it. The ceramides make a real difference. I use it morning and night and my skin has never looked better.", date: "2024-09-25T00:00:00.000Z", helpful: 156, verifiedPurchase: true },
  { id: "rev-13", productId: "p51", userId: "u13", userName: "SensitiveSkinSam", rating: 5, title: "Finally found something that works for sensitive skin", content: "I've tried so many moisturizers that break me out. CeraVe is fragrance-free, non-comedogenic, and genuinely moisturizes without clogging pores. My eczema-prone skin has been much calmer since I switched. The large jar lasts a long time too.", date: "2024-10-08T00:00:00.000Z", helpful: 93, verifiedPurchase: true },
  { id: "rev-14", productId: "p12", userId: "u14", userName: "SciFiBookworm", rating: 5, title: "Couldn't put it down — read it in 2 days", content: "Project Hail Mary is the most fun I've had reading in years. The science is fascinating and Ryland Grace is such a great character. The friendship at the heart of the story is genuinely moving. Andy Weir did it again. Better than The Martian in my opinion.", date: "2024-08-14T00:00:00.000Z", helpful: 147, verifiedPurchase: true },
  { id: "rev-15", productId: "p22", userId: "u15", userName: "CoffeeLover_Seattle", rating: 4, title: "Convenient and makes decent coffee", content: "The Keurig is very convenient for quick cups. Brews fast and the programmable auto-on is a great feature. The coffee quality isn't quite as good as a pour-over but it's perfect for busy mornings. The large reservoir means I don't refill it constantly.", date: "2024-07-30T00:00:00.000Z", helpful: 38, verifiedPurchase: true },
  { id: "rev-16", productId: "p55", userId: "u16", userName: "CurlyHairCarla", rating: 4, title: "Good but takes practice to master", content: "The One-Step Volumizer gives great results once you learn the technique. My hair comes out shiny and smooth. It does take some practice to get the right angle and motion. Saved me so much time compared to using a regular dryer and brush separately.", date: "2024-10-22T00:00:00.000Z", helpful: 52, verifiedPurchase: true },
  { id: "rev-17", productId: "p49", userId: "u17", userName: "BoardGameNightHost", rating: 5, title: "Perfect game for family gatherings", content: "Catan is our go-to game for when we have 3-4 people. The strategy depth keeps it interesting even after dozens of plays. The variable board setup means every game is different. Easy to teach new players — we taught two friends in 10 minutes.", date: "2024-09-05T00:00:00.000Z", helpful: 74, verifiedPurchase: true },
  { id: "rev-18", productId: "p2", userId: "u18", userName: "RemoteWorkerPro", rating: 5, title: "Best laptop I've ever owned — M2 is a game changer", content: "The battery life on this MacBook Air is unreal. I go all day without charging. The M2 chip handles everything I throw at it — video editing, multiple virtual machines, dozens of browser tabs. Incredibly thin and light. Worth every penny for the productivity boost.", date: "2024-11-10T00:00:00.000Z", helpful: 201, verifiedPurchase: true },
  { id: "rev-19", productId: "p2", userId: "u19", userName: "StudentTechReview", rating: 4, title: "Great for school, minor storage concern", content: "Excellent laptop for a student. Fast, lightweight, and the battery gets me through full school days. My only complaint is that 256GB fills up quickly if you have a lot of media. I'd recommend the 512GB if you can afford it. Otherwise nearly perfect.", date: "2024-10-30T00:00:00.000Z", helpful: 88, verifiedPurchase: true },
  { id: "rev-20", productId: "p3", userId: "u20", userName: "FrequentFlyer_Marcus", rating: 3, title: "Great sound, disappointing call quality", content: "The audio quality for music is excellent and noise cancellation is among the best. However, I was disappointed by the call quality — my callers frequently tell me my voice sounds muffled. For calls I actually prefer my older QC35s. Music listening: 5 stars. Calls: 2 stars.", date: "2024-11-05T00:00:00.000Z", helpful: 62, verifiedPurchase: true }
];

export const INITIAL_DATA = {
  products: HAND_CRAFTED_PRODUCTS,
  user: INITIAL_USER,
  cart: [
    { productId: "p1", quantity: 1 },
    { productId: "p22", quantity: 2 }
  ],
  wishlist: ["p5", "p12", "p37"],
  savedForLater: [],
  orders: SEED_ORDERS,
  reviews: SEED_REVIEWS,
  recentSearches: ["wireless headphones", "coffee maker", "running shoes", "laptop stand", "kindle"],
  recentlyViewed: ["p3", "p7", "p15", "p22", "p41"]
};

// --- Session-based state isolation ---

const BASE_STORAGE_KEY = 'amazon_mock_state';
const BASE_INITIAL_KEY = 'amazon_mock_state_initialState';

function storageKey(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
function initialKey(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const resp = await fetch(url);
    if (resp.ok) { const d = await resp.json(); if (d.has_custom_state && d.stored_state) return d.stored_state; }
  } catch(e) { console.warn('[amazon_mock] fetchCustomState error:', e); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(e => console.warn('[amazon_mock] saveState sync error:', e));
};

export const getInitialState = (sid = null) => {
  const s = localStorage.getItem(initialKey(sid)); return s ? JSON.parse(s) : null;
};

export function createDefaultData() {
  return { ...INITIAL_DATA, savedForLater: [] };
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid), ik = initialKey(sid);
  if (customState) {
    const data = deepMergeWithDefaults(createDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }
  const stored = localStorage.getItem(sk);
  if (stored) { if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored); return JSON.parse(stored); }
  const data = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

// --- Data normalizers for malformed POST data ---

function normalizeProduct(product, index) {
  const p = (typeof product === 'object' && product !== null) ? product : {};
  const price = typeof p.price === 'number' ? p.price : (typeof p.price === 'string' ? parseFloat(p.price) || 0 : 0);
  const originalPrice = typeof p.originalPrice === 'number' ? p.originalPrice : (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) || null : null);
  const rating = typeof p.rating === 'number' ? p.rating : (typeof p.rating === 'string' ? parseFloat(p.rating) || 0 : 0);
  const reviewCount = typeof p.reviewCount === 'number' ? p.reviewCount : (typeof p.reviewCount === 'string' ? parseInt(p.reviewCount, 10) || 0 : 0);
  const stockCount = typeof p.stockCount === 'number' ? p.stockCount : (typeof p.stockCount === 'string' ? parseInt(p.stockCount, 10) || null : null);
  return {
    id: p.id || `prod_custom_${index}`,
    title: p.title || p.name || '(No Title)',
    price,
    originalPrice: originalPrice,
    rating: Math.min(Math.max(rating, 0), 5),
    reviewCount: Math.max(reviewCount, 0),
    image: p.image || p.img || p.imageUrl || '',
    images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []),
    description: p.description || p.desc || '',
    bulletPoints: Array.isArray(p.bulletPoints) ? p.bulletPoints : [],
    specs: (typeof p.specs === 'object' && p.specs !== null && !Array.isArray(p.specs)) ? p.specs : {},
    category: p.category || 'Electronics',
    brand: p.brand || 'Generic',
    prime: typeof p.prime === 'boolean' ? p.prime : !!p.prime,
    inStock: typeof p.inStock === 'boolean' ? p.inStock : true,
    stockCount: stockCount,
    seller: p.seller || 'Amazon.com',
    badges: Array.isArray(p.badges) ? p.badges : [],
    createdAt: p.createdAt || new Date().toISOString(),
  };
}

function normalizeCartItem(item, index) {
  const it = (typeof item === 'object' && item !== null) ? item : {};
  const quantity = typeof it.quantity === 'number' ? it.quantity : (typeof it.quantity === 'string' ? parseInt(it.quantity, 10) || 1 : 1);
  return {
    productId: it.productId || it.product_id || it.id || `prod_custom_${index}`,
    quantity: Math.max(quantity, 1),
  };
}

function normalizeWishlistItem(item) {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) return item.productId || item.product_id || item.id || '';
  return String(item);
}

function normalizeOrder(order, index) {
  const o = (typeof order === 'object' && order !== null) ? order : {};
  const total = typeof o.total === 'number' ? o.total : (typeof o.total === 'string' ? parseFloat(o.total) || 0 : 0);
  const items = Array.isArray(o.items) ? o.items.map((it, i) => normalizeCartItem(it, i)) : [];
  const addr = (typeof o.shippingAddress === 'object' && o.shippingAddress !== null) ? o.shippingAddress : {};
  const payment = (typeof o.paymentMethod === 'object' && o.paymentMethod !== null) ? o.paymentMethod : {};
  return {
    id: o.id || `ord_custom_${index}`,
    date: o.date || new Date().toISOString(),
    status: o.status || 'Processing',
    total,
    shippingAddress: {
      fullName: addr.fullName || addr.name || 'Unknown',
      street: addr.street || addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || addr.zipCode || addr.postalCode || '',
      country: addr.country || 'United States',
      phone: addr.phone || '',
    },
    items,
    paymentMethod: {
      last4: payment.last4 || '0000',
      brand: payment.brand || payment.type || 'Card',
    },
    trackingNumber: o.trackingNumber || null,
    estimatedDelivery: o.estimatedDelivery || null,
  };
}

function normalizeReview(review, index) {
  const r = (typeof review === 'object' && review !== null) ? review : {};
  const rating = typeof r.rating === 'number' ? r.rating : (typeof r.rating === 'string' ? parseFloat(r.rating) || 0 : 0);
  const helpful = typeof r.helpful === 'number' ? r.helpful : (typeof r.helpful === 'string' ? parseInt(r.helpful, 10) || 0 : 0);
  return {
    id: r.id || `rev_custom_${index}`,
    productId: r.productId || r.product_id || '',
    userId: r.userId || r.user_id || 'anonymous',
    userName: r.userName || r.user_name || r.author || 'Xmazon Customer',
    rating: Math.min(Math.max(rating, 0), 5),
    title: r.title || r.headline || '',
    content: r.content || r.body || r.text || '',
    date: r.date || new Date().toISOString(),
    helpful: Math.max(helpful, 0),
    verifiedPurchase: typeof r.verifiedPurchase === 'boolean' ? r.verifiedPurchase : true,
  };
}

function normalizeSavedForLaterItem(item, index) {
  return normalizeCartItem(item, index);
}

function normalizeRecentSearch(item) {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) return item.term || item.query || item.text || String(item);
  return String(item);
}

function normalizeRecentlyViewedItem(item) {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) return item.productId || item.product_id || item.id || '';
  return String(item);
}

const ARRAY_NORMALIZERS = {
  products: normalizeProduct,
  cart: normalizeCartItem,
  wishlist: normalizeWishlistItem,
  orders: normalizeOrder,
  reviews: normalizeReview,
  savedForLater: normalizeSavedForLaterItem,
  recentSearches: normalizeRecentSearch,
  recentlyViewed: normalizeRecentlyViewedItem,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && ARRAY_NORMALIZERS[key]) {
        result[key] = custom[key].map((item, index) => ARRAY_NORMALIZERS[key](item, index));
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else { result[key] = custom[key]; }
    }
  }
  return result;
}
