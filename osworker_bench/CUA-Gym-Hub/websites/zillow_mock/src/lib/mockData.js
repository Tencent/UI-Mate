const getDefaultData = () => ({
  user: {
    userId: "user-1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "(415) 555-0142",
    avatar: null,
    isSignedIn: false,
    savedProperties: ["prop-2", "prop-5", "prop-8"],
    savedSearches: ["search-1", "search-2"],
    recentlyViewed: ["prop-1", "prop-3", "prop-7", "prop-12"]
  },
  filters: {
    search: '',
    listingStatus: 'For Sale',
    minPrice: 0,
    maxPrice: 10000000,
    minBeds: 0,
    minBaths: 0,
    minSqft: 0,
    maxSqft: 100000,
    type: 'All',
    features: [],
    sortBy: 'Homes for You'
  },
  properties: [
    // === FOR SALE - HOUSES (8) ===
    {
      id: "prop-1",
      zpid: "29384756",
      address: "2847 Pacific Avenue",
      city: "San Francisco",
      state: "CA",
      zip: "94115",
      neighborhood: "Pacific Heights",
      price: 2450000,
      zestimate: 2510000,
      zestimateRange: { low: 2380000, high: 2640000 },
      rentZestimate: 8500,
      beds: 5,
      baths: 3.5,
      sqft: 3200,
      lotSize: 3800,
      yearBuilt: 1912,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 8,
      description: "Magnificent Pacific Heights Victorian with sweeping Bay views. Recently renovated chef's kitchen with marble countertops, original hardwood floors, and a private garden.",
      features: ["Bay View", "Hardwood Floors", "Fireplace", "Garden", "Garage", "Wine Cellar"],
      coordinates: [37.7920, -122.4350],
      images: [
        "https://picsum.photos/seed/p1a/800/600",
        "https://picsum.photos/seed/p1b/800/600",
        "https://picsum.photos/seed/p1c/800/600",
        "https://picsum.photos/seed/p1d/800/600",
        "https://picsum.photos/seed/p1e/800/600"
      ],
      agentId: "agent-1",
      tags: ["Open House"],
      openHouse: "Sat 1-4pm",
      hoaFee: null,
      propertyTax: 24500,
      walkScore: 92,
      transitScore: 85,
      bikeScore: 72,
      priceHistory: [
        { date: "2024-11-01", event: "Listed for sale", price: 2450000, source: "MLS" },
        { date: "2018-06-15", event: "Sold", price: 1950000, source: "Public Record" },
        { date: "2010-03-20", event: "Sold", price: 1420000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 24500, taxAssessment: 2040000 },
        { year: 2022, propertyTax: 23800, taxAssessment: 1980000 },
        { year: 2021, propertyTax: 23100, taxAssessment: 1920000 }
      ],
      schools: [
        { name: "Sherman Elementary", level: "Elementary", grades: "K-5", rating: 8, distance: "0.3 mi", type: "Public" },
        { name: "Marina Middle School", level: "Middle", grades: "6-8", rating: 7, distance: "0.8 mi", type: "Public" },
        { name: "Galileo Academy", level: "High", grades: "9-12", rating: 7, distance: "1.1 mi", type: "Public" }
      ],
      estimatedPayment: { total: 14200, principalAndInterest: 10800, propertyTax: 2042, homeInsurance: 1020, hoa: 0, mortgageInsurance: 0 }
    },
    {
      id: "prop-2",
      zpid: "29384801",
      address: "1456 Noe Street",
      city: "San Francisco",
      state: "CA",
      zip: "94131",
      neighborhood: "Noe Valley",
      price: 1650000,
      zestimate: 1680000,
      zestimateRange: { low: 1590000, high: 1760000 },
      rentZestimate: 6200,
      beds: 3,
      baths: 2,
      sqft: 1850,
      lotSize: 2800,
      yearBuilt: 1923,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 14,
      description: "Charming Noe Valley home on a tree-lined street. Bright living spaces, updated kitchen, and a sunny backyard perfect for entertaining.",
      features: ["Backyard", "Updated Kitchen", "Hardwood Floors", "Skylights", "Washer/Dryer"],
      coordinates: [37.7502, -122.4320],
      images: [
        "https://picsum.photos/seed/p2a/800/600",
        "https://picsum.photos/seed/p2b/800/600",
        "https://picsum.photos/seed/p2c/800/600",
        "https://picsum.photos/seed/p2d/800/600"
      ],
      agentId: "agent-2",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: 16800,
      walkScore: 95,
      transitScore: 78,
      bikeScore: 82,
      priceHistory: [
        { date: "2024-10-18", event: "Listed for sale", price: 1695000, source: "MLS" },
        { date: "2024-10-28", event: "Price change", price: 1650000, source: "MLS" },
        { date: "2015-08-22", event: "Sold", price: 1180000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 16800, taxAssessment: 1400000 },
        { year: 2022, propertyTax: 16300, taxAssessment: 1360000 },
        { year: 2021, propertyTax: 15800, taxAssessment: 1320000 }
      ],
      schools: [
        { name: "Alvarado Elementary", level: "Elementary", grades: "K-5", rating: 9, distance: "0.4 mi", type: "Public" },
        { name: "James Lick Middle", level: "Middle", grades: "6-8", rating: 6, distance: "1.0 mi", type: "Public" },
        { name: "Mission High School", level: "High", grades: "9-12", rating: 5, distance: "1.3 mi", type: "Public" }
      ],
      estimatedPayment: { total: 9800, principalAndInterest: 7300, propertyTax: 1400, homeInsurance: 690, hoa: 0, mortgageInsurance: 0 }
    },
    {
      id: "prop-3",
      zpid: "29384902",
      address: "3721 Irving Street",
      city: "San Francisco",
      state: "CA",
      zip: "94122",
      neighborhood: "Sunset",
      price: 1250000,
      zestimate: 1280000,
      zestimateRange: { low: 1200000, high: 1350000 },
      rentZestimate: 4800,
      beds: 3,
      baths: 2,
      sqft: 1650,
      lotSize: 2500,
      yearBuilt: 1940,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 2,
      description: "Well-maintained Sunset district home close to Golden Gate Park. Original charm with modern updates including a new roof and tankless water heater.",
      features: ["Near Park", "New Roof", "Garage", "Hardwood Floors", "Deck"],
      coordinates: [37.7630, -122.4750],
      images: [
        "https://picsum.photos/seed/p3a/800/600",
        "https://picsum.photos/seed/p3b/800/600",
        "https://picsum.photos/seed/p3c/800/600",
        "https://picsum.photos/seed/p3d/800/600"
      ],
      agentId: "agent-3",
      tags: ["New Listing"],
      openHouse: null,
      hoaFee: null,
      propertyTax: 12800,
      walkScore: 88,
      transitScore: 65,
      bikeScore: 70,
      priceHistory: [
        { date: "2024-11-06", event: "Listed for sale", price: 1250000, source: "MLS" },
        { date: "2005-04-10", event: "Sold", price: 620000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 12800, taxAssessment: 1070000 },
        { year: 2022, propertyTax: 12400, taxAssessment: 1035000 },
        { year: 2021, propertyTax: 12000, taxAssessment: 1000000 }
      ],
      schools: [
        { name: "Sunset Elementary", level: "Elementary", grades: "K-5", rating: 7, distance: "0.5 mi", type: "Public" },
        { name: "Giannini Middle", level: "Middle", grades: "6-8", rating: 6, distance: "0.9 mi", type: "Public" },
        { name: "Lincoln High School", level: "High", grades: "9-12", rating: 7, distance: "1.2 mi", type: "Public" }
      ],
      estimatedPayment: { total: 7500, principalAndInterest: 5600, propertyTax: 1067, homeInsurance: 525, hoa: 0, mortgageInsurance: 0 }
    },
    {
      id: "prop-4",
      zpid: "29385010",
      address: "1892 Chestnut Street",
      city: "San Francisco",
      state: "CA",
      zip: "94123",
      neighborhood: "Marina",
      price: 1975000,
      zestimate: 2020000,
      zestimateRange: { low: 1920000, high: 2120000 },
      rentZestimate: 7200,
      beds: 4,
      baths: 3,
      sqft: 2400,
      lotSize: 3200,
      yearBuilt: 1935,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 21,
      description: "Elegant Marina home with two fireplaces and views of the Golden Gate Bridge from the rooftop deck. Recently upgraded plumbing and electrical.",
      features: ["Rooftop Deck", "GG Bridge View", "Fireplace", "Updated Systems", "Garage"],
      coordinates: [37.8005, -122.4370],
      images: [
        "https://picsum.photos/seed/p4a/800/600",
        "https://picsum.photos/seed/p4b/800/600",
        "https://picsum.photos/seed/p4c/800/600",
        "https://picsum.photos/seed/p4d/800/600",
        "https://picsum.photos/seed/p4e/800/600"
      ],
      agentId: "agent-1",
      tags: ["Price Cut"],
      openHouse: null,
      hoaFee: null,
      propertyTax: 20200,
      walkScore: 96,
      transitScore: 80,
      bikeScore: 85,
      priceHistory: [
        { date: "2024-10-10", event: "Listed for sale", price: 2100000, source: "MLS" },
        { date: "2024-10-31", event: "Price change", price: 1975000, source: "MLS" },
        { date: "2020-01-15", event: "Sold", price: 1720000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 20200, taxAssessment: 1685000 },
        { year: 2022, propertyTax: 19600, taxAssessment: 1635000 },
        { year: 2021, propertyTax: 19000, taxAssessment: 1585000 }
      ],
      schools: [
        { name: "Sherman Elementary", level: "Elementary", grades: "K-5", rating: 8, distance: "0.4 mi", type: "Public" },
        { name: "Marina Middle School", level: "Middle", grades: "6-8", rating: 7, distance: "0.6 mi", type: "Public" },
        { name: "Galileo Academy", level: "High", grades: "9-12", rating: 7, distance: "0.9 mi", type: "Public" }
      ],
      estimatedPayment: { total: 11600, principalAndInterest: 8700, propertyTax: 1683, homeInsurance: 830, hoa: 0, mortgageInsurance: 0 }
    },
    {
      id: "prop-5",
      zpid: "29385105",
      address: "5234 Locksley Avenue",
      city: "Oakland",
      state: "CA",
      zip: "94618",
      neighborhood: "Rockridge",
      price: 1450000,
      zestimate: 1490000,
      zestimateRange: { low: 1410000, high: 1570000 },
      rentZestimate: 5500,
      beds: 4,
      baths: 2.5,
      sqft: 2100,
      lotSize: 5200,
      yearBuilt: 1928,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 5,
      description: "Beautiful Rockridge Craftsman with period details intact. Spacious eat-in kitchen, mature fruit trees, and proximity to College Avenue shops.",
      features: ["Craftsman Style", "Fruit Trees", "Large Lot", "Hardwood Floors", "Fireplace", "Deck"],
      coordinates: [37.8440, -122.2510],
      images: [
        "https://picsum.photos/seed/p5a/800/600",
        "https://picsum.photos/seed/p5b/800/600",
        "https://picsum.photos/seed/p5c/800/600",
        "https://picsum.photos/seed/p5d/800/600"
      ],
      agentId: "agent-4",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: 14800,
      walkScore: 90,
      transitScore: 72,
      bikeScore: 88,
      priceHistory: [
        { date: "2024-11-03", event: "Listed for sale", price: 1450000, source: "MLS" },
        { date: "2016-09-30", event: "Sold", price: 980000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 14800, taxAssessment: 1235000 },
        { year: 2022, propertyTax: 14300, taxAssessment: 1195000 },
        { year: 2021, propertyTax: 13900, taxAssessment: 1155000 }
      ],
      schools: [
        { name: "Chabot Elementary", level: "Elementary", grades: "K-5", rating: 9, distance: "0.3 mi", type: "Public" },
        { name: "Claremont Middle", level: "Middle", grades: "6-8", rating: 8, distance: "0.7 mi", type: "Public" },
        { name: "Oakland Tech", level: "High", grades: "9-12", rating: 6, distance: "1.5 mi", type: "Public" }
      ],
      estimatedPayment: { total: 8700, principalAndInterest: 6400, propertyTax: 1233, homeInsurance: 610, hoa: 0, mortgageInsurance: 0 }
    },
    {
      id: "prop-6",
      zpid: "29385208",
      address: "1027 Euclid Avenue",
      city: "Berkeley",
      state: "CA",
      zip: "94708",
      neighborhood: "North Berkeley",
      price: 1780000,
      zestimate: 1820000,
      zestimateRange: { low: 1730000, high: 1910000 },
      rentZestimate: 6800,
      beds: 4,
      baths: 3,
      sqft: 2600,
      lotSize: 6500,
      yearBuilt: 1920,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 1,
      description: "Stunning North Berkeley brown shingle with panoramic Bay views. Lush terraced garden, formal dining room, and sunlit artist studio.",
      features: ["Bay View", "Garden", "Artist Studio", "Formal Dining", "Hardwood Floors", "Fireplace"],
      coordinates: [37.8850, -122.2630],
      images: [
        "https://picsum.photos/seed/p6a/800/600",
        "https://picsum.photos/seed/p6b/800/600",
        "https://picsum.photos/seed/p6c/800/600",
        "https://picsum.photos/seed/p6d/800/600",
        "https://picsum.photos/seed/p6e/800/600",
        "https://picsum.photos/seed/p6f/800/600"
      ],
      agentId: "agent-5",
      tags: ["New Listing", "Hot Home"],
      openHouse: "Sun 2-5pm",
      hoaFee: null,
      propertyTax: 18200,
      walkScore: 82,
      transitScore: 60,
      bikeScore: 90,
      priceHistory: [
        { date: "2024-11-07", event: "Listed for sale", price: 1780000, source: "MLS" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 18200, taxAssessment: 1520000 },
        { year: 2022, propertyTax: 17700, taxAssessment: 1475000 },
        { year: 2021, propertyTax: 17100, taxAssessment: 1425000 }
      ],
      schools: [
        { name: "Cragmont Elementary", level: "Elementary", grades: "K-5", rating: 8, distance: "0.4 mi", type: "Public" },
        { name: "Martin Luther King Jr. Middle", level: "Middle", grades: "6-8", rating: 7, distance: "1.0 mi", type: "Public" },
        { name: "Berkeley High School", level: "High", grades: "9-12", rating: 7, distance: "1.5 mi", type: "Public" }
      ],
      estimatedPayment: { total: 10500, principalAndInterest: 7900, propertyTax: 1517, homeInsurance: 750, hoa: 0, mortgageInsurance: 0 }
    },
    {
      id: "prop-7",
      zpid: "29385312",
      address: "892 Dolores Street",
      city: "San Francisco",
      state: "CA",
      zip: "94110",
      neighborhood: "Mission District",
      price: 1350000,
      zestimate: 1380000,
      zestimateRange: { low: 1310000, high: 1450000 },
      rentZestimate: 5400,
      beds: 3,
      baths: 2,
      sqft: 1750,
      lotSize: 2200,
      yearBuilt: 1905,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Sale",
      listingType: "For Sale By Owner",
      daysOnZillow: 30,
      description: "Classic Mission Victorian with ornate details. Steps from Dolores Park with a sunny south-facing backyard. In-law unit potential in lower level.",
      features: ["Near Dolores Park", "Victorian Details", "In-Law Unit Potential", "Sunny Backyard"],
      coordinates: [37.7580, -122.4257],
      images: [
        "https://picsum.photos/seed/p7a/800/600",
        "https://picsum.photos/seed/p7b/800/600",
        "https://picsum.photos/seed/p7c/800/600",
        "https://picsum.photos/seed/p7d/800/600"
      ],
      agentId: "agent-6",
      tags: ["For Sale By Owner"],
      openHouse: null,
      hoaFee: null,
      propertyTax: 13800,
      walkScore: 97,
      transitScore: 88,
      bikeScore: 90,
      priceHistory: [
        { date: "2024-10-08", event: "Listed for sale", price: 1395000, source: "FSBO" },
        { date: "2024-10-25", event: "Price change", price: 1350000, source: "FSBO" },
        { date: "2000-05-12", event: "Sold", price: 485000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 13800, taxAssessment: 1150000 },
        { year: 2022, propertyTax: 13400, taxAssessment: 1115000 },
        { year: 2021, propertyTax: 12900, taxAssessment: 1080000 }
      ],
      schools: [
        { name: "Sanchez Elementary", level: "Elementary", grades: "K-5", rating: 6, distance: "0.3 mi", type: "Public" },
        { name: "Everett Middle School", level: "Middle", grades: "6-8", rating: 5, distance: "0.9 mi", type: "Public" },
        { name: "Mission High School", level: "High", grades: "9-12", rating: 5, distance: "0.7 mi", type: "Public" }
      ],
      estimatedPayment: { total: 8100, principalAndInterest: 6000, propertyTax: 1150, homeInsurance: 570, hoa: 0, mortgageInsurance: 0 }
    },
    {
      id: "prop-8",
      zpid: "29385420",
      address: "4510 Howe Street",
      city: "Oakland",
      state: "CA",
      zip: "94611",
      neighborhood: "Montclair",
      price: 1180000,
      zestimate: 1210000,
      zestimateRange: { low: 1150000, high: 1270000 },
      rentZestimate: 4500,
      beds: 3,
      baths: 2,
      sqft: 1900,
      lotSize: 7200,
      yearBuilt: 1952,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 12,
      description: "Bright and airy Montclair mid-century with an open floor plan. Expansive deck overlooks a wooded canyon. Top-rated schools nearby.",
      features: ["Canyon View", "Mid-Century", "Open Floor Plan", "Large Deck", "Garage", "Updated Baths"],
      coordinates: [37.8305, -122.2110],
      images: [
        "https://picsum.photos/seed/p8a/800/600",
        "https://picsum.photos/seed/p8b/800/600",
        "https://picsum.photos/seed/p8c/800/600",
        "https://picsum.photos/seed/p8d/800/600"
      ],
      agentId: "agent-7",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: 12100,
      walkScore: 52,
      transitScore: 35,
      bikeScore: 40,
      priceHistory: [
        { date: "2024-10-26", event: "Listed for sale", price: 1180000, source: "MLS" },
        { date: "2012-11-05", event: "Sold", price: 710000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 12100, taxAssessment: 1010000 },
        { year: 2022, propertyTax: 11700, taxAssessment: 978000 },
        { year: 2021, propertyTax: 11400, taxAssessment: 945000 }
      ],
      schools: [
        { name: "Montclair Elementary", level: "Elementary", grades: "K-5", rating: 9, distance: "0.5 mi", type: "Public" },
        { name: "Montera Middle", level: "Middle", grades: "6-8", rating: 8, distance: "0.8 mi", type: "Public" },
        { name: "Skyline High School", level: "High", grades: "9-12", rating: 6, distance: "1.4 mi", type: "Public" }
      ],
      estimatedPayment: { total: 7100, principalAndInterest: 5200, propertyTax: 1008, homeInsurance: 500, hoa: 0, mortgageInsurance: 0 }
    },

    // === FOR SALE - CONDOS (5) ===
    {
      id: "prop-9",
      zpid: "29385530",
      address: "201 Folsom Street #24D",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      neighborhood: "SOMA",
      price: 985000,
      zestimate: 1010000,
      zestimateRange: { low: 960000, high: 1060000 },
      rentZestimate: 4200,
      beds: 2,
      baths: 2,
      sqft: 1150,
      lotSize: 0,
      yearBuilt: 2016,
      type: "Condo",
      propertyType: "Condo",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 7,
      description: "Sleek SOMA condo in a full-service building with doorman, gym, and rooftop terrace. Floor-to-ceiling windows with city and Bay Bridge views.",
      features: ["Doorman", "Gym", "Rooftop Terrace", "Bay Bridge View", "In-Unit Laundry", "Central AC"],
      coordinates: [37.7880, -122.3930],
      images: [
        "https://picsum.photos/seed/p9a/800/600",
        "https://picsum.photos/seed/p9b/800/600",
        "https://picsum.photos/seed/p9c/800/600",
        "https://picsum.photos/seed/p9d/800/600"
      ],
      agentId: "agent-2",
      tags: [],
      openHouse: null,
      hoaFee: 650,
      propertyTax: 10100,
      walkScore: 98,
      transitScore: 95,
      bikeScore: 85,
      priceHistory: [
        { date: "2024-11-01", event: "Listed for sale", price: 985000, source: "MLS" },
        { date: "2016-10-15", event: "Sold (New Construction)", price: 1050000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 10100, taxAssessment: 845000 },
        { year: 2022, propertyTax: 9800, taxAssessment: 818000 },
        { year: 2021, propertyTax: 9500, taxAssessment: 792000 }
      ],
      schools: [
        { name: "Bessie Carmichael Elementary", level: "Elementary", grades: "K-5", rating: 5, distance: "0.6 mi", type: "Public" },
        { name: "Lick-Wilmerding High", level: "High", grades: "9-12", rating: 10, distance: "1.8 mi", type: "Private" }
      ],
      estimatedPayment: { total: 7200, principalAndInterest: 4400, propertyTax: 842, homeInsurance: 415, hoa: 650, mortgageInsurance: 0 }
    },
    {
      id: "prop-10",
      zpid: "29385645",
      address: "3450 Mission Street #8",
      city: "San Francisco",
      state: "CA",
      zip: "94110",
      neighborhood: "Mission District",
      price: 625000,
      zestimate: 640000,
      zestimateRange: { low: 610000, high: 672000 },
      rentZestimate: 3100,
      beds: 1,
      baths: 1,
      sqft: 720,
      lotSize: 0,
      yearBuilt: 2005,
      type: "Condo",
      propertyType: "Condo",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 18,
      description: "Bright Mission condo with south-facing windows. Modern open layout with quartz counters, stainless appliances, and one deeded parking spot.",
      features: ["Parking Spot", "Modern Kitchen", "South Facing", "In-Unit Laundry"],
      coordinates: [37.7465, -122.4215],
      images: [
        "https://picsum.photos/seed/p10a/800/600",
        "https://picsum.photos/seed/p10b/800/600",
        "https://picsum.photos/seed/p10c/800/600"
      ],
      agentId: "agent-3",
      tags: ["Price Cut"],
      openHouse: null,
      hoaFee: 380,
      propertyTax: 6400,
      walkScore: 96,
      transitScore: 82,
      bikeScore: 88,
      priceHistory: [
        { date: "2024-10-20", event: "Listed for sale", price: 665000, source: "MLS" },
        { date: "2024-11-02", event: "Price change", price: 625000, source: "MLS" },
        { date: "2019-03-18", event: "Sold", price: 590000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 6400, taxAssessment: 535000 },
        { year: 2022, propertyTax: 6200, taxAssessment: 518000 },
        { year: 2021, propertyTax: 6000, taxAssessment: 500000 }
      ],
      schools: [
        { name: "Sanchez Elementary", level: "Elementary", grades: "K-5", rating: 6, distance: "0.5 mi", type: "Public" },
        { name: "Everett Middle School", level: "Middle", grades: "6-8", rating: 5, distance: "0.7 mi", type: "Public" }
      ],
      estimatedPayment: { total: 4600, principalAndInterest: 2800, propertyTax: 533, homeInsurance: 265, hoa: 380, mortgageInsurance: 0 }
    },
    {
      id: "prop-11",
      zpid: "29385740",
      address: "1188 Harrison Street #305",
      city: "Oakland",
      state: "CA",
      zip: "94612",
      neighborhood: "Downtown Oakland",
      price: 475000,
      zestimate: 490000,
      zestimateRange: { low: 455000, high: 515000 },
      rentZestimate: 2600,
      beds: 1,
      baths: 1,
      sqft: 680,
      lotSize: 0,
      yearBuilt: 2008,
      type: "Condo",
      propertyType: "Condo",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 25,
      description: "Urban loft-style condo near Lake Merritt with exposed brick and high ceilings. Building features secure parking and bike storage.",
      features: ["Loft Style", "High Ceilings", "Exposed Brick", "Secure Parking", "Bike Storage"],
      coordinates: [37.8020, -122.2700],
      images: [
        "https://picsum.photos/seed/p11a/800/600",
        "https://picsum.photos/seed/p11b/800/600",
        "https://picsum.photos/seed/p11c/800/600"
      ],
      agentId: "agent-8",
      tags: [],
      openHouse: null,
      hoaFee: 420,
      propertyTax: 4900,
      walkScore: 94,
      transitScore: 90,
      bikeScore: 92,
      priceHistory: [
        { date: "2024-10-13", event: "Listed for sale", price: 499000, source: "MLS" },
        { date: "2024-10-28", event: "Price change", price: 475000, source: "MLS" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 4900, taxAssessment: 410000 },
        { year: 2022, propertyTax: 4700, taxAssessment: 395000 },
        { year: 2021, propertyTax: 4600, taxAssessment: 382000 }
      ],
      schools: [
        { name: "Lincoln Elementary", level: "Elementary", grades: "K-5", rating: 5, distance: "0.6 mi", type: "Public" }
      ],
      estimatedPayment: { total: 3800, principalAndInterest: 2100, propertyTax: 408, homeInsurance: 200, hoa: 420, mortgageInsurance: 0 }
    },
    {
      id: "prop-12",
      zpid: "29385850",
      address: "88 King Street #1410",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
      neighborhood: "SOMA",
      price: 1150000,
      zestimate: 1180000,
      zestimateRange: { low: 1120000, high: 1240000 },
      rentZestimate: 4800,
      beds: 2,
      baths: 2,
      sqft: 1280,
      lotSize: 0,
      yearBuilt: 2018,
      type: "Condo",
      propertyType: "Condo",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 3,
      description: "Luxury waterfront condo near Oracle Park with stunning Bay views. Chef's kitchen, wide-plank floors, and private balcony.",
      features: ["Waterfront", "Bay View", "Balcony", "Chef Kitchen", "Concierge", "Pool"],
      coordinates: [37.7790, -122.3930],
      images: [
        "https://picsum.photos/seed/p12a/800/600",
        "https://picsum.photos/seed/p12b/800/600",
        "https://picsum.photos/seed/p12c/800/600",
        "https://picsum.photos/seed/p12d/800/600",
        "https://picsum.photos/seed/p12e/800/600"
      ],
      agentId: "agent-1",
      tags: ["New Listing"],
      openHouse: null,
      hoaFee: 890,
      propertyTax: 11800,
      walkScore: 92,
      transitScore: 88,
      bikeScore: 80,
      priceHistory: [
        { date: "2024-11-05", event: "Listed for sale", price: 1150000, source: "MLS" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 11800, taxAssessment: 985000 },
        { year: 2022, propertyTax: 11400, taxAssessment: 952000 },
        { year: 2021, propertyTax: 11100, taxAssessment: 920000 }
      ],
      schools: [
        { name: "Bessie Carmichael Elementary", level: "Elementary", grades: "K-5", rating: 5, distance: "0.8 mi", type: "Public" }
      ],
      estimatedPayment: { total: 8400, principalAndInterest: 5100, propertyTax: 983, homeInsurance: 485, hoa: 890, mortgageInsurance: 0 }
    },
    {
      id: "prop-13",
      zpid: "29385960",
      address: "2240 Clay Street #4",
      city: "San Francisco",
      state: "CA",
      zip: "94115",
      neighborhood: "Pacific Heights",
      price: 895000,
      zestimate: 920000,
      zestimateRange: { low: 870000, high: 965000 },
      rentZestimate: 3800,
      beds: 2,
      baths: 1,
      sqft: 1050,
      lotSize: 0,
      yearBuilt: 1925,
      type: "Condo",
      propertyType: "Condo",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 10,
      description: "Classic Pac Heights condo with high ceilings and crown molding. Shared garden and storage. Steps to Fillmore Street dining.",
      features: ["High Ceilings", "Crown Molding", "Shared Garden", "Storage", "Near Fillmore"],
      coordinates: [37.7905, -122.4350],
      images: [
        "https://picsum.photos/seed/p13a/800/600",
        "https://picsum.photos/seed/p13b/800/600",
        "https://picsum.photos/seed/p13c/800/600"
      ],
      agentId: "agent-5",
      tags: [],
      openHouse: null,
      hoaFee: 350,
      propertyTax: 9200,
      walkScore: 95,
      transitScore: 82,
      bikeScore: 75,
      priceHistory: [
        { date: "2024-10-29", event: "Listed for sale", price: 895000, source: "MLS" },
        { date: "2017-07-20", event: "Sold", price: 810000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 9200, taxAssessment: 770000 },
        { year: 2022, propertyTax: 8900, taxAssessment: 745000 },
        { year: 2021, propertyTax: 8600, taxAssessment: 720000 }
      ],
      schools: [
        { name: "Sherman Elementary", level: "Elementary", grades: "K-5", rating: 8, distance: "0.5 mi", type: "Public" }
      ],
      estimatedPayment: { total: 6000, principalAndInterest: 3950, propertyTax: 767, homeInsurance: 375, hoa: 350, mortgageInsurance: 0 }
    },

    // === FOR SALE - TOWNHOUSES (3) ===
    {
      id: "prop-14",
      zpid: "29386070",
      address: "415 Castro Street",
      city: "San Francisco",
      state: "CA",
      zip: "94114",
      neighborhood: "Castro",
      price: 1120000,
      zestimate: 1150000,
      zestimateRange: { low: 1090000, high: 1210000 },
      rentZestimate: 4800,
      beds: 3,
      baths: 2.5,
      sqft: 1650,
      lotSize: 1200,
      yearBuilt: 2010,
      type: "Townhouse",
      propertyType: "Townhouse",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 6,
      description: "Modern Castro townhome with a private rooftop deck and two-car tandem garage. Open concept main level with chef's kitchen.",
      features: ["Rooftop Deck", "Tandem Garage", "Chef Kitchen", "Central AC", "Radiant Heat"],
      coordinates: [37.7610, -122.4350],
      images: [
        "https://picsum.photos/seed/p14a/800/600",
        "https://picsum.photos/seed/p14b/800/600",
        "https://picsum.photos/seed/p14c/800/600",
        "https://picsum.photos/seed/p14d/800/600"
      ],
      agentId: "agent-4",
      tags: [],
      openHouse: null,
      hoaFee: 280,
      propertyTax: 11500,
      walkScore: 97,
      transitScore: 85,
      bikeScore: 82,
      priceHistory: [
        { date: "2024-11-02", event: "Listed for sale", price: 1120000, source: "MLS" },
        { date: "2010-06-01", event: "Sold (New Construction)", price: 890000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 11500, taxAssessment: 960000 },
        { year: 2022, propertyTax: 11100, taxAssessment: 928000 },
        { year: 2021, propertyTax: 10800, taxAssessment: 898000 }
      ],
      schools: [
        { name: "Harvey Milk Elementary", level: "Elementary", grades: "K-5", rating: 8, distance: "0.3 mi", type: "Public" },
        { name: "Everett Middle School", level: "Middle", grades: "6-8", rating: 5, distance: "0.9 mi", type: "Public" }
      ],
      estimatedPayment: { total: 7200, principalAndInterest: 4950, propertyTax: 958, homeInsurance: 470, hoa: 280, mortgageInsurance: 0 }
    },
    {
      id: "prop-15",
      zpid: "29386180",
      address: "4802 Telegraph Avenue #B",
      city: "Oakland",
      state: "CA",
      zip: "94609",
      neighborhood: "Temescal",
      price: 780000,
      zestimate: 800000,
      zestimateRange: { low: 760000, high: 840000 },
      rentZestimate: 3600,
      beds: 2,
      baths: 2,
      sqft: 1200,
      lotSize: 900,
      yearBuilt: 2015,
      type: "Townhouse",
      propertyType: "Townhouse",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 15,
      description: "Contemporary Temescal townhome steps from shops and restaurants. Private patio, energy-efficient appliances, and EV charger in garage.",
      features: ["Private Patio", "EV Charger", "Energy Efficient", "Walk to Shops"],
      coordinates: [37.8350, -122.2605],
      images: [
        "https://picsum.photos/seed/p15a/800/600",
        "https://picsum.photos/seed/p15b/800/600",
        "https://picsum.photos/seed/p15c/800/600"
      ],
      agentId: "agent-6",
      tags: [],
      openHouse: null,
      hoaFee: 250,
      propertyTax: 8000,
      walkScore: 93,
      transitScore: 75,
      bikeScore: 90,
      priceHistory: [
        { date: "2024-10-24", event: "Listed for sale", price: 780000, source: "MLS" },
        { date: "2015-09-20", event: "Sold (New Construction)", price: 620000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 8000, taxAssessment: 670000 },
        { year: 2022, propertyTax: 7700, taxAssessment: 645000 },
        { year: 2021, propertyTax: 7500, taxAssessment: 622000 }
      ],
      schools: [
        { name: "Emerson Elementary", level: "Elementary", grades: "K-5", rating: 6, distance: "0.4 mi", type: "Public" },
        { name: "Claremont Middle", level: "Middle", grades: "6-8", rating: 8, distance: "1.0 mi", type: "Public" }
      ],
      estimatedPayment: { total: 5300, principalAndInterest: 3450, propertyTax: 667, homeInsurance: 330, hoa: 250, mortgageInsurance: 0 }
    },
    {
      id: "prop-16",
      zpid: "29386290",
      address: "688 Guerrero Street",
      city: "San Francisco",
      state: "CA",
      zip: "94110",
      neighborhood: "Mission District",
      price: 950000,
      zestimate: 975000,
      zestimateRange: { low: 925000, high: 1025000 },
      rentZestimate: 4200,
      beds: 2,
      baths: 2.5,
      sqft: 1380,
      lotSize: 1000,
      yearBuilt: 2019,
      type: "Townhouse",
      propertyType: "Townhouse",
      listingStatus: "For Sale",
      listingType: "Agent Listed",
      daysOnZillow: 1,
      description: "Brand-new-feel Mission townhome with designer finishes. Private garage, European-style kitchen, and a landscaped common courtyard.",
      features: ["Designer Finishes", "Private Garage", "European Kitchen", "Common Courtyard"],
      coordinates: [37.7580, -122.4230],
      images: [
        "https://picsum.photos/seed/p16a/800/600",
        "https://picsum.photos/seed/p16b/800/600",
        "https://picsum.photos/seed/p16c/800/600",
        "https://picsum.photos/seed/p16d/800/600"
      ],
      agentId: "agent-9",
      tags: ["New Listing"],
      openHouse: null,
      hoaFee: 220,
      propertyTax: 9800,
      walkScore: 96,
      transitScore: 85,
      bikeScore: 88,
      priceHistory: [
        { date: "2024-11-07", event: "Listed for sale", price: 950000, source: "MLS" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 9800, taxAssessment: 818000 },
        { year: 2022, propertyTax: 9500, taxAssessment: 792000 },
        { year: 2021, propertyTax: 9200, taxAssessment: 765000 }
      ],
      schools: [
        { name: "Sanchez Elementary", level: "Elementary", grades: "K-5", rating: 6, distance: "0.4 mi", type: "Public" },
        { name: "Everett Middle School", level: "Middle", grades: "6-8", rating: 5, distance: "0.6 mi", type: "Public" }
      ],
      estimatedPayment: { total: 6300, principalAndInterest: 4200, propertyTax: 817, homeInsurance: 400, hoa: 220, mortgageInsurance: 0 }
    },

    // === FOR RENT - APARTMENTS (3) ===
    {
      id: "prop-17",
      zpid: "29386400",
      address: "150 Van Ness Avenue #812",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      neighborhood: "Civic Center",
      price: 3500,
      zestimate: null,
      zestimateRange: null,
      rentZestimate: 3500,
      beds: 1,
      baths: 1,
      sqft: 650,
      lotSize: 0,
      yearBuilt: 2020,
      type: "Apartment",
      propertyType: "Apartment",
      listingStatus: "For Rent",
      listingType: "Agent Listed",
      daysOnZillow: 4,
      description: "Modern high-rise apartment with skyline views. Full amenity building: pool, gym, co-working space, and 24/7 concierge.",
      features: ["Pool", "Gym", "Co-Working", "Concierge", "Skyline View", "In-Unit Laundry"],
      coordinates: [37.7755, -122.4195],
      images: [
        "https://picsum.photos/seed/p17a/800/600",
        "https://picsum.photos/seed/p17b/800/600",
        "https://picsum.photos/seed/p17c/800/600"
      ],
      agentId: "agent-10",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: null,
      walkScore: 97,
      transitScore: 95,
      bikeScore: 85,
      priceHistory: [],
      taxHistory: [],
      schools: [
        { name: "Tenderloin Community School", level: "Elementary", grades: "K-5", rating: 4, distance: "0.5 mi", type: "Public" }
      ],
      estimatedPayment: null
    },
    {
      id: "prop-18",
      zpid: "29386510",
      address: "2001 Market Street #504",
      city: "San Francisco",
      state: "CA",
      zip: "94114",
      neighborhood: "Castro",
      price: 4200,
      zestimate: null,
      zestimateRange: null,
      rentZestimate: 4200,
      beds: 2,
      baths: 2,
      sqft: 980,
      lotSize: 0,
      yearBuilt: 2017,
      type: "Apartment",
      propertyType: "Apartment",
      listingStatus: "For Rent",
      listingType: "Agent Listed",
      daysOnZillow: 2,
      description: "Bright corner unit with twin peaks views. Quartz counters, wine fridge, and parking included. Pet-friendly building.",
      features: ["Corner Unit", "Twin Peaks View", "Parking Included", "Pet Friendly", "Wine Fridge"],
      coordinates: [37.7648, -122.4310],
      images: [
        "https://picsum.photos/seed/p18a/800/600",
        "https://picsum.photos/seed/p18b/800/600",
        "https://picsum.photos/seed/p18c/800/600",
        "https://picsum.photos/seed/p18d/800/600"
      ],
      agentId: "agent-10",
      tags: ["New Listing"],
      openHouse: null,
      hoaFee: null,
      propertyTax: null,
      walkScore: 96,
      transitScore: 88,
      bikeScore: 80,
      priceHistory: [],
      taxHistory: [],
      schools: [
        { name: "Harvey Milk Elementary", level: "Elementary", grades: "K-5", rating: 8, distance: "0.4 mi", type: "Public" }
      ],
      estimatedPayment: null
    },
    {
      id: "prop-19",
      zpid: "29386620",
      address: "1301 16th Street #210",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      neighborhood: "Mission District",
      price: 5500,
      zestimate: null,
      zestimateRange: null,
      rentZestimate: 5500,
      beds: 3,
      baths: 2,
      sqft: 1400,
      lotSize: 0,
      yearBuilt: 2021,
      type: "Apartment",
      propertyType: "Apartment",
      listingStatus: "For Rent",
      listingType: "Agent Listed",
      daysOnZillow: 9,
      description: "Spacious three-bedroom in the heart of the Mission. Rooftop deck with downtown views, bike room, and a dog wash station.",
      features: ["Rooftop Deck", "Downtown View", "Bike Room", "Dog Wash", "Garage Parking"],
      coordinates: [37.7665, -122.4155],
      images: [
        "https://picsum.photos/seed/p19a/800/600",
        "https://picsum.photos/seed/p19b/800/600",
        "https://picsum.photos/seed/p19c/800/600"
      ],
      agentId: "agent-8",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: null,
      walkScore: 95,
      transitScore: 82,
      bikeScore: 90,
      priceHistory: [],
      taxHistory: [],
      schools: [
        { name: "Sanchez Elementary", level: "Elementary", grades: "K-5", rating: 6, distance: "0.6 mi", type: "Public" }
      ],
      estimatedPayment: null
    },

    // === FOR RENT - HOUSES (2) ===
    {
      id: "prop-20",
      zpid: "29386730",
      address: "2810 Russell Street",
      city: "Berkeley",
      state: "CA",
      zip: "94705",
      neighborhood: "South Berkeley",
      price: 5800,
      zestimate: null,
      zestimateRange: null,
      rentZestimate: 5800,
      beds: 3,
      baths: 2,
      sqft: 1700,
      lotSize: 4500,
      yearBuilt: 1935,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Rent",
      listingType: "Agent Listed",
      daysOnZillow: 11,
      description: "Charming Berkeley bungalow available for rent. Hardwood floors throughout, sunny eat-in kitchen, and a large fenced yard with fruit trees.",
      features: ["Fenced Yard", "Fruit Trees", "Hardwood Floors", "Garage", "Pet Friendly"],
      coordinates: [37.8560, -122.2600],
      images: [
        "https://picsum.photos/seed/p20a/800/600",
        "https://picsum.photos/seed/p20b/800/600",
        "https://picsum.photos/seed/p20c/800/600",
        "https://picsum.photos/seed/p20d/800/600"
      ],
      agentId: "agent-7",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: null,
      walkScore: 80,
      transitScore: 55,
      bikeScore: 85,
      priceHistory: [],
      taxHistory: [],
      schools: [
        { name: "Malcolm X Elementary", level: "Elementary", grades: "K-5", rating: 6, distance: "0.5 mi", type: "Public" },
        { name: "Willard Middle School", level: "Middle", grades: "6-8", rating: 7, distance: "0.8 mi", type: "Public" }
      ],
      estimatedPayment: null
    },
    {
      id: "prop-21",
      zpid: "29386840",
      address: "1024 Tilton Avenue",
      city: "San Mateo",
      state: "CA",
      zip: "94401",
      neighborhood: "Downtown San Mateo",
      price: 7500,
      zestimate: null,
      zestimateRange: null,
      rentZestimate: 7500,
      beds: 4,
      baths: 3,
      sqft: 2400,
      lotSize: 5800,
      yearBuilt: 1960,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "For Rent",
      listingType: "Agent Listed",
      daysOnZillow: 7,
      description: "Spacious San Mateo family home for rent. Remodeled kitchen and bathrooms, two-car garage, flat backyard, and excellent schools.",
      features: ["Remodeled", "Two-Car Garage", "Flat Backyard", "Central AC", "Great Schools"],
      coordinates: [37.5640, -122.3230],
      images: [
        "https://picsum.photos/seed/p21a/800/600",
        "https://picsum.photos/seed/p21b/800/600",
        "https://picsum.photos/seed/p21c/800/600",
        "https://picsum.photos/seed/p21d/800/600"
      ],
      agentId: "agent-3",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: null,
      walkScore: 72,
      transitScore: 50,
      bikeScore: 60,
      priceHistory: [],
      taxHistory: [],
      schools: [
        { name: "Baywood Elementary", level: "Elementary", grades: "K-5", rating: 8, distance: "0.4 mi", type: "Public" },
        { name: "Borel Middle School", level: "Middle", grades: "6-8", rating: 8, distance: "0.7 mi", type: "Public" },
        { name: "Aragon High School", level: "High", grades: "9-12", rating: 9, distance: "1.2 mi", type: "Public" }
      ],
      estimatedPayment: null
    },

    // === RECENTLY SOLD (2) ===
    {
      id: "prop-22",
      zpid: "29386950",
      address: "3335 Broderick Street",
      city: "San Francisco",
      state: "CA",
      zip: "94123",
      neighborhood: "Marina",
      price: 2100000,
      zestimate: 2150000,
      zestimateRange: { low: 2050000, high: 2260000 },
      rentZestimate: 7800,
      beds: 4,
      baths: 3,
      sqft: 2200,
      lotSize: 2800,
      yearBuilt: 1920,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "Recently Sold",
      listingType: "Agent Listed",
      daysOnZillow: 45,
      description: "Beautifully renovated Marina home sold above asking price. Features a chef's kitchen, marble bathrooms, and a landscaped backyard.",
      features: ["Renovated", "Chef Kitchen", "Marble Baths", "Landscaped", "Garage"],
      coordinates: [37.7995, -122.4420],
      images: [
        "https://picsum.photos/seed/p22a/800/600",
        "https://picsum.photos/seed/p22b/800/600",
        "https://picsum.photos/seed/p22c/800/600",
        "https://picsum.photos/seed/p22d/800/600"
      ],
      agentId: "agent-2",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: 21500,
      walkScore: 94,
      transitScore: 78,
      bikeScore: 82,
      priceHistory: [
        { date: "2024-09-15", event: "Listed for sale", price: 1995000, source: "MLS" },
        { date: "2024-10-20", event: "Sold", price: 2100000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 21500, taxAssessment: 1790000 },
        { year: 2022, propertyTax: 20800, taxAssessment: 1735000 },
        { year: 2021, propertyTax: 20200, taxAssessment: 1680000 }
      ],
      schools: [
        { name: "Sherman Elementary", level: "Elementary", grades: "K-5", rating: 8, distance: "0.3 mi", type: "Public" }
      ],
      estimatedPayment: null
    },
    {
      id: "prop-23",
      zpid: "29387060",
      address: "5812 College Avenue",
      city: "Oakland",
      state: "CA",
      zip: "94618",
      neighborhood: "Rockridge",
      price: 1320000,
      zestimate: 1350000,
      zestimateRange: { low: 1280000, high: 1420000 },
      rentZestimate: 5200,
      beds: 3,
      baths: 2,
      sqft: 1650,
      lotSize: 4000,
      yearBuilt: 1930,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "Recently Sold",
      listingType: "Agent Listed",
      daysOnZillow: 60,
      description: "Classic Rockridge Tudor that sold quickly. Period charm with updated systems, a mature garden, and walkability to BART and shops.",
      features: ["Tudor Style", "Updated Systems", "Mature Garden", "Near BART", "Hardwood Floors"],
      coordinates: [37.8420, -122.2520],
      images: [
        "https://picsum.photos/seed/p23a/800/600",
        "https://picsum.photos/seed/p23b/800/600",
        "https://picsum.photos/seed/p23c/800/600"
      ],
      agentId: "agent-4",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: 13500,
      walkScore: 92,
      transitScore: 75,
      bikeScore: 88,
      priceHistory: [
        { date: "2024-08-20", event: "Listed for sale", price: 1295000, source: "MLS" },
        { date: "2024-09-10", event: "Sold", price: 1320000, source: "Public Record" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 13500, taxAssessment: 1125000 },
        { year: 2022, propertyTax: 13100, taxAssessment: 1090000 },
        { year: 2021, propertyTax: 12700, taxAssessment: 1055000 }
      ],
      schools: [
        { name: "Chabot Elementary", level: "Elementary", grades: "K-5", rating: 9, distance: "0.4 mi", type: "Public" },
        { name: "Claremont Middle", level: "Middle", grades: "6-8", rating: 8, distance: "0.6 mi", type: "Public" }
      ],
      estimatedPayment: null
    },

    // === PENDING (2) ===
    {
      id: "prop-24",
      zpid: "29387170",
      address: "1745 Haight Street",
      city: "San Francisco",
      state: "CA",
      zip: "94117",
      neighborhood: "Haight-Ashbury",
      price: 1575000,
      zestimate: 1610000,
      zestimateRange: { low: 1530000, high: 1690000 },
      rentZestimate: 6000,
      beds: 3,
      baths: 2,
      sqft: 1800,
      lotSize: 2400,
      yearBuilt: 1900,
      type: "Single Family",
      propertyType: "Single Family",
      listingStatus: "Pending",
      listingType: "Agent Listed",
      daysOnZillow: 18,
      description: "Iconic Haight-Ashbury Victorian with original stained glass windows and intricate woodwork. Pending sale with multiple offers.",
      features: ["Stained Glass", "Victorian Details", "Backyard", "Near Golden Gate Park"],
      coordinates: [37.7700, -122.4510],
      images: [
        "https://picsum.photos/seed/p24a/800/600",
        "https://picsum.photos/seed/p24b/800/600",
        "https://picsum.photos/seed/p24c/800/600",
        "https://picsum.photos/seed/p24d/800/600"
      ],
      agentId: "agent-9",
      tags: [],
      openHouse: null,
      hoaFee: null,
      propertyTax: 16100,
      walkScore: 93,
      transitScore: 72,
      bikeScore: 78,
      priceHistory: [
        { date: "2024-10-20", event: "Listed for sale", price: 1575000, source: "MLS" },
        { date: "2024-11-05", event: "Pending", price: 1575000, source: "MLS" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 16100, taxAssessment: 1345000 },
        { year: 2022, propertyTax: 15600, taxAssessment: 1300000 },
        { year: 2021, propertyTax: 15100, taxAssessment: 1260000 }
      ],
      schools: [
        { name: "Grattan Elementary", level: "Elementary", grades: "K-5", rating: 9, distance: "0.3 mi", type: "Public" },
        { name: "Roosevelt Middle School", level: "Middle", grades: "6-8", rating: 6, distance: "1.1 mi", type: "Public" }
      ],
      estimatedPayment: null
    },
    {
      id: "prop-25",
      zpid: "29387280",
      address: "560 Grand Avenue #302",
      city: "Oakland",
      state: "CA",
      zip: "94610",
      neighborhood: "Lake Merritt",
      price: 650000,
      zestimate: 665000,
      zestimateRange: { low: 635000, high: 700000 },
      rentZestimate: 3000,
      beds: 2,
      baths: 1,
      sqft: 900,
      lotSize: 0,
      yearBuilt: 1990,
      type: "Condo",
      propertyType: "Condo",
      listingStatus: "Pending",
      listingType: "Agent Listed",
      daysOnZillow: 10,
      description: "Lake Merritt condo with lake views going pending after first open house. Hardwood floors, updated kitchen, and in-unit laundry.",
      features: ["Lake View", "Hardwood Floors", "Updated Kitchen", "In-Unit Laundry", "Parking"],
      coordinates: [37.8095, -122.2560],
      images: [
        "https://picsum.photos/seed/p25a/800/600",
        "https://picsum.photos/seed/p25b/800/600",
        "https://picsum.photos/seed/p25c/800/600"
      ],
      agentId: "agent-6",
      tags: [],
      openHouse: null,
      hoaFee: 400,
      propertyTax: 6700,
      walkScore: 90,
      transitScore: 80,
      bikeScore: 85,
      priceHistory: [
        { date: "2024-10-28", event: "Listed for sale", price: 650000, source: "MLS" },
        { date: "2024-11-03", event: "Pending", price: 650000, source: "MLS" }
      ],
      taxHistory: [
        { year: 2023, propertyTax: 6700, taxAssessment: 560000 },
        { year: 2022, propertyTax: 6500, taxAssessment: 540000 },
        { year: 2021, propertyTax: 6300, taxAssessment: 525000 }
      ],
      schools: [
        { name: "Lincoln Elementary", level: "Elementary", grades: "K-5", rating: 5, distance: "0.4 mi", type: "Public" },
        { name: "Westlake Middle", level: "Middle", grades: "6-8", rating: 6, distance: "0.9 mi", type: "Public" }
      ],
      estimatedPayment: null
    }
  ],

  agents: [
    {
      id: "agent-1",
      name: "Jennifer Martinez",
      photo: null,
      phone: "(415) 555-0198",
      email: "jennifer.m@compass.com",
      brokerage: "Compass Real Estate",
      rating: 4.9,
      reviewCount: 187,
      recentSales: 62,
      activeListings: 14,
      specialties: ["Buyer's Agent", "Listing Agent"],
      serviceAreas: ["San Francisco", "Daly City"],
      isFeatured: true,
      bio: "15+ years helping families find their dream home in San Francisco. Specializing in Pacific Heights and Marina properties."
    },
    {
      id: "agent-2",
      name: "David Kim",
      photo: null,
      phone: "(415) 555-0234",
      email: "david.k@coldwellbanker.com",
      brokerage: "Coldwell Banker Realty",
      rating: 4.8,
      reviewCount: 142,
      recentSales: 48,
      activeListings: 11,
      specialties: ["Buyer's Agent", "Listing Agent", "Relocation"],
      serviceAreas: ["San Francisco", "San Mateo"],
      isFeatured: true,
      bio: "Top-producing agent in SOMA and South Beach. Expert in condo conversions and new construction purchases."
    },
    {
      id: "agent-3",
      name: "Lisa Chen",
      photo: null,
      phone: "(415) 555-0345",
      email: "lisa.c@kwsf.com",
      brokerage: "Keller Williams SF",
      rating: 4.7,
      reviewCount: 98,
      recentSales: 35,
      activeListings: 8,
      specialties: ["Buyer's Agent", "Listing Agent"],
      serviceAreas: ["San Francisco", "San Mateo", "Millbrae"],
      isFeatured: false,
      bio: "Dedicated to making homeownership achievable. Fluent in Mandarin and Cantonese."
    },
    {
      id: "agent-4",
      name: "Robert Williams",
      photo: null,
      phone: "(510) 555-0456",
      email: "robert.w@sothebys.com",
      brokerage: "Sotheby's International Realty",
      rating: 4.9,
      reviewCount: 215,
      recentSales: 78,
      activeListings: 16,
      specialties: ["Buyer's Agent", "Listing Agent", "Luxury Homes"],
      serviceAreas: ["Oakland", "Berkeley", "Piedmont"],
      isFeatured: true,
      isTeam: true,
      bio: "East Bay luxury specialist with deep roots in Rockridge and Montclair. Known for off-market deals and concierge-level service."
    },
    {
      id: "agent-5",
      name: "Sarah O'Brien",
      photo: null,
      phone: "(510) 555-0567",
      email: "sarah.ob@compass.com",
      brokerage: "Compass Real Estate",
      rating: 4.6,
      reviewCount: 76,
      recentSales: 28,
      activeListings: 6,
      specialties: ["Buyer's Agent", "Listing Agent"],
      serviceAreas: ["Berkeley", "Albany", "El Cerrito"],
      isFeatured: false,
      bio: "Berkeley native helping neighbors buy and sell with integrity and local expertise."
    },
    {
      id: "agent-6",
      name: "Marcus Johnson",
      photo: null,
      phone: "(415) 555-0678",
      email: "marcus.j@remax.com",
      brokerage: "RE/MAX Gold",
      rating: 4.5,
      reviewCount: 63,
      recentSales: 22,
      activeListings: 5,
      specialties: ["Buyer's Agent", "Short Sales"],
      serviceAreas: ["San Francisco", "Oakland"],
      isFeatured: false,
      bio: "Experienced in navigating complex transactions. First-time buyer specialist with a patient, educational approach."
    },
    {
      id: "agent-7",
      name: "Amy Nguyen",
      photo: null,
      phone: "(510) 555-0789",
      email: "amy.n@compass.com",
      brokerage: "Compass Real Estate",
      rating: 4.8,
      reviewCount: 134,
      recentSales: 45,
      activeListings: 10,
      specialties: ["Buyer's Agent", "Listing Agent"],
      serviceAreas: ["Oakland", "Berkeley", "San Leandro"],
      isFeatured: false,
      isTeam: true,
      bio: "Award-winning East Bay agent. Data-driven approach to pricing and marketing that consistently outperforms the market."
    },
    {
      id: "agent-8",
      name: "James Park",
      photo: null,
      phone: "(510) 555-0890",
      email: "james.p@kweb.com",
      brokerage: "Keller Williams East Bay",
      rating: 4.4,
      reviewCount: 52,
      recentSales: 18,
      activeListings: 4,
      specialties: ["Buyer's Agent", "Listing Agent", "Investment Properties"],
      serviceAreas: ["Oakland", "Emeryville", "Alameda"],
      isFeatured: false,
      bio: "Investment property expert. Helping clients build wealth through strategic real estate purchases since 2012."
    },
    {
      id: "agent-9",
      name: "Elena Rodriguez",
      photo: null,
      phone: "(415) 555-0912",
      email: "elena.r@sothebys.com",
      brokerage: "Sotheby's International Realty",
      rating: 4.7,
      reviewCount: 108,
      recentSales: 38,
      activeListings: 9,
      specialties: ["Listing Agent", "Luxury Homes", "Staging"],
      serviceAreas: ["San Francisco"],
      isFeatured: false,
      bio: "Luxury staging and marketing expert. Every home I list tells a story that buyers can't resist."
    },
    {
      id: "agent-10",
      name: "Kevin Thompson",
      photo: null,
      phone: "(415) 555-1023",
      email: "kevin.t@coldwellbanker.com",
      brokerage: "Coldwell Banker Realty",
      rating: 4.3,
      reviewCount: 41,
      recentSales: 15,
      activeListings: 7,
      specialties: ["Buyer's Agent", "Rentals"],
      serviceAreas: ["San Francisco", "Daly City", "South San Francisco"],
      isFeatured: false,
      bio: "Rental and first-time buyer specialist. Making the San Francisco housing market accessible for everyone."
    }
  ],

  savedSearches: [
    {
      id: "search-1",
      name: "SF Under 900K",
      location: "San Francisco, CA",
      filters: {
        search: "San Francisco",
        minPrice: 500000,
        maxPrice: 900000,
        minBeds: 2,
        type: "All"
      },
      createdAt: "2024-11-15T10:30:00Z",
      newListings: 3,
      emailAlerts: true
    },
    {
      id: "search-2",
      name: "Oakland Family Homes",
      location: "Oakland, CA",
      filters: {
        search: "Oakland",
        minPrice: 600000,
        maxPrice: 1200000,
        minBeds: 3,
        minBaths: 2,
        type: "Single Family"
      },
      createdAt: "2024-10-20T14:00:00Z",
      newListings: 5,
      emailAlerts: true
    }
  ],

  searchSuggestions: [
    { id: "sug-1", text: "San Francisco, CA", type: "city", subtext: "City in California" },
    { id: "sug-2", text: "Oakland, CA", type: "city", subtext: "City in California" },
    { id: "sug-3", text: "Berkeley, CA", type: "city", subtext: "City in California" },
    { id: "sug-4", text: "San Jose, CA", type: "city", subtext: "City in California" },
    { id: "sug-5", text: "Palo Alto, CA", type: "city", subtext: "City in California" },
    { id: "sug-6", text: "Mountain View, CA", type: "city", subtext: "City in California" },
    { id: "sug-7", text: "San Mateo, CA", type: "city", subtext: "City in California" },
    { id: "sug-8", text: "Pacific Heights", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-9", text: "Mission District", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-10", text: "Noe Valley", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-11", text: "Castro", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-12", text: "Sunset", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-13", text: "Richmond", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-14", text: "SOMA", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-15", text: "Marina", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-16", text: "Haight-Ashbury", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-17", text: "North Beach", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-18", text: "Potrero Hill", type: "neighborhood", subtext: "Neighborhood in San Francisco, CA" },
    { id: "sug-19", text: "Rockridge", type: "neighborhood", subtext: "Neighborhood in Oakland, CA" },
    { id: "sug-20", text: "Temescal", type: "neighborhood", subtext: "Neighborhood in Oakland, CA" },
    { id: "sug-21", text: "Lake Merritt", type: "neighborhood", subtext: "Neighborhood in Oakland, CA" },
    { id: "sug-22", text: "Montclair", type: "neighborhood", subtext: "Neighborhood in Oakland, CA" },
    { id: "sug-23", text: "94102", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-24", text: "94103", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-25", text: "94105", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-26", text: "94107", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-27", text: "94110", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-28", text: "94114", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-29", text: "94115", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-30", text: "94117", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-31", text: "94122", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-32", text: "94123", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-33", text: "94131", type: "zip", subtext: "San Francisco, CA" },
    { id: "sug-34", text: "94607", type: "zip", subtext: "Oakland, CA" },
    { id: "sug-35", text: "94609", type: "zip", subtext: "Oakland, CA" },
    { id: "sug-36", text: "94610", type: "zip", subtext: "Oakland, CA" },
    { id: "sug-37", text: "94611", type: "zip", subtext: "Oakland, CA" },
    { id: "sug-38", text: "94612", type: "zip", subtext: "Oakland, CA" },
    { id: "sug-39", text: "94618", type: "zip", subtext: "Oakland, CA" },
    { id: "sug-40", text: "94705", type: "zip", subtext: "Berkeley, CA" },
    { id: "sug-41", text: "94708", type: "zip", subtext: "Berkeley, CA" }
  ],

  mortgageRates: [
    { type: "30-Year Fixed", rate: 6.89, apr: 6.95, lastUpdated: "2024-12-01" },
    { type: "20-Year Fixed", rate: 6.67, apr: 6.74, lastUpdated: "2024-12-01" },
    { type: "15-Year Fixed", rate: 6.12, apr: 6.21, lastUpdated: "2024-12-01" },
    { type: "5/1 ARM", rate: 6.45, apr: 7.01, lastUpdated: "2024-12-01" },
    { type: "7/1 ARM", rate: 6.55, apr: 6.98, lastUpdated: "2024-12-01" }
  ],

  tours: [],
  contactMessages: []
});

