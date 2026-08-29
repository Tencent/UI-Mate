// Xooking.com Mock — Data Manager
// Implements session-aware state management per dev.md standards

const BASE_STORAGE_KEY = 'booking_com_mock_state';
const BASE_INITIAL_KEY = 'booking_com_mock_initialState';

export function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}

export function initialKey(sid) {
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
  } catch (e) {
    console.warn('No custom state available');
  }
  return null;
};

export const saveState = (state, sid = null) => {
  try {
    localStorage.setItem(storageKey(sid), JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
  try {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state: state.current_state }),
    }).catch(() => {});
  } catch (e) {
    console.error('Failed to sync state to server', e);
  }
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (
        typeof custom[key] === 'object' &&
        !Array.isArray(custom[key]) &&
        typeof defaults[key] === 'object' &&
        !Array.isArray(defaults[key])
      ) {
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
    const defaultData = createInitialData();
    const mergedData = deepMergeWithDefaults(defaultData, customState);
    const fullState = {
      initial_state: JSON.parse(JSON.stringify(mergedData)),
      current_state: mergedData,
    };
    localStorage.setItem(sk, JSON.stringify(fullState));
    localStorage.setItem(ik, JSON.stringify(fullState));
    return fullState;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
      return parsed;
    } catch (e) {
      console.warn('Corrupted state in localStorage, resetting to defaults:', e);
      localStorage.removeItem(sk);
    }
  }

  const defaultData = createInitialData();
  const fullState = {
    initial_state: JSON.parse(JSON.stringify(defaultData)),
    current_state: defaultData,
  };
  localStorage.setItem(sk, JSON.stringify(fullState));
  localStorage.setItem(ik, JSON.stringify(fullState));
  return fullState;
};

// ========================
// SEED DATA
// ========================

