
    // Mock Data Generators

    export const AIRPORTS = [
      { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
      { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK' },
      { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
      { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
      { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
      { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
      { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA' },
      { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia' },
      { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
      { code: 'AMS', city: 'Amsterdam', name: 'Schiphol Airport', country: 'Netherlands' },
      { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'USA' },
      { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
      { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
    ];

    export const AIRLINES = [
      { id: 'DL', name: 'Delta Air Lines', logo: 'https://picsum.photos/64/64?random=dl' },
      { id: 'BA', name: 'British Airways', logo: 'https://picsum.photos/64/64?random=ba' },
      { id: 'EK', name: 'Emirates', logo: 'https://picsum.photos/64/64?random=ek' },
      { id: 'SQ', name: 'Singapore Airlines', logo: 'https://picsum.photos/64/64?random=sq' },
      { id: 'JL', name: 'Japan Airlines', logo: 'https://picsum.photos/64/64?random=jl' },
      { id: 'AF', name: 'Air France', logo: 'https://picsum.photos/64/64?random=af' },
      { id: 'LH', name: 'Lufthansa', logo: 'https://picsum.photos/64/64?random=lh' },
      { id: 'QF', name: 'Qantas', logo: 'https://picsum.photos/64/64?random=qf' },
    ];

    const AIRCRAFT_TYPES = ['Boeing 777-300ER', 'Airbus A350-900', 'Boeing 787-9', 'Airbus A380-800', 'Boeing 737 MAX 8', 'Airbus A321neo'];

    const getAirport = (code) => AIRPORTS.find(airport => airport.code === code);
    const getAirline = (id) => AIRLINES.find(airline => airline.id === id);

    const createCuratedFlight = ({ id, originCode, destinationCode, airlineId, dayOffset, hour, duration, stops, price, aircraft }) => {
      const origin = getAirport(originCode);
      const destination = getAirport(destinationCode);
      const airline = getAirline(airlineId);
      const departure = new Date();
      departure.setHours(hour, 15, 0, 0);
      departure.setDate(departure.getDate() + dayOffset);
      const arrival = new Date(departure.getTime() + duration * 60000);
      const segments = [{
        id: `${id}_seg_1`,
        origin,
        destination,
        departure: departure.toISOString(),
        arrival: arrival.toISOString(),
        duration,
        flightNumber: `${airline.id}${100 + dayOffset}`,
        aircraft,
        airline
      }];

      return {
        id,
        airline,
        origin,
        destination,
        departure: departure.toISOString(),
        arrival: arrival.toISOString(),
        duration,
        stops,
        segments,
        price,
        aircraft,
        baggage: '1 Carry-on, 1 Checked bag',
        seatsAvailable: 28 + dayOffset
      };
    };

    const generateCuratedFlights = () => ([
      createCuratedFlight({ id: 'curated_jfk_lhr_ba', originCode: 'JFK', destinationCode: 'LHR', airlineId: 'BA', dayOffset: 3, hour: 18, duration: 420, stops: 0, price: 299, aircraft: 'Boeing 777-300ER' }),
      createCuratedFlight({ id: 'curated_jfk_lhr_dl', originCode: 'JFK', destinationCode: 'LHR', airlineId: 'DL', dayOffset: 5, hour: 21, duration: 445, stops: 0, price: 336, aircraft: 'Airbus A350-900' }),
      createCuratedFlight({ id: 'curated_sfo_hnd_jl', originCode: 'SFO', destinationCode: 'HND', airlineId: 'JL', dayOffset: 4, hour: 12, duration: 650, stops: 0, price: 489, aircraft: 'Boeing 787-9' }),
      createCuratedFlight({ id: 'curated_jfk_cdg_af', originCode: 'JFK', destinationCode: 'CDG', airlineId: 'AF', dayOffset: 6, hour: 19, duration: 430, stops: 0, price: 329, aircraft: 'Airbus A350-900' }),
      createCuratedFlight({ id: 'curated_lax_sin_sq', originCode: 'LAX', destinationCode: 'SIN', airlineId: 'SQ', dayOffset: 7, hour: 22, duration: 1040, stops: 0, price: 640, aircraft: 'Airbus A380-800' }),
      createCuratedFlight({ id: 'curated_lax_syd_qf', originCode: 'LAX', destinationCode: 'SYD', airlineId: 'QF', dayOffset: 8, hour: 23, duration: 900, stops: 0, price: 710, aircraft: 'Boeing 787-9' }),
      createCuratedFlight({ id: 'curated_lhr_dxb_ek', originCode: 'LHR', destinationCode: 'DXB', airlineId: 'EK', dayOffset: 2, hour: 14, duration: 420, stops: 0, price: 370, aircraft: 'Airbus A380-800' })
    ]);

    export const generateFlights = (count = 100) => {
      const flights = [];
      const today = new Date();

      for (let i = 0; i < count; i++) {
        const origin = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
        let destination = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
        while (destination.code === origin.code) {
          destination = AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];
        }

        const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];

        // Random date within next 30 days
        const departureDate = new Date(today);
        departureDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
        departureDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 12) * 5);

        // INCREASED PROBABILITY OF STOPS:
        // 30% Nonstop, 50% 1 Stop, 20% 2 Stops
        const rand = Math.random();
        const stops = rand < 0.3 ? 0 : (rand < 0.8 ? 1 : 2);

        // Generate Segments
        const segments = [];
        let currentOrigin = origin;
        let currentTime = new Date(departureDate);
        let totalDuration = 0;

        const numSegments = stops + 1;

        for (let s = 0; s < numSegments; s++) {
          const isLastSegment = s === numSegments - 1;
          const segmentDest = isLastSegment ? destination : AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)];

          // Ensure segment dest != current origin and not final dest if not last
          if (!isLastSegment && (segmentDest.code === currentOrigin.code || segmentDest.code === destination.code)) {
            s--; // retry
            continue;
          }

          const flightTime = 60 + Math.floor(Math.random() * 600); // 1h to 11h
          const arrivalTime = new Date(currentTime.getTime() + flightTime * 60000);

          segments.push({
            id: `seg_${Math.random().toString(36).substr(2, 9)}`,
            origin: currentOrigin,
            destination: segmentDest,
            departure: currentTime.toISOString(),
            arrival: arrivalTime.toISOString(),
            duration: flightTime,
            flightNumber: `${airline.id}${Math.floor(Math.random() * 9000) + 100}`,
            aircraft: AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)],
            airline: airline
          });

          totalDuration += flightTime;

          // Layover
          if (!isLastSegment) {
            const layoverTime = 60 + Math.floor(Math.random() * 300); // 1h to 6h layover
            totalDuration += layoverTime;
            currentTime = new Date(arrivalTime.getTime() + layoverTime * 60000);
            currentOrigin = segmentDest;
          }
        }

        const finalArrival = segments[segments.length - 1].arrival;
        const basePrice = 100 + (totalDuration * 0.5) + (stops * -50);
        const price = Math.floor(basePrice + Math.random() * 200);

        flights.push({
          id: `fl_${Math.random().toString(36).substr(2, 9)}`,
          airline,
          origin,
          destination,
          departure: departureDate.toISOString(),
          arrival: finalArrival,
          duration: totalDuration,
          stops,
          segments, // Added segments
          price,
          aircraft: segments[0].aircraft, // Main aircraft (usually first leg)
          baggage: '1 Carry-on, 1 Checked bag',
          seatsAvailable: Math.floor(Math.random() * 50) + 10
        });
      }
      return [...generateCuratedFlights(), ...flights];
    };

    const getDefaultData = () => ({
      flights: generateFlights(200),
      bookings: [],
      alerts: [],
      user: {
        id: 'u_1',
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: 'https://picsum.photos/100/100?random=user1'
      }
    });

    export const INITIAL_STATE = getDefaultData();

    // --- Session-aware storage functions ---

    const BASE_STORAGE_KEY = 'flight_search_app_v1';
    const BASE_INITIAL_KEY = 'flight_search_app_v1_initial';
    export function storageKey(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
    export function initialKey(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

    export const getSessionId = () => {
      const p = new URLSearchParams(window.location.search);
      const s = p.get('sid');
      if (s) { sessionStorage.setItem('mock_sid', s); return s; }
      return sessionStorage.getItem('mock_sid') || null;
    };

    export const fetchCustomState = async (sid = null) => {
      try {
        const u = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
        const r = await fetch(u);
        if (r.ok) {
          const d = await r.json();
          if (d.has_custom_state && d.stored_state) return d.stored_state;
        }
      } catch (e) { /* no custom state */ }
      return null;
    };

    export const saveState = (state, sid = null) => {
      localStorage.setItem(storageKey(sid), JSON.stringify(state));
      const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state })
      }).catch(() => {});
    };

    export const getInitialState = (sid = null) => {
      const s = localStorage.getItem(initialKey(sid));
      return s ? JSON.parse(s) : null;
    };

    function deepMergeWithDefaults(defaults, custom) {
      if (!custom) return defaults;
      const result = { ...defaults };
      for (const key in custom) {
        if (custom[key] !== null && custom[key] !== undefined) {
          if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
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
        const d = deepMergeWithDefaults(getDefaultData(), customState);
        localStorage.setItem(sk, JSON.stringify(d));
        localStorage.setItem(ik, JSON.stringify(d));
        return d;
      }

      const stored = localStorage.getItem(sk);
      if (stored) {
        if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
        return JSON.parse(stored);
      }

      const d = getDefaultData();
      localStorage.setItem(sk, JSON.stringify(d));
      localStorage.setItem(ik, JSON.stringify(d));
      return d;
    };


export const POPULAR_DESTINATIONS = [
  { airport: 'CDG', city: 'Paris',     country: 'France',      price: 480, image: 'https://picsum.photos/seed/paris/400/300' },
  { airport: 'HND', city: 'Tokyo',     country: 'Japan',       price: 920, image: 'https://picsum.photos/seed/tokyo/400/300' },
  { airport: 'DXB', city: 'Dubai',     country: 'UAE',         price: 760, image: 'https://picsum.photos/seed/dubai/400/300' },
  { airport: 'SIN', city: 'Singapore', country: 'Singapore',   price: 980, image: 'https://picsum.photos/seed/sg/400/300' },
  { airport: 'LHR', city: 'London',    country: 'UK',          price: 540, image: 'https://picsum.photos/seed/london/400/300' },
  { airport: 'SYD', city: 'Sydney',    country: 'Australia',   price: 1180, image: 'https://picsum.photos/seed/sydney/400/300' },
  { airport: 'AMS', city: 'Amsterdam', country: 'Netherlands', price: 510, image: 'https://picsum.photos/seed/ams/400/300' },
  { airport: 'ICN', city: 'Seoul',     country: 'South Korea', price: 880, image: 'https://picsum.photos/seed/seoul/400/300' },
];

// Generate a 30-day calendar of mock prices for an origin->destination route.
// Deterministic by route hash so refresh is stable.
export function generatePriceCalendar(origin, destination, days = 30) {
  const seedStr = `${origin || 'SFO'}->${destination || 'JFK'}`;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i += 1) seed = (seed * 31 + seedStr.charCodeAt(i)) | 0;
  const rng = (i) => Math.abs(Math.sin((seed + i * 13.37) * 0.001)) ;
  const base = 250 + (Math.abs(seed) % 500);
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const noise = rng(i) - 0.5;
    const price = Math.max(80, Math.round(base * (1 + noise * 0.45)));
    return {
      date: d.toISOString().slice(0, 10),
      price,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });
}
