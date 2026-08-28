
    import React, { useState, useMemo } from 'react';
    import { useSearchParams } from 'react-router-dom';
    import { useAppStore } from '../lib/store';
    import Navbar from '../components/Navbar';
    import FlightCard from '../components/FlightCard';
    import PriceGraph from '../components/PriceGraph';
    import { Filter, Bell, Clock, Sun, Moon, Sunset, Sunrise } from 'lucide-react';
    import Autocomplete from '../components/Autocomplete';
    import { AIRLINES } from '../lib/data';
    import { formatDuration } from '../lib/utils';
    import { differenceInDays, parseISO } from 'date-fns';

    export default function Results() {
      const [searchParams, setSearchParams] = useSearchParams();
      const { state, addAlert } = useAppStore();

      // Filter States
      const [priceLimit, setPriceLimit] = useState(2000);
      const [stopsFilter, setStopsFilter] = useState('any'); // any, 0, 1, 2
      const [selectedAirlines, setSelectedAirlines] = useState([]);
      const [departureTime, setDepartureTime] = useState([]); // morning, afternoon, evening, night
      const [arrivalTime, setArrivalTime] = useState([]); // morning, afternoon, evening, night
      const [maxDuration, setMaxDuration] = useState(1200); // in minutes
      const [sort, setSort] = useState('best'); // best, price, duration
      const [alertMessage, setAlertMessage] = useState('');

      const origin = searchParams.get('origin');
      const destination = searchParams.get('destination');
      const date = searchParams.get('date');
      const isFlexible = searchParams.get('flexible') === 'true';

      // Helper to check time of day
      const getTimeOfDay = (dateString) => {
        const hour = new Date(dateString).getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
      };

      // Filter flights based on search params and local filters
      const filteredFlights = useMemo(() => {
        let results = state.flights.filter(flight => {
          // 1. Basic route matching
          const matchOrigin = origin ? flight.origin.code === origin : true;
          const matchDest = destination ? flight.destination.code === destination : true;

          // 2. Date Matching (Exact or Flexible)
          let matchDate = true;
          if (date) {
            const flightDate = parseISO(flight.departure);
            const searchDate = parseISO(date);
            const diff = Math.abs(differenceInDays(flightDate, searchDate));

            if (isFlexible) {
              matchDate = diff <= 3;
            } else {
              matchDate = diff === 0;
            }
          }

          // 3. Price
          const matchPrice = flight.price <= priceLimit;

          // 4. Stops
          const matchStops = stopsFilter === 'any' ? true : flight.stops <= parseInt(stopsFilter);

          // 5. Airlines
          const matchAirline = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline.id);

          // 6. Departure Time
          const flightDepTime = getTimeOfDay(flight.departure);
          const matchDepTime = departureTime.length === 0 || departureTime.includes(flightDepTime);

          // 7. Arrival Time
          const flightArrTime = getTimeOfDay(flight.arrival);
          const matchArrTime = arrivalTime.length === 0 || arrivalTime.includes(flightArrTime);

          // 8. Duration
          const matchDuration = flight.duration <= maxDuration;

          return matchOrigin && matchDest && matchDate && matchPrice && matchStops && matchAirline && matchDepTime && matchArrTime && matchDuration;
        });

        // Sorting
        if (sort === 'price') {
          results.sort((a, b) => a.price - b.price);
        } else if (sort === 'duration') {
          results.sort((a, b) => a.duration - b.duration);
        } else if (sort === 'departure') {
          results.sort((a, b) => new Date(a.departure) - new Date(b.departure));
        } else if (sort === 'arrival') {
          results.sort((a, b) => new Date(a.arrival) - new Date(b.arrival));
        } else {
          // Best = mix of price and duration (mock logic)
          results.sort((a, b) => (a.price + a.duration) - (b.price + b.duration));
        }

        return results;
      }, [state.flights, origin, destination, date, isFlexible, priceLimit, stopsFilter, selectedAirlines, departureTime, arrivalTime, maxDuration, sort]);

      const handleCreateAlert = () => {
        addAlert({
          origin,
          destination,
          maxPrice: priceLimit,
          read: false,
          createdAt: new Date().toISOString()
        });
        setAlertMessage(`Tracking ${origin || 'any origin'} to ${destination || 'any destination'} under $${priceLimit}.`);
      };

      const updateSearch = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        setSearchParams(newParams);
      };

      const toggleAirline = (id) => {
        setSelectedAirlines(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
      };

      const toggleDepartureTime = (time) => {
        setDepartureTime(prev =>
          prev.includes(time) ? prev.filter(x => x !== time) : [...prev, time]
        );
      };

      const toggleArrivalTime = (time) => {
        setArrivalTime(prev =>
          prev.includes(time) ? prev.filter(x => x !== time) : [...prev, time]
        );
      };

      // Helper to force show picker
      const showPicker = (e) => {
        if (e.target.showPicker) {
          e.target.showPicker();
        }
      };

      const timeOptions = [
        { id: 'morning', label: 'Morning', sub: '05:00 - 11:59', icon: Sunrise },
        { id: 'afternoon', label: 'Afternoon', sub: '12:00 - 16:59', icon: Sun },
        { id: 'evening', label: 'Evening', sub: '17:00 - 20:59', icon: Sunset },
        { id: 'night', label: 'Night', sub: '21:00 - 04:59', icon: Moon }
      ];

      return (
        <div className="min-h-screen bg-background pb-12">
          <Navbar />

          {/* Search Bar Condensed */}
          <div className="bg-white shadow-sm border-b border-gray-200 py-4 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Autocomplete
                    placeholder="Origin"
                    value={origin || ''}
                    onChange={(v) => updateSearch('origin', v)}
                  />
                  <Autocomplete
                    placeholder="Destination"
                    value={destination || ''}
                    onChange={(v) => updateSearch('destination', v)}
                  />
                  <input
                    type="date"
                    className="border border-gray-300 rounded px-2 py-2 cursor-pointer"
                    value={date || ''}
                    onChange={(e) => updateSearch('date', e.target.value)}
                    onClick={showPicker}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Filters Sidebar */}
              <div className="w-full lg:w-72 flex-shrink-0 space-y-8">

                {/* Stops */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    Stops
                  </h3>
                  <div className="space-y-2">
                    {['any', '0', '1', '2'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="radio"
                          name="stops"
                          checked={stopsFilter === opt}
                          onChange={() => setStopsFilter(opt)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">
                          {opt === 'any' ? 'Any number of stops' : (opt === '0' ? 'Nonstop only' : `${opt} stop or fewer`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Airlines */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Airlines</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {AIRLINES.map(airline => (
                      <label key={airline.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes(airline.id)}
                          onChange={() => toggleAirline(airline.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{airline.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Departure Times */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Departure times</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeOptions.map(t => {
                      const Icon = t.icon;
                      const isSelected = departureTime.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleDepartureTime(t.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded border text-center transition-colors ${isSelected ? 'bg-blue-50 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Arrival Times */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Arrival times</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeOptions.map(t => {
                      const Icon = t.icon;
                      const isSelected = arrivalTime.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleArrivalTime(t.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded border text-center transition-colors ${isSelected ? 'bg-blue-50 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Price</h3>
                  <div className="px-2">
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      step="50"
                      value={priceLimit}
                      onChange={(e) => setPriceLimit(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>$0</span>
                      <span className="font-medium">${priceLimit}</span>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Max Duration</h3>
                  <div className="px-2">
                    <input
                      type="range"
                      min="120"
                      max="1200"
                      step="30"
                      value={maxDuration}
                      onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>2h</span>
                      <span className="font-medium">{formatDuration(maxDuration)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCreateAlert}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-full text-sm font-medium text-primary hover:bg-blue-50 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    Track Prices
                  </button>
                </div>
              </div>

              {/* Main Results */}
              <div className="flex-1 min-w-0">
                {alertMessage && (
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex items-center justify-between gap-3">
                    <span>{alertMessage}</span>
                    <button type="button" onClick={() => setAlertMessage('')} className="font-medium hover:underline">Dismiss</button>
                  </div>
                )}

                {/* Price Graph */}
                <PriceGraph basePrice={filteredFlights.length > 0 ? filteredFlights[0].price : 300} currentDate={date || new Date()} />

                {/* Sort & Count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div className="text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredFlights.length}</span> flights
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="text-sm font-medium border-none bg-transparent focus:ring-0 cursor-pointer text-gray-900"
                    >
                      <option value="best">Best Match</option>
                      <option value="price">Price (Low to High)</option>
                      <option value="duration">Duration (Shortest)</option>
                      <option value="departure">Departure Time</option>
                      <option value="arrival">Arrival Time</option>
                    </select>
                  </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                  {filteredFlights.length > 0 ? (
                    filteredFlights.map(flight => (
                      <FlightCard key={flight.id} flight={flight} />
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Filter className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No flights found</h3>
                      <p className="mt-1 text-gray-500">Try adjusting your filters or search criteria.</p>
                      <button
                        onClick={() => {
                          setStopsFilter('any');
                          setPriceLimit(2000);
                          setSelectedAirlines([]);
                          setDepartureTime([]);
                          setArrivalTime([]);
                          setMaxDuration(1200);
                        }}
                        className="mt-6 text-primary font-medium hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