// Keep backward compat: INITIAL_DATA is still used by existing code for reference
export const INITIAL_DATA = getDefaultData();

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'zillow_mock_state';
const BASE_INITIAL_KEY = 'zillow_mock_initial_state';

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
    body: JSON.stringify({ action: 'set_current', state }),
  }).catch(() => {});
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Array item normalizers ---

function normalizeProperty(property, index) {
  return {
    id: property.id || `p_custom_${index}`,
    zpid: property.zpid || '',
    address: property.address || '',
    city: property.city || '',
    state: property.state || '',
    zip: property.zip || '',
    neighborhood: property.neighborhood || '',
    price: typeof property.price === 'number' ? property.price : 0,
    zestimate: property.zestimate || null,
    zestimateRange: property.zestimateRange || null,
    rentZestimate: property.rentZestimate || null,
    beds: typeof property.beds === 'number' ? property.beds : 0,
    baths: typeof property.baths === 'number' ? property.baths : 0,
    sqft: typeof property.sqft === 'number' ? property.sqft : 0,
    lotSize: typeof property.lotSize === 'number' ? property.lotSize : 0,
    yearBuilt: property.yearBuilt || 2000,
    type: property.type || 'Single Family',
    propertyType: property.propertyType || property.type || 'Single Family',
    listingStatus: property.listingStatus || 'For Sale',
    listingType: property.listingType || 'Agent Listed',
    daysOnZillow: typeof property.daysOnZillow === 'number' ? property.daysOnZillow : 0,
    description: property.description || '',
    features: Array.isArray(property.features) ? property.features : [],
    coordinates: Array.isArray(property.coordinates) ? property.coordinates : [37.7749, -122.4194],
    images: Array.isArray(property.images) ? property.images : [],
    agentId: property.agentId || 'agent-1',
    tags: Array.isArray(property.tags) ? property.tags : [],
    openHouse: property.openHouse || null,
    hoaFee: property.hoaFee || null,
    propertyTax: property.propertyTax || null,
    walkScore: property.walkScore || null,
    transitScore: property.transitScore || null,
    bikeScore: property.bikeScore || null,
    priceHistory: Array.isArray(property.priceHistory) ? property.priceHistory : [],
    taxHistory: Array.isArray(property.taxHistory) ? property.taxHistory : [],
    schools: Array.isArray(property.schools) ? property.schools : [],
    estimatedPayment: property.estimatedPayment || null,
  };
}

function normalizeTour(tour, index) {
  return {
    id: tour.id || `t_custom_${index}`,
    propertyId: tour.propertyId || '',
    date: tour.date || '',
    time: tour.time || '',
    name: tour.name || '',
    email: tour.email || '',
    phone: tour.phone || '',
    status: tour.status || 'pending',
  };
}

const arrayNormalizers = {
  properties: normalizeProperty,
  tours: normalizeTour,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
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
    const initialData = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
