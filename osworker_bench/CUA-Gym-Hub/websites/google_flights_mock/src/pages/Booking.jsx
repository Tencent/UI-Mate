
    import React, { useState } from 'react';
    import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
    import { useAppStore } from '../lib/store';
    import Navbar from '../components/Navbar';
    import { Check, CreditCard, ArrowLeft, Download } from 'lucide-react';
    import { formatCurrency } from '../lib/utils';
    import { format } from 'date-fns';

    export default function Booking() {
      const location = useLocation();
      const navigate = useNavigate();
      const [searchParams] = useSearchParams();
      const { state, addBooking } = useAppStore();
      const flightId = searchParams.get('flightId');
      const flight = location.state?.flight || state.flights.find(item => item.id === flightId);

      const [step, setStep] = useState(1);
      const [passenger, setPassenger] = useState({ firstName: '', lastName: '', email: '' });
      const [seat, setSeat] = useState(null);
      const [isProcessing, setIsProcessing] = useState(false);
      const [bookingRef, setBookingRef] = useState('');

      const downloadItinerary = () => {
        const lines = [
          'SkySearch itinerary',
          `Booking reference: ${bookingRef}`,
          `Passenger: ${passenger.firstName} ${passenger.lastName}`,
          `Route: ${flight.origin.city} (${flight.origin.code}) to ${flight.destination.city} (${flight.destination.code})`,
          `Departure: ${format(new Date(flight.departure), 'PPpp')}`,
          `Arrival: ${format(new Date(flight.arrival), 'PPpp')}`,
          `Airline: ${flight.airline.name}`,
          `Seat: ${seat}`,
          `Total: ${formatCurrency(flight.price)}`
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${bookingRef || 'skysearch-itinerary'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      if (!flight) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">No flight selected</h2>
              <p className="text-gray-600 mb-4">Please select a flight to continue.</p>
              <button onClick={() => navigate('/')} className="text-primary hover:underline">Go Home</button>
            </div>
          </div>
        );
      }

      const handleBooking = () => {
        setIsProcessing(true);
        setTimeout(() => {
          const reference = `SKY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          setBookingRef(reference);
          addBooking({
            flightId: flight.id,
            flightDetails: flight,
            passenger,
            seat,
            total: flight.price,
            reference,
            status: 'confirmed'
          });
          setIsProcessing(false);
          setStep(4); // Success
        }, 1500);
      };

      const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-1 transition-colors ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      );

      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to results
            </button>

            {renderStepIndicator()}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {step === 1 && 'Passenger Details'}
                      {step === 2 && 'Select Seat'}
                      {step === 3 && 'Payment'}
                      {step === 4 && 'Booking Confirmed'}
                    </h2>
                  </div>

                  <div className="p-6">
                    {step === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-primary outline-none"
                              value={passenger.firstName}
                              onChange={e => setPassenger({...passenger, firstName: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-primary outline-none"
                              value={passenger.lastName}
                              onChange={e => setPassenger({...passenger, lastName: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-primary outline-none"
                            value={passenger.email}
                            onChange={e => setPassenger({...passenger, email: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end mt-6">
                          <button
                            onClick={() => setStep(2)}
                            disabled={!passenger.firstName || !passenger.lastName || !passenger.email}
                            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition-colors"
                          >
                            Continue to Seats
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div>
                        <div className="mb-6 flex justify-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-white border border-gray-300"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-300"></div>
                            <span>Occupied</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-primary"></div>
                            <span>Selected</span>
                          </div>
                        </div>

                        {/* Aircraft Seat Map */}
                        <div className="max-w-xs mx-auto bg-white p-8 rounded-t-[4rem] rounded-b-xl border-2 border-gray-200 shadow-inner relative">
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-300 text-xs">COCKPIT</div>

                          <div className="space-y-2 mt-8">
                            {Array.from({ length: 10 }).map((_, row) => (
                              <div key={row} className="flex justify-between items-center gap-4">
                                {/* Left Side (A, B) */}
                                <div className="flex gap-1">
                                  {['A', 'B'].map((col) => {
                                    const seatId = `${row + 1}${col}`;
                                    const isTaken = (row * 4 + col.charCodeAt(0)) % 7 === 0; // Mock taken logic
                                    const isSelected = seat === seatId;
                                    return (
                                      <button
                                        key={seatId}
                                        disabled={isTaken}
                                        onClick={() => setSeat(seatId)}
                                        className={`
                                          w-8 h-8 rounded-t-md rounded-b-sm text-xs font-bold transition-all
                                          ${isTaken ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : ''}
                                          ${isSelected ? 'bg-primary text-white scale-110 shadow-md' : 'bg-white border border-gray-300 hover:border-primary'}
                                          ${!isTaken && !isSelected ? 'text-gray-600' : ''}
                                        `}
                                      >
                                        {col}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Aisle Number */}
                                <div className="text-xs text-gray-300 font-mono w-4 text-center">{row + 1}</div>

                                {/* Right Side (C, D) */}
                                <div className="flex gap-1">
                                  {['C', 'D'].map((col) => {
                                    const seatId = `${row + 1}${col}`;
                                    const isTaken = (row * 4 + col.charCodeAt(0)) % 5 === 0;
                                    const isSelected = seat === seatId;
                                    return (
                                      <button
                                        key={seatId}
                                        disabled={isTaken}
                                        onClick={() => setSeat(seatId)}
                                        className={`
                                          w-8 h-8 rounded-t-md rounded-b-sm text-xs font-bold transition-all
                                          ${isTaken ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : ''}
                                          ${isSelected ? 'bg-primary text-white scale-110 shadow-md' : 'bg-white border border-gray-300 hover:border-primary'}
                                          ${!isTaken && !isSelected ? 'text-gray-600' : ''}
                                        `}
                                      >
                                        {col}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
                          <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 font-medium">Back</button>
                          <button
                            onClick={() => setStep(3)}
                            disabled={!seat}
                            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition-colors"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="border border-gray-200 rounded p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="text-gray-500" />
                            <span className="font-medium">Payment Method</span>
                          </div>
                          <input
                            type="text"
                            placeholder="Card Number (Mock)"
                            className="w-full border border-gray-300 rounded p-2 mb-2 focus:ring-1 focus:ring-primary outline-none"
                            defaultValue="4242 4242 4242 4242"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="MM/YY" className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-primary outline-none" defaultValue="12/25" />
                            <input type="text" placeholder="CVC" className="border border-gray-300 rounded p-2 focus:ring-1 focus:ring-primary outline-none" defaultValue="123" />
                          </div>
                        </div>

                        <div className="flex justify-between mt-6">
                          <button onClick={() => setStep(2)} className="text-gray-600 hover:text-gray-900 font-medium">Back</button>
                          <button
                            onClick={handleBooking}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded font-bold shadow-md w-full sm:w-auto transition-colors"
                          >
                            {isProcessing ? 'Processing...' : `Pay ${formatCurrency(flight.price)}`}
                          </button>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                          <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-8">Your flight to {flight.destination.city} has been booked successfully.</p>
                        <div className="bg-gray-50 p-4 rounded-lg max-w-sm mx-auto mb-8 text-left">
                          <div className="text-sm text-gray-500 mb-1">Booking Reference</div>
                          <div className="text-lg font-mono font-bold text-gray-900">{bookingRef}</div>
                          <div className="mt-4 text-sm text-gray-500 mb-1">Passenger</div>
                          <div className="font-medium">{passenger.firstName} {passenger.lastName}</div>
                          <div className="mt-4 text-sm text-gray-500 mb-1">Seat</div>
                          <div className="font-medium">{seat}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                          <button
                            type="button"
                            onClick={downloadItinerary}
                            className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download itinerary
                          </button>
                          <button
                            onClick={() => navigate('/')}
                            className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors"
                          >
                            Return Home
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 className="font-semibold text-gray-900 mb-4">Trip Summary</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-bold text-gray-900">{flight.origin.code}</div>
                        <div className="text-xs text-gray-500">{flight.origin.city}</div>
                      </div>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-xs text-gray-400">to</span>
                        <div className="w-12 h-px bg-gray-300 my-1"></div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{flight.destination.code}</div>
                        <div className="text-xs text-gray-500">{flight.destination.city}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium">{format(new Date(flight.departure), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time</span>
                        <span className="font-medium">{format(new Date(flight.departure), 'HH:mm')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Airline</span>
                        <span className="font-medium">{flight.airline.name}</span>
                      </div>
                      {seat && (
                        <div className="flex justify-between text-primary">
                          <span className="font-medium">Selected Seat</span>
                          <span className="font-bold">{seat}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-end">
                        <span className="text-gray-600 font-medium">Total Price</span>
                        <span className="text-2xl font-bold text-green-700">{formatCurrency(flight.price)}</span>
                      </div>
                      <div className="text-xs text-gray-500 text-right mt-1">Includes taxes & fees</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

