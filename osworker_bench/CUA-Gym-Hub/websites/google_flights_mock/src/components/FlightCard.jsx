
    import React, { useState } from 'react';
    import { ChevronDown, ChevronUp, Clock, Luggage, Wifi, ArrowRight } from 'lucide-react';
    import { formatDuration, formatCurrency } from '../lib/utils';
    import { format, differenceInMinutes } from 'date-fns';
    import { useNavigate } from 'react-router-dom';

    export default function FlightCard({ flight }) {
      const [expanded, setExpanded] = useState(false);
      const navigate = useNavigate();

      const handleSelect = () => {
        navigate(`/booking?flightId=${encodeURIComponent(flight.id)}`, { state: { flight } });
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 hover:shadow-md transition-shadow">
          {/* Main Card Content */}
          <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* Airline Info */}
              <div className="flex items-center gap-4 w-full sm:w-1/4">
                <img src={flight.airline.logo} alt={flight.airline.name} className="w-8 h-8 rounded-sm object-contain" />
                <div>
                  <div className="font-semibold text-gray-900">{format(new Date(flight.departure), 'HH:mm')} – {format(new Date(flight.arrival), 'HH:mm')}</div>
                  <div className="text-xs text-gray-500">{flight.airline.name}</div>
                </div>
              </div>

              {/* Duration & Stops */}
              <div className="flex flex-col items-center justify-center w-full sm:w-1/4">
                <div className="text-sm text-gray-700">{formatDuration(flight.duration)}</div>
                <div className="relative w-24 h-px bg-gray-300 my-1">
                  <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-gray-300"></div>
                  {flight.stops > 0 && (
                    <div className="absolute -top-1 left-1/2 -ml-1 w-2 h-2 rounded-full bg-white border border-gray-400"></div>
                  )}
                </div>
                <div className={`text-xs ${flight.stops === 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </div>
              </div>

              {/* Route */}
              <div className="text-center w-full sm:w-1/4 hidden sm:block">
                <div className="text-sm font-medium text-gray-600">{flight.origin.code} - {flight.destination.code}</div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-1/4 gap-4">
                <div className="text-right">
                  <div className="text-xl font-bold text-green-700">{formatCurrency(flight.price)}</div>
                  <div className="text-xs text-gray-500">round trip</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expanded && (
            <div className="border-t border-gray-200 bg-gray-50 p-6 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Flight Details</h4>

                  {/* Segments Loop */}
                  {flight.segments ? (
                    flight.segments.map((segment, index) => {
                      const nextSegment = flight.segments[index + 1];
                      const layoverDuration = nextSegment
                        ? differenceInMinutes(new Date(nextSegment.departure), new Date(segment.arrival))
                        : 0;

                      return (
                        <div key={segment.id} className="relative pl-8 pb-8 last:pb-0 border-l-2 border-gray-300 last:border-l-0 ml-2">
                          {/* Segment Dot */}
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-gray-400 bg-white"></div>

                          {/* Segment Content */}
                          <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <img src={segment.airline.logo} alt={segment.airline.name} className="w-5 h-5 object-contain" />
                                <span className="text-sm font-medium text-gray-900">{segment.airline.name} · {segment.aircraft}</span>
                                <span className="text-xs text-gray-500">Flight {segment.flightNumber}</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <div>
                                  <div className="font-semibold text-gray-900">{format(new Date(segment.departure), 'HH:mm')}</div>
                                  <div className="text-sm text-gray-600">{segment.origin.name} ({segment.origin.code})</div>
                                  <div className="text-xs text-gray-500">{format(new Date(segment.departure), 'EEE, MMM d')}</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{format(new Date(segment.arrival), 'HH:mm')}</div>
                                  <div className="text-sm text-gray-600">{segment.destination.name} ({segment.destination.code})</div>
                                  <div className="text-xs text-gray-500">{format(new Date(segment.arrival), 'EEE, MMM d')}</div>
                                </div>
                              </div>

                              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Duration: {formatDuration(segment.duration)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Layover Info */}
                          {layoverDuration > 0 && (
                            <div className="my-4 p-3 bg-orange-50 border border-orange-100 rounded-md text-sm text-orange-800 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{formatDuration(layoverDuration)} layover in {segment.destination.city} ({segment.destination.code})</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Fallback for old data structure if any
                    <div className="text-gray-500">Details unavailable for this flight.</div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Luggage className="w-4 h-4" />
                    <span>{flight.baggage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    <span>Wi-Fi & USB Power</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Total Duration:</span>
                    <span>{formatDuration(flight.duration)}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSelect}
                    className="bg-primary hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow transition-colors flex items-center gap-2"
                  >
                    Select Flight <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

