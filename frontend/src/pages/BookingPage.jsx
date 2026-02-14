import { useState, useEffect, Fragment } from 'react';
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
  Search,
  Plus,
  Check
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
import { sortFlights, filterFlights } from '../utils/filters';
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
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [stops, setStops] = useState({ direct: false, oneStop: false, twoPlus: false });

  const [showRerouteModal, setShowRerouteModal] = useState(false);
  const [cancelledFlightId, setCancelledFlightId] = useState('');
  const [alternateFlights, setAlternateFlights] = useState([]);

  const [clientSecret, setClientSecret] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [searchPerformed, setSearchPerformed] = useState(false);

  // Round-trip state
  const [returnFlights, setReturnFlights] = useState([]);
  const [selectedReturnFlightId, setSelectedReturnFlightId] = useState(null);
  const [returnSearchPerformed, setReturnSearchPerformed] = useState(false);
  const [returnTicketId, setReturnTicketId] = useState(null);
  const [roundTripPhase, setRoundTripPhase] = useState('outbound');
  const [bookingRoundTripLeg, setBookingRoundTripLeg] = useState(null);

  // Multi-city state
  const [legs, setLegs] = useState([
    { source: '', destination: '', date: '' },
    { source: '', destination: '', date: '' }
  ]);
  const [currentLeg, setCurrentLeg] = useState(0);
  const [legFlights, setLegFlights] = useState([[], [], []]);
  const [legSelectedFlightId, setLegSelectedFlightId] = useState([null, null, null]);
  const [legTicketId, setLegTicketId] = useState([null, null, null]);
  const [legSearchPerformed, setLegSearchPerformed] = useState([false, false, false]);
  const [bookingLegIndex, setBookingLegIndex] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/Login');
    }
  }, [isLoggedIn, navigate]);

  const isMultiCity = tripType === 'multicity';
  const isRoundTrip = tripType === 'roundtrip';

  // Computed values for unified rendering
  const currentFlights = isMultiCity
    ? legFlights[currentLeg]
    : isRoundTrip
    ? (roundTripPhase === 'outbound' ? availableFlights : returnFlights)
    : availableFlights;
  const currentSelectedFlightId = isMultiCity
    ? legSelectedFlightId[currentLeg]
    : isRoundTrip
    ? (roundTripPhase === 'outbound' ? selectedFlightId : selectedReturnFlightId)
    : selectedFlightId;
  const currentSearchPerformed = isMultiCity
    ? legSearchPerformed[currentLeg]
    : isRoundTrip
    ? (roundTripPhase === 'outbound' ? searchPerformed : returnSearchPerformed)
    : searchPerformed;
  const allLegsHaveSelection = isMultiCity && legs.every((_, i) => legSelectedFlightId[i] !== null);
  const allLegsBooked = isMultiCity && legs.every((_, i) => legTicketId[i] !== null);
  const bothRoundTripSelected = isRoundTrip && selectedFlightId && selectedReturnFlightId;
  const bothRoundTripBooked = isRoundTrip && ticketId && returnTicketId;
  const outboundFlight = isRoundTrip ? availableFlights.find(f => f.flight_id === selectedFlightId) : null;
  const returnSelectedFlight = isRoundTrip ? returnFlights.find(f => f.flight_id === selectedReturnFlightId) : null;
  const roundTripTotalPrice = (outboundFlight?.price || 0) + (returnSelectedFlight?.price || 0);

  // --- Leg helpers ---
  const updateLeg = (index, field, value) => {
    setLegs(prev => prev.map((leg, i) => i === index ? { ...leg, [field]: value } : leg));
  };

  const addLeg = () => {
    if (legs.length < 3) {
      setLegs(prev => [...prev, { source: '', destination: '', date: '' }]);
    }
  };

  const removeLeg = (index) => {
    setLegs(prev => prev.filter((_, i) => i !== index));
    setLegFlights(prev => {
      const next = [...prev];
      next.splice(index, 1);
      next.push([]);
      return next;
    });
    setLegSelectedFlightId(prev => {
      const next = [...prev];
      next.splice(index, 1);
      next.push(null);
      return next;
    });
    setLegSearchPerformed(prev => {
      const next = [...prev];
      next.splice(index, 1);
      next.push(false);
      return next;
    });
    setLegTicketId(prev => {
      const next = [...prev];
      next.splice(index, 1);
      next.push(null);
      return next;
    });
    if (currentLeg >= index && currentLeg > 0) {
      setCurrentLeg(currentLeg - 1);
    }
  };

  const handleSelectFlight = (flightId) => {
    if (isMultiCity) {
      setLegSelectedFlightId(prev => {
        const next = [...prev];
        next[currentLeg] = flightId;
        return next;
      });
    } else if (isRoundTrip && roundTripPhase === 'return') {
      setSelectedReturnFlightId(flightId);
    } else {
      setSelectedFlightId(flightId);
    }
  };

  // --- Search ---
  const handleSwapLocations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearch = async () => {
    if (isMultiCity) {
      const leg = legs[currentLeg];
      if (!leg.source || !leg.destination) {
        return alert(`Please enter source and destination for Leg ${currentLeg + 1}`);
      }

      try {
        const params = new URLSearchParams({ source: leg.source, destination: leg.destination });
        if (leg.date) params.append('date', leg.date);
        if (minPrice !== '') params.append('min_price', minPrice);
        if (maxPrice !== '') params.append('max_price', maxPrice);
        const response = await fetch(
          `${getApiUrl(ENDPOINTS.AVAILABLE_FLIGHTS)}?${params}`
        );
        if (!response.ok) throw new Error('Failed to fetch flight data');
        const result = await response.json();
        setLegFlights(prev => {
          const next = [...prev];
          next[currentLeg] = result.Flights || [];
          return next;
        });
        setLegSearchPerformed(prev => {
          const next = [...prev];
          next[currentLeg] = true;
          return next;
        });
      } catch (err) {
        console.error('Error fetching flights:', err);
        setLegSearchPerformed(prev => {
          const next = [...prev];
          next[currentLeg] = true;
          return next;
        });
      }
      return;
    }

    if (isRoundTrip) {
      if (!departureDate || !returnDate) {
        return alert('Please select both departure and return dates');
      }

      try {
        const outboundParams = new URLSearchParams({ source, destination });
        outboundParams.append('date', departureDate);
        if (minPrice !== '') outboundParams.append('min_price', minPrice);
        if (maxPrice !== '') outboundParams.append('max_price', maxPrice);

        const returnParams = new URLSearchParams({ source: destination, destination: source });
        returnParams.append('date', returnDate);
        if (minPrice !== '') returnParams.append('min_price', minPrice);
        if (maxPrice !== '') returnParams.append('max_price', maxPrice);

        const [outboundRes, returnRes] = await Promise.all([
          fetch(`${getApiUrl(ENDPOINTS.AVAILABLE_FLIGHTS)}?${outboundParams}`),
          fetch(`${getApiUrl(ENDPOINTS.AVAILABLE_FLIGHTS)}?${returnParams}`)
        ]);

        if (!outboundRes.ok || !returnRes.ok) throw new Error('Failed to fetch flight data');

        const outboundData = await outboundRes.json();
        const returnData = await returnRes.json();

        setAvailableFlights(outboundData.Flights || []);
        setReturnFlights(returnData.Flights || []);
        setSearchPerformed(true);
        setReturnSearchPerformed(true);
        setRoundTripPhase('outbound');
        setSelectedFlightId(null);
        setSelectedReturnFlightId(null);
      } catch (err) {
        console.error('Error fetching flights:', err);
        setSearchPerformed(true);
        setReturnSearchPerformed(true);
      }
      return;
    }

    try {
      const params = new URLSearchParams({ source, destination });
      if (departureDate) params.append('date', departureDate);
      if (minPrice !== '') params.append('min_price', minPrice);
      if (maxPrice !== '') params.append('max_price', maxPrice);
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

  // --- Booking ---
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

  const handleMultiCityBookingInitiate = async (legIndex) => {
    const flightId = legSelectedFlightId[legIndex];
    if (!flightId) return alert(`No flight selected for Leg ${legIndex + 1}`);

    try {
      const token = getAuthToken();
      if (!token) return alert("You must be logged in to book.");

      setBookingLegIndex(legIndex);

      const response = await fetch(getApiUrl(ENDPOINTS.CREATE_INTENT), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          flight_id: flightId,
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
      setBookingLegIndex(null);
      alert('Failed to initiate booking. Please try again.');
    }
  };

  const handleRoundTripBookingInitiate = async (leg) => {
    const flightId = leg === 'outbound' ? selectedFlightId : selectedReturnFlightId;
    if (!flightId) return alert(`No flight selected for ${leg} trip`);

    try {
      const token = getAuthToken();
      if (!token) return alert("You must be logged in to book.");

      setBookingRoundTripLeg(leg);

      const response = await fetch(getApiUrl(ENDPOINTS.CREATE_INTENT), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          flight_id: flightId,
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
      setBookingRoundTripLeg(null);
      alert('Failed to initiate booking. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setShowPaymentModal(false);

    if (isMultiCity && bookingLegIndex !== null) {
      const legIndex = bookingLegIndex;
      const leg = legs[legIndex];
      const bookingData = {
        passenger_no: passengerNo,
        class: travelClass,
        food_preference: foodPreference,
        date: leg.date,
        source: leg.source,
        destination: leg.destination,
        seat_no: seatNo,
        flight_id: legSelectedFlightId[legIndex],
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
        setLegTicketId(prev => {
          const next = [...prev];
          next[legIndex] = result.ticket_id;
          return next;
        });
        setBookingLegIndex(null);
        alert(`Leg ${legIndex + 1} booked successfully! Ticket ID: ${result.ticket_id}`);
      } catch (error) {
        console.error('Error during booking:', error);
        setBookingLegIndex(null);
        alert('Payment succeeded but booking failed. Please contact support.');
      }
      return;
    }

    if (isRoundTrip && bookingRoundTripLeg !== null) {
      const leg = bookingRoundTripLeg;
      const isReturn = leg === 'return';
      const bookingData = {
        passenger_no: passengerNo,
        class: travelClass,
        food_preference: foodPreference,
        date: isReturn ? returnDate : departureDate,
        source: isReturn ? destination : source,
        destination: isReturn ? source : destination,
        seat_no: seatNo,
        flight_id: isReturn ? selectedReturnFlightId : selectedFlightId,
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
        if (isReturn) {
          setReturnTicketId(result.ticket_id);
        } else {
          setTicketId(result.ticket_id);
        }
        setBookingRoundTripLeg(null);
        alert(`${isReturn ? 'Return' : 'Outbound'} flight booked! Ticket ID: ${result.ticket_id}`);
      } catch (error) {
        console.error('Error during booking:', error);
        setBookingRoundTripLeg(null);
        alert('Payment succeeded but booking failed. Please contact support.');
      }
      return;
    }

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

      const refundMsg = result.refund_status === 'succeeded'
        ? 'Refund has been processed. Check your email for details.'
        : result.refund_status === 'pending'
        ? 'Refund is being processed. Check your email for details.'
        : result.refund_status === 'no_payment'
        ? 'No payment was associated with this booking.'
        : result.refund_status === 'failed'
        ? 'Refund could not be processed. Please contact support.'
        : '';
      alert(`Booking cancelled successfully.${refundMsg ? ' ' + refundMsg : ''}`);
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

  const getFilteredAndSortedFlights = () => {
    const filtered = filterFlights(currentFlights, { stops, minPrice, maxPrice, directOnly });
    return sortFlights(filtered, sortBy);
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

              {isMultiCity ? (
                <div className="space-y-3 mb-4">
                  {legs.map((leg, index) => (
                    <div
                      key={index}
                      className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end p-3 rounded-lg transition-colors ${
                        currentLeg === index
                          ? 'bg-primary/5 ring-1 ring-primary/20'
                          : ''
                      }`}
                    >
                      <Input
                        label={`Leg ${index + 1} - From`}
                        icon={PlaneTakeoff}
                        placeholder="City or airport"
                        value={leg.source}
                        onChange={(e) => updateLeg(index, 'source', e.target.value)}
                        onFocus={() => setCurrentLeg(index)}
                      />
                      <Input
                        label="To"
                        icon={PlaneLanding}
                        placeholder="City or airport"
                        value={leg.destination}
                        onChange={(e) => updateLeg(index, 'destination', e.target.value)}
                        onFocus={() => setCurrentLeg(index)}
                      />
                      <Input
                        label="Date"
                        icon={Calendar}
                        type="date"
                        value={leg.date}
                        onChange={(e) => updateLeg(index, 'date', e.target.value)}
                        onFocus={() => setCurrentLeg(index)}
                      />
                      {index >= 2 ? (
                        <button
                          onClick={() => removeLeg(index)}
                          className="p-2 mb-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full self-end"
                          aria-label="Remove leg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      ) : (
                        <div className="hidden md:block w-9" />
                      )}
                    </div>
                  ))}
                  {legs.length < 3 && (
                    <button
                      onClick={addLeg}
                      className="flex items-center text-sm text-primary hover:text-primary/80 font-medium ml-3 mt-1"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add another leg
                    </button>
                  )}
                </div>
              ) : (
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
              )}

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

              <div className="flex justify-end items-center gap-3">
                {isMultiCity && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Searching Leg {currentLeg + 1} of {legs.length}
                  </span>
                )}
                <Button onClick={handleSearch} size="lg">
                  <Plane className="mr-2 w-5 h-5" />
                  {isMultiCity ? `Search Leg ${currentLeg + 1}` : 'Search Flights'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Multi-city leg stepper */}
          {isMultiCity && (legSearchPerformed.some(Boolean) || legSelectedFlightId.some(id => id !== null)) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {legs.map((leg, index) => (
                <Fragment key={index}>
                  {index > 0 && (
                    <div className="text-gray-400 dark:text-gray-500 px-1">&#8594;</div>
                  )}
                  <button
                    onClick={() => setCurrentLeg(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      currentLeg === index
                        ? 'bg-primary text-white'
                        : legTicketId[index]
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : legSelectedFlightId[index]
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {legTicketId[index] ? (
                      <Check className="w-4 h-4" />
                    ) : legSelectedFlightId[index] ? (
                      <Plane className="w-4 h-4" />
                    ) : null}
                    Leg {index + 1}: {leg.source || '?'} &rarr; {leg.destination || '?'}
                  </button>
                </Fragment>
              ))}
            </div>
          )}

          {/* Round-trip phase stepper */}
          {isRoundTrip && (searchPerformed || returnSearchPerformed) && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setRoundTripPhase('outbound')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  roundTripPhase === 'outbound'
                    ? 'bg-primary text-white'
                    : ticketId
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : selectedFlightId
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {ticketId ? (
                  <Check className="w-4 h-4" />
                ) : selectedFlightId ? (
                  <Plane className="w-4 h-4" />
                ) : null}
                Departure: {source || '?'} &rarr; {destination || '?'}
              </button>
              <div className="text-gray-400 dark:text-gray-500 px-1">&#8594;</div>
              <button
                onClick={() => setRoundTripPhase('return')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  roundTripPhase === 'return'
                    ? 'bg-primary text-white'
                    : returnTicketId
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : selectedReturnFlightId
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {returnTicketId ? (
                  <Check className="w-4 h-4" />
                ) : selectedReturnFlightId ? (
                  <Plane className="w-4 h-4" />
                ) : null}
                Return: {destination || '?'} &rarr; {source || '?'}
              </button>
            </div>
          )}

          {currentSearchPerformed && currentFlights.length === 0 && (
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
                {isMultiCity ? (
                  <>No flights available from {legs[currentLeg]?.source || 'your origin'} to {legs[currentLeg]?.destination || 'your destination'} on the selected date. Try different dates or destinations.</>
                ) : isRoundTrip ? (
                  <>No {roundTripPhase} flights available from {roundTripPhase === 'outbound' ? `${source || 'your origin'} to ${destination || 'your destination'}` : `${destination || 'your origin'} to ${source || 'your destination'}`} on the selected date. Try different dates or destinations.</>
                ) : (
                  <>No flights available from {source || 'your origin'} to {destination || 'your destination'} on the selected date. Try different dates or destinations.</>
                )}
              </p>
            </motion.div>
          )}

          {currentFlights.length > 0 && (
            <div>
              <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  {isMultiCity && (
                    <h3 className="text-lg font-semibold">
                      Leg {currentLeg + 1}: {legs[currentLeg].source} &rarr; {legs[currentLeg].destination}
                    </h3>
                  )}

                  {isRoundTrip && (
                    <h3 className="text-lg font-semibold">
                      {roundTripPhase === 'outbound' ? 'Departure' : 'Return'}: {roundTripPhase === 'outbound' ? `${source} \u2192 ${destination}` : `${destination} \u2192 ${source}`}
                    </h3>
                  )}

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
                    Showing {getFilteredAndSortedFlights().length} of {currentFlights.length} results
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
                        onClick={() => {
                          setStops({ direct: false, oneStop: false, twoPlus: false });
                          setMinPrice('');
                          setMaxPrice('');
                        }}
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

                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Price Range</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Min Price</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Max Price</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="No limit"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
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
                  {getFilteredAndSortedFlights().length === 0 && (
                    <div className="text-center py-12 px-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <SlidersHorizontal className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
                      <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                        No Flights Match Your Filters
                      </h3>
                      <p className="text-gray-400 text-sm max-w-md mx-auto">
                        {currentFlights.length} flight{currentFlights.length > 1 ? 's' : ''} found, but none match your current filters. Try adjusting or clearing your filters.
                      </p>
                    </div>
                  )}
                  {getFilteredAndSortedFlights().map((flight) => (
                    <motion.div
                      key={flight.flight_id}
                      variants={fadeInUp}
                    >
                      <Card
                        hover
                        className={`cursor-pointer ${
                          currentSelectedFlightId === flight.flight_id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleSelectFlight(flight.flight_id)}
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
                              variant={currentSelectedFlightId === flight.flight_id ? 'primary' : 'outline'}
                              size="md"
                              fullWidth
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectFlight(flight.flight_id);
                              }}
                            >
                              {currentSelectedFlightId === flight.flight_id ? 'Selected' : 'Select'}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Multi-city: Next Leg button after selecting a flight */}
              {isMultiCity && currentSelectedFlightId && currentLeg < legs.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end mt-6"
                >
                  <Button
                    size="lg"
                    onClick={() => setCurrentLeg(currentLeg + 1)}
                  >
                    Next Leg &rarr;
                  </Button>
                </motion.div>
              )}

              {/* Round-trip: Next phase button after selecting outbound */}
              {isRoundTrip && roundTripPhase === 'outbound' && selectedFlightId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end mt-6"
                >
                  <Button
                    size="lg"
                    onClick={() => setRoundTripPhase('return')}
                  >
                    Select Return Flight &rarr;
                  </Button>
                </motion.div>
              )}

              {/* One-way: existing booking panel */}
              {!isMultiCity && !isRoundTrip && selectedFlightId && (
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

          {/* Multi-city booking summary */}
          {isMultiCity && allLegsHaveSelection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mt-8" padding="md">
                <h3 className="text-xl font-bold mb-4">Multi-City Trip Summary</h3>

                <div className="space-y-3 mb-6">
                  {legs.map((leg, index) => {
                    const flight = legFlights[index].find(f => f.flight_id === legSelectedFlightId[index]);
                    return (
                      <div
                        key={index}
                        className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-lg border ${
                          legTicketId[index]
                            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant={legTicketId[index] ? 'success' : 'primary'}>
                            Leg {index + 1}
                          </Badge>
                          <span className="font-medium">
                            {leg.source} &rarr; {leg.destination}
                          </span>
                          {leg.date && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">{leg.date}</span>
                          )}
                          {flight && (
                            <Badge variant="info" size="sm">Flight {flight.flight_id}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {flight && (
                            <span className="font-bold text-primary">{formatPrice(flight.price)}</span>
                          )}
                          {legTicketId[index] ? (
                            <Badge variant="success">
                              <Check className="inline w-3 h-3 mr-1" />
                              Ticket #{legTicketId[index]}
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleMultiCityBookingInitiate(index)}
                              disabled={index > 0 && !legTicketId[index - 1]}
                            >
                              Book Leg {index + 1}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

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

                {allLegsBooked && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="text-lg font-bold text-green-700 dark:text-green-400">
                      All Legs Booked Successfully!
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Ticket IDs: {legs.map((_, i) => `#${legTicketId[i]}`).join(', ')}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {/* Round-trip booking summary */}
          {bothRoundTripSelected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mt-8" padding="md">
                <h3 className="text-xl font-bold mb-4">Round-Trip Summary</h3>

                <div className="space-y-3 mb-6">
                  {/* Outbound */}
                  <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-lg border ${
                    ticketId
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={ticketId ? 'success' : 'primary'}>Outbound</Badge>
                      <span className="font-medium">{source} &rarr; {destination}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{departureDate}</span>
                      {outboundFlight && (
                        <Badge variant="info" size="sm">Flight {outboundFlight.flight_id}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {outboundFlight && (
                        <span className="font-bold text-primary">{formatPrice(outboundFlight.price)}</span>
                      )}
                      {ticketId ? (
                        <Badge variant="success">
                          <Check className="inline w-3 h-3 mr-1" />
                          Ticket #{ticketId}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRoundTripBookingInitiate('outbound')}
                        >
                          Book Outbound
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Return */}
                  <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4 rounded-lg border ${
                    returnTicketId
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={returnTicketId ? 'success' : 'primary'}>Return</Badge>
                      <span className="font-medium">{destination} &rarr; {source}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{returnDate}</span>
                      {returnSelectedFlight && (
                        <Badge variant="info" size="sm">Flight {returnSelectedFlight.flight_id}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {returnSelectedFlight && (
                        <span className="font-bold text-primary">{formatPrice(returnSelectedFlight.price)}</span>
                      )}
                      {returnTicketId ? (
                        <Badge variant="success">
                          <Check className="inline w-3 h-3 mr-1" />
                          Ticket #{returnTicketId}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRoundTripBookingInitiate('return')}
                          disabled={!ticketId}
                        >
                          Book Return
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Total price */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
                  <span className="text-lg font-semibold">Total Round-Trip Price</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(roundTripTotalPrice)}</span>
                </div>

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

                {bothRoundTripBooked && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                    <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="text-lg font-bold text-green-700 dark:text-green-400">
                      Round-Trip Booked Successfully!
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Outbound Ticket: #{ticketId} | Return Ticket: #{returnTicketId}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {showPaymentModal && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentModal
                amount={paymentAmount}
                onClose={() => {
                  setShowPaymentModal(false);
                  setBookingLegIndex(null);
                  setBookingRoundTripLeg(null);
                }}
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
