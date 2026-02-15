import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plane, Clock, MapPin, Users, Calendar } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Button, Input, Badge } from '../components/ui';
import { fadeInUp } from '../utils/animations';
import { handleApiResponse } from '../utils/errorHandling';
import { FLIGHT_STATUSES } from '../utils/constants';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { getFormattedFlightDuration, formatTime } from '../utils/dateTime';
import { formatPrice } from '../utils/formatters';

const FlightStatusPage = () => {
  const [flightId, setFlightId] = useState('');
  const [flight, setFlight] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!flightId.trim()) {
      setError('Please enter a flight ID');
      return;
    }

    setLoading(true);
    setError('');
    setFlight(null);

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.FLIGHT_STATUS(flightId.trim())));
      const data = await handleApiResponse(response, 'Flight not found');
      setFlight(data.flight);
    } catch (err) {
      setError(err.message || 'Flight not found. Please check the flight ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = flight?.status ? FLIGHT_STATUSES[flight.status] : null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Flight Status
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track the real-time status of any flight
              </p>
            </div>

            <Card className="mb-8">
              <form onSubmit={handleSearch} className="flex items-center gap-3 w-full">
                <div className="flex-1">
                  <label htmlFor="flight-id-input" className="sr-only">
                    Flight ID
                  </label>
                  <Input
                    id="flight-id-input"
                    type="text"
                    placeholder="Enter Flight ID (e.g. 101)"
                    value={flightId}
                    onChange={(e) => setFlightId(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Searching
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Search
                    </span>
                  )}
                </Button>
              </form>
            </Card>

            {error && (
              <Card className="mb-8 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
              </Card>
            )}

            {flight && (
              <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <Card>
                  <div className="text-center mb-6">
                    <Badge variant="primary" size="lg" className="mb-3">
                      Flight {flight.flight_id}
                    </Badge>
                    {statusInfo && (
                      <div className="mt-3">
                        <Badge variant={statusInfo.variant} size="lg">
                          {statusInfo.label}
                        </Badge>
                      </div>
                    )}
                    {flight.airline_name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {flight.airline_name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-6 px-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatTime(flight.departure)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold mt-1">
                        <MapPin className="inline w-3 h-3 mr-1" />
                        {flight.source}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-4">
                      <div className="text-xs text-gray-500 mb-1">
                        <Clock className="inline mr-1 w-3 h-3" />
                        {flight.departure && flight.arrival
                          ? getFormattedFlightDuration(flight.departure, flight.arrival)
                          : '--'}
                      </div>
                      <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600 relative">
                        <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary w-4 h-4" />
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatTime(flight.arrival)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 uppercase font-semibold mt-1">
                        <MapPin className="inline w-3 h-3 mr-1" />
                        {flight.destination}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    {flight.date && (
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Date
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(flight.date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    {flight.available_seats != null && (
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Available Seats
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {flight.available_seats}
                        </div>
                      </div>
                    )}
                    {flight.price != null && (
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Price</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatPrice(flight.price)}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default FlightStatusPage;
