import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Users,
  ArrowLeftRight,
  SlidersHorizontal,
  Clock,
  X,
  Plane,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Card, Button, Input, Badge } from '../components/ui';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentModal } from '../components/ui/PaymentModal';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { getAuthToken, getAuthHeaders } from '../utils/auth';
import { getFormattedFlightDuration } from '../utils/dateTime';
import { sortFlights } from '../utils/filters';
import { formatPrice } from '../utils/formatters';
import { TRIP_TYPES, CABIN_CLASSES } from '../utils/constants';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Booking = ({ isLoggedIn }) => {
  const [tripType, setTripType] = useState('roundtrip');
  const [travelClass, setTravelClass] = useState('economy');
  const [passengerNo, setPassengerNo] = useState(1);
  const [directOnly, setDirectOnly] = useState(false);

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  const [seatNo, setSeatNo] = useState('');

  const [availableFlights, setAvailableFlights] = useState([]);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [ticketId, setTicketId] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');

  const [showFilters, setShowFilters] = useState(false);
  const [priceRange] = useState([0, 10000]);
  const [stops, setStops] = useState({ direct: false, oneStop: false, twoPlus: false });

  const [showRerouteModal, setShowRerouteModal] = useState(false);
  const [cancelledFlightId, setCancelledFlightId] = useState('');
  const [alternateFlights, setAlternateFlights] = useState([]);

  const [clientSecret, setClientSecret] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [searchPerformed, setSearchPerformed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/Login');
    }
  }, [isLoggedIn, navigate]);

  const handleSwapLocations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams({ source, destination });
      if (departureDate) params.append('date', departureDate);
      const response = await fetch(
        `${getApiUrl(ENDPOINTS.AVAILABLE_FLIGHTS)}?${params}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch flight data');
      }
      const result = await response.json();
      setAvailableFlights(result.Flights || []);
      setSearchPerformed(true);
    } catch (err) {
      console.error('Error fetching flights:', err);
      setSearchPerformed(true);
    }
  };

  const handleBookingInitiate = async () => {
    if (!selectedFlightId) {
      return alert('Please select a flight');
    }

    try {
      const token = getAuthToken();
      if (!token) {
         return alert("You must be logged in to book.");
      }

      const response = await fetch(getApiUrl(ENDPOINTS.CREATE_INTENT), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            flight_id: selectedFlightId,
            passenger_count: passengerNo
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Payment initialization failed');

      setClientSecret(data.clientSecret);
      setPaymentAmount(data.amount);
      setShowPaymentModal(true);

    } catch (error) {
      console.error('Error initiating booking:', error);
      alert('Failed to initiate booking. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setShowPaymentModal(false);

    const bookingData = {
      passenger_no: passengerNo,
      class: travelClass,
      food_preference: foodPreference,
      date: departureDate,
      source,
      destination,
      seat_no: seatNo,
      flight_id: selectedFlightId,
      transaction_id: paymentIntentId
    };

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.CREATE_BOOKING), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error('Failed to book flight');

      const result = await response.json();
      console.log('Booking successful:', result);
      setTicketId(result.ticket_id);
      alert('Booking successful! Ticket ID: ' + result.ticket_id);
    } catch (error) {
      console.error('Error during booking:', error);
      alert('Payment succeeded but booking failed. Please contact support.');
    }
  };

  const handleCancel = async () => {
    if (!ticketId) return;

    try {
      const token = getAuthToken();
      const response = await fetch(getApiUrl(ENDPOINTS.CANCEL_BOOKING(ticketId)), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      const result = await response.json();
      console.log('Booking canceled:', result);

      setSelectedFlightId(null);
      setTicketId(null);
      setAvailableFlights([]);
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error during cancellation:', error);
      alert('Cancellation failed. Please try again.');
    }
  };

  const handleReRoute = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.ALTERNATE_FLIGHTS), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelled_flight_id: cancelledFlightId }),
      });

      if (!response.ok) throw new Error('Failed to fetch alternate flights');

      const result = await response.json();
      setAlternateFlights(result.alternateFlights || []);
    } catch (error) {
      console.error('Error fetching alternate flights:', error);
      alert('Failed to find alternate flights');
    }
  };

  const getSortedFlights = () => {
    return sortFlights(availableFlights, sortBy);
  };

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Card className="mb-8">

              <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-dark-border">
                {TRIP_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setTripType(type.value)}
                    className={`px-4 py-2 font-medium capitalize rounded-t-lg transition-colors ${
                      tripType === type.value
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4">
                <div className="relative">
                  <Input
                    label="Flying From"
                    icon={PlaneTakeoff}
                    placeholder="City or airport"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={handleSwapLocations}
                    className="absolute -left-3 md:-left-8 top-6 mt-1 z-10 p-2 bg-white dark:bg-gray-800 rounded-full border-2 border-primary hover:bg-primary hover:text-white transition-colors hidden md:flex items-center justify-center"
                    aria-label="Swap locations"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                  <Input
                    label="Flying To"
                    icon={PlaneLanding}
                    placeholder="City or airport"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Departure"
                    icon={Calendar}
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                  />
                </div>

                {tripType === 'roundtrip' && (
                  <div>
                    <Input
                      label="Return"
                      icon={Calendar}
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Input
                    label="Passengers"
                    icon={Users}
                    type="number"
                    min="1"
                    value={passengerNo}
                    onChange={(e) => setPassengerNo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cabin Class
                  </label>
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {CABIN_CLASSES.map((cabin) => (
                      <option key={cabin.value} value={cabin.value}>
                        {cabin.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={directOnly}
                      onChange={(e) => setDirectOnly(e.target.checked)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Direct flights only
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSearch} size="lg">
                  <Plane className="mr-2 w-5 h-5" />
                  Search Flights
                </Button>
              </div>
            </Card>
          </motion.div>

          {searchPerformed && availableFlights.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 px-6 bg-red-500/10 border border-red-500/30 rounded-lg mt-6"
            >
              <Search className="w-12 h-12 mx-auto text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                No Flights Found
              </h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                No flights available from {source || 'your origin'} to {destination || 'your destination'} on the selected date.
                Try different dates or destinations.
              </p>
            </motion.div>
          )}

          {availableFlights.length > 0 && (
            <div>
              <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden"
                  >
                    <SlidersHorizontal className="mr-2 w-4 h-4" />
                    Filters
                  </Button>

                  <div className="flex space-x-2 flex-wrap">
                    {['recommended', 'cheapest', 'fastest'].map((sort) => (
                      <button
                        key={sort}
                        onClick={() => setSortBy(sort)}
                        className={`px-4 py-2 font-medium capitalize rounded-lg transition-colors ${
                          sortBy === sort
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {sort}
                      </button>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {availableFlights.length} results
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <motion.div
                  className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card padding="md" className="sticky top-20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">Filters</h3>
                      <button
                        onClick={() => setStops({ direct: false, oneStop: false, twoPlus: false })}
                        className="text-sm text-primary hover:underline"
                      >
                        Clear all
                      </button>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Stops</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={stops.direct}
                            onChange={(e) => setStops({ ...stops, direct: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded"
                          />
                          <span className="text-sm">Direct</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={stops.oneStop}
                            onChange={(e) => setStops({ ...stops, oneStop: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded"
                          />
                          <span className="text-sm">1 Stop</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={stops.twoPlus}
                            onChange={(e) => setStops({ ...stops, twoPlus: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded"
                          />
                          <span className="text-sm">2+ Stops</span>
                        </label>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  className="lg:col-span-3 space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                >
                  {getSortedFlights().map((flight) => (
                    <motion.div
                      key={flight.flight_id}
                      variants={fadeInUp}
                    >
                      <Card
                        hover
                        className={`cursor-pointer ${
                          selectedFlightId === flight.flight_id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedFlightId(flight.flight_id)}
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <Badge variant="primary" className="mb-2">
                                  Flight {flight.flight_id}
                                </Badge>
                                {sortBy === 'recommended' && (
                                  <Badge variant="secondary" className="ml-2">
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              {flight.available_seats && flight.available_seats < 5 && (
                                <Badge variant="warning" size="sm">
                                  {flight.available_seats} seats left
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold">{flight.departure ? flight.departure.slice(0, 5) : '08:00'}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase font-semibold">
                                  {flight.source}
                                </div>
                              </div>

                              <div className="flex-1 flex flex-col items-center">
                                <div className="text-xs text-gray-500 mb-1">
                                  <Clock className="inline mr-1 w-3 h-3" />
                                  {flight.departure && flight.arrival
                                    ? getFormattedFlightDuration(flight.departure, flight.arrival)
                                    : '2h 30m'}
                                </div>

                                <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600 relative">
                                  <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {directOnly ? 'Direct' : 'Direct'}
                                </div>
                              </div>

                              <div className="text-center">
                                <div className="text-2xl font-bold">{flight.arrival ? flight.arrival.slice(0, 5) : '10:30'}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase font-semibold">
                                  {flight.destination}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                              Available seats: {flight.available_seats || 'N/A'}
                            </div>
                          </div>

                          {/* Pricing Panel */}
                          <div className="md:w-48 flex flex-col justify-between items-end bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                            <div className="text-right mb-4">
                              <div className="text-xs text-gray-500 mb-1">From</div>
                              <div className="text-3xl font-bold text-primary">
                                 {formatPrice(flight.price)}
                              </div>
                              <div className="text-xs text-gray-500">per person</div>
                            </div>
                            <Button
                              variant={selectedFlightId === flight.flight_id ? 'primary' : 'outline'}
                              size="md"
                              fullWidth
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFlightId(flight.flight_id);
                              }}
                            >
                              {selectedFlightId === flight.flight_id ? 'Selected' : 'Select'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {selectedFlightId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="mt-8" padding="md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Input
                        label="Food Preference"
                        placeholder="e.g., Vegetarian, Vegan"
                        value={foodPreference}
                        onChange={(e) => setFoodPreference(e.target.value)}
                      />
                      <Input
                        label="Preferred Seat Number"
                        placeholder="e.g., 12A"
                        value={seatNo}
                        onChange={(e) => setSeatNo(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 justify-end">
                      {ticketId && (
                        <Button variant="danger" onClick={handleCancel}>
                          Cancel Booking
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => setShowRerouteModal(true)}>
                        Find Alternate Routes
                      </Button>
                      <Button onClick={handleBookingInitiate} size="lg">
                        Book Selected Flight
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          )}

          {showPaymentModal && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentModal
                amount={paymentAmount}
                onClose={() => setShowPaymentModal(false)}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}

          {showRerouteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" padding="lg">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Find Alternate Flights</h2>
                  <button
                    onClick={() => setShowRerouteModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <Input
                  label="Cancelled Flight ID"
                  placeholder="Enter flight ID"
                  value={cancelledFlightId}
                  onChange={(e) => setCancelledFlightId(e.target.value)}
                  className="mb-4"
                />

                <Button onClick={handleReRoute} fullWidth className="mb-6">
                  Search Alternate Flights
                </Button>

                {alternateFlights.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Alternative Options</h3>
                    {alternateFlights.map((flight) => (
                      <Card key={flight.flight_id} padding="md">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Flight:</span> {flight.flight_id}
                          </div>
                          <div>
                            <span className="font-medium">Airline:</span> {flight.airline_id}
                          </div>
                          <div>
                            <span className="font-medium">Departure:</span> {flight.departure}
                          </div>
                          <div>
                            <span className="font-medium">Arrival:</span> {flight.arrival}
                          </div>
                          <div>
                            <span className="font-medium">Seats:</span> {flight.available_seats}
                          </div>
                          <div>
                            <span className="font-medium">Price:</span> {formatPrice(flight.price)}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Booking;
