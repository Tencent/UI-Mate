
    import React from 'react';
    import { useNavigate } from 'react-router-dom';
    import Navbar from '../components/Navbar';
    import FlightSearchForm from '../components/FlightSearchForm';

    export default function Home() {
      const navigate = useNavigate();
      const destinations = [
        { city: 'London', route: 'JFK to LHR', origin: 'JFK', destination: 'LHR', price: 299, image: 'london' },
        { city: 'Tokyo', route: 'SFO to HND', origin: 'SFO', destination: 'HND', price: 489, image: 'tokyo' },
        { city: 'Paris', route: 'JFK to CDG', origin: 'JFK', destination: 'CDG', price: 329, image: 'paris' },
        { city: 'Singapore', route: 'LAX to SIN', origin: 'LAX', destination: 'SIN', price: 640, image: 'singapore' },
        { city: 'Sydney', route: 'LAX to SYD', origin: 'LAX', destination: 'SYD', price: 710, image: 'sydney' },
        { city: 'Dubai', route: 'LHR to DXB', origin: 'LHR', destination: 'DXB', price: 370, image: 'dubai' },
      ];

      const openDestination = (destination) => {
        const params = new URLSearchParams({
          origin: destination.origin,
          destination: destination.destination,
          flexible: 'true',
          type: 'round-trip',
          passengers: '1',
          cabin: 'economy'
        });
        navigate(`/results?${params.toString()}`);
      };

      return (
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <div className="relative bg-white pb-32">
            <div className="absolute inset-0">
              <img
                className="w-full h-full object-cover"
                src="https://picsum.photos/1920/600?random=hero"
                alt="Travel background"
              />
              <div className="absolute inset-0 bg-gray-900 mix-blend-multiply opacity-40" />
            </div>
            <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-center mb-8">
                Explore the world
              </h1>
              <p className="mt-6 text-xl text-gray-100 text-center max-w-3xl mx-auto">
                Find the best flights, track prices, and book your next adventure with confidence.
              </p>
            </div>
          </div>

          <div className="flex-grow bg-background px-4">
            <FlightSearchForm />

            <div className="max-w-7xl mx-auto mt-16 px-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Destinations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((destination) => (
                  <button
                    type="button"
                    key={destination.city}
                    onClick={() => openDestination(destination)}
                    className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all text-left"
                  >
                    <img src={`https://picsum.photos/400/300?random=${destination.image}`} alt={destination.city} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <div>
                        <h3 className="text-white font-bold text-lg">{destination.city}</h3>
                        <p className="text-gray-200 text-sm">{destination.route} · From ${destination.price}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

