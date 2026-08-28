// dataManager.js - Xpedia Mock State Management

const BASE_KEY = 'expedia_mock_state'
const BASE_INITIAL_KEY = 'expedia_mock_initial'

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search)
  const sid = params.get('sid')
  if (sid) {
    sessionStorage.setItem('expedia_sid', sid)
    return sid
  }
  return sessionStorage.getItem('expedia_sid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  if (!sid) return null
  try {
    const res = await fetch(`/state?sid=${sid}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

let initialSync = {}

const postState = (sid, payload) => {
  const query = sid ? `?sid=${encodeURIComponent(sid)}` : ''
  return fetch(`/post${query}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(() => {})
}

const syncInitialState = (state, sid = null) => {
  const key = sid || 'default'
  if (initialSync[key]) return
  initialSync[key] = true
  postState(sid, { action: 'set', state })
}

export const saveState = (state, sid = null) => {
  try {
    const key = storageKey(sid)
    localStorage.setItem(key, JSON.stringify(state))
    postState(sid, { action: 'set_current', state })
  } catch (e) {
    console.warn('Failed to save state:', e)
  }
}

export const loadState = (sid = null) => {
  try {
    const key = storageKey(sid)
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) {
      result[key] = source[key]
    } else if (source[key] && typeof source[key] === 'object') {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else if (source[key] !== null && source[key] !== undefined) {
      result[key] = source[key]
    }
  }
  return result
}

export const initializeData = (sid = null, customState = null) => {
  const defaults = createInitialData()

  if (customState) {
    const merged = deepMerge(defaults, customState)
    const key = storageKey(sid)
    const initKey = initialKey(sid)
    localStorage.setItem(key, JSON.stringify(merged))
    if (!localStorage.getItem(initKey)) {
      localStorage.setItem(initKey, JSON.stringify(merged))
    }
    syncInitialState(merged, sid)
    return merged
  }

  const existing = loadState(sid)
  if (existing) {
    const initKey = initialKey(sid)
    if (!localStorage.getItem(initKey)) {
      localStorage.setItem(initKey, JSON.stringify(existing))
    }
    syncInitialState(existing, sid)
    return existing
  }

  const key = storageKey(sid)
  const initKey = initialKey(sid)
  localStorage.setItem(key, JSON.stringify(defaults))
  localStorage.setItem(initKey, JSON.stringify(defaults))
  syncInitialState(defaults, sid)
  return defaults
}

export const getInitialState = (sid = null) => {
  try {
    const key = initialKey(sid)
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function createInitialData() {
  return {
    user: {
      id: 'user_1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (415) 555-0123',
      oneKeyTier: 'Gold',
      oneKeyCash: 124.50,
      savedProperties: ['hotel_3', 'hotel_7'],
      recentSearches: [
        {
          id: 'search_1',
          type: 'stays',
          destination: 'New York, NY',
          checkIn: '2026-05-15',
          checkOut: '2026-05-19',
          guests: 2,
          rooms: 1,
          timestamp: '2026-04-10T14:30:00Z'
        },
        {
          id: 'search_2',
          type: 'flights',
          destination: 'New York (JFK)',
          checkIn: '2026-05-15',
          checkOut: '2026-05-19',
          guests: 1,
          rooms: 0,
          timestamp: '2026-04-09T10:00:00Z'
        },
        {
          id: 'search_3',
          type: 'stays',
          destination: 'Cancun, Mexico',
          checkIn: '2026-06-10',
          checkOut: '2026-06-17',
          guests: 2,
          rooms: 1,
          timestamp: '2026-04-08T09:15:00Z'
        }
      ],
      travelers: [
        {
          id: 'traveler_1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: '1988-03-15',
          gender: 'Female',
          passportNumber: 'X12345678',
          knownTravelerNumber: '',
          frequentFlyerNumbers: { 'United': 'MP123456', 'Delta': 'SKY789012' }
        },
        {
          id: 'traveler_2',
          firstName: 'James',
          lastName: 'Johnson',
          dateOfBirth: '1985-07-22',
          gender: 'Male',
          passportNumber: 'Y87654321',
          knownTravelerNumber: 'TSA123456',
          frequentFlyerNumbers: { 'United': 'MP654321' }
        }
      ]
    },
    hotels: [
      {
        id: 'hotel_1',
        name: 'The Manhattan Club',
        type: 'Hotel',
        starRating: 5,
        guestRating: 9.2,
        guestRatingLabel: 'Exceptional',
        reviewCount: 1247,
        address: '200 W 56th St, New York, NY 10019',
        neighborhood: 'Midtown Manhattan',
        latitude: 40.7648,
        longitude: -73.9808,
        images: [
          'https://picsum.photos/seed/hotel1a/800/500',
          'https://picsum.photos/seed/hotel1b/800/500',
          'https://picsum.photos/seed/hotel1c/800/500',
          'https://picsum.photos/seed/hotel1d/800/500',
          'https://picsum.photos/seed/hotel1e/800/500'
        ],
        description: 'An iconic landmark in the heart of Midtown Manhattan, The Manhattan Club offers world-class service and elegantly appointed rooms with stunning city views. Situated steps from Central Park, Fifth Avenue shopping, and Broadway theaters, this luxury hotel is the perfect base for exploring New York City.',
        amenities: ['Free WiFi', 'Pool', 'Fitness center', 'Restaurant', 'Room service', 'Parking', 'Business center', 'Spa', 'Concierge', 'Valet parking'],
        highlights: ['Fully refundable', 'Reserve now, pay later', 'Free cancellation before May 13'],
        distanceFromCenter: '0.3 mi from center',
        memberPrice: true,
        memberDiscount: 15,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          cancellation: 'Free cancellation before 48 hours of check-in'
        },
        rooms: [
          {
            id: 'room_1_1',
            name: 'Deluxe King Room',
            description: '1 King bed, City view, 350 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 350,
            pricePerNight: 249,
            originalPrice: 299,
            totalPrice: 996,
            memberPrice: 212,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Mini-bar', 'Safe'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_1_2',
            name: 'Premier Suite',
            description: 'Separate living area, 2 King beds, Panoramic city view, 650 sq ft',
            bedType: '2 King Beds',
            maxGuests: 4,
            sqFt: 650,
            pricePerNight: 449,
            originalPrice: 549,
            totalPrice: 1796,
            memberPrice: 382,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Mini-bar', 'Safe', 'Kitchenette', 'Sofa bed'],
            freeCancellation: true,
            breakfastIncluded: true,
            payLater: false,
            availability: '3 left'
          },
          {
            id: 'room_1_3',
            name: 'Standard Queen Room',
            description: '1 Queen bed, Garden view, 280 sq ft',
            bedType: '1 Queen Bed',
            maxGuests: 2,
            sqFt: 280,
            pricePerNight: 189,
            originalPrice: null,
            totalPrice: 756,
            memberPrice: 161,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV'],
            freeCancellation: false,
            breakfastIncluded: false,
            payLater: false,
            availability: 'sold out'
          }
        ],
        reviews: [
          {
            id: 'review_1_1',
            authorName: 'Michael T.',
            rating: 9.5,
            title: 'Outstanding stay in the heart of NYC',
            body: 'The hotel was perfectly located for everything we wanted to do. Staff were incredibly helpful and the room was spotless. The views from our suite were breathtaking. Will definitely return!',
            date: '2026-03-20',
            tripType: 'Couple',
            categories: { cleanliness: 9.8, service: 9.5, amenities: 9.2, condition: 9.4 }
          },
          {
            id: 'review_1_2',
            authorName: 'Jennifer R.',
            rating: 8.8,
            title: 'Great hotel, great location',
            body: 'Loved the central location and the room was spacious and clean. The pool was a bit small but everything else was fantastic. Breakfast was delicious.',
            date: '2026-02-14',
            tripType: 'Business',
            categories: { cleanliness: 9.0, service: 8.6, amenities: 8.4, condition: 9.0 }
          },
          {
            id: 'review_1_3',
            authorName: 'David K.',
            rating: 9.0,
            title: 'Perfect for our family vacation',
            body: 'We had an amazing time. The kids loved the pool and the staff went above and beyond to make our stay special. Highly recommend the suite!',
            date: '2026-01-05',
            tripType: 'Family',
            categories: { cleanliness: 9.2, service: 9.3, amenities: 8.9, condition: 9.1 }
          }
        ]
      },
      {
        id: 'hotel_2',
        name: 'Park Hyatt New York',
        type: 'Hotel',
        starRating: 5,
        guestRating: 9.4,
        guestRatingLabel: 'Exceptional',
        reviewCount: 2156,
        address: '153 W 57th St, New York, NY 10019',
        neighborhood: 'Midtown Manhattan',
        latitude: 40.7654,
        longitude: -73.9799,
        images: [
          'https://picsum.photos/seed/hotel2a/800/500',
          'https://picsum.photos/seed/hotel2b/800/500',
          'https://picsum.photos/seed/hotel2c/800/500',
          'https://picsum.photos/seed/hotel2d/800/500',
          'https://picsum.photos/seed/hotel2e/800/500'
        ],
        description: 'The Park Hyatt New York stands at the corner of West 57th Street and Seventh Avenue in Midtown Manhattan. This sophisticated luxury hotel offers unmatched personal service, 210 spacious rooms and suites, a world-class spa, and acclaimed dining.',
        amenities: ['Free WiFi', 'Pool', 'Fitness center', 'Restaurant', 'Room service', 'Spa', 'Concierge', 'Valet parking', 'Bar'],
        highlights: ['Fully refundable', 'Reserve now, pay later'],
        distanceFromCenter: '0.4 mi from center',
        memberPrice: true,
        memberDiscount: 12,
        policies: {
          checkIn: '4:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 72 hours of check-in'
        },
        rooms: [
          {
            id: 'room_2_1',
            name: 'Park King',
            description: '1 King bed, City view, 400 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 400,
            pricePerNight: 650,
            originalPrice: 750,
            totalPrice: 2600,
            memberPrice: 572,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Marble bathroom', 'Bathtub', 'Mini-bar'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_2_2',
            name: 'Midtown Suite',
            description: 'Separate living room, 1 King bed, Park view, 700 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 700,
            pricePerNight: 950,
            originalPrice: null,
            totalPrice: 3800,
            memberPrice: 836,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Marble bathroom', 'Separate living area', 'Dining table'],
            freeCancellation: true,
            breakfastIncluded: true,
            payLater: false,
            availability: '2 left'
          }
        ],
        reviews: [
          {
            id: 'review_2_1',
            authorName: 'Alexandra M.',
            rating: 9.8,
            title: 'Absolutely flawless luxury experience',
            body: 'From check-in to check-out, every detail was perfect. The room was immaculate, the staff remembered our names, and the spa was world-class. Worth every penny.',
            date: '2026-03-15',
            tripType: 'Couple',
            categories: { cleanliness: 10, service: 9.8, amenities: 9.6, condition: 9.9 }
          },
          {
            id: 'review_2_2',
            authorName: 'Robert C.',
            rating: 9.2,
            title: 'Best business hotel in NYC',
            body: 'I stay here for business trips regularly. The location is perfect, the business center is excellent, and the breakfast is superb. Highly recommended for business travelers.',
            date: '2026-02-28',
            tripType: 'Business',
            categories: { cleanliness: 9.5, service: 9.0, amenities: 9.2, condition: 9.4 }
          }
        ]
      },
      {
        id: 'hotel_3',
        name: 'The Standard High Line',
        type: 'Hotel',
        starRating: 4,
        guestRating: 8.6,
        guestRatingLabel: 'Excellent',
        reviewCount: 3421,
        address: '848 Washington St, New York, NY 10014',
        neighborhood: 'Meatpacking District',
        latitude: 40.7412,
        longitude: -74.0067,
        images: [
          'https://picsum.photos/seed/hotel3a/800/500',
          'https://picsum.photos/seed/hotel3b/800/500',
          'https://picsum.photos/seed/hotel3c/800/500',
          'https://picsum.photos/seed/hotel3d/800/500'
        ],
        description: 'Straddling the High Line in the Meatpacking District, The Standard High Line offers unparalleled views of the Hudson River and the Manhattan skyline. Known for its vibrant atmosphere and floor-to-ceiling windows, it is one of NYC\'s most distinctive hotels.',
        amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Room service', 'Fitness center', 'Rooftop bar'],
        highlights: ['Free cancellation before May 13', 'Reserve now, pay later'],
        distanceFromCenter: '1.8 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 48 hours of check-in'
        },
        rooms: [
          {
            id: 'room_3_1',
            name: 'Hudson River View King',
            description: '1 King bed, Hudson River view, 320 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 320,
            pricePerNight: 349,
            originalPrice: 429,
            totalPrice: 1396,
            memberPrice: null,
            amenities: ['Free WiFi', 'Floor-to-ceiling windows', 'Flat-screen TV', 'Mini-fridge'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_3_2',
            name: 'City View Queen',
            description: '1 Queen bed, Manhattan skyline view, 280 sq ft',
            bedType: '1 Queen Bed',
            maxGuests: 2,
            sqFt: 280,
            pricePerNight: 279,
            originalPrice: 329,
            totalPrice: 1116,
            memberPrice: null,
            amenities: ['Free WiFi', 'Floor-to-ceiling windows', 'Flat-screen TV'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: false,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_3_1',
            authorName: 'Carlos B.',
            rating: 9.0,
            title: 'Incredible views, amazing vibe',
            body: 'The views from our room were absolutely stunning. The rooftop bar is a must-visit. The hotel has such a cool, energetic atmosphere unlike any other hotel I\'ve stayed in NYC.',
            date: '2026-03-05',
            tripType: 'Couple',
            categories: { cleanliness: 8.8, service: 8.5, amenities: 9.2, condition: 8.9 }
          },
          {
            id: 'review_3_2',
            authorName: 'Emma L.',
            rating: 8.2,
            title: 'Great location and unique design',
            body: 'The High Line is right outside the hotel which is so convenient. Rooms are small but the design is beautiful. Can be noisy on weekends due to the bar scene below.',
            date: '2026-02-20',
            tripType: 'Solo',
            categories: { cleanliness: 8.5, service: 8.0, amenities: 8.5, condition: 8.2 }
          }
        ]
      },
      {
        id: 'hotel_4',
        name: 'Hotel Indigo Lower East Side',
        type: 'Hotel',
        starRating: 4,
        guestRating: 8.4,
        guestRatingLabel: 'Excellent',
        reviewCount: 1832,
        address: '171 Ludlow St, New York, NY 10002',
        neighborhood: 'Lower East Side',
        latitude: 40.7203,
        longitude: -73.9891,
        images: [
          'https://picsum.photos/seed/hotel4a/800/500',
          'https://picsum.photos/seed/hotel4b/800/500',
          'https://picsum.photos/seed/hotel4c/800/500'
        ],
        description: 'Nestled in the vibrant Lower East Side neighborhood, Hotel Indigo offers a uniquely local experience with art-inspired rooms and a neighborhood-centric design. Walk to some of NYC\'s best restaurants, galleries, and live music venues.',
        amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Fitness center', 'Concierge'],
        highlights: ['Free cancellation', 'Reserve now, pay later'],
        distanceFromCenter: '2.5 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          cancellation: 'Free cancellation before 24 hours of check-in'
        },
        rooms: [
          {
            id: 'room_4_1',
            name: 'Neighborhood King',
            description: '1 King bed, Neighborhood view, 290 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 290,
            pricePerNight: 219,
            originalPrice: 259,
            totalPrice: 876,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Art prints'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_4_2',
            name: 'Double Queen',
            description: '2 Queen beds, 310 sq ft',
            bedType: '2 Queen Beds',
            maxGuests: 4,
            sqFt: 310,
            pricePerNight: 249,
            originalPrice: null,
            totalPrice: 996,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: false,
            availability: '4 left'
          }
        ],
        reviews: [
          {
            id: 'review_4_1',
            authorName: 'Priya S.',
            rating: 8.5,
            title: 'Loved the neighborhood vibe',
            body: 'This hotel perfectly captures the spirit of the Lower East Side. The local restaurant recommendations from the concierge were spot on. Room was well-designed and comfortable.',
            date: '2026-03-12',
            tripType: 'Solo',
            categories: { cleanliness: 8.8, service: 8.3, amenities: 8.0, condition: 8.6 }
          }
        ]
      },
      {
        id: 'hotel_5',
        name: 'Courtyard by Marriott Times Square',
        type: 'Hotel',
        starRating: 3,
        guestRating: 7.8,
        guestRatingLabel: 'Very Good',
        reviewCount: 4521,
        address: '114 W 40th St, New York, NY 10018',
        neighborhood: 'Times Square',
        latitude: 40.7536,
        longitude: -73.9904,
        images: [
          'https://picsum.photos/seed/hotel5a/800/500',
          'https://picsum.photos/seed/hotel5b/800/500',
          'https://picsum.photos/seed/hotel5c/800/500'
        ],
        description: 'Located just steps from Times Square, this modern hotel offers comfortable rooms at an accessible price point. Perfect for families and first-time visitors who want to be in the center of the action without breaking the bank.',
        amenities: ['Free WiFi', 'Restaurant', 'Fitness center', 'Business center', 'Market pantry'],
        highlights: ['Reserve now, pay later'],
        distanceFromCenter: '0.1 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Non-refundable'
        },
        rooms: [
          {
            id: 'room_5_1',
            name: 'Standard King',
            description: '1 King bed, City view, 240 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 240,
            pricePerNight: 159,
            originalPrice: 199,
            totalPrice: 636,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Coffee maker'],
            freeCancellation: false,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_5_2',
            name: 'Family Room',
            description: '2 Queen beds, 320 sq ft',
            bedType: '2 Queen Beds',
            maxGuests: 4,
            sqFt: 320,
            pricePerNight: 199,
            originalPrice: 239,
            totalPrice: 796,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Coffee maker', 'Mini-fridge'],
            freeCancellation: false,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_5_1',
            authorName: 'Susan H.',
            rating: 7.8,
            title: 'Great location for Times Square',
            body: 'You literally cannot beat this location if you want to be in Times Square. Rooms are small but well-maintained. Noise from the street can be an issue late at night.',
            date: '2026-02-25',
            tripType: 'Family',
            categories: { cleanliness: 8.0, service: 7.6, amenities: 7.5, condition: 7.8 }
          }
        ]
      },
      {
        id: 'hotel_6',
        name: 'The Plaza Hotel',
        type: 'Hotel',
        starRating: 5,
        guestRating: 9.1,
        guestRatingLabel: 'Exceptional',
        reviewCount: 5234,
        address: '768 5th Ave, New York, NY 10019',
        neighborhood: 'Midtown Manhattan',
        latitude: 40.7647,
        longitude: -73.9740,
        images: [
          'https://picsum.photos/seed/hotel6a/800/500',
          'https://picsum.photos/seed/hotel6b/800/500',
          'https://picsum.photos/seed/hotel6c/800/500',
          'https://picsum.photos/seed/hotel6d/800/500'
        ],
        description: 'An American icon since 1907, The Plaza Hotel stands majestically at the corner of Fifth Avenue and Central Park South. With its distinctive French Renaissance architecture and world-famous luxury, The Plaza offers an unparalleled New York experience.',
        amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Room service', 'Fitness center', 'Concierge', 'Valet parking', 'Bar', 'Pool'],
        highlights: ['Fully refundable', 'Reserve now, pay later'],
        distanceFromCenter: '0.5 mi from center',
        memberPrice: true,
        memberDiscount: 10,
        policies: {
          checkIn: '4:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 72 hours of check-in'
        },
        rooms: [
          {
            id: 'room_6_1',
            name: 'Superior Room',
            description: '1 King bed, Central Park or city view, 400 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 400,
            pricePerNight: 895,
            originalPrice: 1050,
            totalPrice: 3580,
            memberPrice: 805,
            amenities: ['Free WiFi', 'Marble bathroom', 'Bathtub', 'Mini-bar', 'Butler service'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: false,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_6_1',
            authorName: 'William N.',
            rating: 9.5,
            title: 'Living the classic New York dream',
            body: 'Staying at The Plaza is a bucket list experience. The historic grandeur is unmatched. Service is impeccable and the location right on Central Park is unbeatable. Expensive but worth it for a special occasion.',
            date: '2026-03-18',
            tripType: 'Couple',
            categories: { cleanliness: 9.8, service: 9.5, amenities: 9.3, condition: 9.7 }
          }
        ]
      },
      {
        id: 'hotel_7',
        name: 'Hilton Midtown',
        type: 'Hotel',
        starRating: 4,
        guestRating: 8.0,
        guestRatingLabel: 'Very Good',
        reviewCount: 6892,
        address: '1335 6th Ave, New York, NY 10019',
        neighborhood: 'Midtown Manhattan',
        latitude: 40.7615,
        longitude: -73.9797,
        images: [
          'https://picsum.photos/seed/hotel7a/800/500',
          'https://picsum.photos/seed/hotel7b/800/500',
          'https://picsum.photos/seed/hotel7c/800/500'
        ],
        description: 'One of Manhattan\'s largest hotels, the New York Hilton Midtown is ideally located on Avenue of the Americas in the heart of Midtown. The hotel features an impressive array of dining options, a fully equipped business center, and spacious rooms.',
        amenities: ['Free WiFi', 'Fitness center', 'Restaurant', 'Business center', 'Bar', 'Room service'],
        highlights: ['Reserve now, pay later', 'Free cancellation'],
        distanceFromCenter: '0.3 mi from center',
        memberPrice: true,
        memberDiscount: 18,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 48 hours of check-in'
        },
        rooms: [
          {
            id: 'room_7_1',
            name: 'Hilton King Room',
            description: '1 King bed, City view, 330 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 330,
            pricePerNight: 199,
            originalPrice: 249,
            totalPrice: 796,
            memberPrice: 163,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Work desk'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_7_2',
            name: 'Double Double Room',
            description: '2 Full beds, 360 sq ft',
            bedType: '2 Full Beds',
            maxGuests: 4,
            sqFt: 360,
            pricePerNight: 229,
            originalPrice: null,
            totalPrice: 916,
            memberPrice: 188,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Work desk'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_7_1',
            authorName: 'Tom P.',
            rating: 8.0,
            title: 'Reliable and well-located',
            body: 'Classic Hilton quality. Nothing fancy but everything you need. The location is excellent for business travel and sightseeing. Staff were helpful and professional.',
            date: '2026-03-01',
            tripType: 'Business',
            categories: { cleanliness: 8.2, service: 7.9, amenities: 8.0, condition: 8.1 }
          }
        ]
      },
      {
        id: 'hotel_8',
        name: 'Ace Hotel New York',
        type: 'Hotel',
        starRating: 4,
        guestRating: 8.7,
        guestRatingLabel: 'Excellent',
        reviewCount: 2987,
        address: '20 W 29th St, New York, NY 10001',
        neighborhood: 'NoMad',
        latitude: 40.7455,
        longitude: -73.9887,
        images: [
          'https://picsum.photos/seed/hotel8a/800/500',
          'https://picsum.photos/seed/hotel8b/800/500',
          'https://picsum.photos/seed/hotel8c/800/500'
        ],
        description: 'The Ace Hotel New York blends the comfort of a classic hotel with the vibe of a NYC neighborhood gathering spot. Located in NoMad, the hotel is a creative hub featuring a rooftop bar, excellent coffee, and rooms designed by local artists.',
        amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Fitness center', 'Rooftop bar', 'Coffee shop'],
        highlights: ['Free cancellation', 'Reserve now, pay later'],
        distanceFromCenter: '0.9 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 48 hours of check-in'
        },
        rooms: [
          {
            id: 'room_8_1',
            name: 'Bunk Room',
            description: 'Bunk beds, Shared bathroom option, 180 sq ft',
            bedType: 'Bunk Bed',
            maxGuests: 2,
            sqFt: 180,
            pricePerNight: 129,
            originalPrice: 159,
            totalPrice: 516,
            memberPrice: null,
            amenities: ['Free WiFi', 'Flat-screen TV', 'USB ports'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_8_2',
            name: 'Queen Room',
            description: '1 Queen bed, Art-inspired design, 240 sq ft',
            bedType: '1 Queen Bed',
            maxGuests: 2,
            sqFt: 240,
            pricePerNight: 189,
            originalPrice: 229,
            totalPrice: 756,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Work desk'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: false,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_8_1',
            authorName: 'Amanda F.',
            rating: 8.8,
            title: 'So much character and great vibe',
            body: 'The Ace Hotel is unlike any other hotel I\'ve stayed in. The lobby buzzes with energy and the rooms are small but thoughtfully designed. The rooftop bar is amazing on a warm evening.',
            date: '2026-03-22',
            tripType: 'Solo',
            categories: { cleanliness: 8.7, service: 8.6, amenities: 9.0, condition: 8.8 }
          }
        ]
      },
      {
        id: 'hotel_9',
        name: 'W New York - Union Square',
        type: 'Hotel',
        starRating: 4,
        guestRating: 8.3,
        guestRatingLabel: 'Excellent',
        reviewCount: 3156,
        address: '201 Park Ave S, New York, NY 10003',
        neighborhood: 'Union Square',
        latitude: 40.7369,
        longitude: -73.9892,
        images: [
          'https://picsum.photos/seed/hotel9a/800/500',
          'https://picsum.photos/seed/hotel9b/800/500',
          'https://picsum.photos/seed/hotel9c/800/500'
        ],
        description: 'The W New York - Union Square is a bold, design-forward hotel steps from the Union Square Greenmarket and Gramercy Park. Featuring the W\'s signature Whatever/Whenever service and vibrant nightlife scene.',
        amenities: ['Free WiFi', 'Fitness center', 'Restaurant', 'Bar', 'Room service', 'Spa'],
        highlights: ['Free cancellation before May 13'],
        distanceFromCenter: '1.2 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 48 hours of check-in'
        },
        rooms: [
          {
            id: 'room_9_1',
            name: 'Wonderful Room',
            description: '1 King bed, City view, 300 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 300,
            pricePerNight: 259,
            originalPrice: 319,
            totalPrice: 1036,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Pillowtop mattress'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_9_1',
            authorName: 'Maria G.',
            rating: 8.4,
            title: 'Stylish hotel in a great neighborhood',
            body: 'Love the W brand and this hotel lives up to it. The Union Square location is perfect - walking distance to the subway, farmers market, and tons of restaurants. Rooms are well-designed.',
            date: '2026-02-28',
            tripType: 'Couple',
            categories: { cleanliness: 8.6, service: 8.2, amenities: 8.4, condition: 8.3 }
          }
        ]
      },
      {
        id: 'hotel_10',
        name: 'Pod 51',
        type: 'Hotel',
        starRating: 3,
        guestRating: 7.2,
        guestRatingLabel: 'Good',
        reviewCount: 2543,
        address: '230 E 51st St, New York, NY 10022',
        neighborhood: 'Midtown East',
        latitude: 40.7556,
        longitude: -73.9693,
        images: [
          'https://picsum.photos/seed/hotel10a/800/500',
          'https://picsum.photos/seed/hotel10b/800/500'
        ],
        description: 'Pod 51 is a micro-hotel that maximizes every square inch with thoughtful design. Perfect for solo travelers and digital nomads who want a comfortable, affordable base in Midtown East.',
        amenities: ['Free WiFi', 'Bar', 'Fitness center', 'Rooftop lounge'],
        highlights: ['Reserve now, pay later'],
        distanceFromCenter: '0.6 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          cancellation: 'Non-refundable'
        },
        rooms: [
          {
            id: 'room_10_1',
            name: 'Solo Pod Room',
            description: '1 Twin bed, Compact design, 75 sq ft',
            bedType: '1 Twin Bed',
            maxGuests: 1,
            sqFt: 75,
            pricePerNight: 89,
            originalPrice: 119,
            totalPrice: 356,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV'],
            freeCancellation: false,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_10_2',
            name: 'Double Pod',
            description: '1 Full bed, Compact design, 100 sq ft',
            bedType: '1 Full Bed',
            maxGuests: 2,
            sqFt: 100,
            pricePerNight: 119,
            originalPrice: null,
            totalPrice: 476,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV'],
            freeCancellation: false,
            breakfastIncluded: false,
            payLater: false,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_10_1',
            authorName: 'Kevin L.',
            rating: 7.0,
            title: 'Tiny but efficient',
            body: 'If you just need a clean place to sleep in a great location, Pod 51 delivers. Rooms are incredibly small but cleverly designed. Don\'t expect luxury but the value is there.',
            date: '2026-01-15',
            tripType: 'Solo',
            categories: { cleanliness: 7.5, service: 7.0, amenities: 6.8, condition: 7.4 }
          }
        ]
      },
      {
        id: 'hotel_11',
        name: 'LUMA Hotel Times Square',
        type: 'Hotel',
        starRating: 4,
        guestRating: 8.5,
        guestRatingLabel: 'Excellent',
        reviewCount: 1876,
        address: '120 W 41st St, New York, NY 10036',
        neighborhood: 'Times Square',
        latitude: 40.7548,
        longitude: -73.9888,
        images: [
          'https://picsum.photos/seed/hotel11a/800/500',
          'https://picsum.photos/seed/hotel11b/800/500',
          'https://picsum.photos/seed/hotel11c/800/500'
        ],
        description: 'LUMA Hotel Times Square is a boutique luxury hotel perfectly positioned in the center of Midtown Manhattan. With rooftop views, innovative design, and personalized service, LUMA is a fresh take on the classic NYC hotel experience.',
        amenities: ['Free WiFi', 'Rooftop bar', 'Restaurant', 'Fitness center', 'Room service', 'Concierge'],
        highlights: ['Free cancellation', 'Reserve now, pay later', 'Fully refundable'],
        distanceFromCenter: '0.1 mi from center',
        memberPrice: true,
        memberDiscount: 13,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 48 hours of check-in'
        },
        rooms: [
          {
            id: 'room_11_1',
            name: 'Urban King',
            description: '1 King bed, Times Square view, 310 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 310,
            pricePerNight: 289,
            originalPrice: 349,
            totalPrice: 1156,
            memberPrice: 251,
            amenities: ['Free WiFi', 'Rainfall shower', 'Flat-screen TV', 'Floor-to-ceiling windows'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_11_2',
            name: 'Rooftop Suite',
            description: '1 King bed, Rooftop terrace, 500 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 500,
            pricePerNight: 489,
            originalPrice: 589,
            totalPrice: 1956,
            memberPrice: 425,
            amenities: ['Free WiFi', 'Private terrace', 'Bathtub', 'Mini-bar', 'Butler service'],
            freeCancellation: true,
            breakfastIncluded: true,
            payLater: false,
            availability: '1 left'
          }
        ],
        reviews: [
          {
            id: 'review_11_1',
            authorName: 'Lisa M.',
            rating: 8.7,
            title: 'Boutique luxury in Times Square',
            body: 'LUMA was a wonderful surprise. The boutique feel with all the luxury amenities made for a perfect stay. The rooftop bar at sunset with Times Square views is something I\'ll never forget.',
            date: '2026-03-28',
            tripType: 'Couple',
            categories: { cleanliness: 9.0, service: 8.5, amenities: 8.7, condition: 8.9 }
          }
        ]
      },
      {
        id: 'hotel_12',
        name: 'Moxy NYC Times Square',
        type: 'Hotel',
        starRating: 3,
        guestRating: 7.9,
        guestRatingLabel: 'Very Good',
        reviewCount: 3012,
        address: '485 7th Ave, New York, NY 10018',
        neighborhood: 'Times Square',
        latitude: 40.7520,
        longitude: -73.9935,
        images: [
          'https://picsum.photos/seed/hotel12a/800/500',
          'https://picsum.photos/seed/hotel12b/800/500'
        ],
        description: 'Moxy NYC Times Square is designed for travelers who want to do more with less. The playful, tech-forward hotel features compact rooms loaded with the essentials, a fun-filled bar, and a social atmosphere that makes it easy to meet fellow travelers.',
        amenities: ['Free WiFi', 'Bar', 'Fitness center', 'Bike rental'],
        highlights: ['Reserve now, pay later'],
        distanceFromCenter: '0.2 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Non-refundable'
        },
        rooms: [
          {
            id: 'room_12_1',
            name: 'Pep Talk King',
            description: '1 King bed, Compact, 183 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 183,
            pricePerNight: 149,
            originalPrice: 189,
            totalPrice: 596,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Smart TV', 'Rain shower'],
            freeCancellation: false,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_12_1',
            authorName: 'Ryan B.',
            rating: 8.0,
            title: 'Perfect for the budget-conscious traveler',
            body: 'Moxy delivers exactly what it promises. Tiny room but you\'re in NYC - you\'re not going to be spending time in the room anyway! The bar downstairs is a great place to meet other travelers.',
            date: '2026-02-10',
            tripType: 'Solo',
            categories: { cleanliness: 8.2, service: 7.8, amenities: 7.9, condition: 8.0 }
          }
        ]
      },
      {
        id: 'hotel_13',
        name: 'The Ritz-Carlton New York, Central Park',
        type: 'Hotel',
        starRating: 5,
        guestRating: 9.6,
        guestRatingLabel: 'Exceptional',
        reviewCount: 3845,
        address: '50 Central Park S, New York, NY 10019',
        neighborhood: 'Midtown Manhattan',
        latitude: 40.7648,
        longitude: -73.9743,
        images: [
          'https://picsum.photos/seed/hotel13a/800/500',
          'https://picsum.photos/seed/hotel13b/800/500',
          'https://picsum.photos/seed/hotel13c/800/500',
          'https://picsum.photos/seed/hotel13d/800/500',
          'https://picsum.photos/seed/hotel13e/800/500'
        ],
        description: 'Overlooking Central Park, The Ritz-Carlton offers the ultimate New York luxury experience. Impeccable service, a world-class La Prairie spa, and the iconic Star Lounge make this hotel a destination in itself.',
        amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Room service', 'Fitness center', 'Concierge', 'Valet parking', 'Bar', 'Business center'],
        highlights: ['Fully refundable', 'Reserve now, pay later', 'Spa credit included'],
        distanceFromCenter: '0.4 mi from center',
        memberPrice: true,
        memberDiscount: 12,
        policies: {
          checkIn: '4:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 72 hours of check-in'
        },
        rooms: [
          {
            id: 'room_13_1',
            name: 'Superior Park View King',
            description: '1 King bed, Central Park view, 425 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 425,
            pricePerNight: 995,
            originalPrice: 1195,
            totalPrice: 3980,
            memberPrice: 876,
            amenities: ['Free WiFi', 'Marble bathroom', 'Soaking tub', 'Mini-bar', 'Nespresso machine'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_13_2',
            name: 'Grand Central Park Suite',
            description: 'Separate living room, 1 King bed, Full park view, 850 sq ft',
            bedType: '1 King Bed',
            maxGuests: 3,
            sqFt: 850,
            pricePerNight: 1895,
            originalPrice: 2295,
            totalPrice: 7580,
            memberPrice: 1667,
            amenities: ['Free WiFi', 'Marble bathroom', 'Soaking tub', 'Mini-bar', 'Butler service', 'Dining table'],
            freeCancellation: true,
            breakfastIncluded: true,
            payLater: false,
            availability: '1 left'
          }
        ],
        reviews: [
          {
            id: 'review_13_1',
            authorName: 'Isabelle F.',
            rating: 10,
            title: 'Perfection in every sense',
            body: 'This hotel sets the standard for luxury in NYC. The park view was breathtaking, the spa was heavenly, and the service was flawless. An unforgettable anniversary celebration.',
            date: '2026-03-25',
            tripType: 'Couple',
            categories: { cleanliness: 10, service: 10, amenities: 9.8, condition: 9.9 }
          },
          {
            id: 'review_13_2',
            authorName: 'Thomas W.',
            rating: 9.3,
            title: 'Simply outstanding',
            body: 'Every detail was perfect. The concierge arranged amazing dinner reservations and the room was immaculate. The Star Lounge has the best cocktails in Midtown.',
            date: '2026-02-18',
            tripType: 'Business',
            categories: { cleanliness: 9.5, service: 9.6, amenities: 9.2, condition: 9.4 }
          }
        ]
      },
      {
        id: 'hotel_14',
        name: 'Pod 51',
        type: 'Hotel',
        starRating: 3,
        guestRating: 7.4,
        guestRatingLabel: 'Good',
        reviewCount: 5678,
        address: '230 E 51st St, New York, NY 10022',
        neighborhood: 'Midtown East',
        latitude: 40.7557,
        longitude: -73.9712,
        images: [
          'https://picsum.photos/seed/hotel14a/800/500',
          'https://picsum.photos/seed/hotel14b/800/500',
          'https://picsum.photos/seed/hotel14c/800/500'
        ],
        description: 'Pod 51 redefines budget travel in NYC. The micro-hotel features cleverly designed compact rooms, a rooftop garden, and a prime Midtown East location near the United Nations and Grand Central Terminal.',
        amenities: ['Free WiFi', 'Rooftop bar', 'Fitness center', 'Bike rental'],
        highlights: ['Best budget option in Midtown'],
        distanceFromCenter: '0.6 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          cancellation: 'Non-refundable'
        },
        rooms: [
          {
            id: 'room_14_1',
            name: 'Full Pod',
            description: '1 Full bed, Compact, 130 sq ft',
            bedType: '1 Full Bed',
            maxGuests: 2,
            sqFt: 130,
            pricePerNight: 109,
            originalPrice: 139,
            totalPrice: 436,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV'],
            freeCancellation: false,
            breakfastIncluded: false,
            payLater: false,
            availability: 'available'
          },
          {
            id: 'room_14_2',
            name: 'Queen Pod',
            description: '1 Queen bed, Slightly larger, 150 sq ft',
            bedType: '1 Queen Bed',
            maxGuests: 2,
            sqFt: 150,
            pricePerNight: 129,
            originalPrice: 159,
            totalPrice: 516,
            memberPrice: null,
            amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Rain shower'],
            freeCancellation: false,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_14_1',
            authorName: 'Lisa M.',
            rating: 7.5,
            title: 'Great value for Manhattan',
            body: 'You get what you pay for - a clean, tiny room in a great location. Perfect for solo travelers who just need a place to sleep. The rooftop is a nice bonus.',
            date: '2026-03-08',
            tripType: 'Solo',
            categories: { cleanliness: 7.8, service: 7.2, amenities: 7.0, condition: 7.6 }
          }
        ]
      },
      {
        id: 'hotel_15',
        name: 'The Beekman, A Thompson Hotel',
        type: 'Hotel',
        starRating: 5,
        guestRating: 9.0,
        guestRatingLabel: 'Exceptional',
        reviewCount: 2234,
        address: '123 Nassau St, New York, NY 10038',
        neighborhood: 'Downtown',
        latitude: 40.7109,
        longitude: -74.0071,
        images: [
          'https://picsum.photos/seed/hotel15a/800/500',
          'https://picsum.photos/seed/hotel15b/800/500',
          'https://picsum.photos/seed/hotel15c/800/500',
          'https://picsum.photos/seed/hotel15d/800/500'
        ],
        description: 'Housed in one of downtown Manhattan\'s most storied buildings, The Beekman features a soaring Victorian-era atrium, Tom Colicchio\'s Fowler & Wells restaurant, and beautifully appointed rooms blending historic charm with modern luxury.',
        amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Room service', 'Fitness center', 'Concierge', 'Valet parking'],
        highlights: ['Fully refundable', 'Historic landmark building'],
        distanceFromCenter: '3.2 mi from center',
        memberPrice: true,
        memberDiscount: 10,
        policies: {
          checkIn: '3:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 48 hours of check-in'
        },
        rooms: [
          {
            id: 'room_15_1',
            name: 'Atrium King',
            description: '1 King bed, Atrium view, 380 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 380,
            pricePerNight: 425,
            originalPrice: 525,
            totalPrice: 1700,
            memberPrice: 383,
            amenities: ['Free WiFi', 'Marble bathroom', 'Bathtub', 'Mini-bar', 'Nespresso'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: true,
            availability: 'available'
          },
          {
            id: 'room_15_2',
            name: 'Turret Suite',
            description: 'Turret corner room, 1 King bed, 520 sq ft',
            bedType: '1 King Bed',
            maxGuests: 2,
            sqFt: 520,
            pricePerNight: 695,
            originalPrice: null,
            totalPrice: 2780,
            memberPrice: 626,
            amenities: ['Free WiFi', 'Marble bathroom', 'Bathtub', 'Sitting area', 'Curved windows'],
            freeCancellation: true,
            breakfastIncluded: true,
            payLater: false,
            availability: '2 left'
          }
        ],
        reviews: [
          {
            id: 'review_15_1',
            authorName: 'Grace P.',
            rating: 9.2,
            title: 'Stunning historic property',
            body: 'The atrium alone is worth the visit. Our room was gorgeous with incredible attention to detail. The restaurant downstairs is excellent. A truly unique NYC hotel experience.',
            date: '2026-03-15',
            tripType: 'Couple',
            categories: { cleanliness: 9.4, service: 9.0, amenities: 9.0, condition: 9.3 }
          }
        ]
      },
      {
        id: 'hotel_16',
        name: 'citizenM New York Bowery',
        type: 'Hotel',
        starRating: 4,
        guestRating: 8.3,
        guestRatingLabel: 'Excellent',
        reviewCount: 2890,
        address: '189 Bowery, New York, NY 10002',
        neighborhood: 'Lower East Side',
        latitude: 40.7218,
        longitude: -73.9932,
        images: [
          'https://picsum.photos/seed/hotel16a/800/500',
          'https://picsum.photos/seed/hotel16b/800/500',
          'https://picsum.photos/seed/hotel16c/800/500'
        ],
        description: 'citizenM brings its signature affordable luxury to the Bowery. Tech-forward rooms with mood lighting controlled by iPad, a vibrant living room lobby filled with art, and a rooftop bar with stunning downtown views.',
        amenities: ['Free WiFi', 'Bar', 'Rooftop bar', 'Fitness center', 'Library'],
        highlights: ['Free cancellation', 'Self check-in kiosk'],
        distanceFromCenter: '2.3 mi from center',
        memberPrice: false,
        memberDiscount: 0,
        policies: {
          checkIn: '2:00 PM',
          checkOut: '12:00 PM',
          cancellation: 'Free cancellation before 24 hours of check-in'
        },
        rooms: [
          {
            id: 'room_16_1',
            name: 'citizenM Room',
            description: '1 King XL bed, Mood lighting, 150 sq ft',
            bedType: '1 King XL Bed',
            maxGuests: 2,
            sqFt: 150,
            pricePerNight: 189,
            originalPrice: 229,
            totalPrice: 756,
            memberPrice: null,
            amenities: ['Free WiFi', 'iPad room controls', 'Rain shower', 'Smart TV'],
            freeCancellation: true,
            breakfastIncluded: false,
            payLater: false,
            availability: 'available'
          }
        ],
        reviews: [
          {
            id: 'review_16_1',
            authorName: 'Alex K.',
            rating: 8.5,
            title: 'Super cool modern hotel',
            body: 'Love the tech touches - controlling everything from an iPad is neat. Room is small but the bed is incredibly comfortable. The rooftop bar has amazing views of downtown Manhattan.',
            date: '2026-03-01',
            tripType: 'Solo',
            categories: { cleanliness: 8.6, service: 8.2, amenities: 8.5, condition: 8.4 }
          }
        ]
      }
    ],
    flights: [
      {
        id: 'flight_1',
        airline: 'United Airlines',
        airlineCode: 'UA',
        flightNumber: 'UA 1234',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '08:30',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '17:05',
        duration: '5h 35m',
        durationMinutes: 335,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 737-900',
        cabinClass: 'Economy',
        price: 189,
        originalPrice: 245,
        baggageIncluded: 'Personal item',
        seatSelection: 'Fee',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.2,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_2',
        airline: 'United Airlines',
        airlineCode: 'UA',
        flightNumber: 'UA 1456',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '10:15',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '18:45',
        duration: '5h 30m',
        durationMinutes: 330,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Airbus A319',
        cabinClass: 'Economy',
        price: 215,
        originalPrice: null,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Fee',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.5,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_3',
        airline: 'Delta Air Lines',
        airlineCode: 'DL',
        flightNumber: 'DL 2098',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '07:45',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '16:25',
        duration: '5h 40m',
        durationMinutes: 340,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 757-200',
        cabinClass: 'Economy',
        price: 199,
        originalPrice: 265,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Included',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.7,
        refundable: true,
        nextDayArrival: false
      },
      {
        id: 'flight_4',
        airline: 'Delta Air Lines',
        airlineCode: 'DL',
        flightNumber: 'DL 3412',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '14:00',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '22:35',
        duration: '5h 35m',
        durationMinutes: 335,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Airbus A321',
        cabinClass: 'Economy',
        price: 209,
        originalPrice: null,
        baggageIncluded: 'Personal item',
        seatSelection: 'Fee',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.0,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_5',
        airline: 'JetBlue Airways',
        airlineCode: 'B6',
        flightNumber: 'B6 415',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '11:30',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '20:05',
        duration: '5h 35m',
        durationMinutes: 335,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Airbus A321',
        cabinClass: 'Economy',
        price: 179,
        originalPrice: 229,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Included',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.9,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_6',
        airline: 'JetBlue Airways',
        airlineCode: 'B6',
        flightNumber: 'B6 1201',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '16:45',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '01:10',
        duration: '5h 25m',
        durationMinutes: 325,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Airbus A320',
        cabinClass: 'Economy',
        price: 155,
        originalPrice: null,
        baggageIncluded: 'Personal item',
        seatSelection: 'Fee',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 7.8,
        refundable: false,
        nextDayArrival: true
      },
      {
        id: 'flight_7',
        airline: 'American Airlines',
        airlineCode: 'AA',
        flightNumber: 'AA 2001',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '09:00',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '18:45',
        duration: '7h 45m',
        durationMinutes: 465,
        stops: 1,
        stopAirports: ['DFW'],
        stopDurations: ['1h 30m'],
        aircraft: 'Boeing 737-800',
        cabinClass: 'Economy',
        price: 165,
        originalPrice: 210,
        baggageIncluded: 'Personal item',
        seatSelection: 'Fee',
        wifi: false,
        entertainment: false,
        powerOutlets: false,
        flightScore: 7.0,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_8',
        airline: 'American Airlines',
        airlineCode: 'AA',
        flightNumber: 'AA 2345',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '12:30',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '23:55',
        duration: '8h 25m',
        durationMinutes: 505,
        stops: 1,
        stopAirports: ['ORD'],
        stopDurations: ['2h 10m'],
        aircraft: 'Airbus A319',
        cabinClass: 'Economy',
        price: 149,
        originalPrice: null,
        baggageIncluded: 'Personal item',
        seatSelection: 'Fee',
        wifi: false,
        entertainment: false,
        powerOutlets: false,
        flightScore: 6.8,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_9',
        airline: 'Alaska Airlines',
        airlineCode: 'AS',
        flightNumber: 'AS 789',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '06:15',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '14:55',
        duration: '5h 40m',
        durationMinutes: 340,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 737 MAX 9',
        cabinClass: 'Economy',
        price: 198,
        originalPrice: 249,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Fee',
        wifi: true,
        entertainment: false,
        powerOutlets: true,
        flightScore: 8.1,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_10',
        airline: 'Spirit Airlines',
        airlineCode: 'NK',
        flightNumber: 'NK 503',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '07:00',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '18:55',
        duration: '8h 55m',
        durationMinutes: 535,
        stops: 1,
        stopAirports: ['ATL'],
        stopDurations: ['2h 20m'],
        aircraft: 'Airbus A320',
        cabinClass: 'Economy',
        price: 89,
        originalPrice: null,
        baggageIncluded: 'Personal item (small)',
        seatSelection: 'Fee',
        wifi: false,
        entertainment: false,
        powerOutlets: false,
        flightScore: 5.5,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_11',
        airline: 'United Airlines',
        airlineCode: 'UA',
        flightNumber: 'UA 2788',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '09:00',
        arrivalAirport: 'SFO',
        arrivalCity: 'San Francisco',
        arrivalTime: '12:30',
        duration: '6h 30m',
        durationMinutes: 390,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 737-900',
        cabinClass: 'Economy',
        price: 199,
        originalPrice: 265,
        baggageIncluded: 'Personal item',
        seatSelection: 'Fee',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.2,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_12',
        airline: 'Delta Air Lines',
        airlineCode: 'DL',
        flightNumber: 'DL 1895',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '11:15',
        arrivalAirport: 'SFO',
        arrivalCity: 'San Francisco',
        arrivalTime: '14:50',
        duration: '6h 35m',
        durationMinutes: 395,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 757-200',
        cabinClass: 'Economy',
        price: 219,
        originalPrice: 299,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Included',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.8,
        refundable: true,
        nextDayArrival: false
      },
      {
        id: 'flight_13',
        airline: 'JetBlue Airways',
        airlineCode: 'B6',
        flightNumber: 'B6 422',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '15:30',
        arrivalAirport: 'SFO',
        arrivalCity: 'San Francisco',
        arrivalTime: '19:05',
        duration: '6h 35m',
        durationMinutes: 395,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Airbus A321',
        cabinClass: 'Economy',
        price: 185,
        originalPrice: 245,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Included',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.9,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_14',
        airline: 'Southwest Airlines',
        airlineCode: 'WN',
        flightNumber: 'WN 2345',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '06:00',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '14:25',
        duration: '5h 25m',
        durationMinutes: 325,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 737 MAX 8',
        cabinClass: 'Economy',
        price: 168,
        originalPrice: 218,
        baggageIncluded: '2 checked bags free',
        seatSelection: 'Open seating',
        wifi: true,
        entertainment: false,
        powerOutlets: true,
        flightScore: 7.5,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_15',
        airline: 'Southwest Airlines',
        airlineCode: 'WN',
        flightNumber: 'WN 3456',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '16:30',
        arrivalAirport: 'SFO',
        arrivalCity: 'San Francisco',
        arrivalTime: '19:55',
        duration: '6h 25m',
        durationMinutes: 385,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 737 MAX 8',
        cabinClass: 'Economy',
        price: 172,
        originalPrice: 222,
        baggageIncluded: '2 checked bags free',
        seatSelection: 'Open seating',
        wifi: true,
        entertainment: false,
        powerOutlets: true,
        flightScore: 7.3,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_16',
        airline: 'Frontier Airlines',
        airlineCode: 'F9',
        flightNumber: 'F9 789',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '07:15',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '18:45',
        duration: '8h 30m',
        durationMinutes: 510,
        stops: 1,
        stopAirports: ['DEN'],
        stopDurations: ['1h 45m'],
        aircraft: 'Airbus A320neo',
        cabinClass: 'Economy',
        price: 129,
        originalPrice: null,
        baggageIncluded: 'Personal item only',
        seatSelection: 'Extra fee',
        wifi: false,
        entertainment: false,
        powerOutlets: false,
        flightScore: 5.8,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_17',
        airline: 'Frontier Airlines',
        airlineCode: 'F9',
        flightNumber: 'F9 890',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '20:00',
        arrivalAirport: 'SFO',
        arrivalCity: 'San Francisco',
        arrivalTime: '01:30',
        duration: '8h 30m',
        durationMinutes: 510,
        stops: 1,
        stopAirports: ['DEN'],
        stopDurations: ['1h 50m'],
        aircraft: 'Airbus A320neo',
        cabinClass: 'Economy',
        price: 135,
        originalPrice: null,
        baggageIncluded: 'Personal item only',
        seatSelection: 'Extra fee',
        wifi: false,
        entertainment: false,
        powerOutlets: false,
        flightScore: 5.5,
        refundable: false,
        nextDayArrival: true
      },
      {
        id: 'flight_18',
        airline: 'Delta Air Lines',
        airlineCode: 'DL',
        flightNumber: 'DL 5678',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '21:00',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '05:30',
        duration: '5h 30m',
        durationMinutes: 330,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 767-400ER',
        cabinClass: 'Economy',
        price: 205,
        originalPrice: 265,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Included',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.6,
        refundable: true,
        nextDayArrival: true
      },
      {
        id: 'flight_19',
        airline: 'Delta Air Lines',
        airlineCode: 'DL',
        flightNumber: 'DL 6789',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '22:30',
        arrivalAirport: 'SFO',
        arrivalCity: 'San Francisco',
        arrivalTime: '02:00',
        duration: '6h 30m',
        durationMinutes: 390,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Boeing 767-400ER',
        cabinClass: 'Economy',
        price: 198,
        originalPrice: 258,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Included',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.4,
        refundable: true,
        nextDayArrival: true
      },
      {
        id: 'flight_20',
        airline: 'American Airlines',
        airlineCode: 'AA',
        flightNumber: 'AA 1357',
        departureAirport: 'SFO',
        departureCity: 'San Francisco',
        departureTime: '14:00',
        arrivalAirport: 'JFK',
        arrivalCity: 'New York',
        arrivalTime: '22:28',
        duration: '5h 28m',
        durationMinutes: 328,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Airbus A321T',
        cabinClass: 'Economy',
        price: 215,
        originalPrice: 275,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Included',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.0,
        refundable: false,
        nextDayArrival: false
      },
      {
        id: 'flight_21',
        airline: 'American Airlines',
        airlineCode: 'AA',
        flightNumber: 'AA 2468',
        departureAirport: 'JFK',
        departureCity: 'New York',
        departureTime: '07:00',
        arrivalAirport: 'SFO',
        arrivalCity: 'San Francisco',
        arrivalTime: '10:35',
        duration: '6h 35m',
        durationMinutes: 395,
        stops: 0,
        stopAirports: [],
        stopDurations: [],
        aircraft: 'Airbus A321T',
        cabinClass: 'Economy',
        price: 208,
        originalPrice: 268,
        baggageIncluded: 'Carry-on + Personal',
        seatSelection: 'Included',
        wifi: true,
        entertainment: true,
        powerOutlets: true,
        flightScore: 8.2,
        refundable: false,
        nextDayArrival: false
      }
    ],
    flightResults: [
      {
        id: 'flightresult_1',
        outbound: 'flight_1',
        returnFlight: 'flight_11',
        totalPrice: 388,
        pricePerPerson: 194,
        savings: 56,
        cabinOptions: [
          { class: 'Economy', price: 388, pricePerPerson: 194 },
          { class: 'Premium Economy', price: 598, pricePerPerson: 299 },
          { class: 'Business', price: 1198, pricePerPerson: 599 },
          { class: 'First', price: 1798, pricePerPerson: 899 }
        ]
      },
      {
        id: 'flightresult_2',
        outbound: 'flight_3',
        returnFlight: 'flight_12',
        totalPrice: 418,
        pricePerPerson: 209,
        savings: 110,
        cabinOptions: [
          { class: 'Economy', price: 418, pricePerPerson: 209 },
          { class: 'Premium Economy', price: 648, pricePerPerson: 324 },
          { class: 'Business', price: 1298, pricePerPerson: 649 },
          { class: 'First', price: 1898, pricePerPerson: 949 }
        ]
      },
      {
        id: 'flightresult_3',
        outbound: 'flight_5',
        returnFlight: 'flight_13',
        totalPrice: 364,
        pricePerPerson: 182,
        savings: 110,
        cabinOptions: [
          { class: 'Economy', price: 364, pricePerPerson: 182 },
          { class: 'Premium Economy', price: 564, pricePerPerson: 282 },
          { class: 'Business', price: 1164, pricePerPerson: 582 },
          { class: 'First', price: 1764, pricePerPerson: 882 }
        ]
      },
      {
        id: 'flightresult_4',
        outbound: 'flight_7',
        returnFlight: 'flight_11',
        totalPrice: 364,
        pricePerPerson: 182,
        savings: 90,
        cabinOptions: [
          { class: 'Economy', price: 364, pricePerPerson: 182 },
          { class: 'Premium Economy', price: 564, pricePerPerson: 282 }
        ]
      },
      {
        id: 'flightresult_5',
        outbound: 'flight_2',
        returnFlight: 'flight_12',
        totalPrice: 434,
        pricePerPerson: 217,
        savings: 60,
        cabinOptions: [
          { class: 'Economy', price: 434, pricePerPerson: 217 },
          { class: 'Premium Economy', price: 634, pricePerPerson: 317 },
          { class: 'Business', price: 1234, pricePerPerson: 617 }
        ]
      },
      {
        id: 'flightresult_6',
        outbound: 'flight_4',
        returnFlight: 'flight_13',
        totalPrice: 394,
        pricePerPerson: 197,
        savings: 95,
        cabinOptions: [
          { class: 'Economy', price: 394, pricePerPerson: 197 },
          { class: 'Premium Economy', price: 594, pricePerPerson: 297 }
        ]
      },
      {
        id: 'flightresult_7',
        outbound: 'flight_10',
        returnFlight: 'flight_11',
        totalPrice: 288,
        pricePerPerson: 144,
        savings: 30,
        cabinOptions: [
          { class: 'Economy', price: 288, pricePerPerson: 144 }
        ]
      },
      {
        id: 'flightresult_8',
        outbound: 'flight_9',
        returnFlight: 'flight_12',
        totalPrice: 417,
        pricePerPerson: 208,
        savings: 101,
        cabinOptions: [
          { class: 'Economy', price: 417, pricePerPerson: 208 },
          { class: 'Premium Economy', price: 617, pricePerPerson: 308 },
          { class: 'Business', price: 1217, pricePerPerson: 608 }
        ]
      },
      {
        id: 'flightresult_9',
        outbound: 'flight_14',
        returnFlight: 'flight_15',
        totalPrice: 340,
        pricePerPerson: 170,
        savings: 100,
        cabinOptions: [
          { class: 'Economy', price: 340, pricePerPerson: 170 }
        ]
      },
      {
        id: 'flightresult_10',
        outbound: 'flight_16',
        returnFlight: 'flight_17',
        totalPrice: 264,
        pricePerPerson: 132,
        savings: 0,
        cabinOptions: [
          { class: 'Economy', price: 264, pricePerPerson: 132 }
        ]
      },
      {
        id: 'flightresult_11',
        outbound: 'flight_18',
        returnFlight: 'flight_19',
        totalPrice: 403,
        pricePerPerson: 201,
        savings: 120,
        cabinOptions: [
          { class: 'Economy', price: 403, pricePerPerson: 201 },
          { class: 'Premium Economy', price: 633, pricePerPerson: 316 },
          { class: 'Business', price: 1503, pricePerPerson: 751 },
          { class: 'First', price: 3203, pricePerPerson: 1601 }
        ]
      },
      {
        id: 'flightresult_12',
        outbound: 'flight_20',
        returnFlight: 'flight_21',
        totalPrice: 423,
        pricePerPerson: 211,
        savings: 120,
        cabinOptions: [
          { class: 'Economy', price: 423, pricePerPerson: 211 },
          { class: 'Premium Economy', price: 623, pricePerPerson: 311 },
          { class: 'Business', price: 1523, pricePerPerson: 761 }
        ]
      }
    ],
    cars: [
      {
        id: 'car_1',
        company: 'Enterprise',
        vehicleType: 'Economy',
        vehicleName: 'Toyota Corolla or similar',
        passengers: 5,
        bags: 2,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 45,
        totalPrice: 180,
        features: ['Unlimited mileage', 'Free cancellation'],
        rating: 8.2,
        reviewCount: 342
      },
      {
        id: 'car_2',
        company: 'Enterprise',
        vehicleType: 'SUV',
        vehicleName: 'Ford Explorer or similar',
        passengers: 7,
        bags: 4,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 89,
        totalPrice: 356,
        features: ['Unlimited mileage', 'Free cancellation', 'GPS included'],
        rating: 8.5,
        reviewCount: 198
      },
      {
        id: 'car_3',
        company: 'Hertz',
        vehicleType: 'Compact',
        vehicleName: 'Honda Civic or similar',
        passengers: 5,
        bags: 2,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 48,
        totalPrice: 192,
        features: ['Unlimited mileage', 'Free cancellation'],
        rating: 7.9,
        reviewCount: 421
      },
      {
        id: 'car_4',
        company: 'Hertz',
        vehicleType: 'Midsize',
        vehicleName: 'Toyota Camry or similar',
        passengers: 5,
        bags: 3,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 62,
        totalPrice: 248,
        features: ['Unlimited mileage', 'Free cancellation'],
        rating: 8.1,
        reviewCount: 287
      },
      {
        id: 'car_5',
        company: 'Budget',
        vehicleType: 'Economy',
        vehicleName: 'Nissan Versa or similar',
        passengers: 5,
        bags: 2,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 38,
        totalPrice: 152,
        features: ['Free cancellation'],
        rating: 7.2,
        reviewCount: 513
      },
      {
        id: 'car_6',
        company: 'Budget',
        vehicleType: 'Full-size',
        vehicleName: 'Chrysler 300 or similar',
        passengers: 5,
        bags: 3,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 72,
        totalPrice: 288,
        features: ['Unlimited mileage'],
        rating: 7.5,
        reviewCount: 162
      },
      {
        id: 'car_7',
        company: 'Avis',
        vehicleType: 'Luxury',
        vehicleName: 'Mercedes-Benz E-Class or similar',
        passengers: 5,
        bags: 3,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 145,
        totalPrice: 580,
        features: ['Unlimited mileage', 'Free cancellation', 'Premium insurance'],
        rating: 9.0,
        reviewCount: 94
      },
      {
        id: 'car_8',
        company: 'National',
        vehicleType: 'Midsize',
        vehicleName: 'Chevrolet Malibu or similar',
        passengers: 5,
        bags: 3,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 58,
        totalPrice: 232,
        features: ['Unlimited mileage', 'Free cancellation'],
        rating: 8.3,
        reviewCount: 225
      },
      {
        id: 'car_9',
        company: 'Hertz',
        vehicleType: 'Luxury',
        vehicleName: 'BMW 5 Series or similar',
        passengers: 5,
        bags: 3,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 175,
        totalPrice: 700,
        features: ['Unlimited mileage', 'Free cancellation', 'Premium insurance included'],
        rating: 9.0,
        reviewCount: 89
      },
      {
        id: 'car_10',
        company: 'Enterprise',
        vehicleType: 'SUV',
        vehicleName: 'Ford Explorer or similar',
        passengers: 7,
        bags: 4,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 95,
        totalPrice: 380,
        features: ['Unlimited mileage', 'Free cancellation', 'Child seat available'],
        rating: 8.6,
        reviewCount: 312
      },
      {
        id: 'car_11',
        company: 'Avis',
        vehicleType: 'Compact',
        vehicleName: 'Volkswagen Jetta or similar',
        passengers: 5,
        bags: 2,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 42,
        totalPrice: 168,
        features: ['Unlimited mileage', 'Airport shuttle'],
        rating: 7.8,
        reviewCount: 267
      },
      {
        id: 'car_12',
        company: 'Budget',
        vehicleType: 'Full-size',
        vehicleName: 'Dodge Charger or similar',
        passengers: 5,
        bags: 3,
        transmission: 'Automatic',
        pickupLocation: 'JFK International Airport',
        dropoffLocation: 'JFK International Airport',
        pricePerDay: 68,
        totalPrice: 272,
        features: ['Unlimited mileage', 'Free cancellation'],
        rating: 7.6,
        reviewCount: 198
      }
    ],
    activities: [
      {
        id: 'activity_1',
        name: 'Statue of Liberty & Ellis Island Tour',
        category: 'Tours',
        description: 'Visit two of America\'s most iconic landmarks on this guided tour. See the Statue of Liberty up close and explore the Ellis Island Immigration Museum, which tells the story of millions of immigrants who came to America.',
        location: 'New York, NY',
        duration: '4 hours',
        price: 49,
        originalPrice: 59,
        rating: 4.8,
        reviewCount: 8923,
        image: 'https://picsum.photos/seed/activity1/400/250',
        highlights: ['Skip-the-line access', 'Expert guide', 'Ferry included', 'Free cancellation'],
        freeCancellation: true
      },
      {
        id: 'activity_2',
        name: 'Top of the Rock Observation Deck',
        category: 'Attractions',
        description: 'Ascend to the top of 30 Rockefeller Plaza for breathtaking panoramic views of New York City. From here, you can see the Empire State Building, Central Park, and the Manhattan skyline in all its glory.',
        location: 'New York, NY',
        duration: '1.5 hours',
        price: 42,
        originalPrice: null,
        rating: 4.7,
        reviewCount: 12451,
        image: 'https://picsum.photos/seed/activity2/400/250',
        highlights: ['Panoramic NYC views', 'Indoor and outdoor decks', 'No crowds morning entry'],
        freeCancellation: true
      },
      {
        id: 'activity_3',
        name: 'Broadway Show - Hamilton',
        category: 'Shows',
        description: 'Experience the groundbreaking musical that took the world by storm. Hamilton tells the story of America\'s Founding Father Alexander Hamilton through a revolutionary blend of hip-hop, jazz, blues, and R&B.',
        location: 'New York, NY',
        duration: '2.75 hours',
        price: 189,
        originalPrice: 250,
        rating: 4.9,
        reviewCount: 3421,
        image: 'https://picsum.photos/seed/activity3/400/250',
        highlights: ['Premium orchestra seats', 'Iconic Broadway show', 'Cast Q&A included'],
        freeCancellation: false
      },
      {
        id: 'activity_4',
        name: 'Central Park Bike Tour',
        category: 'Tours',
        description: 'Explore the iconic 843-acre Central Park on two wheels with an expert local guide. Visit hidden gems, iconic bridges, Bethesda Fountain, and learn about the park\'s fascinating history and design.',
        location: 'New York, NY',
        duration: '2 hours',
        price: 35,
        originalPrice: 45,
        rating: 4.6,
        reviewCount: 2187,
        image: 'https://picsum.photos/seed/activity4/400/250',
        highlights: ['Bike rental included', 'Small group', 'All skill levels welcome', 'Free cancellation'],
        freeCancellation: true
      },
      {
        id: 'activity_5',
        name: 'MoMA - Museum of Modern Art',
        category: 'Attractions',
        description: 'The Museum of Modern Art (MoMA) houses one of the world\'s greatest collections of modern and contemporary art, including works by Picasso, Monet, Warhol, and Pollock. A must-visit for art lovers.',
        location: 'New York, NY',
        duration: '2-3 hours',
        price: 25,
        originalPrice: null,
        rating: 4.7,
        reviewCount: 9876,
        image: 'https://picsum.photos/seed/activity5/400/250',
        highlights: ['World-class art collection', 'Audio guide available', 'Skip the line'],
        freeCancellation: true
      },
      {
        id: 'activity_6',
        name: 'NYC Food Tour - Greenwich Village',
        category: 'Tours',
        description: 'Discover the culinary soul of NYC on this food tour through Greenwich Village. Taste authentic Italian, Jewish deli classics, artisan cheeses, and innovative New American cuisine at 6-8 stops.',
        location: 'New York, NY',
        duration: '3 hours',
        price: 65,
        originalPrice: 80,
        rating: 4.8,
        reviewCount: 1543,
        image: 'https://picsum.photos/seed/activity6/400/250',
        highlights: ['8 food tastings', 'Expert foodie guide', 'Small group (max 12)', 'Free cancellation'],
        freeCancellation: true
      },
      {
        id: 'activity_7',
        name: 'NYC Helicopter Tour',
        category: 'Tours',
        description: 'See New York City like never before with an exhilarating helicopter tour over Manhattan. Fly past the Statue of Liberty, Brooklyn Bridge, One World Trade, and the iconic NYC skyline.',
        location: 'New York, NY',
        duration: '15 minutes',
        price: 199,
        originalPrice: 249,
        rating: 4.9,
        reviewCount: 876,
        image: 'https://picsum.photos/seed/activity7/400/250',
        highlights: ['Unbeatable aerial views', 'Experienced pilots', 'Hotel pickup available'],
        freeCancellation: false
      },
      {
        id: 'activity_8',
        name: 'Brooklyn Bridge Walking Tour',
        category: 'Day trips',
        description: 'Walk across one of the world\'s most famous bridges with a knowledgeable guide. Learn about the engineering marvel\'s history, construction, and the fascinating stories behind one of NYC\'s most beloved landmarks.',
        location: 'New York, NY',
        duration: '2 hours',
        price: 29,
        originalPrice: null,
        rating: 4.5,
        reviewCount: 4321,
        image: 'https://picsum.photos/seed/activity8/400/250',
        highlights: ['Expert historical guide', 'DUMBO neighborhood visit', 'Free cancellation'],
        freeCancellation: true
      }
    ],
    bookings: [
      {
        id: 'booking_1',
        type: 'hotel',
        status: 'upcoming',
        confirmationNumber: 'EXP-78294561',
        itineraryNumber: '7218931051',
        createdAt: '2026-04-01T10:00:00Z',
        hotelId: 'hotel_1',
        flightId: null,
        carId: null,
        activityId: null,
        checkIn: '2026-05-15',
        checkOut: '2026-05-19',
        guests: 2,
        rooms: 1,
        roomType: 'Deluxe King Room',
        totalCost: 996,
        oneKeyCashEarned: 19.92,
        paymentMethod: 'Visa ending in 4242',
        travelerNames: ['Sarah Johnson', 'James Johnson'],
        cancellationDeadline: '2026-05-13T23:59:00Z',
        notes: ''
      },
      {
        id: 'booking_2',
        type: 'flight',
        status: 'upcoming',
        confirmationNumber: 'EXP-45678901',
        itineraryNumber: '4567890123',
        createdAt: '2026-04-02T14:00:00Z',
        hotelId: null,
        flightId: 'flightresult_1',
        carId: null,
        activityId: null,
        checkIn: '2026-05-15',
        checkOut: '2026-05-19',
        guests: 1,
        rooms: 0,
        roomType: null,
        totalCost: 388,
        oneKeyCashEarned: 7.76,
        paymentMethod: 'Visa ending in 4242',
        travelerNames: ['Sarah Johnson'],
        cancellationDeadline: null,
        notes: ''
      },
      {
        id: 'booking_3',
        type: 'hotel',
        status: 'completed',
        confirmationNumber: 'EXP-23456789',
        itineraryNumber: '2345678901',
        createdAt: '2026-02-15T09:00:00Z',
        hotelId: null,
        flightId: null,
        carId: null,
        activityId: null,
        checkIn: '2026-03-10',
        checkOut: '2026-03-14',
        guests: 2,
        rooms: 1,
        roomType: 'Ocean View Suite',
        totalCost: 1800,
        oneKeyCashEarned: 36.00,
        paymentMethod: 'Visa ending in 4242',
        travelerNames: ['Sarah Johnson', 'James Johnson'],
        cancellationDeadline: null,
        notes: 'The Beverly Hills Hotel, Los Angeles, CA'
      },
      {
        id: 'booking_4',
        type: 'car',
        status: 'cancelled',
        confirmationNumber: 'EXP-12345678',
        itineraryNumber: '1234567890',
        createdAt: '2026-03-20T11:00:00Z',
        hotelId: null,
        flightId: null,
        carId: 'car_5',
        activityId: null,
        checkIn: '2026-04-05',
        checkOut: '2026-04-08',
        guests: 1,
        rooms: 0,
        roomType: null,
        totalCost: 180,
        oneKeyCashEarned: 0,
        paymentMethod: 'Visa ending in 4242',
        travelerNames: ['Sarah Johnson'],
        cancellationDeadline: null,
        notes: 'Budget at ORD, Chicago - Cancelled due to trip change'
      }
    ],
    searchFilters: {
      destination: 'New York, NY',
      checkIn: '2026-05-15',
      checkOut: '2026-05-19',
      guests: 2,
      rooms: 1,
      priceMin: 0,
      priceMax: 1000,
      starRatings: [],
      guestRatingMin: 0,
      amenities: [],
      propertyTypes: [],
      neighborhoods: [],
      freeCancellation: false,
      payLater: false,
      sortBy: 'recommended'
    },
    flightSearchFilters: {
      from: 'San Francisco (SFO)',
      to: 'New York (JFK)',
      departDate: '2026-05-15',
      returnDate: '2026-05-19',
      tripType: 'roundtrip',
      travelers: 1,
      cabinClass: 'Economy',
      stops: 'any',
      airlines: [],
      departTimeRange: 'any',
      priceMax: 1000,
      sortBy: 'recommended'
    },
    carSearchFilters: {
      pickupLocation: 'JFK International Airport',
      pickupDate: '2026-05-15',
      dropoffDate: '2026-05-19',
      pickupTime: '10:00',
      dropoffTime: '10:00',
      vehicleTypes: [],
      companies: [],
      transmission: 'any',
      priceMax: 200,
      sortBy: 'recommended'
    },
    trendingDestinations: [
      {
        id: 'dest_1',
        name: 'New York City',
        country: 'United States',
        image: 'https://picsum.photos/seed/nyc/400/250',
        averagePrice: 199,
        tagline: 'The city that never sleeps'
      },
      {
        id: 'dest_2',
        name: 'Cancun',
        country: 'Mexico',
        image: 'https://picsum.photos/seed/cancun/400/250',
        averagePrice: 129,
        tagline: 'Sun, sand, and savings'
      },
      {
        id: 'dest_3',
        name: 'Maui',
        country: 'United States',
        image: 'https://picsum.photos/seed/maui/400/250',
        averagePrice: 289,
        tagline: 'Paradise awaits'
      },
      {
        id: 'dest_4',
        name: 'Paris',
        country: 'France',
        image: 'https://picsum.photos/seed/paris/400/250',
        averagePrice: 259,
        tagline: 'The City of Light'
      },
      {
        id: 'dest_5',
        name: 'Tokyo',
        country: 'Japan',
        image: 'https://picsum.photos/seed/tokyo/400/250',
        averagePrice: 349,
        tagline: 'Ancient meets modern'
      },
      {
        id: 'dest_6',
        name: 'London',
        country: 'United Kingdom',
        image: 'https://picsum.photos/seed/london/400/250',
        averagePrice: 279,
        tagline: 'Royal experiences'
      }
    ],
    packages: [
      {
        id: 'pkg_1',
        name: 'New York City Getaway',
        destination: 'New York, NY',
        image: 'https://picsum.photos/seed/pkg_nyc/400/250',
        duration: '4 nights',
        includes: ['Flight', 'Hotel', 'Airport Transfer'],
        hotel: 'The Manhattan Club',
        airline: 'United Airlines',
        pricePerPerson: 899,
        originalPrice: 1150,
        rating: 4.7,
        reviewCount: 342,
        departDates: ['2026-05-15', '2026-05-22', '2026-06-01', '2026-06-15'],
        highlights: ['Save $251 vs booking separately', 'Free cancellation until May 1', '4-star hotel in Midtown']
      },
      {
        id: 'pkg_2',
        name: 'Cancun All-Inclusive Beach Escape',
        destination: 'Cancun, Mexico',
        image: 'https://picsum.photos/seed/pkg_cancun/400/250',
        duration: '5 nights',
        includes: ['Flight', 'All-Inclusive Resort', 'Airport Transfer', 'Travel Insurance'],
        hotel: 'Grand Riviera Princess',
        airline: 'JetBlue Airways',
        pricePerPerson: 1249,
        originalPrice: 1600,
        rating: 4.8,
        reviewCount: 1205,
        departDates: ['2026-06-01', '2026-06-08', '2026-06-15', '2026-07-01'],
        highlights: ['All meals & drinks included', 'Beachfront resort', 'Save $351 per person']
      },
      {
        id: 'pkg_3',
        name: 'Paris Romantic Retreat',
        destination: 'Paris, France',
        image: 'https://picsum.photos/seed/pkg_paris/400/250',
        duration: '6 nights',
        includes: ['Flight', 'Boutique Hotel', 'Seine River Cruise', 'Airport Transfer'],
        hotel: 'Hotel Le Marais',
        airline: 'Delta Air Lines',
        pricePerPerson: 1799,
        originalPrice: 2200,
        rating: 4.9,
        reviewCount: 567,
        departDates: ['2026-06-10', '2026-07-01', '2026-07-15', '2026-08-01'],
        highlights: ['Eiffel Tower view room', 'Seine River cruise included', 'Save $401 per person']
      },
      {
        id: 'pkg_4',
        name: 'Maui Paradise Package',
        destination: 'Maui, HI',
        image: 'https://picsum.photos/seed/pkg_maui/400/250',
        duration: '7 nights',
        includes: ['Flight', 'Resort', 'Car Rental', 'Snorkeling Tour'],
        hotel: 'Wailea Beach Resort',
        airline: 'Alaska Airlines',
        pricePerPerson: 2199,
        originalPrice: 2800,
        rating: 4.8,
        reviewCount: 891,
        departDates: ['2026-06-15', '2026-07-01', '2026-07-20', '2026-08-10'],
        highlights: ['Car rental included', 'Oceanfront resort', 'Save $601 per person']
      },
      {
        id: 'pkg_5',
        name: 'Las Vegas Weekend Blast',
        destination: 'Las Vegas, NV',
        image: 'https://picsum.photos/seed/pkg_vegas/400/250',
        duration: '3 nights',
        includes: ['Flight', 'Strip Hotel', 'Show Tickets'],
        hotel: 'Bellagio Las Vegas',
        airline: 'Southwest Airlines',
        pricePerPerson: 649,
        originalPrice: 850,
        rating: 4.6,
        reviewCount: 2103,
        departDates: ['2026-05-16', '2026-05-23', '2026-06-06', '2026-06-13'],
        highlights: ['Cirque du Soleil tickets included', 'Strip-front hotel', 'Save $201 per person']
      },
      {
        id: 'pkg_6',
        name: 'Tokyo Culture & Discovery',
        destination: 'Tokyo, Japan',
        image: 'https://picsum.photos/seed/pkg_tokyo/400/250',
        duration: '8 nights',
        includes: ['Flight', 'Hotel', 'Rail Pass', 'Guided City Tour'],
        hotel: 'Park Hotel Tokyo',
        airline: 'United Airlines',
        pricePerPerson: 2499,
        originalPrice: 3100,
        rating: 4.9,
        reviewCount: 412,
        departDates: ['2026-06-20', '2026-07-10', '2026-08-01', '2026-09-05'],
        highlights: ['7-day Japan Rail Pass', 'Shibuya district hotel', 'Save $601 per person']
      }
    ],
    cruises: [
      {
        id: 'cruise_1',
        name: 'Caribbean Paradise Cruise',
        cruiseLine: 'Royal Caribbean',
        ship: 'Wonder of the Seas',
        image: 'https://picsum.photos/seed/cruise_caribbean/400/250',
        duration: '7 nights',
        departure: 'Miami, FL',
        itinerary: ['CocoCay, Bahamas', 'Charlotte Amalie, USVI', 'Philipsburg, St. Maarten'],
        cabins: [
          { type: 'Interior', price: 799, originalPrice: 999 },
          { type: 'Ocean View', price: 999, originalPrice: 1199 },
          { type: 'Balcony', price: 1399, originalPrice: 1699 },
          { type: 'Suite', price: 2499, originalPrice: 2999 }
        ],
        departDates: ['2026-06-01', '2026-06-15', '2026-07-06', '2026-07-20'],
        rating: 4.7,
        reviewCount: 4521,
        highlights: ['All meals included', 'Waterpark on board', 'Broadway-style shows', 'Kids sail free'],
        amenities: ['Pool', 'Spa', 'Casino', 'Fitness center', 'Rock climbing wall', 'Surf simulator']
      },
      {
        id: 'cruise_2',
        name: 'Mediterranean Discovery',
        cruiseLine: 'Norwegian Cruise Line',
        ship: 'Norwegian Prima',
        image: 'https://picsum.photos/seed/cruise_med/400/250',
        duration: '10 nights',
        departure: 'Barcelona, Spain',
        itinerary: ['Marseille, France', 'Florence, Italy', 'Rome, Italy', 'Naples, Italy', 'Santorini, Greece', 'Athens, Greece'],
        cabins: [
          { type: 'Interior', price: 1299, originalPrice: 1599 },
          { type: 'Ocean View', price: 1599, originalPrice: 1899 },
          { type: 'Balcony', price: 1999, originalPrice: 2499 },
          { type: 'Suite', price: 3499, originalPrice: 4199 }
        ],
        departDates: ['2026-06-10', '2026-07-05', '2026-07-25', '2026-08-15'],
        rating: 4.8,
        reviewCount: 2187,
        highlights: ['6 European ports', 'Free beverage package', 'Shore excursions available', 'Specialty dining'],
        amenities: ['Infinity Pool', 'Spa & Thermal Suite', 'Casino', 'Go-Kart Track', 'Water Slides']
      },
      {
        id: 'cruise_3',
        name: 'Alaska Glacier Explorer',
        cruiseLine: 'Princess Cruises',
        ship: 'Discovery Princess',
        image: 'https://picsum.photos/seed/cruise_alaska/400/250',
        duration: '7 nights',
        departure: 'Seattle, WA',
        itinerary: ['Juneau, AK', 'Skagway, AK', 'Glacier Bay', 'Ketchikan, AK'],
        cabins: [
          { type: 'Interior', price: 899, originalPrice: 1099 },
          { type: 'Ocean View', price: 1199, originalPrice: 1399 },
          { type: 'Balcony', price: 1599, originalPrice: 1899 },
          { type: 'Suite', price: 2799, originalPrice: 3399 }
        ],
        departDates: ['2026-06-05', '2026-06-19', '2026-07-03', '2026-07-17'],
        rating: 4.9,
        reviewCount: 3102,
        highlights: ['Glacier Bay scenic cruising', 'Whale watching', 'Complimentary excursion credit', 'Nature talks'],
        amenities: ['Hot Tubs', 'Spa', 'Cinema', 'Library', 'Observation Deck']
      },
      {
        id: 'cruise_4',
        name: 'Bahamas Quick Getaway',
        cruiseLine: 'Carnival Cruise Line',
        ship: 'Carnival Celebration',
        image: 'https://picsum.photos/seed/cruise_bahamas/400/250',
        duration: '4 nights',
        departure: 'Miami, FL',
        itinerary: ['Nassau, Bahamas', 'Half Moon Cay, Bahamas'],
        cabins: [
          { type: 'Interior', price: 399, originalPrice: 499 },
          { type: 'Ocean View', price: 549, originalPrice: 649 },
          { type: 'Balcony', price: 749, originalPrice: 899 },
          { type: 'Suite', price: 1299, originalPrice: 1599 }
        ],
        departDates: ['2026-05-18', '2026-05-25', '2026-06-01', '2026-06-08'],
        rating: 4.5,
        reviewCount: 6789,
        highlights: ['Short getaway', 'Private island access', 'Water slides', 'Fun for all ages'],
        amenities: ['WaterWorks', 'Casino', 'Comedy Club', 'Spa', 'Mini Golf']
      },
      {
        id: 'cruise_5',
        name: 'Hawaiian Islands Voyage',
        cruiseLine: 'Holland America Line',
        ship: 'Koningsdam',
        image: 'https://picsum.photos/seed/cruise_hawaii/400/250',
        duration: '15 nights',
        departure: 'San Diego, CA',
        itinerary: ['Hilo, HI', 'Honolulu, HI', 'Nawiliwili, HI', 'Lahaina, Maui', 'Ensenada, Mexico'],
        cabins: [
          { type: 'Interior', price: 1999, originalPrice: 2499 },
          { type: 'Ocean View', price: 2499, originalPrice: 2999 },
          { type: 'Balcony', price: 3299, originalPrice: 3999 },
          { type: 'Suite', price: 5499, originalPrice: 6499 }
        ],
        departDates: ['2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01'],
        rating: 4.8,
        reviewCount: 1543,
        highlights: ['4 Hawaiian islands', 'Premium dining', 'BBC Earth experiences', 'Live music daily'],
        amenities: ['Pool', 'Spa', 'Casino', 'Culinary Arts Center', 'Digital Workshop', 'Art Gallery']
      }
    ],
    activitySearchFilters: {
      location: 'New York, NY',
      date: '2026-05-15',
      categories: [],
      priceMax: 300,
      freeCancellationOnly: false,
      sortBy: 'recommended'
    },
    packageSearchFilters: {
      destination: '',
      departDate: '',
      travelers: 2,
      sortBy: 'recommended'
    },
    cruiseSearchFilters: {
      destination: '',
      duration: '',
      cruiseLine: '',
      departMonth: '',
      sortBy: 'recommended'
    },
    currentView: 'home',
    selectedHotel: null,
    selectedFlight: null,
    cart: null,
    recentlyViewed: []
  }
}
