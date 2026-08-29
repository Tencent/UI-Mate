const BASE_STORAGE_KEY = 'tripadvisor_mock_state';
const BASE_INITIAL_KEY = 'tripadvisor_mock_initial_state';

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

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  if (stored) return JSON.parse(stored);
  return null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) {}
  return null;
};

export const saveState = async (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  try {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_current', state })
    });
  } catch (e) {}
};

export const saveInitialState = async (state, sid = null) => {
  localStorage.setItem(initialKey(sid), JSON.stringify(state));
  try {
    const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state })
    });
  } catch (e) {}
};

export const loadState = (sid = null) => {
  const stored = localStorage.getItem(storageKey(sid));
  if (stored) return JSON.parse(stored);
  return null;
};

export function createInitialData() {
  const destinations = [
    { id: 'dest_1', name: 'New York City', country: 'United States', description: 'The city that never sleeps offers world-class dining, iconic landmarks, and vibrant neighborhoods. From the bright lights of Times Square to the tranquil paths of Central Park, NYC has something for every traveler.', hotelCount: 1423, restaurantCount: 12845, attractionCount: 1328, image: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
    { id: 'dest_2', name: 'Paris', country: 'France', description: 'The City of Light enchants visitors with its iconic landmarks, world-renowned cuisine, and artistic heritage. Stroll along the Seine, explore the Louvre, and savor exquisite pastries at charming cafes.', hotelCount: 2156, restaurantCount: 16234, attractionCount: 2145, image: 'linear-gradient(135deg, #2d1b69 0%, #6b3fa0 50%, #fd3a69 100%)' },
    { id: 'dest_3', name: 'London', country: 'United Kingdom', description: 'A dynamic capital blending centuries of history with cutting-edge culture. Explore royal palaces, world-class museums, and diverse neighborhoods, each with its own unique character.', hotelCount: 1876, restaurantCount: 18432, attractionCount: 1678, image: 'linear-gradient(135deg, #1b1b2f 0%, #162447 50%, #1f4068 100%)' },
    { id: 'dest_4', name: 'Tokyo', country: 'Japan', description: 'A fascinating blend of ultra-modern and traditional, Tokyo dazzles with neon-lit skyscrapers, ancient temples, incredible food, and a pop culture scene like nowhere else on Earth.', hotelCount: 3245, restaurantCount: 89234, attractionCount: 2345, image: 'linear-gradient(135deg, #e63946 0%, #f1faee 50%, #a8dadc 100%)' },
    { id: 'dest_5', name: 'Rome', country: 'Italy', description: 'The Eternal City is an open-air museum where ancient ruins, Renaissance art, and vibrant street life create an unforgettable experience. Every corner reveals layers of history.', hotelCount: 1234, restaurantCount: 10234, attractionCount: 1567, image: 'linear-gradient(135deg, #6b4226 0%, #d4a76a 50%, #f5e6cc 100%)' },
    { id: 'dest_6', name: 'Barcelona', country: 'Spain', description: 'Gaudi\'s whimsical architecture, beautiful beaches, and a legendary food scene make Barcelona one of Europe\'s most exciting destinations. The city pulses with creativity and energy.', hotelCount: 987, restaurantCount: 8765, attractionCount: 876, image: 'linear-gradient(135deg, #ff6b35 0%, #f7c59f 50%, #efefd0 100%)' },
    { id: 'dest_7', name: 'Cancun', country: 'Mexico', description: 'Turquoise Caribbean waters meet ancient Mayan ruins in this beloved resort destination. World-class beaches, vibrant nightlife, and nearby cenotes offer endless adventure.', hotelCount: 654, restaurantCount: 2345, attractionCount: 456, image: 'linear-gradient(135deg, #00b4d8 0%, #48cae4 50%, #90e0ef 100%)' },
    { id: 'dest_8', name: 'Bali', country: 'Indonesia', description: 'This Indonesian paradise offers lush rice terraces, ancient temples, world-class surfing, and a thriving wellness scene. Bali\'s spiritual energy and natural beauty captivate every visitor.', hotelCount: 876, restaurantCount: 3456, attractionCount: 567, image: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 50%, #95d5b2 100%)' }
  ];

  const users = [
    { id: 'user_1', name: 'TravelExplorer2024', location: 'San Francisco, CA', avatar: null, reviewCount: 47, helpfulVotes: 234, photoCount: 89, level: 'Senior Contributor', memberSince: '2019-03-15', bio: 'Passionate traveler who loves discovering hidden gems around the world.' },
    { id: 'user_2', name: 'WanderlustJane', location: 'London, UK', avatar: null, reviewCount: 156, helpfulVotes: 892, photoCount: 312, level: 'Top Contributor', memberSince: '2017-06-22' },
    { id: 'user_3', name: 'FoodieMarco', location: 'Rome, Italy', avatar: null, reviewCount: 89, helpfulVotes: 445, photoCount: 167, level: 'Senior Contributor', memberSince: '2018-11-03' },
    { id: 'user_4', name: 'AdventureSeeker_Mike', location: 'Sydney, Australia', avatar: null, reviewCount: 201, helpfulVotes: 1023, photoCount: 456, level: 'Top Contributor', memberSince: '2016-01-18' },
    { id: 'user_5', name: 'CultureVulture', location: 'Berlin, Germany', avatar: null, reviewCount: 67, helpfulVotes: 289, photoCount: 134, level: 'Senior Contributor', memberSince: '2020-05-10' },
    { id: 'user_6', name: 'BeachBumSarah', location: 'Miami, FL', avatar: null, reviewCount: 34, helpfulVotes: 167, photoCount: 78, level: 'Contributor', memberSince: '2021-08-14' },
    { id: 'user_7', name: 'HistoryBuff_Tom', location: 'Edinburgh, UK', avatar: null, reviewCount: 112, helpfulVotes: 567, photoCount: 234, level: 'Top Contributor', memberSince: '2017-02-28' },
    { id: 'user_8', name: 'SoloTraveler_Yuki', location: 'Tokyo, Japan', avatar: null, reviewCount: 78, helpfulVotes: 345, photoCount: 189, level: 'Senior Contributor', memberSince: '2019-09-05' },
    { id: 'user_9', name: 'FamilyTrips_Lisa', location: 'Toronto, Canada', avatar: null, reviewCount: 45, helpfulVotes: 198, photoCount: 96, level: 'Contributor', memberSince: '2020-12-01' },
    { id: 'user_10', name: 'LuxuryLover_Pierre', location: 'Paris, France', avatar: null, reviewCount: 234, helpfulVotes: 1456, photoCount: 567, level: 'Top Contributor', memberSince: '2015-04-22' },
    { id: 'user_11', name: 'BackpackerAnna', location: 'Amsterdam, Netherlands', avatar: null, reviewCount: 56, helpfulVotes: 234, photoCount: 123, level: 'Senior Contributor', memberSince: '2019-07-15' },
    { id: 'user_12', name: 'GourmetGuy_NYC', location: 'New York, NY', avatar: null, reviewCount: 178, helpfulVotes: 890, photoCount: 345, level: 'Top Contributor', memberSince: '2016-11-30' },
    { id: 'user_13', name: 'NomadNancy', location: 'Denver, CO', avatar: null, reviewCount: 23, helpfulVotes: 89, photoCount: 45, level: 'Contributor', memberSince: '2022-03-20' },
    { id: 'user_14', name: 'ArtLover_Carlos', location: 'Barcelona, Spain', avatar: null, reviewCount: 91, helpfulVotes: 412, photoCount: 203, level: 'Senior Contributor', memberSince: '2018-08-11' },
    { id: 'user_15', name: 'MountainHiker_Dave', location: 'Boulder, CO', avatar: null, reviewCount: 67, helpfulVotes: 312, photoCount: 178, level: 'Senior Contributor', memberSince: '2019-01-25' },
    { id: 'user_16', name: 'TravelCouple_JK', location: 'Chicago, IL', avatar: null, reviewCount: 134, helpfulVotes: 678, photoCount: 290, level: 'Top Contributor', memberSince: '2017-05-09' },
    { id: 'user_17', name: 'IslandDreamer', location: 'Honolulu, HI', avatar: null, reviewCount: 42, helpfulVotes: 156, photoCount: 87, level: 'Contributor', memberSince: '2021-02-14' },
    { id: 'user_18', name: 'CityExplorer_Sam', location: 'Boston, MA', avatar: null, reviewCount: 88, helpfulVotes: 398, photoCount: 176, level: 'Senior Contributor', memberSince: '2018-10-07' },
    { id: 'user_19', name: 'WineAndDine_Maria', location: 'Napa, CA', avatar: null, reviewCount: 56, helpfulVotes: 234, photoCount: 112, level: 'Senior Contributor', memberSince: '2020-06-18' },
    { id: 'user_20', name: 'PhotographerPete', location: 'Portland, OR', avatar: null, reviewCount: 145, helpfulVotes: 789, photoCount: 890, level: 'Top Contributor', memberSince: '2016-08-23' },
    { id: 'user_21', name: 'BudgetBackpacker_Lee', location: 'Seoul, South Korea', avatar: null, reviewCount: 33, helpfulVotes: 112, photoCount: 67, level: 'Contributor', memberSince: '2022-01-10' }
  ];

  const hotels = [
    // NYC Hotels
    { id: 'hotel_1', name: 'The Manhattan Grand Hotel', destinationId: 'dest_1', address: '145 W 44th St, New York, NY 10036', rating: 4.5, reviewCount: 2341, starClass: 5, pricePerNight: 489, travelersChoice: true, rank: 3, totalHotelsInCity: 845, description: 'Located in the heart of Times Square, The Manhattan Grand Hotel offers luxurious accommodations with stunning city views. Our recently renovated rooms feature premium bedding, marble bathrooms, and state-of-the-art amenities. The rooftop bar provides panoramic views of the Manhattan skyline.', amenities: ['Free WiFi', 'Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Business Center', 'Valet Parking', 'Bar/Lounge', 'Airport Shuttle', 'Laundry Service'], images: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 489 }, { partner: 'Expedia', price: 512 }, { partner: 'Hotels.com', price: 499 }, { partner: 'Priceline', price: 478 }], subRatings: { location: 4.8, cleanliness: 4.6, service: 4.5, value: 4.0, sleepQuality: 4.4, rooms: 4.5 }, propertyType: 'Hotel', neighborhood: 'Midtown' },
    { id: 'hotel_2', name: 'Brooklyn Bridge Inn', destinationId: 'dest_1', address: '85 Smith St, Brooklyn, NY 11201', rating: 4.0, reviewCount: 1876, starClass: 4, pricePerNight: 245, travelersChoice: false, rank: 28, totalHotelsInCity: 845, description: 'A charming boutique hotel nestled in the heart of Brooklyn, steps from the iconic Brooklyn Bridge. Our cozy rooms blend modern comfort with vintage Brooklyn charm. Enjoy artisanal breakfast and explore the vibrant local food scene.', amenities: ['Free WiFi', 'Free Breakfast', 'Fitness Center', 'Business Center', 'Laundry Service', 'Pet Friendly', 'Bicycle Rental'], images: ['linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 245 }, { partner: 'Expedia', price: 259 }, { partner: 'Hotels.com', price: 252 }], subRatings: { location: 4.5, cleanliness: 4.2, service: 4.0, value: 4.3, sleepQuality: 3.8, rooms: 3.9 }, propertyType: 'Inn', neighborhood: 'Brooklyn' },
    { id: 'hotel_3', name: 'SoHo Loft Suites', destinationId: 'dest_1', address: '210 Spring St, New York, NY 10012', rating: 4.3, reviewCount: 987, starClass: 4, pricePerNight: 379, travelersChoice: true, rank: 12, totalHotelsInCity: 845, description: 'Experience the artistic spirit of SoHo in our stylish loft-style suites. Each room features exposed brick, high ceilings, and curated art from local galleries. Walking distance to the best shopping and dining in Lower Manhattan.', amenities: ['Free WiFi', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Bar/Lounge', 'Laundry Service', 'Business Center'], images: ['linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 379 }, { partner: 'Expedia', price: 395 }, { partner: 'Hotels.com', price: 385 }], subRatings: { location: 4.7, cleanliness: 4.4, service: 4.3, value: 3.8, sleepQuality: 4.1, rooms: 4.4 }, propertyType: 'Hotel', neighborhood: 'SoHo' },
    { id: 'hotel_4', name: 'Central Park View Hotel', destinationId: 'dest_1', address: '768 5th Ave, New York, NY 10019', rating: 4.7, reviewCount: 3456, starClass: 5, pricePerNight: 650, travelersChoice: true, rank: 1, totalHotelsInCity: 845, description: 'Overlooking the iconic Central Park, this legendary five-star hotel has been a beacon of luxury hospitality since 1907. Impeccable service, world-class dining, and rooms that redefine elegance await you.', amenities: ['Free WiFi', 'Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Business Center', 'Valet Parking', 'Bar/Lounge', 'Airport Shuttle', 'Laundry Service', 'Kids Club', 'Pet Friendly'], images: ['linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', 'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)', 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 650 }, { partner: 'Expedia', price: 689 }, { partner: 'Hotels.com', price: 665 }, { partner: 'Priceline', price: 635 }], subRatings: { location: 5.0, cleanliness: 4.8, service: 4.9, value: 3.9, sleepQuality: 4.7, rooms: 4.8 }, propertyType: 'Hotel', neighborhood: 'Upper West Side' },
    { id: 'hotel_5', name: 'Harlem Heritage Hostel', destinationId: 'dest_1', address: '242 W 123rd St, New York, NY 10027', rating: 3.2, reviewCount: 456, starClass: 2, pricePerNight: 89, travelersChoice: false, rank: 312, totalHotelsInCity: 845, description: 'An affordable and friendly hostel in the heart of historic Harlem. Perfect for budget travelers who want to experience authentic New York culture. Shared kitchen, common lounge, and guided neighborhood tours available.', amenities: ['Free WiFi', 'Shared Kitchen', 'Laundry Service', 'Luggage Storage', 'Common Lounge'], images: ['linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)', 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'], partnerPrices: [{ partner: 'Hostelworld', price: 89 }, { partner: 'Booking.com', price: 95 }], subRatings: { location: 3.5, cleanliness: 3.0, service: 3.4, value: 4.2, sleepQuality: 2.8, rooms: 2.9 }, propertyType: 'Hostel', neighborhood: 'Harlem' },
    { id: 'hotel_6', name: 'Chelsea Boutique Hotel', destinationId: 'dest_1', address: '130 W 25th St, New York, NY 10001', rating: 4.1, reviewCount: 1234, starClass: 3, pricePerNight: 198, travelersChoice: false, rank: 45, totalHotelsInCity: 845, description: 'A stylish boutique hotel in trendy Chelsea, surrounded by galleries, restaurants, and the famous High Line park. Rooms are thoughtfully designed with modern amenities and artistic touches.', amenities: ['Free WiFi', 'Fitness Center', 'Room Service', 'Concierge', 'Bar/Lounge', 'Laundry Service'], images: ['linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 198 }, { partner: 'Expedia', price: 215 }, { partner: 'Hotels.com', price: 205 }], subRatings: { location: 4.4, cleanliness: 4.1, service: 4.0, value: 4.0, sleepQuality: 3.9, rooms: 3.8 }, propertyType: 'Hotel', neighborhood: 'Chelsea' },
    // Paris Hotels
    { id: 'hotel_7', name: 'Hôtel Le Marais Royale', destinationId: 'dest_2', address: '15 Rue des Archives, 75004 Paris', rating: 4.6, reviewCount: 2789, starClass: 5, pricePerNight: 520, travelersChoice: true, rank: 5, totalHotelsInCity: 1234, description: 'Nestled in the historic Le Marais district, this exquisite five-star hotel combines 17th-century Parisian elegance with contemporary luxury. Our Michelin-starred restaurant and rooftop terrace offer unforgettable experiences.', amenities: ['Free WiFi', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Bar/Lounge', 'Valet Parking', 'Airport Shuttle', 'Laundry Service'], images: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 520 }, { partner: 'Expedia', price: 545 }, { partner: 'Hotels.com', price: 535 }, { partner: 'Agoda', price: 510 }], subRatings: { location: 4.9, cleanliness: 4.7, service: 4.6, value: 4.0, sleepQuality: 4.5, rooms: 4.6 }, propertyType: 'Hotel', neighborhood: 'Le Marais' },
    { id: 'hotel_8', name: 'Montmartre Artist Retreat', destinationId: 'dest_2', address: '42 Rue Lepic, 75018 Paris', rating: 4.2, reviewCount: 1456, starClass: 3, pricePerNight: 189, travelersChoice: false, rank: 67, totalHotelsInCity: 1234, description: 'A charming hotel in bohemian Montmartre, the historic artists\' quarter. Wake up to views of Sacré-Cœur, enjoy fresh croissants at our café, and wander the same streets that inspired Renoir and Picasso.', amenities: ['Free WiFi', 'Free Breakfast', 'Bar/Lounge', 'Concierge', 'Laundry Service', 'Bicycle Rental'], images: ['linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 189 }, { partner: 'Expedia', price: 199 }], subRatings: { location: 4.6, cleanliness: 4.0, service: 4.2, value: 4.4, sleepQuality: 3.8, rooms: 3.9 }, propertyType: 'Hotel', neighborhood: 'Montmartre' },
    { id: 'hotel_9', name: 'Saint-Germain Prestige', destinationId: 'dest_2', address: '88 Boulevard Saint-Germain, 75005 Paris', rating: 4.4, reviewCount: 1987, starClass: 4, pricePerNight: 345, travelersChoice: false, rank: 23, totalHotelsInCity: 1234, description: 'An elegant hotel on the prestigious Boulevard Saint-Germain, in the heart of the Latin Quarter. Rich literary history, refined rooms, and proximity to Notre-Dame and the Luxembourg Gardens.', amenities: ['Free WiFi', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Bar/Lounge', 'Business Center', 'Laundry Service'], images: ['linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 345 }, { partner: 'Expedia', price: 365 }, { partner: 'Hotels.com', price: 355 }], subRatings: { location: 4.8, cleanliness: 4.5, service: 4.3, value: 3.9, sleepQuality: 4.3, rooms: 4.4 }, propertyType: 'Hotel', neighborhood: 'Saint-Germain' },
    { id: 'hotel_10', name: 'Budget Paris Hostel', destinationId: 'dest_2', address: '20 Rue de Dunkerque, 75010 Paris', rating: 3.0, reviewCount: 678, starClass: 1, pricePerNight: 65, travelersChoice: false, rank: 456, totalHotelsInCity: 1234, description: 'A no-frills hostel near Gare du Nord, perfect for budget travelers exploring Paris. Clean rooms, helpful staff, and easy metro access to all major attractions.', amenities: ['Free WiFi', 'Shared Kitchen', 'Luggage Storage', 'Common Lounge', 'Laundry Service'], images: ['linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)', 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'], partnerPrices: [{ partner: 'Hostelworld', price: 65 }, { partner: 'Booking.com', price: 72 }], subRatings: { location: 3.5, cleanliness: 2.8, service: 3.2, value: 4.0, sleepQuality: 2.5, rooms: 2.6 }, propertyType: 'Hostel', neighborhood: 'Gare du Nord' },
    { id: 'hotel_11', name: 'Champs-Élysées Palace', destinationId: 'dest_2', address: '25 Avenue des Champs-Élysées, 75008 Paris', rating: 4.8, reviewCount: 4123, starClass: 5, pricePerNight: 890, travelersChoice: true, rank: 1, totalHotelsInCity: 1234, description: 'The pinnacle of Parisian luxury on the world\'s most famous avenue. Our palatial suites, Michelin-starred dining, and legendary spa make this the ultimate Paris experience.', amenities: ['Free WiFi', 'Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Business Center', 'Valet Parking', 'Bar/Lounge', 'Airport Shuttle', 'Laundry Service', 'Kids Club', 'Pet Friendly', 'Rooftop Terrace'], images: ['linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', 'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)', 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 890 }, { partner: 'Expedia', price: 925 }, { partner: 'Hotels.com', price: 905 }, { partner: 'Agoda', price: 875 }], subRatings: { location: 5.0, cleanliness: 4.9, service: 4.9, value: 3.8, sleepQuality: 4.8, rooms: 4.9 }, propertyType: 'Hotel', neighborhood: 'Champs-Élysées' },
    // London Hotels
    { id: 'hotel_12', name: 'The Westminster Heritage', destinationId: 'dest_3', address: '45 Buckingham Gate, London SW1E 6AF', rating: 4.5, reviewCount: 2567, starClass: 5, pricePerNight: 475, travelersChoice: true, rank: 4, totalHotelsInCity: 987, description: 'A prestigious five-star hotel steps from Buckingham Palace and Westminster Abbey. Classic British elegance meets modern luxury in our beautifully appointed rooms and suites. Afternoon tea in our conservatory is a London tradition.', amenities: ['Free WiFi', 'Spa', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Business Center', 'Valet Parking', 'Bar/Lounge', 'Laundry Service', 'Afternoon Tea'], images: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 475 }, { partner: 'Expedia', price: 495 }, { partner: 'Hotels.com', price: 485 }], subRatings: { location: 4.9, cleanliness: 4.6, service: 4.7, value: 3.9, sleepQuality: 4.5, rooms: 4.5 }, propertyType: 'Hotel', neighborhood: 'Westminster' },
    { id: 'hotel_13', name: 'Camden Town B&B', destinationId: 'dest_3', address: '12 Camden Road, London NW1 9DP', rating: 3.8, reviewCount: 876, starClass: 3, pricePerNight: 145, travelersChoice: false, rank: 123, totalHotelsInCity: 987, description: 'A cozy bed & breakfast in the eclectic Camden Town neighborhood. Full English breakfast included, quirky decor, and a short walk to Camden Market and the Regent\'s Canal.', amenities: ['Free WiFi', 'Free Breakfast', 'Common Lounge', 'Luggage Storage', 'Laundry Service'], images: ['linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 145 }, { partner: 'Expedia', price: 155 }], subRatings: { location: 4.2, cleanliness: 3.8, service: 4.0, value: 4.3, sleepQuality: 3.5, rooms: 3.4 }, propertyType: 'B&B', neighborhood: 'Camden' },
    { id: 'hotel_14', name: 'Kensington Royal Suites', destinationId: 'dest_3', address: '99 Kensington High St, London W8 5SE', rating: 4.3, reviewCount: 1567, starClass: 4, pricePerNight: 325, travelersChoice: false, rank: 18, totalHotelsInCity: 987, description: 'Elegant suites in leafy Kensington, near world-famous museums and beautiful gardens. Our spacious rooms are ideal for families and couples seeking a refined London experience.', amenities: ['Free WiFi', 'Fitness Center', 'Restaurant', 'Room Service', 'Concierge', 'Business Center', 'Bar/Lounge', 'Laundry Service', 'Parking'], images: ['linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 325 }, { partner: 'Expedia', price: 345 }, { partner: 'Hotels.com', price: 335 }], subRatings: { location: 4.6, cleanliness: 4.4, service: 4.2, value: 3.8, sleepQuality: 4.3, rooms: 4.3 }, propertyType: 'Hotel', neighborhood: 'Kensington' },
    { id: 'hotel_15', name: 'Shoreditch Design Hotel', destinationId: 'dest_3', address: '55 Curtain Rd, London EC2A 3PT', rating: 4.1, reviewCount: 1098, starClass: 4, pricePerNight: 265, travelersChoice: false, rank: 35, totalHotelsInCity: 987, description: 'A cutting-edge design hotel in trendy Shoreditch, East London\'s creative hub. Bold contemporary interiors, a rooftop pool, and the city\'s best nightlife on your doorstep.', amenities: ['Free WiFi', 'Pool', 'Fitness Center', 'Restaurant', 'Room Service', 'Bar/Lounge', 'Bicycle Rental', 'Laundry Service'], images: ['linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)'], partnerPrices: [{ partner: 'Booking.com', price: 265 }, { partner: 'Expedia', price: 280 }, { partner: 'Hotels.com', price: 272 }], subRatings: { location: 4.3, cleanliness: 4.2, service: 4.0, value: 3.9, sleepQuality: 3.8, rooms: 4.2 }, propertyType: 'Hotel', neighborhood: 'Shoreditch' }
  ];

  const restaurants = [
    // NYC Restaurants
    { id: 'rest_1', name: 'Le Bernardin', destinationId: 'dest_1', address: '155 W 51st St, New York, NY 10019', rating: 4.8, reviewCount: 3456, priceLevel: '$$$$', cuisines: ['French', 'Seafood'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Gluten Free Options', 'Vegetarian Options'], features: ['Reservations', 'Outdoor Seating', 'Private Dining'], hours: 'Mon-Sat 11:30 AM - 10:30 PM', phone: '(212) 554-1515', description: 'A temple of seafood cuisine helmed by Chef Eric Ripert. Three Michelin stars and consistently ranked among the world\'s best restaurants. The tasting menu is a transformative experience.', images: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'], subRatings: { food: 4.9, service: 4.8, value: 4.2, atmosphere: 4.7 }, travelersChoice: true, rank: 1, totalRestaurantsInCity: 12845 },
    { id: 'rest_2', name: 'Joe\'s Pizza', destinationId: 'dest_1', address: '7 Carmine St, New York, NY 10014', rating: 4.5, reviewCount: 5678, priceLevel: '$', cuisines: ['Italian', 'Pizza'], meals: ['Lunch', 'Dinner', 'Late Night'], dietaryOptions: ['Vegetarian Options'], features: ['Takeout', 'Delivery'], hours: 'Daily 10:00 AM - 4:00 AM', phone: '(212) 366-1182', description: 'A New York City institution since 1975. No-frills, classic New York-style pizza that has earned a cult following. Cash only, and worth every penny.', images: ['linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'], subRatings: { food: 4.7, service: 3.8, value: 4.9, atmosphere: 3.5 }, travelersChoice: false, rank: 15, totalRestaurantsInCity: 12845 },
    { id: 'rest_3', name: 'Raku Japanese', destinationId: 'dest_1', address: '342 E 6th St, New York, NY 10003', rating: 4.4, reviewCount: 1234, priceLevel: '$$$', cuisines: ['Japanese', 'Sushi'], meals: ['Dinner'], dietaryOptions: ['Gluten Free Options', 'Vegetarian Options', 'Vegan Options'], features: ['Reservations', 'Private Dining'], hours: 'Tue-Sun 5:30 PM - 10:30 PM', phone: '(212) 228-1078', description: 'An intimate omakase experience in the East Village. Chef-selected courses showcase the freshest seasonal fish, flown in from Tokyo\'s Tsukiji Market. Reservations essential.', images: ['linear-gradient(135deg, #e63946 0%, #f1faee 100%)', 'linear-gradient(135deg, #a8dadc 0%, #457b9d 100%)', 'linear-gradient(135deg, #1d3557 0%, #457b9d 100%)'], subRatings: { food: 4.7, service: 4.5, value: 3.8, atmosphere: 4.6 }, travelersChoice: false, rank: 42, totalRestaurantsInCity: 12845 },
    { id: 'rest_4', name: 'Los Tacos No. 1', destinationId: 'dest_1', address: '75 9th Ave, New York, NY 10011', rating: 4.3, reviewCount: 2345, priceLevel: '$', cuisines: ['Mexican', 'Latin'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Gluten Free Options', 'Vegetarian Options'], features: ['Takeout'], hours: 'Daily 11:00 AM - 11:00 PM', phone: '(212) 256-0343', description: 'Authentic Mexican street tacos in Chelsea Market. The adobo chicken and carne asada tacos are legendary. Simple, fresh, and impossibly delicious.', images: ['linear-gradient(135deg, #ff6b35 0%, #f7c59f 100%)', 'linear-gradient(135deg, #efefd0 0%, #ff6b35 100%)'], subRatings: { food: 4.6, service: 3.9, value: 4.8, atmosphere: 3.6 }, travelersChoice: false, rank: 23, totalRestaurantsInCity: 12845 },
    { id: 'rest_5', name: 'The Grill Room', destinationId: 'dest_1', address: '99 E 52nd St, New York, NY 10022', rating: 4.2, reviewCount: 987, priceLevel: '$$$$', cuisines: ['American', 'Steakhouse'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Gluten Free Options'], features: ['Reservations', 'Private Dining', 'Outdoor Seating'], hours: 'Mon-Sat 12:00 PM - 10:00 PM', phone: '(212) 375-9001', description: 'A modern American steakhouse in a landmark Midtown space. Dry-aged steaks, classic cocktails, and an impressive wine list in a sophisticated setting.', images: ['linear-gradient(135deg, #6b4226 0%, #d4a76a 100%)', 'linear-gradient(135deg, #f5e6cc 0%, #6b4226 100%)'], subRatings: { food: 4.4, service: 4.3, value: 3.5, atmosphere: 4.5 }, travelersChoice: false, rank: 56, totalRestaurantsInCity: 12845 },
    { id: 'rest_6', name: 'Spice Symphony', destinationId: 'dest_1', address: '150 E 50th St, New York, NY 10022', rating: 4.1, reviewCount: 876, priceLevel: '$$', cuisines: ['Indian'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Vegetarian Options', 'Vegan Options', 'Gluten Free Options'], features: ['Reservations', 'Delivery', 'Takeout'], hours: 'Daily 11:30 AM - 10:30 PM', phone: '(212) 300-4630', description: 'A vibrant Indian restaurant offering both North and South Indian specialties. The butter chicken and dosa are must-tries. Generous lunch buffet on weekdays.', images: ['linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)'], subRatings: { food: 4.3, service: 4.0, value: 4.4, atmosphere: 3.8 }, travelersChoice: false, rank: 78, totalRestaurantsInCity: 12845 },
    // Paris Restaurants
    { id: 'rest_7', name: 'Chez Janou', destinationId: 'dest_2', address: '2 Rue Roger Verlomme, 75003 Paris', rating: 4.5, reviewCount: 2345, priceLevel: '$$', cuisines: ['French', 'Mediterranean'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Vegetarian Options'], features: ['Reservations', 'Outdoor Seating'], hours: 'Daily 12:00 PM - 11:00 PM', phone: '+33 1 42 72 28 41', description: 'A beloved Parisian bistro famous for its chocolate mousse, served from a giant bowl. Provençal-inspired cuisine in a charming courtyard setting in Le Marais.', images: ['linear-gradient(135deg, #2d1b69 0%, #6b3fa0 100%)', 'linear-gradient(135deg, #fd3a69 0%, #fbc2eb 100%)'], subRatings: { food: 4.6, service: 4.3, value: 4.5, atmosphere: 4.7 }, travelersChoice: false, rank: 34, totalRestaurantsInCity: 16234 },
    { id: 'rest_8', name: 'Le Comptoir du Panthéon', destinationId: 'dest_2', address: '5 Rue Soufflot, 75005 Paris', rating: 4.3, reviewCount: 1876, priceLevel: '$$', cuisines: ['French', 'Cafe'], meals: ['Breakfast', 'Lunch', 'Dinner'], dietaryOptions: ['Vegetarian Options'], features: ['Reservations', 'Outdoor Seating'], hours: 'Daily 7:00 AM - 11:00 PM', phone: '+33 1 43 54 75 56', description: 'A classic Parisian café with a view of the Panthéon. Traditional French dishes, excellent wines, and the perfect people-watching terrace on the Left Bank.', images: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'], subRatings: { food: 4.4, service: 4.1, value: 4.3, atmosphere: 4.6 }, travelersChoice: false, rank: 56, totalRestaurantsInCity: 16234 },
    { id: 'rest_9', name: 'L\'Ambroisie', destinationId: 'dest_2', address: '9 Place des Vosges, 75004 Paris', rating: 4.9, reviewCount: 1567, priceLevel: '$$$$', cuisines: ['French'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Gluten Free Options'], features: ['Reservations', 'Private Dining'], hours: 'Tue-Sat 12:00 PM - 2:00 PM, 7:30 PM - 10:00 PM', phone: '+33 1 42 78 51 45', description: 'Three Michelin stars in a stunning 17th-century townhouse on Place des Vosges. Chef Bernard Pacaud\'s classical French cuisine is the pinnacle of gastronomic art.', images: ['linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', 'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)'], subRatings: { food: 5.0, service: 4.9, value: 3.8, atmosphere: 4.9 }, travelersChoice: true, rank: 2, totalRestaurantsInCity: 16234 },
    { id: 'rest_10', name: 'Pink Mamma', destinationId: 'dest_2', address: '20bis Rue de Douai, 75009 Paris', rating: 4.4, reviewCount: 3456, priceLevel: '$$', cuisines: ['Italian', 'Pizza'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Vegetarian Options', 'Vegan Options'], features: ['Outdoor Seating'], hours: 'Daily 12:00 PM - 12:00 AM', phone: '+33 1 78 90 12 34', description: 'A multi-story Italian trattoria that\'s become a Paris sensation. Handmade pasta, wood-fired pizza, and a spectacular vertical garden terrace. No reservations -- worth the wait.', images: ['linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'], subRatings: { food: 4.5, service: 3.9, value: 4.5, atmosphere: 4.6 }, travelersChoice: false, rank: 18, totalRestaurantsInCity: 16234 },
    { id: 'rest_11', name: 'Bouillon Chartier', destinationId: 'dest_2', address: '7 Rue du Faubourg Montmartre, 75009 Paris', rating: 4.0, reviewCount: 4567, priceLevel: '$', cuisines: ['French'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Vegetarian Options'], features: ['Takeout'], hours: 'Daily 11:30 AM - 12:00 AM', phone: '+33 1 47 70 86 29', description: 'A historic Parisian workers\' canteen dating to 1896, serving traditional French cuisine at incredibly affordable prices. The ornate Belle Époque interior is a national landmark.', images: ['linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)', 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'], subRatings: { food: 3.8, service: 3.5, value: 4.8, atmosphere: 4.5 }, travelersChoice: false, rank: 45, totalRestaurantsInCity: 16234 },
    // London Restaurants
    { id: 'rest_12', name: 'Dishoom King\'s Cross', destinationId: 'dest_3', address: '5 Stable St, London N1C 4AB', rating: 4.6, reviewCount: 5678, priceLevel: '$$', cuisines: ['Indian'], meals: ['Breakfast', 'Lunch', 'Dinner'], dietaryOptions: ['Vegetarian Options', 'Vegan Options', 'Gluten Free Options'], features: ['Reservations', 'Outdoor Seating', 'Delivery'], hours: 'Mon-Fri 8:00 AM - 11:00 PM, Sat-Sun 9:00 AM - 11:00 PM', phone: '+44 20 7420 9321', description: 'Inspired by the Irani cafés of Bombay, Dishoom serves vibrant Indian cuisine in a stunning railway-themed setting. The bacon naan roll is a London legend.', images: ['linear-gradient(135deg, #e63946 0%, #f1faee 100%)', 'linear-gradient(135deg, #a8dadc 0%, #457b9d 100%)'], subRatings: { food: 4.7, service: 4.5, value: 4.4, atmosphere: 4.8 }, travelersChoice: true, rank: 5, totalRestaurantsInCity: 18432 },
    { id: 'rest_13', name: 'The Wolseley', destinationId: 'dest_3', address: '160 Piccadilly, London W1J 9EB', rating: 4.3, reviewCount: 3456, priceLevel: '$$$', cuisines: ['European', 'British'], meals: ['Breakfast', 'Lunch', 'Dinner', 'Brunch'], dietaryOptions: ['Vegetarian Options', 'Gluten Free Options'], features: ['Reservations'], hours: 'Mon-Fri 7:00 AM - 12:00 AM, Sat-Sun 8:00 AM - 12:00 AM', phone: '+44 20 7499 6996', description: 'A grand European café-restaurant in a magnificent Art Deco building on Piccadilly. The place to see and be seen, with impeccable service and classic dishes.', images: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'], subRatings: { food: 4.4, service: 4.5, value: 3.7, atmosphere: 4.8 }, travelersChoice: false, rank: 23, totalRestaurantsInCity: 18432 },
    { id: 'rest_14', name: 'Padella', destinationId: 'dest_3', address: '6 Southwark St, London SE1 1TQ', rating: 4.5, reviewCount: 4567, priceLevel: '$$', cuisines: ['Italian', 'Pasta'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Vegetarian Options'], features: ['Takeout'], hours: 'Mon-Sat 12:00 PM - 10:00 PM, Sun 12:00 PM - 5:00 PM', phone: '+44 20 3751 4544', description: 'Hand-rolled pasta at its finest, right next to Borough Market. The pici cacio e pepe is iconic. No reservations, but the queue moves fast and is absolutely worth it.', images: ['linear-gradient(135deg, #ff6b35 0%, #f7c59f 100%)', 'linear-gradient(135deg, #efefd0 0%, #ff6b35 100%)'], subRatings: { food: 4.8, service: 4.0, value: 4.7, atmosphere: 4.0 }, travelersChoice: false, rank: 8, totalRestaurantsInCity: 18432 },
    { id: 'rest_15', name: 'Sketch - The Lecture Room', destinationId: 'dest_3', address: '9 Conduit St, London W1S 2XG', rating: 4.7, reviewCount: 2345, priceLevel: '$$$$', cuisines: ['French', 'European'], meals: ['Lunch', 'Dinner'], dietaryOptions: ['Vegetarian Options', 'Gluten Free Options'], features: ['Reservations', 'Private Dining'], hours: 'Tue-Sat 12:00 PM - 2:30 PM, 6:30 PM - 10:30 PM', phone: '+44 20 7659 4500', description: 'Two Michelin stars in one of London\'s most extraordinary dining rooms. Avant-garde cuisine meets theatrical design in a space that feels like stepping into another world.', images: ['linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)'], subRatings: { food: 4.8, service: 4.7, value: 3.5, atmosphere: 4.9 }, travelersChoice: true, rank: 3, totalRestaurantsInCity: 18432 }
  ];

  const attractions = [
    // NYC Attractions
    { id: 'attr_1', name: 'Statue of Liberty & Ellis Island', destinationId: 'dest_1', address: 'Liberty Island, New York, NY 10004', rating: 4.6, reviewCount: 8765, category: 'Sights & Landmarks', price: 24, duration: '4-6 hours', description: 'The iconic symbol of freedom and democracy. Take the ferry to Liberty Island for close-up views and climb to the crown for a breathtaking panorama of New York Harbor. Ellis Island\'s Immigration Museum tells the moving story of millions who arrived in search of a new life.', images: ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'], hours: 'Daily 9:00 AM - 5:00 PM', bestTimeToVisit: 'Early morning to avoid crowds. Book crown access tickets months in advance.', bookingOptions: [{ tier: 'Reserve', price: 24, includes: 'Ferry + Liberty Island + Ellis Island' }, { tier: 'Pedestal Reserve', price: 24, includes: 'Ferry + Pedestal Access + Ellis Island' }, { tier: 'Crown Reserve', price: 24, includes: 'Ferry + Crown Access + Ellis Island' }], whatsIncluded: ['Round-trip ferry', 'Audio guide', 'Access to Liberty Island', 'Ellis Island Immigration Museum'], travelersChoice: true, rank: 1, totalAttractionsInCity: 1328 },
    { id: 'attr_2', name: 'Metropolitan Museum of Art', destinationId: 'dest_1', address: '1000 5th Ave, New York, NY 10028', rating: 4.7, reviewCount: 6543, category: 'Museums', price: 30, duration: '3-5 hours', description: 'One of the world\'s greatest art museums, housing over 5,000 years of art from every corner of the globe. From ancient Egyptian temples to contemporary masterpieces, The Met\'s collection of over 2 million works is staggering in scope and quality.', images: ['linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'], hours: 'Sun-Tue, Thu 10:00 AM - 5:00 PM; Fri-Sat 10:00 AM - 9:00 PM', bestTimeToVisit: 'Weekday mornings for smallest crowds. Friday and Saturday evenings are magical.', bookingOptions: [{ tier: 'General Admission', price: 30, includes: 'All galleries + same-day entry to The Met Cloisters' }, { tier: 'Guided Tour', price: 50, includes: 'General Admission + Expert-led 90-min tour' }], whatsIncluded: ['Access to all galleries', 'The Met app with audio guides', 'Same-day entry to The Met Cloisters'], travelersChoice: true, rank: 2, totalAttractionsInCity: 1328 },
    { id: 'attr_3', name: 'Central Park Walking Tour', destinationId: 'dest_1', address: 'Central Park, New York, NY', rating: 4.5, reviewCount: 3456, category: 'Tours', price: 35, duration: '2-3 hours', description: 'Discover the secrets and stories of Central Park with an expert local guide. This walking tour covers Bethesda Fountain, Bow Bridge, Strawberry Fields, the Shakespeare Garden, and hidden gems most visitors miss.', images: ['linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)', 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'], hours: 'Tours at 10:00 AM and 2:00 PM daily', bestTimeToVisit: 'Spring (April-May) or Fall (September-October) for the best scenery.', bookingOptions: [{ tier: 'Standard Tour', price: 35, includes: '2-hour guided walking tour' }, { tier: 'Private Tour', price: 150, includes: 'Private guide, customizable route, 3 hours' }], whatsIncluded: ['Expert local guide', 'Small group (max 15)', 'Bottled water'], travelersChoice: false, rank: 12, totalAttractionsInCity: 1328 },
    { id: 'attr_4', name: 'Broadway Show - Hamilton', destinationId: 'dest_1', address: 'Richard Rodgers Theatre, 226 W 46th St', rating: 4.8, reviewCount: 4567, category: 'Nightlife', price: 179, duration: '2.5 hours', description: 'The revolutionary musical that changed Broadway forever. Lin-Manuel Miranda\'s hip-hop retelling of Alexander Hamilton\'s story is electrifying, emotional, and utterly unforgettable.', images: ['linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'], hours: 'Tue-Sat 8:00 PM, Wed & Sat 2:00 PM, Sun 3:00 PM', bestTimeToVisit: 'Book well in advance. Lottery tickets available same-day.', bookingOptions: [{ tier: 'Orchestra', price: 299, includes: 'Orchestra seating' }, { tier: 'Mezzanine', price: 179, includes: 'Mezzanine seating' }, { tier: 'Rear Mezzanine', price: 99, includes: 'Rear mezzanine seating' }], whatsIncluded: ['Show ticket', 'Playbill'], travelersChoice: true, rank: 5, totalAttractionsInCity: 1328 },
    { id: 'attr_5', name: 'Brooklyn Food Tour', destinationId: 'dest_1', address: 'Brooklyn, New York', rating: 4.4, reviewCount: 1234, category: 'Food & Drink', price: 85, duration: '3-4 hours', description: 'Taste your way through Brooklyn\'s incredible food scene. Visit family-run bakeries, artisanal cheese shops, and trendy restaurants in Williamsburg and DUMBO. Come hungry!', images: ['linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'], hours: 'Tue-Sun 11:00 AM and 3:00 PM', bestTimeToVisit: 'Weekdays for a more intimate experience.', bookingOptions: [{ tier: 'Standard Food Tour', price: 85, includes: '6-8 tastings across Brooklyn' }, { tier: 'VIP Food & Drink Tour', price: 135, includes: '8-10 tastings + cocktail pairings' }], whatsIncluded: ['6-8 food tastings', 'Local guide', 'Walking tour of neighborhood', 'Water and snacks'], travelersChoice: false, rank: 18, totalAttractionsInCity: 1328 },
    // Paris Attractions
    { id: 'attr_6', name: 'Eiffel Tower', destinationId: 'dest_2', address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris', rating: 4.5, reviewCount: 12345, category: 'Sights & Landmarks', price: 26, duration: '2-3 hours', description: 'The iron lady of Paris and the most visited paid monument in the world. Ascend to the top for unrivaled views of the City of Light, dine at one of two restaurants, or simply admire its beauty from the Champ de Mars below.', images: ['linear-gradient(135deg, #2d1b69 0%, #6b3fa0 100%)', 'linear-gradient(135deg, #fd3a69 0%, #fbc2eb 100%)', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'], hours: 'Daily 9:30 AM - 11:45 PM (summer), 9:30 AM - 10:30 PM (winter)', bestTimeToVisit: 'Sunset for the most magical views. Book skip-the-line tickets.', bookingOptions: [{ tier: 'Stairs to 2nd Floor', price: 11, includes: 'Stairs access to 1st and 2nd floors' }, { tier: 'Elevator to 2nd Floor', price: 18, includes: 'Elevator to 2nd floor' }, { tier: 'Elevator to Summit', price: 26, includes: 'Elevator to summit' }], whatsIncluded: ['Access to observation decks', 'Interactive exhibits on each floor'], travelersChoice: true, rank: 1, totalAttractionsInCity: 2145 },
    { id: 'attr_7', name: 'Louvre Museum', destinationId: 'dest_2', address: 'Rue de Rivoli, 75001 Paris', rating: 4.7, reviewCount: 9876, category: 'Museums', price: 17, duration: '4-6 hours', description: 'The world\'s largest and most visited art museum. Home to the Mona Lisa, Venus de Milo, and Winged Victory of Samothrace, the Louvre\'s collection spans 9,000 years of human creativity across 72,735 square meters.', images: ['linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'], hours: 'Wed-Mon 9:00 AM - 6:00 PM (Fri until 9:45 PM). Closed Tuesday.', bestTimeToVisit: 'Wednesday or Friday evening for fewer crowds. Go straight to the lesser-known wings first.', bookingOptions: [{ tier: 'General Admission', price: 17, includes: 'Access to all galleries' }, { tier: 'Guided Highlights Tour', price: 65, includes: 'Admission + 2-hour expert-guided tour of masterpieces' }], whatsIncluded: ['Access to all permanent collections', 'Temporary exhibitions (with ticket)'], travelersChoice: true, rank: 2, totalAttractionsInCity: 2145 },
    { id: 'attr_8', name: 'Seine River Cruise', destinationId: 'dest_2', address: 'Port de la Bourdonnais, 75007 Paris', rating: 4.3, reviewCount: 5678, category: 'Tours', price: 15, duration: '1-1.5 hours', description: 'Glide along the Seine and see Paris\'s most iconic landmarks from the water. Pass under historic bridges, past Notre-Dame, the Louvre, Musée d\'Orsay, and the Eiffel Tower. An essential Paris experience.', images: ['linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'], hours: 'Departures every 30 min, 10:00 AM - 10:30 PM', bestTimeToVisit: 'Twilight cruise for the most romantic atmosphere.', bookingOptions: [{ tier: 'Sightseeing Cruise', price: 15, includes: '1-hour cruise with audio guide' }, { tier: 'Dinner Cruise', price: 95, includes: '2.5-hour dinner cruise with wine' }], whatsIncluded: ['Audio commentary in 12 languages', 'Panoramic views'], travelersChoice: false, rank: 8, totalAttractionsInCity: 2145 },
    { id: 'attr_9', name: 'Versailles Palace Day Trip', destinationId: 'dest_2', address: 'Place d\'Armes, 78000 Versailles', rating: 4.6, reviewCount: 7654, category: 'Tours', price: 21, duration: 'Full day', description: 'The opulent Palace of Versailles, once home to Louis XIV, is a UNESCO World Heritage site of extraordinary grandeur. Explore the Hall of Mirrors, the Royal Apartments, and the magnificent gardens.', images: ['linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'], hours: 'Tue-Sun 9:00 AM - 6:30 PM (summer), 9:00 AM - 5:30 PM (winter). Closed Monday.', bestTimeToVisit: 'Tuesday or Wednesday for fewer crowds. The Fountain Show runs April-October.', bookingOptions: [{ tier: 'Palace Ticket', price: 21, includes: 'Palace + temporary exhibitions' }, { tier: 'Passport', price: 28, includes: 'Palace + gardens + estate of Trianon + musical gardens' }, { tier: 'Guided Tour from Paris', price: 89, includes: 'Round-trip transport + skip-the-line + guided tour' }], whatsIncluded: ['Palace entry', 'Access to gardens (free on non-musical days)'], travelersChoice: true, rank: 3, totalAttractionsInCity: 2145 },
    // London Attractions
    { id: 'attr_10', name: 'British Museum', destinationId: 'dest_3', address: 'Great Russell St, London WC1B 3DG', rating: 4.7, reviewCount: 8765, category: 'Museums', price: 0, duration: '3-5 hours', description: 'One of the greatest museums in the world, and it\'s free. From the Rosetta Stone to the Elgin Marbles, from Egyptian mummies to the Sutton Hoo treasures, the British Museum\'s collection tells the story of human civilization.', images: ['linear-gradient(135deg, #1b1b2f 0%, #162447 100%)', 'linear-gradient(135deg, #1f4068 0%, #e8e8e8 100%)', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'], hours: 'Daily 10:00 AM - 5:00 PM (Fri until 8:30 PM)', bestTimeToVisit: 'Friday evenings for extended hours and special events.', bookingOptions: [{ tier: 'General Admission', price: 0, includes: 'Free entry to permanent collections' }, { tier: 'Guided Tour', price: 14, includes: 'Expert-led 90-minute highlights tour' }], whatsIncluded: ['Free entry', 'Multimedia guide available (£7)'], travelersChoice: true, rank: 1, totalAttractionsInCity: 1678 },
    { id: 'attr_11', name: 'Tower of London', destinationId: 'dest_3', address: 'London EC3N 4AB', rating: 4.5, reviewCount: 6543, category: 'Sights & Landmarks', price: 33, duration: '3-4 hours', description: 'A 1,000-year-old fortress that has served as a royal palace, prison, armory, and home of the Crown Jewels. Yeoman Warder tours bring centuries of history to life with tales of intrigue, treachery, and royal drama.', images: ['linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'], hours: 'Tue-Sat 9:00 AM - 5:30 PM, Sun-Mon 10:00 AM - 5:30 PM', bestTimeToVisit: 'Arrive at opening time to see the Crown Jewels without queues.', bookingOptions: [{ tier: 'Standard Entry', price: 33, includes: 'Entry + Crown Jewels + Yeoman Warder tour' }, { tier: 'Ceremony of the Keys', price: 0, includes: 'Free nightly ceremony (must book months ahead)' }], whatsIncluded: ['Entry to all areas', 'Crown Jewels exhibition', 'Yeoman Warder guided tour', 'Audio guide'], travelersChoice: true, rank: 3, totalAttractionsInCity: 1678 },
    { id: 'attr_12', name: 'West End Theatre - The Phantom of the Opera', destinationId: 'dest_3', address: 'Her Majesty\'s Theatre, Haymarket, London SW1Y 4QL', rating: 4.6, reviewCount: 3456, category: 'Nightlife', price: 35, duration: '2.5 hours', description: 'Andrew Lloyd Webber\'s legendary musical has been captivating audiences in the West End for over three decades. The falling chandelier, the haunting music, and the underground lake -- it\'s theatrical magic at its finest.', images: ['linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)', 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'], hours: 'Mon-Sat 7:30 PM, Thu & Sat 2:30 PM', bestTimeToVisit: 'Weekday performances for better seat availability.', bookingOptions: [{ tier: 'Stalls', price: 85, includes: 'Premium stalls seating' }, { tier: 'Dress Circle', price: 65, includes: 'Dress circle seating' }, { tier: 'Upper Circle', price: 35, includes: 'Upper circle seating' }], whatsIncluded: ['Show ticket', 'Programme available for purchase'], travelersChoice: false, rank: 8, totalAttractionsInCity: 1678 }
  ];

  // Generate reviews
  const reviews = [];
  const reviewTexts = {
    excellent: [
      'Absolutely incredible experience! Everything exceeded our expectations. The attention to detail was remarkable and the staff went above and beyond to make our stay memorable. Would highly recommend to anyone.',
      'What a wonderful place! We had the most amazing time here. The location is perfect, the service is impeccable, and the overall experience was truly five-star. We\'re already planning our return visit.',
      'One of the best experiences we\'ve ever had while traveling. The quality is outstanding and the value for money is excellent. Every aspect was carefully thought out and beautifully executed.',
      'Simply outstanding in every way. From the moment we arrived until our departure, everything was perfect. The staff was incredibly warm and attentive. This is a must-visit destination.',
      'Exceeded all expectations! The reviews don\'t do this place justice. You have to experience it yourself to truly appreciate how special it is. We made memories that will last a lifetime.'
    ],
    veryGood: [
      'Really enjoyed our visit here. A few minor things could be improved, but overall a fantastic experience. The location is great and the staff is friendly and helpful. Would definitely come back.',
      'Great experience overall. The highlights were truly spectacular and more than made up for any small inconveniences. Good value for what you get. Recommended for families and couples alike.',
      'Very pleasant experience. Well-organized and professional. The facilities are clean and well-maintained. Only giving 4 stars instead of 5 because of a minor issue with our booking, but otherwise excellent.',
      'Had a wonderful time! The atmosphere is fantastic and there\'s so much to see and do. We spent longer here than planned because we were enjoying it so much. Highly recommend the guided tour option.'
    ],
    average: [
      'It was okay. Not bad but not amazing either. The location is decent but the experience didn\'t quite live up to the hype. Might be worth visiting if you\'re in the area but I wouldn\'t go out of my way.',
      'Mixed feelings about this one. Some aspects were really good, but others fell short of what I expected based on the reviews. The price seemed a bit high for what you actually get.',
      'Decent but nothing special. The basic experience is fine but compared to similar options in the area, this one doesn\'t really stand out. Staff was friendly enough but seemed understaffed.'
    ],
    poor: [
      'Disappointing experience. The place has potential but needs significant improvement in several areas. The service was slow, the facilities need updating, and the overall experience didn\'t match the advertised quality.',
      'Not worth the price. We felt rushed and the whole experience felt very commercialized. There are much better options in the area for similar or less money. Would not recommend.'
    ],
    terrible: [
      'Terrible experience. Avoid at all costs. The facilities were dirty, the staff was rude, and the whole thing felt like a tourist trap. We left early and wish we had never come. Complete waste of money.'
    ]
  };
  const tripTypes = ['Couples', 'Family', 'Solo', 'Business', 'Friends'];
  const travelDates = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'];

  let reviewId = 1;
  const allEntities = [
    ...hotels.map(h => ({ ...h, entityType: 'hotel' })),
    ...restaurants.map(r => ({ ...r, entityType: 'restaurant' })),
    ...attractions.map(a => ({ ...a, entityType: 'attraction' }))
  ];

  allEntities.forEach(entity => {
    const numReviews = entity.rating >= 4.5 ? 5 : entity.rating >= 4.0 ? 4 : 3;
    for (let i = 0; i < numReviews; i++) {
      const rating = i === 0 ? 5 : i === 1 ? 4 : i === 2 ? (entity.rating >= 4.0 ? 5 : 3) : i === 3 ? (entity.rating >= 4.5 ? 4 : 3) : 2;
      const ratingKey = rating === 5 ? 'excellent' : rating === 4 ? 'veryGood' : rating === 3 ? 'average' : rating === 2 ? 'poor' : 'terrible';
      const texts = reviewTexts[ratingKey];
      const text = texts[reviewId % texts.length];
      const userId = `user_${(reviewId % 20) + 2}`;
      const user = users.find(u => u.id === userId);
      const hasManagementResponse = reviewId % 7 === 0;
      const hasPhotos = reviewId % 4 === 0;

      reviews.push({
        id: `review_${reviewId}`,
        entityId: entity.id,
        entityType: entity.entityType,
        entityName: entity.name,
        userId: userId,
        userName: user?.name || 'Anonymous',
        userLocation: user?.location || 'Unknown',
        rating: rating,
        title: rating === 5 ? 'Absolutely Amazing!' : rating === 4 ? 'Great Experience' : rating === 3 ? 'It Was Okay' : rating === 2 ? 'Disappointing Visit' : 'Terrible Experience',
        text: text,
        tripType: tripTypes[reviewId % tripTypes.length],
        travelDate: travelDates[reviewId % travelDates.length],
        createdAt: new Date(2025, reviewId % 12, (reviewId % 28) + 1).toISOString().split('T')[0],
        helpfulVotes: (reviewId * 17) % 50,
        photos: hasPhotos ? ['linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'] : [],
        managementResponse: hasManagementResponse ? {
          text: 'Thank you for your feedback! We appreciate you taking the time to share your experience. We are always working to improve and hope to welcome you back soon.',
          date: new Date(2025, (reviewId % 12) + 1, (reviewId % 28) + 1).toISOString().split('T')[0],
          author: 'Management'
        } : null
      });
      reviewId++;
    }
  });

  const trips = [
    {
      id: 'trip_1',
      name: 'NYC Weekend Getaway',
      description: 'A quick weekend exploring the best of New York City',
      userId: 'user_1',
      createdAt: '2025-06-15',
      items: [
        { entityId: 'hotel_1', entityType: 'hotel', addedAt: '2025-06-15' },
        { entityId: 'rest_1', entityType: 'restaurant', addedAt: '2025-06-16' },
        { entityId: 'attr_1', entityType: 'attraction', addedAt: '2025-06-16' }
      ]
    },
    {
      id: 'trip_2',
      name: 'European Summer 2025',
      description: 'Two weeks exploring Paris and London with the family',
      userId: 'user_1',
      createdAt: '2025-04-01',
      items: [
        { entityId: 'hotel_7', entityType: 'hotel', addedAt: '2025-04-01' },
        { entityId: 'rest_9', entityType: 'restaurant', addedAt: '2025-04-02' },
        { entityId: 'attr_6', entityType: 'attraction', addedAt: '2025-04-02' },
        { entityId: 'hotel_12', entityType: 'hotel', addedAt: '2025-04-03' },
        { entityId: 'attr_10', entityType: 'attraction', addedAt: '2025-04-03' }
      ]
    }
  ];

  const forumThreads = [
    { id: 'thread_1', destinationId: 'dest_1', title: 'Best area to stay in NYC for first-time visitors?', authorId: 'user_9', createdAt: '2025-08-15', views: 1234, replies: [
      { id: 'reply_1', authorId: 'user_12', text: 'Midtown is the most convenient for first-timers. Close to Times Square, Central Park, and great transport links. If you prefer something quieter, consider the Upper West Side.', createdAt: '2025-08-15', helpfulVotes: 23 },
      { id: 'reply_2', authorId: 'user_4', text: 'I\'d recommend SoHo or Greenwich Village. More authentic New York feel, amazing restaurants, and still walkable to most attractions. The subway is easy to navigate.', createdAt: '2025-08-16', helpfulVotes: 18 },
      { id: 'reply_3', authorId: 'user_18', text: 'Brooklyn is becoming a great option too! DUMBO and Williamsburg have excellent hotels, and you get stunning Manhattan views. Just make sure you\'re near the subway.', createdAt: '2025-08-17', helpfulVotes: 12 }
    ]},
    { id: 'thread_2', destinationId: 'dest_1', title: 'Restaurant recommendations for a special anniversary dinner?', authorId: 'user_16', createdAt: '2025-09-02', views: 876, replies: [
      { id: 'reply_4', authorId: 'user_12', text: 'Le Bernardin is the ultimate special occasion restaurant. The tasting menu is a work of art. Book well in advance!', createdAt: '2025-09-02', helpfulVotes: 15 },
      { id: 'reply_5', authorId: 'user_19', text: 'Daniel or Per Se if budget isn\'t an issue. For something more romantic and intimate, try L\'Artusi in the West Village.', createdAt: '2025-09-03', helpfulVotes: 11 }
    ]},
    { id: 'thread_3', destinationId: 'dest_1', title: 'Is the NYC CityPASS worth it?', authorId: 'user_13', createdAt: '2025-10-10', views: 2345, replies: [
      { id: 'reply_6', authorId: 'user_7', text: 'Absolutely! If you plan to visit 3+ attractions, the CityPASS saves you both money and time with skip-the-line access. We saved over $80 per person.', createdAt: '2025-10-10', helpfulVotes: 34 },
      { id: 'reply_7', authorId: 'user_18', text: 'Depends on your plans. If you\'re more interested in off-the-beaten-path experiences, you might not visit enough of the included attractions to make it worthwhile.', createdAt: '2025-10-11', helpfulVotes: 8 }
    ]},
    { id: 'thread_4', destinationId: 'dest_1', title: 'Day trip suggestions from NYC?', authorId: 'user_6', createdAt: '2025-11-05', views: 567, replies: [
      { id: 'reply_8', authorId: 'user_15', text: 'The Hudson Valley is gorgeous, especially in fall. Bear Mountain, Storm King Art Center, and Dia Beacon are all within 1-2 hours.', createdAt: '2025-11-05', helpfulVotes: 9 },
      { id: 'reply_9', authorId: 'user_4', text: 'Fire Island or the Hamptons in summer. In winter, head to Woodbury Common Premium Outlets for shopping.', createdAt: '2025-11-06', helpfulVotes: 7 }
    ]},
    // Paris
    { id: 'thread_5', destinationId: 'dest_2', title: 'Best patisseries in Paris?', authorId: 'user_10', createdAt: '2025-07-20', views: 3456, replies: [
      { id: 'reply_10', authorId: 'user_14', text: 'Du Pain et des Idées for the best pain des amis. Cédric Grolet for visually stunning pastries. Pierre Hermé for macarons. You can\'t go wrong with any of these!', createdAt: '2025-07-20', helpfulVotes: 45 },
      { id: 'reply_11', authorId: 'user_3', text: 'Don\'t miss Stohrer in Rue Montorgueil -- the oldest patisserie in Paris, open since 1730! Their rum baba is legendary.', createdAt: '2025-07-21', helpfulVotes: 28 }
    ]},
    { id: 'thread_6', destinationId: 'dest_2', title: 'Weather in Paris in April?', authorId: 'user_17', createdAt: '2025-12-15', views: 1234, replies: [
      { id: 'reply_12', authorId: 'user_5', text: 'April in Paris is lovely but unpredictable. Expect temperatures between 8-16°C (46-61°F). Pack layers and a light rain jacket. Cherry blossoms should be blooming!', createdAt: '2025-12-15', helpfulVotes: 19 },
      { id: 'reply_13', authorId: 'user_10', text: 'Spring in Paris is magical. The Luxembourg Gardens and Tuileries are beautiful in April. Just be prepared for occasional rain showers.', createdAt: '2025-12-16', helpfulVotes: 14 }
    ]},
    { id: 'thread_7', destinationId: 'dest_2', title: 'Is the Paris Museum Pass worth buying?', authorId: 'user_21', createdAt: '2026-01-08', views: 2345, replies: [
      { id: 'reply_14', authorId: 'user_7', text: 'Definitely yes if you plan to visit 3+ museums in 2 days. It covers the Louvre, Orsay, Versailles, and many more. The skip-the-line benefit alone is worth it at busy sites.', createdAt: '2026-01-08', helpfulVotes: 31 }
    ]},
    // London
    { id: 'thread_8', destinationId: 'dest_3', title: 'Best free things to do in London?', authorId: 'user_11', createdAt: '2025-09-20', views: 4567, replies: [
      { id: 'reply_15', authorId: 'user_7', text: 'London is amazing for free activities! British Museum, National Gallery, Tate Modern, Victoria & Albert Museum -- all free. Walking along the South Bank and through Hyde Park is wonderful too.', createdAt: '2025-09-20', helpfulVotes: 56 },
      { id: 'reply_16', authorId: 'user_2', text: 'Don\'t miss the Changing of the Guard at Buckingham Palace (free, check schedule), the Borough Market for browsing, and the Sky Garden for free panoramic views (book ahead).', createdAt: '2025-09-21', helpfulVotes: 42 }
    ]},
    { id: 'thread_9', destinationId: 'dest_3', title: 'Getting from Heathrow to Central London - best option?', authorId: 'user_13', createdAt: '2025-10-30', views: 3456, replies: [
      { id: 'reply_17', authorId: 'user_2', text: 'The Heathrow Express is fastest (15 min) but expensive (£25). The Elizabeth Line is the best value -- takes 40-50 min and costs about £11. Avoid taxis unless you have lots of luggage.', createdAt: '2025-10-30', helpfulVotes: 38 },
      { id: 'reply_18', authorId: 'user_7', text: 'I always take the Elizabeth Line (formerly Crossrail). It\'s modern, comfortable, and goes directly to Paddington, Tottenham Court Road, and Liverpool Street. Get an Oyster card at the airport.', createdAt: '2025-10-31', helpfulVotes: 29 }
    ]},
    { id: 'thread_10', destinationId: 'dest_3', title: 'Traditional afternoon tea recommendations?', authorId: 'user_16', createdAt: '2025-11-15', views: 1876, replies: [
      { id: 'reply_19', authorId: 'user_2', text: 'The Ritz is the most iconic, but book months ahead. Claridge\'s and The Dorchester are also excellent. For something quirky, try Sketch or the Mad Hatter\'s Afternoon Tea at Sanderson.', createdAt: '2025-11-15', helpfulVotes: 25 },
      { id: 'reply_20', authorId: 'user_10', text: 'Fortnum & Mason in the Diamond Jubilee Tea Salon is our favorite. Elegant setting, superb teas, and the most delicious scones in London.', createdAt: '2025-11-16', helpfulVotes: 18 }
    ]}
  ];

  return {
    currentUser: users[0],
    users,
    destinations,
    hotels,
    restaurants,
    attractions,
    reviews,
    trips,
    forumThreads,
    searchHistory: {
      recentSearches: [
        { query: 'Hotels in New York City', type: 'hotel', destinationId: 'dest_1', timestamp: '2026-03-15' },
        { query: 'Best restaurants Paris', type: 'restaurant', destinationId: 'dest_2', timestamp: '2026-03-10' },
        { query: 'Things to do London', type: 'attraction', destinationId: 'dest_3', timestamp: '2026-03-05' }
      ]
    },
    filters: {
      hotels: { amenities: [], priceMin: 0, priceMax: 1000, starClass: [], rating: [], propertyType: [], destination: null },
      restaurants: { cuisines: [], priceLevel: [], meals: [], dietary: [], features: [], rating: [], destination: null },
      attractions: { category: [], priceRange: null, duration: [], rating: [], destination: null }
    },
    sort: { hotels: 'bestValue', restaurants: 'bestValue', attractions: 'bestValue' },
    activeCategory: 'hotels',
    votedHelpful: [],
    savedEntities: {}
  };
}