export function createInitialData() {
  return {
    user: {
      id: 'user_1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      country: 'United States',
      nationality: 'American',
      avatarUrl: null,
      geniusLevel: 1,
      geniusBookings: 2,
      geniusBookingsRequired: 5,
      currency: 'USD',
      language: 'English (US)',
      savedProperties: ['prop_2', 'prop_5'],
    },
    destinations: [
      { id: 'dest_1', name: 'New York', country: 'United States', countryCode: 'US', type: 'city', propertyCount: 1847, trending: true, description: 'The city that never sleeps' },
      { id: 'dest_2', name: 'Paris', country: 'France', countryCode: 'FR', type: 'city', propertyCount: 2341, trending: true, description: 'The city of love and light' },
      { id: 'dest_3', name: 'London', country: 'United Kingdom', countryCode: 'GB', type: 'city', propertyCount: 1923, trending: true, description: 'A world in one city' },
      { id: 'dest_4', name: 'Tokyo', country: 'Japan', countryCode: 'JP', type: 'city', propertyCount: 1567, trending: true, description: 'Where tradition meets innovation' },
      { id: 'dest_5', name: 'Barcelona', country: 'Spain', countryCode: 'ES', type: 'city', propertyCount: 1234, trending: true, description: 'Art, architecture, and beaches' },
      { id: 'dest_6', name: 'Rome', country: 'Italy', countryCode: 'IT', type: 'city', propertyCount: 1456, trending: false, description: 'The eternal city' },
      { id: 'dest_7', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', type: 'city', propertyCount: 987, trending: true, description: 'Luxury in the desert' },
      { id: 'dest_8', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', type: 'city', propertyCount: 876, trending: false, description: 'Canals, culture, and charm' },
      { id: 'dest_9', name: 'Bali', country: 'Indonesia', countryCode: 'ID', type: 'region', propertyCount: 1123, trending: true, description: 'Island of the Gods' },
      { id: 'dest_10', name: 'Los Angeles', country: 'United States', countryCode: 'US', type: 'city', propertyCount: 1678, trending: false, description: 'City of Angels' },
    ],
    properties: [
      {
        id: 'prop_1', name: 'Grand Plaza Hotel & Spa', type: 'hotel', stars: 4,
        destinationId: 'dest_1', city: 'New York', country: 'United States',
        address: '123 Broadway, Manhattan, New York, NY 10001',
        distanceFromCenter: '0.5 km from center',
        coordinates: { lat: 40.7580, lng: -73.9855 },
        description: 'Located in the heart of Manhattan, this luxury hotel offers stunning skyline views and world-class amenities. Just steps from Times Square and major attractions, Grand Plaza Hotel & Spa combines modern elegance with exceptional service. The hotel features a rooftop pool, full-service spa, and multiple dining options.',
        shortDescription: 'Excellent location – rated 9.2 by recent guests',
        reviewScore: 8.7, reviewScoreWord: 'Fabulous', reviewCount: 2847,
        pricePerNight: 189, originalPrice: 249, currency: 'USD', taxesAndFees: 42,
        genius: true, geniusDiscountPercent: 10, freeCancellation: true,
        freeCancellationUntil: '2025-03-13', prepayment: 'no_prepayment',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop1/400/300',
        photos: [
          { id: 'p1_1', url: 'https://picsum.photos/seed/prop1a/800/600', caption: 'Hotel exterior', category: 'exterior' },
          { id: 'p1_2', url: 'https://picsum.photos/seed/prop1b/800/600', caption: 'Lobby', category: 'lobby' },
          { id: 'p1_3', url: 'https://picsum.photos/seed/prop1c/800/600', caption: 'Standard room', category: 'room' },
          { id: 'p1_4', url: 'https://picsum.photos/seed/prop1d/800/600', caption: 'Deluxe room', category: 'room' },
          { id: 'p1_5', url: 'https://picsum.photos/seed/prop1e/800/600', caption: 'Swimming pool', category: 'pool' },
          { id: 'p1_6', url: 'https://picsum.photos/seed/prop1f/800/600', caption: 'Restaurant', category: 'restaurant' },
          { id: 'p1_7', url: 'https://picsum.photos/seed/prop1g/800/600', caption: 'Spa', category: 'spa' },
          { id: 'p1_8', url: 'https://picsum.photos/seed/prop1h/800/600', caption: 'City view', category: 'view' },
        ],
        facilities: ['free_wifi', 'pool', 'spa', 'fitness', 'restaurant', 'bar', 'parking', 'room_service', '24h_front_desk', 'air_conditioning', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Swimming pool', 'Spa', 'Fitness center'],
        rooms: ['room_1_1', 'room_1_2', 'room_1_3'],
        checkInTime: '15:00', checkOutTime: '11:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: true, sustainabilityLevel: 2,
        limitedTimeDeal: false, newToBooking: false,
      },
      {
        id: 'prop_2', name: 'The Manhattan Suites', type: 'apartment', stars: 0,
        destinationId: 'dest_1', city: 'New York', country: 'United States',
        address: '456 5th Avenue, Midtown, New York, NY 10018',
        distanceFromCenter: '1.2 km from center',
        coordinates: { lat: 40.7549, lng: -73.9840 },
        description: 'Stylish and spacious apartment suites in the heart of Midtown Manhattan. Each suite is fully equipped with a modern kitchen, living room, and high-speed WiFi. Perfect for business travelers and families looking for a home away from home with all the comforts of luxury living.',
        shortDescription: 'Superb apartment suites with full kitchen in Midtown',
        reviewScore: 9.1, reviewScoreWord: 'Superb', reviewCount: 1203,
        pricePerNight: 275, originalPrice: null, currency: 'USD', taxesAndFees: 55,
        genius: false, geniusDiscountPercent: 0, freeCancellation: true,
        freeCancellationUntil: null, prepayment: 'no_prepayment',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop2/400/300',
        photos: [
          { id: 'p2_1', url: 'https://picsum.photos/seed/prop2a/800/600', caption: 'Living room', category: 'room' },
          { id: 'p2_2', url: 'https://picsum.photos/seed/prop2b/800/600', caption: 'Kitchen', category: 'room' },
          { id: 'p2_3', url: 'https://picsum.photos/seed/prop2c/800/600', caption: 'Bedroom', category: 'room' },
          { id: 'p2_4', url: 'https://picsum.photos/seed/prop2d/800/600', caption: 'Bathroom', category: 'bathroom' },
          { id: 'p2_5', url: 'https://picsum.photos/seed/prop2e/800/600', caption: 'City view', category: 'view' },
          { id: 'p2_6', url: 'https://picsum.photos/seed/prop2f/800/600', caption: 'Building exterior', category: 'exterior' },
        ],
        facilities: ['free_wifi', 'kitchen', 'washer', 'air_conditioning', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Kitchen', 'Washing machine', 'Air conditioning'],
        rooms: ['room_2_1', 'room_2_2'],
        checkInTime: '15:00', checkOutTime: '11:00',
        petsAllowed: true, smokingAllowed: false,
        sustainability: false, sustainabilityLevel: 0,
        limitedTimeDeal: false, newToBooking: false,
      },
      {
        id: 'prop_3', name: 'NYC Budget Inn', type: 'hotel', stars: 2,
        destinationId: 'dest_1', city: 'New York', country: 'United States',
        address: "789 8th Ave, Hell's Kitchen, New York, NY 10036",
        distanceFromCenter: '2.1 km from center',
        coordinates: { lat: 40.7589, lng: -73.9929 },
        description: 'Affordable and clean hotel in the vibrant Hell\'s Kitchen neighborhood. Ideal for budget-conscious travelers who still want a comfortable base in New York City. Walking distance to Times Square, Broadway theaters, and excellent dining options.',
        shortDescription: 'Budget-friendly hotel close to Times Square',
        reviewScore: 7.2, reviewScoreWord: 'Good', reviewCount: 856,
        pricePerNight: 89, originalPrice: 119, currency: 'USD', taxesAndFees: 18,
        genius: true, geniusDiscountPercent: 15, freeCancellation: false,
        freeCancellationUntil: null, prepayment: 'prepayment_required',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop3/400/300',
        photos: [
          { id: 'p3_1', url: 'https://picsum.photos/seed/prop3a/800/600', caption: 'Exterior', category: 'exterior' },
          { id: 'p3_2', url: 'https://picsum.photos/seed/prop3b/800/600', caption: 'Standard room', category: 'room' },
          { id: 'p3_3', url: 'https://picsum.photos/seed/prop3c/800/600', caption: 'Bathroom', category: 'bathroom' },
          { id: 'p3_4', url: 'https://picsum.photos/seed/prop3d/800/600', caption: 'Lobby', category: 'lobby' },
          { id: 'p3_5', url: 'https://picsum.photos/seed/prop3e/800/600', caption: 'Street view', category: 'view' },
        ],
        facilities: ['free_wifi', '24h_front_desk', 'air_conditioning'],
        popularFacilities: ['Free WiFi', '24-hour front desk'],
        rooms: ['room_3_1', 'room_3_2'],
        checkInTime: '14:00', checkOutTime: '12:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: false, sustainabilityLevel: 0,
        limitedTimeDeal: true, newToBooking: false,
      },
      {
        id: 'prop_4', name: 'Hôtel Le Marais Charm', type: 'hotel', stars: 3,
        destinationId: 'dest_2', city: 'Paris', country: 'France',
        address: '12 Rue des Archives, Le Marais, Paris 75004',
        distanceFromCenter: '0.8 km from center',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        description: 'A charming boutique hotel nestled in the historic Le Marais district of Paris. This 3-star property combines classic Parisian architecture with modern comforts. Breakfast is included and features freshly baked croissants and local delicacies. Walking distance to Notre-Dame, the Pompidou Centre, and numerous art galleries.',
        shortDescription: 'Charming boutique hotel in historic Le Marais district',
        reviewScore: 8.4, reviewScoreWord: 'Very Good', reviewCount: 1567,
        pricePerNight: 145, originalPrice: null, currency: 'USD', taxesAndFees: 29,
        genius: false, geniusDiscountPercent: 0, freeCancellation: true,
        freeCancellationUntil: null, prepayment: 'no_prepayment',
        breakfastIncluded: true, thumbnailUrl: 'https://picsum.photos/seed/prop4/400/300',
        photos: [
          { id: 'p4_1', url: 'https://picsum.photos/seed/prop4a/800/600', caption: 'Hotel facade', category: 'exterior' },
          { id: 'p4_2', url: 'https://picsum.photos/seed/prop4b/800/600', caption: 'Classic room', category: 'room' },
          { id: 'p4_3', url: 'https://picsum.photos/seed/prop4c/800/600', caption: 'Breakfast room', category: 'restaurant' },
          { id: 'p4_4', url: 'https://picsum.photos/seed/prop4d/800/600', caption: 'Bathroom', category: 'bathroom' },
          { id: 'p4_5', url: 'https://picsum.photos/seed/prop4e/800/600', caption: 'Paris view', category: 'view' },
          { id: 'p4_6', url: 'https://picsum.photos/seed/prop4f/800/600', caption: 'Lobby', category: 'lobby' },
        ],
        facilities: ['free_wifi', 'breakfast', 'bar', 'air_conditioning', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Breakfast included', 'Bar', 'Air conditioning'],
        rooms: ['room_4_1', 'room_4_2'],
        checkInTime: '14:00', checkOutTime: '12:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: true, sustainabilityLevel: 1,
        limitedTimeDeal: false, newToBooking: false,
      },
      {
        id: 'prop_5', name: 'Paris Luxury Palace', type: 'hotel', stars: 5,
        destinationId: 'dest_2', city: 'Paris', country: 'France',
        address: '1 Place Vendôme, 1st Arrondissement, Paris 75001',
        distanceFromCenter: '0.3 km from center',
        coordinates: { lat: 48.8673, lng: 2.3296 },
        description: 'The epitome of Parisian luxury, this 5-star palace hotel overlooks the iconic Place Vendôme. Each room and suite is a masterpiece of design, featuring hand-crafted furniture, marble bathrooms, and priceless artwork. The Michelin-starred restaurant, world-class spa, and indoor swimming pool make this the ultimate Parisian experience.',
        shortDescription: 'Exceptional 5-star palace hotel overlooking Place Vendôme',
        reviewScore: 9.5, reviewScoreWord: 'Exceptional', reviewCount: 3421,
        pricePerNight: 589, originalPrice: 699, currency: 'USD', taxesAndFees: 118,
        genius: true, geniusDiscountPercent: 10, freeCancellation: true,
        freeCancellationUntil: null, prepayment: 'no_prepayment',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop5/400/300',
        photos: [
          { id: 'p5_1', url: 'https://picsum.photos/seed/prop5a/800/600', caption: 'Grand facade', category: 'exterior' },
          { id: 'p5_2', url: 'https://picsum.photos/seed/prop5b/800/600', caption: 'Grand lobby', category: 'lobby' },
          { id: 'p5_3', url: 'https://picsum.photos/seed/prop5c/800/600', caption: 'Deluxe suite', category: 'room' },
          { id: 'p5_4', url: 'https://picsum.photos/seed/prop5d/800/600', caption: 'Marble bathroom', category: 'bathroom' },
          { id: 'p5_5', url: 'https://picsum.photos/seed/prop5e/800/600', caption: 'Swimming pool', category: 'pool' },
          { id: 'p5_6', url: 'https://picsum.photos/seed/prop5f/800/600', caption: 'Fine dining restaurant', category: 'restaurant' },
          { id: 'p5_7', url: 'https://picsum.photos/seed/prop5g/800/600', caption: 'Spa', category: 'spa' },
          { id: 'p5_8', url: 'https://picsum.photos/seed/prop5h/800/600', caption: 'Vendôme view', category: 'view' },
        ],
        facilities: ['free_wifi', 'pool', 'spa', 'fitness', 'restaurant', 'bar', 'parking', 'room_service', '24h_front_desk', 'concierge', 'air_conditioning', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Swimming pool', 'Spa', 'Restaurant'],
        rooms: ['room_5_1', 'room_5_2', 'room_5_3'],
        checkInTime: '15:00', checkOutTime: '12:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: true, sustainabilityLevel: 3,
        limitedTimeDeal: false, newToBooking: false,
      },
      {
        id: 'prop_6', name: 'Kensington Gardens B&B', type: 'guesthouse', stars: 0,
        destinationId: 'dest_3', city: 'London', country: 'United Kingdom',
        address: '34 Kensington High Street, Kensington, London W8 4PF',
        distanceFromCenter: '3.5 km from center',
        coordinates: { lat: 51.5007, lng: -0.1943 },
        description: 'A delightful bed and breakfast in the elegant Kensington neighborhood, just minutes from Kensington Palace and Hyde Park. This Victorian townhouse has been lovingly converted into a charming guesthouse with individually decorated rooms. A generous English breakfast is served each morning.',
        shortDescription: 'Charming Victorian B&B near Kensington Palace and Hyde Park',
        reviewScore: 8.9, reviewScoreWord: 'Fabulous', reviewCount: 432,
        pricePerNight: 112, originalPrice: null, currency: 'USD', taxesAndFees: 22,
        genius: false, geniusDiscountPercent: 0, freeCancellation: true,
        freeCancellationUntil: null, prepayment: 'no_prepayment',
        breakfastIncluded: true, thumbnailUrl: 'https://picsum.photos/seed/prop6/400/300',
        photos: [
          { id: 'p6_1', url: 'https://picsum.photos/seed/prop6a/800/600', caption: 'Victorian exterior', category: 'exterior' },
          { id: 'p6_2', url: 'https://picsum.photos/seed/prop6b/800/600', caption: 'Cozy room', category: 'room' },
          { id: 'p6_3', url: 'https://picsum.photos/seed/prop6c/800/600', caption: 'English breakfast', category: 'restaurant' },
          { id: 'p6_4', url: 'https://picsum.photos/seed/prop6d/800/600', caption: 'Garden', category: 'view' },
          { id: 'p6_5', url: 'https://picsum.photos/seed/prop6e/800/600', caption: 'Bathroom', category: 'bathroom' },
        ],
        facilities: ['free_wifi', 'breakfast', 'garden', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Breakfast included', 'Garden'],
        rooms: ['room_6_1', 'room_6_2'],
        checkInTime: '15:00', checkOutTime: '11:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: false, sustainabilityLevel: 0,
        limitedTimeDeal: false, newToBooking: true,
      },
      {
        id: 'prop_7', name: 'Shibuya Crossing Hotel', type: 'hotel', stars: 4,
        destinationId: 'dest_4', city: 'Tokyo', country: 'Japan',
        address: '2-1 Dogenzaka, Shibuya-ku, Tokyo 150-0043',
        distanceFromCenter: '0.2 km from center',
        coordinates: { lat: 35.6595, lng: 139.7004 },
        description: 'Experience Tokyo at its most vibrant from this sleek 4-star hotel overlooking the iconic Shibuya Crossing. The hotel blends contemporary Japanese design with modern amenities. The rooftop bar offers spectacular views of the crossing, and the in-house restaurant serves authentic Japanese cuisine alongside international dishes.',
        shortDescription: 'Superb location overlooking the world-famous Shibuya Crossing',
        reviewScore: 9.0, reviewScoreWord: 'Superb', reviewCount: 1876,
        pricePerNight: 165, originalPrice: 210, currency: 'USD', taxesAndFees: 33,
        genius: true, geniusDiscountPercent: 10, freeCancellation: true,
        freeCancellationUntil: '2025-04-28', prepayment: 'no_prepayment',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop7/400/300',
        photos: [
          { id: 'p7_1', url: 'https://picsum.photos/seed/prop7a/800/600', caption: 'Hotel exterior', category: 'exterior' },
          { id: 'p7_2', url: 'https://picsum.photos/seed/prop7b/800/600', caption: 'Shibuya Crossing view', category: 'view' },
          { id: 'p7_3', url: 'https://picsum.photos/seed/prop7c/800/600', caption: 'Standard room', category: 'room' },
          { id: 'p7_4', url: 'https://picsum.photos/seed/prop7d/800/600', caption: 'Japanese bathroom', category: 'bathroom' },
          { id: 'p7_5', url: 'https://picsum.photos/seed/prop7e/800/600', caption: 'Restaurant', category: 'restaurant' },
          { id: 'p7_6', url: 'https://picsum.photos/seed/prop7f/800/600', caption: 'Rooftop bar', category: 'lobby' },
          { id: 'p7_7', url: 'https://picsum.photos/seed/prop7g/800/600', caption: 'Fitness center', category: 'spa' },
        ],
        facilities: ['free_wifi', 'restaurant', 'fitness', 'laundry', 'air_conditioning', '24h_front_desk', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Restaurant', 'Fitness center', '24-hour front desk'],
        rooms: ['room_7_1', 'room_7_2', 'room_7_3'],
        checkInTime: '15:00', checkOutTime: '11:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: true, sustainabilityLevel: 2,
        limitedTimeDeal: false, newToBooking: false,
      },
      {
        id: 'prop_8', name: 'Casa Barcelona Apartments', type: 'apartment', stars: 0,
        destinationId: 'dest_5', city: 'Barcelona', country: 'Spain',
        address: 'La Rambla 78, Gothic Quarter, Barcelona 08002',
        distanceFromCenter: '0.1 km from center',
        coordinates: { lat: 41.3851, lng: 2.1734 },
        description: 'Modern and stylish apartments on the famous La Rambla in the heart of Barcelona\'s Gothic Quarter. Each apartment features a fully equipped kitchen, balcony, and air conditioning. Steps from the vibrant Boqueria market, Gothic cathedral, and beautiful beaches. The perfect base for exploring Barcelona.',
        shortDescription: 'Prime location on La Rambla with balconies and full kitchen',
        reviewScore: 8.2, reviewScoreWord: 'Very Good', reviewCount: 654,
        pricePerNight: 98, originalPrice: null, currency: 'USD', taxesAndFees: 20,
        genius: false, geniusDiscountPercent: 0, freeCancellation: false,
        freeCancellationUntil: null, prepayment: 'prepayment_required',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop8/400/300',
        photos: [
          { id: 'p8_1', url: 'https://picsum.photos/seed/prop8a/800/600', caption: 'Apartment exterior', category: 'exterior' },
          { id: 'p8_2', url: 'https://picsum.photos/seed/prop8b/800/600', caption: 'Living room', category: 'room' },
          { id: 'p8_3', url: 'https://picsum.photos/seed/prop8c/800/600', caption: 'Kitchen', category: 'room' },
          { id: 'p8_4', url: 'https://picsum.photos/seed/prop8d/800/600', caption: 'Balcony', category: 'view' },
          { id: 'p8_5', url: 'https://picsum.photos/seed/prop8e/800/600', caption: 'Bathroom', category: 'bathroom' },
        ],
        facilities: ['free_wifi', 'kitchen', 'balcony', 'washer', 'air_conditioning', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Kitchen', 'Balcony', 'Washing machine'],
        rooms: ['room_8_1', 'room_8_2'],
        checkInTime: '15:00', checkOutTime: '11:00',
        petsAllowed: true, smokingAllowed: false,
        sustainability: false, sustainabilityLevel: 0,
        limitedTimeDeal: false, newToBooking: false,
      },
      {
        id: 'prop_9', name: 'Palm Beach Resort & Spa', type: 'resort', stars: 5,
        destinationId: 'dest_7', city: 'Dubai', country: 'United Arab Emirates',
        address: 'Palm Jumeirah, Crescent Road, Dubai 00000',
        distanceFromCenter: '12.5 km from center',
        coordinates: { lat: 25.1124, lng: 55.1390 },
        description: 'The ultimate luxury experience on the iconic Palm Jumeirah. This 5-star resort features private beach access, multiple swimming pools, a world-class spa, and award-winning restaurants. Each room and villa offers breathtaking views of the Arabian Gulf or Dubai skyline. Water sports, kids club, and concierge services are available.',
        shortDescription: 'Ultimate luxury resort on the Palm with private beach',
        reviewScore: 9.3, reviewScoreWord: 'Superb', reviewCount: 2198,
        pricePerNight: 425, originalPrice: 520, currency: 'USD', taxesAndFees: 85,
        genius: true, geniusDiscountPercent: 15, freeCancellation: true,
        freeCancellationUntil: null, prepayment: 'no_prepayment',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop9/400/300',
        photos: [
          { id: 'p9_1', url: 'https://picsum.photos/seed/prop9a/800/600', caption: 'Resort exterior', category: 'exterior' },
          { id: 'p9_2', url: 'https://picsum.photos/seed/prop9b/800/600', caption: 'Private beach', category: 'pool' },
          { id: 'p9_3', url: 'https://picsum.photos/seed/prop9c/800/600', caption: 'Infinity pool', category: 'pool' },
          { id: 'p9_4', url: 'https://picsum.photos/seed/prop9d/800/600', caption: 'Luxury suite', category: 'room' },
          { id: 'p9_5', url: 'https://picsum.photos/seed/prop9e/800/600', caption: 'Spa treatment', category: 'spa' },
          { id: 'p9_6', url: 'https://picsum.photos/seed/prop9f/800/600', caption: 'Fine dining', category: 'restaurant' },
          { id: 'p9_7', url: 'https://picsum.photos/seed/prop9g/800/600', caption: 'Arabian Gulf view', category: 'view' },
          { id: 'p9_8', url: 'https://picsum.photos/seed/prop9h/800/600', caption: 'Lobby', category: 'lobby' },
        ],
        facilities: ['free_wifi', 'pool', 'private_beach', 'spa', 'fitness', 'restaurant', 'bar', 'parking', 'kids_club', 'water_sports', 'room_service', '24h_front_desk'],
        popularFacilities: ['Free WiFi', 'Private beach', 'Swimming pool', 'Spa'],
        rooms: ['room_9_1', 'room_9_2', 'room_9_3'],
        checkInTime: '15:00', checkOutTime: '12:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: true, sustainabilityLevel: 2,
        limitedTimeDeal: true, newToBooking: false,
      },
      {
        id: 'prop_10', name: 'Ubud Jungle Villa', type: 'villa', stars: 0,
        destinationId: 'dest_9', city: 'Ubud, Bali', country: 'Indonesia',
        address: 'Jl. Raya Ubud, Gianyar, Ubud 80571',
        distanceFromCenter: '1.5 km from center',
        coordinates: { lat: -8.5069, lng: 115.2625 },
        description: 'A breathtaking private villa nestled in the lush jungle of Ubud, Bali. This stunning property features an infinity pool overlooking rice paddies, an open-air living pavilion, and daily housekeeping. Perfect for romantic getaways and honeymoons. A private chef and yoga sessions can be arranged.',
        shortDescription: 'Private jungle villa with infinity pool in magical Ubud',
        reviewScore: 9.6, reviewScoreWord: 'Exceptional', reviewCount: 328,
        pricePerNight: 195, originalPrice: 245, currency: 'USD', taxesAndFees: 39,
        genius: false, geniusDiscountPercent: 0, freeCancellation: true,
        freeCancellationUntil: null, prepayment: 'no_prepayment',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop10/400/300',
        photos: [
          { id: 'p10_1', url: 'https://picsum.photos/seed/prop10a/800/600', caption: 'Villa exterior', category: 'exterior' },
          { id: 'p10_2', url: 'https://picsum.photos/seed/prop10b/800/600', caption: 'Infinity pool', category: 'pool' },
          { id: 'p10_3', url: 'https://picsum.photos/seed/prop10c/800/600', caption: 'Master bedroom', category: 'room' },
          { id: 'p10_4', url: 'https://picsum.photos/seed/prop10d/800/600', caption: 'Open-air bathroom', category: 'bathroom' },
          { id: 'p10_5', url: 'https://picsum.photos/seed/prop10e/800/600', caption: 'Jungle view', category: 'view' },
          { id: 'p10_6', url: 'https://picsum.photos/seed/prop10f/800/600', caption: 'Outdoor dining', category: 'restaurant' },
          { id: 'p10_7', url: 'https://picsum.photos/seed/prop10g/800/600', caption: 'Garden', category: 'view' },
        ],
        facilities: ['free_wifi', 'pool', 'spa', 'restaurant', 'garden', 'terrace', 'airport_shuttle', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Swimming pool', 'Spa', 'Garden'],
        rooms: ['room_10_1', 'room_10_2'],
        checkInTime: '14:00', checkOutTime: '12:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: true, sustainabilityLevel: 3,
        limitedTimeDeal: false, newToBooking: false,
      },
      {
        id: 'prop_11', name: 'Canal View Hostel', type: 'hostel', stars: 0,
        destinationId: 'dest_8', city: 'Amsterdam', country: 'Netherlands',
        address: 'Prinsengracht 456, Jordaan, Amsterdam 1017 KE',
        distanceFromCenter: '0.6 km from center',
        coordinates: { lat: 52.3702, lng: 4.8952 },
        description: 'A friendly and affordable hostel on the beautiful Prinsengracht canal. This social hostel offers both private rooms and dormitories in a prime location in the Jordaan neighborhood. The common area has a vibrant bar, communal kitchen, and free bicycle rental for exploring Amsterdam.',
        shortDescription: 'Social canal-side hostel with free bikes in Jordaan',
        reviewScore: 7.8, reviewScoreWord: 'Good', reviewCount: 1243,
        pricePerNight: 42, originalPrice: null, currency: 'USD', taxesAndFees: 8,
        genius: true, geniusDiscountPercent: 10, freeCancellation: false,
        freeCancellationUntil: null, prepayment: 'prepayment_required',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop11/400/300',
        photos: [
          { id: 'p11_1', url: 'https://picsum.photos/seed/prop11a/800/600', caption: 'Canal view', category: 'view' },
          { id: 'p11_2', url: 'https://picsum.photos/seed/prop11b/800/600', caption: 'Private room', category: 'room' },
          { id: 'p11_3', url: 'https://picsum.photos/seed/prop11c/800/600', caption: 'Dormitory', category: 'room' },
          { id: 'p11_4', url: 'https://picsum.photos/seed/prop11d/800/600', caption: 'Bar lounge', category: 'lobby' },
          { id: 'p11_5', url: 'https://picsum.photos/seed/prop11e/800/600', caption: 'Shared kitchen', category: 'restaurant' },
        ],
        facilities: ['free_wifi', 'bar', 'shared_kitchen', 'locker', 'bicycle_rental', 'non_smoking'],
        popularFacilities: ['Free WiFi', 'Bar', 'Bicycle rental', 'Shared kitchen'],
        rooms: ['room_11_1', 'room_11_2'],
        checkInTime: '14:00', checkOutTime: '11:00',
        petsAllowed: false, smokingAllowed: false,
        sustainability: false, sustainabilityLevel: 0,
        limitedTimeDeal: false, newToBooking: false,
      },
      {
        id: 'prop_12', name: 'Beverly Hills Grand', type: 'hotel', stars: 5,
        destinationId: 'dest_10', city: 'Los Angeles', country: 'United States',
        address: '9876 Wilshire Blvd, Beverly Hills, CA 90210',
        distanceFromCenter: '8.2 km from center',
        coordinates: { lat: 34.0736, lng: -118.4004 },
        description: 'Hollywood glamour meets timeless luxury at this iconic 5-star hotel on Wilshire Boulevard. This legendary property has been the playground of celebrities for decades. Enjoy valet parking, celebrity chef restaurants, an Olympic-size pool, and the most coveted spa in Beverly Hills. Rooms feature Frette linens and custom-designed furnishings.',
        shortDescription: 'Iconic 5-star hotel with old Hollywood glamour in Beverly Hills',
        reviewScore: 9.1, reviewScoreWord: 'Superb', reviewCount: 1567,
        pricePerNight: 399, originalPrice: 499, currency: 'USD', taxesAndFees: 80,
        genius: true, geniusDiscountPercent: 10, freeCancellation: true,
        freeCancellationUntil: null, prepayment: 'no_prepayment',
        breakfastIncluded: false, thumbnailUrl: 'https://picsum.photos/seed/prop12/400/300',
        photos: [
          { id: 'p12_1', url: 'https://picsum.photos/seed/prop12a/800/600', caption: 'Hotel exterior', category: 'exterior' },
          { id: 'p12_2', url: 'https://picsum.photos/seed/prop12b/800/600', caption: 'Grand lobby', category: 'lobby' },
          { id: 'p12_3', url: 'https://picsum.photos/seed/prop12c/800/600', caption: 'Presidential suite', category: 'room' },
          { id: 'p12_4', url: 'https://picsum.photos/seed/prop12d/800/600', caption: 'Pool deck', category: 'pool' },
          { id: 'p12_5', url: 'https://picsum.photos/seed/prop12e/800/600', caption: 'Celebrity restaurant', category: 'restaurant' },
          { id: 'p12_6', url: 'https://picsum.photos/seed/prop12f/800/600', caption: 'Luxury spa', category: 'spa' },
          { id: 'p12_7', url: 'https://picsum.photos/seed/prop12g/800/600', caption: 'Tennis court', category: 'view' },
        ],
        facilities: ['free_wifi', 'pool', 'spa', 'fitness', 'restaurant', 'bar', 'valet_parking', 'room_service', 'concierge', 'tennis', '24h_front_desk', 'air_conditioning'],
        popularFacilities: ['Free WiFi', 'Swimming pool', 'Spa', 'Valet parking'],
        rooms: ['room_12_1', 'room_12_2', 'room_12_3'],
        checkInTime: '15:00', checkOutTime: '12:00',
        petsAllowed: true, smokingAllowed: false,
        sustainability: true, sustainabilityLevel: 2,
        limitedTimeDeal: false, newToBooking: false,
      },
    ],
    rooms: [
      // prop_1 rooms
      { id: 'room_1_1', propertyId: 'prop_1', name: 'Standard Double Room', type: 'double', maxGuests: 2, bedType: '1 queen bed', size: '22 m²', pricePerNight: 189, originalPrice: 249, amenities: ['Air conditioning', 'Private bathroom', 'Flat-screen TV', 'Free WiFi', 'Safe'], view: 'City view', breakfastIncluded: false, breakfastPrice: 25, freeCancellation: true, cancellationDeadline: '2025-03-13', prepayment: 'no_prepayment', availableCount: 5, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room1a/400/300' },
      { id: 'room_1_2', propertyId: 'prop_1', name: 'Deluxe King Room', type: 'double', maxGuests: 2, bedType: '1 king bed', size: '30 m²', pricePerNight: 259, originalPrice: 329, amenities: ['Air conditioning', 'Private bathroom', 'Flat-screen TV', 'Minibar', 'Free WiFi', 'Safe', 'Bathrobe', 'Coffee machine'], view: 'City view', breakfastIncluded: false, breakfastPrice: 25, freeCancellation: true, cancellationDeadline: '2025-03-13', prepayment: 'no_prepayment', availableCount: 3, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room1b/400/300' },
      { id: 'room_1_3', propertyId: 'prop_1', name: 'Executive Suite', type: 'suite', maxGuests: 3, bedType: '1 king bed', size: '55 m²', pricePerNight: 449, originalPrice: 549, amenities: ['Air conditioning', 'Private bathroom', 'Living room', 'Flat-screen TV', 'Minibar', 'Free WiFi', 'Safe', 'Bathrobe', 'Coffee machine', 'Spa bath'], view: 'Skyline view', breakfastIncluded: false, breakfastPrice: 25, freeCancellation: true, cancellationDeadline: '2025-03-13', prepayment: 'no_prepayment', availableCount: 1, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room1c/400/300' },
      // prop_2 rooms
      { id: 'room_2_1', propertyId: 'prop_2', name: 'Studio Suite', type: 'studio', maxGuests: 2, bedType: '1 queen bed', size: '35 m²', pricePerNight: 275, originalPrice: null, amenities: ['Full kitchen', 'Air conditioning', 'Flat-screen TV', 'Free WiFi', 'Washing machine', 'Dishwasher'], view: 'City view', breakfastIncluded: false, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 4, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room2a/400/300' },
      { id: 'room_2_2', propertyId: 'prop_2', name: 'One-Bedroom Suite', type: 'suite', maxGuests: 3, bedType: '1 king bed', size: '55 m²', pricePerNight: 375, originalPrice: null, amenities: ['Full kitchen', 'Air conditioning', 'Flat-screen TV', 'Free WiFi', 'Washing machine', 'Dishwasher', 'Separate living room', 'Sofa bed'], view: 'Park view', breakfastIncluded: false, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 2, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room2b/400/300' },
      // prop_3 rooms
      { id: 'room_3_1', propertyId: 'prop_3', name: 'Budget Single Room', type: 'single', maxGuests: 1, bedType: '1 single bed', size: '12 m²', pricePerNight: 69, originalPrice: 89, amenities: ['Air conditioning', 'Shared bathroom', 'Flat-screen TV', 'Free WiFi'], view: null, breakfastIncluded: false, breakfastPrice: null, freeCancellation: false, cancellationDeadline: null, prepayment: 'prepayment_required', availableCount: 8, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room3a/400/300' },
      { id: 'room_3_2', propertyId: 'prop_3', name: 'Standard Double Room', type: 'double', maxGuests: 2, bedType: '1 double bed', size: '18 m²', pricePerNight: 89, originalPrice: 119, amenities: ['Air conditioning', 'Private bathroom', 'Flat-screen TV', 'Free WiFi'], view: 'Street view', breakfastIncluded: false, breakfastPrice: null, freeCancellation: false, cancellationDeadline: null, prepayment: 'prepayment_required', availableCount: 5, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room3b/400/300' },
      // prop_4 rooms
      { id: 'room_4_1', propertyId: 'prop_4', name: 'Classic Double Room', type: 'double', maxGuests: 2, bedType: '1 double bed', size: '18 m²', pricePerNight: 145, originalPrice: null, amenities: ['Air conditioning', 'Private bathroom', 'Flat-screen TV', 'Free WiFi', 'Breakfast included'], view: 'Courtyard view', breakfastIncluded: true, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 5, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room4a/400/300' },
      { id: 'room_4_2', propertyId: 'prop_4', name: 'Superior Room with Balcony', type: 'double', maxGuests: 2, bedType: '1 queen bed', size: '25 m²', pricePerNight: 185, originalPrice: null, amenities: ['Air conditioning', 'Private bathroom', 'Flat-screen TV', 'Free WiFi', 'Breakfast included', 'Balcony'], view: 'Paris view', breakfastIncluded: true, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 2, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room4b/400/300' },
      // prop_5 rooms
      { id: 'room_5_1', propertyId: 'prop_5', name: 'Deluxe Room', type: 'double', maxGuests: 2, bedType: '1 king bed', size: '40 m²', pricePerNight: 589, originalPrice: 699, amenities: ['Air conditioning', 'Marble bathroom', 'Flat-screen TV', 'Minibar', 'Free WiFi', 'Safe', 'Bathrobe', 'Coffee machine', 'Pillow menu'], view: 'Vendôme view', breakfastIncluded: false, breakfastPrice: 65, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 4, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room5a/400/300' },
      { id: 'room_5_2', propertyId: 'prop_5', name: 'Junior Suite', type: 'suite', maxGuests: 2, bedType: '1 king bed', size: '65 m²', pricePerNight: 899, originalPrice: 1099, amenities: ['Air conditioning', 'Marble bathroom', 'Living room', 'Flat-screen TV', 'Minibar', 'Free WiFi', 'Safe', 'Butler service'], view: 'Paris view', breakfastIncluded: false, breakfastPrice: 65, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 2, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room5b/400/300' },
      { id: 'room_5_3', propertyId: 'prop_5', name: 'Imperial Suite', type: 'suite', maxGuests: 4, bedType: '2 king beds', size: '200 m²', pricePerNight: 2999, originalPrice: null, amenities: ['Air conditioning', 'Marble bathroom', 'Dining room', 'Living room', 'Two bedrooms', 'Butler service', 'Free WiFi', 'Private terrace'], view: 'Eiffel Tower view', breakfastIncluded: true, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 1, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room5c/400/300' },
      // prop_6 rooms
      { id: 'room_6_1', propertyId: 'prop_6', name: 'Single Room with Breakfast', type: 'single', maxGuests: 1, bedType: '1 single bed', size: '12 m²', pricePerNight: 85, originalPrice: null, amenities: ['Free WiFi', 'Breakfast included', 'Private bathroom'], view: 'Garden view', breakfastIncluded: true, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 3, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room6a/400/300' },
      { id: 'room_6_2', propertyId: 'prop_6', name: 'Double Room with Breakfast', type: 'double', maxGuests: 2, bedType: '1 double bed', size: '18 m²', pricePerNight: 112, originalPrice: null, amenities: ['Free WiFi', 'Breakfast included', 'Private bathroom', 'Garden view'], view: 'Garden view', breakfastIncluded: true, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 4, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room6b/400/300' },
      // prop_7 rooms
      { id: 'room_7_1', propertyId: 'prop_7', name: 'Standard Double Room', type: 'double', maxGuests: 2, bedType: '1 double bed', size: '22 m²', pricePerNight: 165, originalPrice: 210, amenities: ['Air conditioning', 'Private bathroom', 'Flat-screen TV', 'Free WiFi', 'Minibar'], view: 'City view', breakfastIncluded: false, breakfastPrice: 20, freeCancellation: true, cancellationDeadline: '2025-04-28', prepayment: 'no_prepayment', availableCount: 6, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room7a/400/300' },
      { id: 'room_7_2', propertyId: 'prop_7', name: 'Superior Room - Crossing View', type: 'double', maxGuests: 2, bedType: '1 king bed', size: '28 m²', pricePerNight: 225, originalPrice: 279, amenities: ['Air conditioning', 'Private bathroom', 'Flat-screen TV', 'Free WiFi', 'Minibar', 'Coffee machine'], view: 'Shibuya Crossing view', breakfastIncluded: false, breakfastPrice: 20, freeCancellation: true, cancellationDeadline: '2025-04-28', prepayment: 'no_prepayment', availableCount: 4, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room7b/400/300' },
      { id: 'room_7_3', propertyId: 'prop_7', name: 'Junior Suite', type: 'suite', maxGuests: 3, bedType: '1 king bed', size: '45 m²', pricePerNight: 349, originalPrice: 429, amenities: ['Air conditioning', 'Marble bathroom', 'Living area', 'Flat-screen TV', 'Free WiFi', 'Minibar', 'Coffee machine', 'Bathrobe'], view: 'Tokyo skyline view', breakfastIncluded: false, breakfastPrice: 20, freeCancellation: true, cancellationDeadline: '2025-04-28', prepayment: 'no_prepayment', availableCount: 2, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room7c/400/300' },
      // prop_8 rooms
      { id: 'room_8_1', propertyId: 'prop_8', name: 'Standard Apartment', type: 'studio', maxGuests: 2, bedType: '1 double bed', size: '35 m²', pricePerNight: 98, originalPrice: null, amenities: ['Full kitchen', 'Air conditioning', 'Flat-screen TV', 'Free WiFi', 'Balcony', 'Washing machine'], view: 'La Rambla view', breakfastIncluded: false, breakfastPrice: null, freeCancellation: false, cancellationDeadline: null, prepayment: 'prepayment_required', availableCount: 5, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room8a/400/300' },
      { id: 'room_8_2', propertyId: 'prop_8', name: 'Superior Apartment', type: 'studio', maxGuests: 4, bedType: '2 single beds + sofa bed', size: '55 m²', pricePerNight: 145, originalPrice: null, amenities: ['Full kitchen', 'Air conditioning', 'Flat-screen TV', 'Free WiFi', 'Balcony', 'Washing machine', 'Dishwasher'], view: 'Gothic Quarter view', breakfastIncluded: false, breakfastPrice: null, freeCancellation: false, cancellationDeadline: null, prepayment: 'prepayment_required', availableCount: 3, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room8b/400/300' },
      // prop_9 rooms
      { id: 'room_9_1', propertyId: 'prop_9', name: 'Deluxe Sea View Room', type: 'double', maxGuests: 2, bedType: '1 king bed', size: '48 m²', pricePerNight: 425, originalPrice: 520, amenities: ['Air conditioning', 'Marble bathroom', 'Private terrace', 'Flat-screen TV', 'Free WiFi', 'Minibar', 'Coffee machine'], view: 'Arabian Gulf view', breakfastIncluded: false, breakfastPrice: 45, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 8, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room9a/400/300' },
      { id: 'room_9_2', propertyId: 'prop_9', name: 'Beach Villa', type: 'suite', maxGuests: 2, bedType: '1 king bed', size: '120 m²', pricePerNight: 899, originalPrice: 1099, amenities: ['Private pool', 'Air conditioning', 'Marble bathroom', 'Outdoor shower', 'Flat-screen TV', 'Free WiFi', 'Butler service', 'Private beach access'], view: 'Private beach view', breakfastIncluded: true, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 3, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room9b/400/300' },
      { id: 'room_9_3', propertyId: 'prop_9', name: 'Family Suite', type: 'family', maxGuests: 4, bedType: '1 king bed + 2 single beds', size: '80 m²', pricePerNight: 649, originalPrice: 799, amenities: ['Air conditioning', 'Marble bathroom', 'Bunk beds', 'Flat-screen TV', 'Free WiFi', 'Kids amenities', 'Kitchenette'], view: 'Garden and pool view', breakfastIncluded: false, breakfastPrice: 45, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 4, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room9c/400/300' },
      // prop_10 rooms
      { id: 'room_10_1', propertyId: 'prop_10', name: 'Garden Villa', type: 'double', maxGuests: 2, bedType: '1 king bed', size: '80 m²', pricePerNight: 195, originalPrice: 245, amenities: ['Private pool', 'Air conditioning', 'Open-air bathroom', 'Indoor outdoor shower', 'Free WiFi', 'Daily breakfast available'], view: 'Rice paddy view', breakfastIncluded: false, breakfastPrice: 20, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 2, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room10a/400/300' },
      { id: 'room_10_2', propertyId: 'prop_10', name: 'Jungle Retreat Villa', type: 'suite', maxGuests: 2, bedType: '1 king bed', size: '120 m²', pricePerNight: 295, originalPrice: 365, amenities: ['Private infinity pool', 'Air conditioning', 'Outdoor bathroom', 'Daybed pavilion', 'Free WiFi', 'Private chef available'], view: 'Jungle and valley view', breakfastIncluded: false, breakfastPrice: 20, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 1, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room10b/400/300' },
      // prop_11 rooms
      { id: 'room_11_1', propertyId: 'prop_11', name: 'Dormitory Bed', type: 'dormitory', maxGuests: 1, bedType: '1 bunk bed', size: '4 m²', pricePerNight: 42, originalPrice: null, amenities: ['Free WiFi', 'Shared bathroom', 'Locker', 'Reading light'], view: null, breakfastIncluded: false, breakfastPrice: null, freeCancellation: false, cancellationDeadline: null, prepayment: 'prepayment_required', availableCount: 12, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room11a/400/300' },
      { id: 'room_11_2', propertyId: 'prop_11', name: 'Private Room', type: 'single', maxGuests: 2, bedType: '1 double bed', size: '12 m²', pricePerNight: 89, originalPrice: null, amenities: ['Free WiFi', 'Private bathroom', 'Locker'], view: 'Canal view', breakfastIncluded: false, breakfastPrice: null, freeCancellation: false, cancellationDeadline: null, prepayment: 'prepayment_required', availableCount: 4, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room11b/400/300' },
      // prop_12 rooms
      { id: 'room_12_1', propertyId: 'prop_12', name: 'Deluxe Room', type: 'double', maxGuests: 2, bedType: '1 king bed', size: '45 m²', pricePerNight: 399, originalPrice: 499, amenities: ['Air conditioning', 'Marble bathroom', 'Flat-screen TV', 'Minibar', 'Free WiFi', 'Safe', 'Bathrobe', 'Frette linens'], view: 'Garden view', breakfastIncluded: false, breakfastPrice: 55, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 6, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room12a/400/300' },
      { id: 'room_12_2', propertyId: 'prop_12', name: 'Beverly Hills Suite', type: 'suite', maxGuests: 3, bedType: '1 king bed', size: '80 m²', pricePerNight: 699, originalPrice: 849, amenities: ['Air conditioning', 'Marble bathroom', 'Living room', 'Flat-screen TV', 'Minibar', 'Free WiFi', 'Butler service', 'Private patio'], view: 'Pool view', breakfastIncluded: false, breakfastPrice: 55, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 3, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room12b/400/300' },
      { id: 'room_12_3', propertyId: 'prop_12', name: 'Presidential Suite', type: 'suite', maxGuests: 4, bedType: '2 king beds', size: '200 m²', pricePerNight: 1999, originalPrice: null, amenities: ['Air conditioning', 'Marble bathroom', 'Dining room', 'Home theater', 'Kitchen', 'Free WiFi', 'Personal butler', 'Limousine service'], view: 'Beverly Hills panorama', breakfastIncluded: true, breakfastPrice: null, freeCancellation: true, cancellationDeadline: null, prepayment: 'no_prepayment', availableCount: 1, smokingAllowed: false, imageUrl: 'https://picsum.photos/seed/room12c/400/300' },
    ],
    reviews: [
      // prop_1 reviews
      { id: 'review_1_1', propertyId: 'prop_1', authorName: 'Michael', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-11-15', score: 9.2, title: 'Amazing stay!', positive: 'The location was perfect, staff were incredibly helpful, and the room was spotless. The spa was world-class.', negative: 'Breakfast area was a bit crowded during peak hours.', roomType: 'Deluxe King Room', nightsStayed: 3, travellerType: 'couple' },
      { id: 'review_1_2', propertyId: 'prop_1', authorName: 'Sophie', authorCountry: 'France', authorCountryCode: 'FR', date: '2024-10-22', score: 8.5, title: 'Great hotel in a perfect location', positive: 'Beautiful hotel with excellent amenities. The pool and gym were top notch. Easy access to Broadway and Central Park.', negative: 'The room was slightly smaller than expected but very well equipped.', roomType: 'Standard Double Room', nightsStayed: 4, travellerType: 'solo' },
      { id: 'review_1_3', propertyId: 'prop_1', authorName: 'James', authorCountry: 'United Kingdom', authorCountryCode: 'GB', date: '2024-12-03', score: 9.0, title: 'Excellent business trip', positive: 'Perfect for business travelers. Fast WiFi, excellent meeting facilities nearby, and the room service was prompt.', negative: '', roomType: 'Executive Suite', nightsStayed: 2, travellerType: 'business' },
      { id: 'review_1_4', propertyId: 'prop_1', authorName: 'Yuki', authorCountry: 'Japan', authorCountryCode: 'JP', date: '2024-09-18', score: 8.0, title: 'Good hotel but pricey', positive: 'Great location and very clean rooms. Staff was professional and helpful. Good fitness center.', negative: 'Prices are quite high. Parking fee is expensive. Room service took a while.', roomType: 'Standard Double Room', nightsStayed: 5, travellerType: 'family' },
      // prop_2 reviews
      { id: 'review_2_1', propertyId: 'prop_2', authorName: 'Emma', authorCountry: 'Australia', authorCountryCode: 'AU', date: '2024-11-28', score: 9.5, title: 'Home away from home!', positive: 'The apartment was stunning with an amazing view of the city. The kitchen was fully equipped and we loved cooking in. Very spacious for a family.', negative: '', roomType: 'One-Bedroom Suite', nightsStayed: 7, travellerType: 'family' },
      { id: 'review_2_2', propertyId: 'prop_2', authorName: 'Carlos', authorCountry: 'Spain', authorCountryCode: 'ES', date: '2024-10-10', score: 9.2, title: 'Perfect apartment for NYC', positive: 'Modern, clean, and well-located. Having a proper kitchen saved us a lot of money. The apartment was very quiet despite being in Midtown.', negative: 'The elevator was sometimes slow.', roomType: 'Studio Suite', nightsStayed: 5, travellerType: 'couple' },
      { id: 'review_2_3', propertyId: 'prop_2', authorName: 'Linda', authorCountry: 'Canada', authorCountryCode: 'CA', date: '2024-08-15', score: 8.8, title: 'Excellent value for money', positive: 'Spacious and very well equipped. Great location near everything. The views were spectacular.', negative: 'Check-in was a bit impersonal compared to hotels.', roomType: 'Studio Suite', nightsStayed: 3, travellerType: 'solo' },
      // prop_3 reviews
      { id: 'review_3_1', propertyId: 'prop_3', authorName: 'Tom', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-11-05', score: 7.5, title: 'Good budget option', positive: 'Clean rooms, good location near Times Square. Perfect if you just need a place to sleep. Staff was helpful.', negative: 'The room was very small. No amenities really. Noise from the street at night.', roomType: 'Standard Double Room', nightsStayed: 2, travellerType: 'solo' },
      { id: 'review_3_2', propertyId: 'prop_3', authorName: 'Anna', authorCountry: 'Germany', authorCountryCode: 'DE', date: '2024-09-30', score: 6.8, title: 'Basic but does the job', positive: 'Location is great. Clean. Free WiFi works well. Good price for New York.', negative: 'Very basic, no frills at all. Walls are thin. Bathroom is tiny. But you get what you pay for.', roomType: 'Budget Single Room', nightsStayed: 3, travellerType: 'solo' },
      // prop_4 reviews
      { id: 'review_4_1', propertyId: 'prop_4', authorName: 'Pierre', authorCountry: 'France', authorCountryCode: 'FR', date: '2024-12-08', score: 8.8, title: 'Très bien! Charming Parisian hotel', positive: 'Beautiful boutique hotel in the heart of Le Marais. The breakfast was fantastic with fresh croissants. Staff were so friendly and helpful.', negative: 'The room was on the small side but very charming.', roomType: 'Classic Double Room', nightsStayed: 4, travellerType: 'couple' },
      { id: 'review_4_2', propertyId: 'prop_4', authorName: 'Hannah', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-11-20', score: 8.2, title: 'Perfect Paris base', positive: 'Great location to explore Paris on foot. Lovely atmosphere and decor. The included breakfast was a real highlight.', negative: 'No elevator, which was challenging with luggage.', roomType: 'Superior Room with Balcony', nightsStayed: 5, travellerType: 'couple' },
      { id: 'review_4_3', propertyId: 'prop_4', authorName: 'Maria', authorCountry: 'Italy', authorCountryCode: 'IT', date: '2024-10-15', score: 7.9, title: 'Nice hotel, good breakfast', positive: 'The breakfast was excellent and included. The location is perfect for exploring Paris. Clean rooms.', negative: 'Limited parking. Room AC was a bit noisy.', roomType: 'Classic Double Room', nightsStayed: 3, travellerType: 'family' },
      // prop_5 reviews
      { id: 'review_5_1', propertyId: 'prop_5', authorName: 'Alexander', authorCountry: 'Russia', authorCountryCode: 'RU', date: '2024-11-10', score: 10.0, title: 'The most perfect hotel in Paris', positive: 'Absolutely flawless in every way. The room overlooking Place Vendôme was spectacular. The service was impeccable. Best meal of my life at the restaurant.', negative: '', roomType: 'Junior Suite', nightsStayed: 5, travellerType: 'couple' },
      { id: 'review_5_2', propertyId: 'prop_5', authorName: 'Jennifer', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-10-28', score: 9.5, title: 'Worth every penny', positive: 'This is what true luxury feels like. The attention to detail is extraordinary. The spa is unmatched. The concierge team arranged everything perfectly.', negative: 'The price is very high, but you get what you pay for.', roomType: 'Deluxe Room', nightsStayed: 3, travellerType: 'business' },
      { id: 'review_5_3', propertyId: 'prop_5', authorName: 'Hiroshi', authorCountry: 'Japan', authorCountryCode: 'JP', date: '2024-09-05', score: 9.3, title: 'A true palace experience', positive: 'Everything about this hotel is exceptional. The history, the elegance, the service. A once-in-a-lifetime experience.', negative: '', roomType: 'Deluxe Room', nightsStayed: 2, travellerType: 'couple' },
      // prop_6 reviews
      { id: 'review_6_1', propertyId: 'prop_6', authorName: 'David', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-11-25', score: 9.2, title: 'Wonderful B&B experience', positive: 'A real gem in Kensington. The owner was incredibly welcoming. The English breakfast was superb - best we had in London. Peaceful garden to relax in.', negative: '', roomType: 'Double Room with Breakfast', nightsStayed: 3, travellerType: 'couple' },
      { id: 'review_6_2', propertyId: 'prop_6', authorName: 'Claire', authorCountry: 'France', authorCountryCode: 'FR', date: '2024-10-05', score: 8.5, title: 'Charming and very British', positive: 'Lovely Victorian house converted with lots of character. Very quiet location. Hyde Park was a lovely walk away. Breakfast was generous.', negative: 'WiFi signal was weak in my room.', roomType: 'Single Room with Breakfast', nightsStayed: 4, travellerType: 'solo' },
      // prop_7 reviews
      { id: 'review_7_1', propertyId: 'prop_7', authorName: 'Kevin', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-11-30', score: 9.5, title: 'Perfect Tokyo experience', positive: 'The view of Shibuya Crossing from the room was incredible. Amazing hotel in the best location. Staff went above and beyond. The rooftop bar is a must.', negative: '', roomType: 'Superior Room - Crossing View', nightsStayed: 4, travellerType: 'couple' },
      { id: 'review_7_2', propertyId: 'prop_7', authorName: 'Elena', authorCountry: 'Italy', authorCountryCode: 'IT', date: '2024-10-18', score: 9.0, title: 'Excellent modern hotel', positive: 'Very clean, modern rooms with all amenities. The location in Shibuya is perfect for shopping and exploring. Breakfast was good.', negative: 'The room was a bit small by Western standards but very well designed.', roomType: 'Standard Double Room', nightsStayed: 5, travellerType: 'couple' },
      { id: 'review_7_3', propertyId: 'prop_7', authorName: 'Robert', authorCountry: 'Canada', authorCountryCode: 'CA', date: '2024-09-22', score: 8.8, title: 'Great business hotel in Tokyo', positive: 'Excellent connectivity, professional staff who speak English. Clean, modern rooms. Great gym facilities. Easy access to everywhere by train.', negative: '', roomType: 'Standard Double Room', nightsStayed: 3, travellerType: 'business' },
      // prop_8 reviews
      { id: 'review_8_1', propertyId: 'prop_8', authorName: 'Laura', authorCountry: 'United Kingdom', authorCountryCode: 'GB', date: '2024-11-12', score: 8.5, title: 'Perfect Barcelona apartment', positive: 'Great location right on La Rambla. The apartment was clean and had everything we needed. The balcony views were amazing. Walking distance to everything.', negative: 'La Rambla can be noisy at night.', roomType: 'Standard Apartment', nightsStayed: 5, travellerType: 'family' },
      { id: 'review_8_2', propertyId: 'prop_8', authorName: 'Markus', authorCountry: 'Germany', authorCountryCode: 'DE', date: '2024-10-02', score: 7.8, title: 'Good location, basic apartment', positive: 'Unbeatable location in the Gothic Quarter. The apartment was clean and comfortable. Good price for Barcelona.', negative: 'The apartment looked a bit dated. The kitchen was small. Noise was an issue at weekends.', roomType: 'Standard Apartment', nightsStayed: 4, travellerType: 'couple' },
      // prop_9 reviews
      { id: 'review_9_1', propertyId: 'prop_9', authorName: 'Sheikh Ahmed', authorCountry: 'Saudi Arabia', authorCountryCode: 'SA', date: '2024-12-01', score: 9.8, title: 'The best resort in Dubai', positive: 'World-class resort with perfect service. The private beach is stunning. The infinity pool is incredible. The restaurants are Michelin-star quality. Everything was flawless.', negative: '', roomType: 'Beach Villa', nightsStayed: 7, travellerType: 'family' },
      { id: 'review_9_2', propertyId: 'prop_9', authorName: 'Natasha', authorCountry: 'Russia', authorCountryCode: 'RU', date: '2024-11-15', score: 9.2, title: 'Luxury at its finest', positive: 'Amazing resort with incredible facilities. The spa was wonderful. Private beach and multiple pools. The staff were attentive and professional.', negative: 'A bit overpriced even for Dubai standards.', roomType: 'Deluxe Sea View Room', nightsStayed: 5, travellerType: 'couple' },
      { id: 'review_9_3', propertyId: 'prop_9', authorName: 'Robert', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-10-20', score: 9.0, title: 'Incredible family resort', positive: 'The kids loved the water sports and kids club. The family suite was very spacious. The staff were great with children. Excellent restaurants.', negative: 'The resort is quite large so a lot of walking between facilities.', roomType: 'Family Suite', nightsStayed: 6, travellerType: 'family' },
      // prop_10 reviews
      { id: 'review_10_1', propertyId: 'prop_10', authorName: 'Megan', authorCountry: 'Australia', authorCountryCode: 'AU', date: '2024-11-22', score: 9.8, title: 'Paradise on Earth!', positive: 'This villa was the most beautiful place I have ever stayed. The private pool overlooking the jungle was magical. Daily breakfast was fresh and delicious. The staff were angels.', negative: '', roomType: 'Garden Villa', nightsStayed: 7, travellerType: 'couple' },
      { id: 'review_10_2', propertyId: 'prop_10', authorName: 'Nicolas', authorCountry: 'France', authorCountryCode: 'FR', date: '2024-10-08', score: 9.5, title: 'Honeymoon perfection', positive: 'We came for our honeymoon and it exceeded all expectations. The infinity pool villa was absolutely stunning. The sunset views are indescribable.', negative: 'The location requires taxi everywhere as it is remote.', roomType: 'Jungle Retreat Villa', nightsStayed: 10, travellerType: 'couple' },
      // prop_11 reviews
      { id: 'review_11_1', propertyId: 'prop_11', authorName: 'Alex', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-11-18', score: 8.0, title: 'Great hostel for budget travelers', positive: 'Really social atmosphere with great bar. Perfect location in Jordaan. The free bikes were a great bonus. Staff organized fun activities.', negative: 'Dormitory is quite noisy and the lockers are small. Bathroom facilities need updating.', roomType: 'Dormitory Bed', nightsStayed: 4, travellerType: 'solo' },
      { id: 'review_11_2', propertyId: 'prop_11', authorName: 'Sophie', authorCountry: 'New Zealand', authorCountryCode: 'NZ', date: '2024-09-14', score: 7.5, title: 'Fun hostel, great location', positive: 'Met amazing people here. Great canal views. Bike rental is brilliant for exploring Amsterdam. Very social common area.', negative: 'The private room was quite small and basic for the price.', roomType: 'Private Room', nightsStayed: 5, travellerType: 'solo' },
      // prop_12 reviews
      { id: 'review_12_1', propertyId: 'prop_12', authorName: 'Brad', authorCountry: 'United States', authorCountryCode: 'US', date: '2024-12-05', score: 9.3, title: 'Classic Hollywood luxury', positive: 'This hotel oozes old Hollywood glamour. The service is impeccable. Spotted two celebrities at the pool. The restaurant food was outstanding. Spa is world class.', negative: '', roomType: 'Beverly Hills Suite', nightsStayed: 3, travellerType: 'couple' },
      { id: 'review_12_2', propertyId: 'prop_12', authorName: 'Isabella', authorCountry: 'Brazil', authorCountryCode: 'BR', date: '2024-11-08', score: 9.0, title: 'Beverly Hills at its finest', positive: 'Iconic hotel with superb service. The pool area is stunning. Central location in Beverly Hills for shopping on Rodeo Drive.', negative: 'Valet parking is very expensive but it is Beverly Hills so expected.', roomType: 'Deluxe Room', nightsStayed: 4, travellerType: 'couple' },
    ],
    reviewCategories: {
      prop_1: { staff: 9.0, facilities: 8.5, cleanliness: 9.2, comfort: 8.8, valueForMoney: 8.3, location: 9.5, freeWifi: 8.7 },
      prop_2: { staff: 7.5, facilities: 9.0, cleanliness: 9.3, comfort: 9.1, valueForMoney: 8.8, location: 9.2, freeWifi: 9.0 },
      prop_3: { staff: 7.2, facilities: 6.8, cleanliness: 7.5, comfort: 7.0, valueForMoney: 8.5, location: 8.8, freeWifi: 7.5 },
      prop_4: { staff: 9.1, facilities: 8.0, cleanliness: 8.8, comfort: 8.5, valueForMoney: 8.2, location: 9.0, freeWifi: 8.3 },
      prop_5: { staff: 9.8, facilities: 9.7, cleanliness: 9.9, comfort: 9.8, valueForMoney: 8.5, location: 9.9, freeWifi: 9.5 },
      prop_6: { staff: 9.5, facilities: 8.2, cleanliness: 9.3, comfort: 8.8, valueForMoney: 9.0, location: 8.9, freeWifi: 7.8 },
      prop_7: { staff: 9.3, facilities: 9.0, cleanliness: 9.5, comfort: 9.0, valueForMoney: 8.7, location: 9.8, freeWifi: 9.2 },
      prop_8: { staff: 7.5, facilities: 8.0, cleanliness: 8.5, comfort: 8.0, valueForMoney: 8.8, location: 9.5, freeWifi: 8.5 },
      prop_9: { staff: 9.5, facilities: 9.8, cleanliness: 9.7, comfort: 9.6, valueForMoney: 8.2, location: 9.0, freeWifi: 9.0 },
      prop_10: { staff: 9.9, facilities: 9.7, cleanliness: 9.8, comfort: 9.9, valueForMoney: 9.5, location: 8.5, freeWifi: 8.8 },
      prop_11: { staff: 8.5, facilities: 7.5, cleanliness: 8.0, comfort: 7.2, valueForMoney: 8.8, location: 9.2, freeWifi: 8.0 },
      prop_12: { staff: 9.5, facilities: 9.3, cleanliness: 9.5, comfort: 9.4, valueForMoney: 8.0, location: 8.8, freeWifi: 9.0 },
    },
    bookings: [
      {
        id: 'booking_1', confirmationNumber: '2847193650', pinCode: '4829',
        userId: 'user_1', propertyId: 'prop_1', propertyName: 'Grand Plaza Hotel & Spa',
        propertyImage: 'https://picsum.photos/seed/prop1a/400/300',
        propertyCity: 'New York', propertyAddress: '123 Broadway, Manhattan, New York, NY 10001',
        roomId: 'room_1_2', roomName: 'Deluxe King Room',
        checkIn: '2026-06-15', checkOut: '2026-06-20', nights: 5,
        guests: { adults: 2, children: 0 }, rooms: 1,
        pricePerNight: 259, totalPrice: 1295, taxesAndFees: 194, grandTotal: 1489,
        status: 'confirmed', guestFirstName: 'Sarah', guestLastName: 'Johnson',
        guestEmail: 'sarah.johnson@email.com', guestPhone: '+1 (555) 123-4567',
        specialRequests: 'Late check-in, around 10 PM please', arrivalTime: '22:00 – 23:00',
        freeCancellation: true, cancellationDeadline: '2026-06-12',
        createdAt: '2026-02-01T10:30:00Z',
      },
      {
        id: 'booking_2', confirmationNumber: '1935728461', pinCode: '7351',
        userId: 'user_1', propertyId: 'prop_7', propertyName: 'Shibuya Crossing Hotel',
        propertyImage: 'https://picsum.photos/seed/prop7a/400/300',
        propertyCity: 'Tokyo', propertyAddress: '2-1 Dogenzaka, Shibuya-ku, Tokyo 150-0043',
        roomId: 'room_7_1', roomName: 'Standard Double Room',
        checkIn: '2025-05-01', checkOut: '2025-05-05', nights: 4,
        guests: { adults: 2, children: 0 }, rooms: 1,
        pricePerNight: 165, totalPrice: 660, taxesAndFees: 99, grandTotal: 759,
        status: 'confirmed', guestFirstName: 'Sarah', guestLastName: 'Johnson',
        guestEmail: 'sarah.johnson@email.com', guestPhone: '+1 (555) 123-4567',
        specialRequests: '', arrivalTime: '15:00 – 16:00',
        freeCancellation: true, cancellationDeadline: '2025-04-28',
        createdAt: '2025-01-15T14:20:00Z',
      },
      {
        id: 'booking_3', confirmationNumber: '7461039285', pinCode: '2194',
        userId: 'user_1', propertyId: 'prop_4', propertyName: 'Hôtel Le Marais Charm',
        propertyImage: 'https://picsum.photos/seed/prop4a/400/300',
        propertyCity: 'Paris', propertyAddress: '12 Rue des Archives, Le Marais, Paris 75004',
        roomId: 'room_4_1', roomName: 'Classic Double Room',
        checkIn: '2024-10-10', checkOut: '2024-10-13', nights: 3,
        guests: { adults: 1, children: 0 }, rooms: 1,
        pricePerNight: 145, totalPrice: 435, taxesAndFees: 65, grandTotal: 500,
        status: 'completed', guestFirstName: 'Sarah', guestLastName: 'Johnson',
        guestEmail: 'sarah.johnson@email.com', guestPhone: '+1 (555) 123-4567',
        specialRequests: 'Extra pillows please', arrivalTime: '18:00 – 19:00',
        freeCancellation: false, cancellationDeadline: null,
        createdAt: '2024-09-01T09:00:00Z',
      },
    ],
    searchParams: {
      destination: '',
      destinationId: null,
      checkIn: null,
      checkOut: null,
      adults: 2,
      children: 0,
      childrenAges: [],
      rooms: 1,
      travelingForWork: false,
    },
    searchFilters: {
      priceMin: null,
      priceMax: null,
      starRating: [],
      reviewScore: null,
      propertyType: [],
      facilities: [],
      freeCancellation: false,
      breakfastIncluded: false,
      geniusDeals: false,
      sortBy: 'our_top_picks',
    },
    searchResults: [],
    selectedPropertyId: null,
    recentSearches: [
      { destination: 'New York', destinationId: 'dest_1', dates: 'Mar 15 – Mar 18', guests: '2 adults · 0 children · 1 room' },
      { destination: 'Tokyo', destinationId: 'dest_4', dates: 'May 1 – May 5', guests: '2 adults · 0 children · 1 room' },
    ],
    recentlyViewed: ['prop_1', 'prop_4'],
    notifications: [],
    viewedProperties: [],
  };
}

// Export alias for compatibility
export const generateInitialData = createInitialData;
