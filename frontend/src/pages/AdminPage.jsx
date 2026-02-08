import { useState } from 'react';
import { TrendingUp, Route, Pencil, Plane, Clock, MapPin } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';
import { ENDPOINTS } from '../utils/api';
import { formatPrice } from '../utils/formatters';

function AdminPage() {
  const [flightId, setFlightId] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newTime, setNewTime] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [runwayNo, setRunwayNo] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [alternativeFlights, setAlternativeFlights] = useState([]);
  const [messageType, setMessageType] = useState('success');

  const handleDynamicPricing = async () => {
    try {
      const response = await fetch(ENDPOINTS.DYNAMIC_PRICING, {
        method: 'POST',
      });
      const data = await response.json();
      setResponseMessage(data.message || 'Dynamic price updated');
      setMessageType('success');
    } catch (err) {
      setResponseMessage('Error updating dynamic pricing');
      setMessageType('error');
      console.error('Dynamic pricing error:', err);
    }
  };

  const handleMonitorRoutes = async () => {
    try {
      const response = await fetch(ENDPOINTS.MONITOR_ROUTES);
      const data = await response.json();
      setResponseMessage(data.message || 'Routes monitored successfully');
      setMessageType('success');
    } catch (err) {
      setResponseMessage('Error monitoring routes');
      setMessageType('error');
      console.error('Monitor routes error:', err);
    }
  };

  const handleEditSchedule = async () => {
    try {
      const response = await fetch(ENDPOINTS.EDIT_SCHEDULE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flight_id: flightId,
          new_source: newSource,
          new_destination: newDestination,
          new_time: newTime,
          departure_time: departureDate,
          runway_no: runwayNo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      setResponseMessage(data.message || 'Schedule updated successfully');
      setMessageType('success');
      setAlternativeFlights(data.alternatives || []);
    } catch (err) {
      setResponseMessage('Error updating flight schedule');
      setMessageType('error');
      console.error('Edit schedule error', err);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent min-h-screen">
        <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage flights, routes, and pricing
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card hover padding="lg" className="cursor-pointer" onClick={handleDynamicPricing}>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Dynamic Pricing</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Update flight prices based on demand and availability
                  </p>
                  <Button variant="primary" size="sm">
                    Run Dynamic Pricing
                  </Button>
                </div>
              </div>
            </Card>

            <Card hover padding="lg" className="cursor-pointer" onClick={handleMonitorRoutes}>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Route className="w-8 h-8 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">Monitor Routes</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    View and analyze current flight routes and performance
                  </p>
                  <Button variant="primary" size="sm">
                    Monitor Routes
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Response Message */}
          {responseMessage && (
            <div
              className={`mb-8 p-4 rounded-lg border ${
                messageType === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <p
                className={`font-medium ${
                  messageType === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {responseMessage}
              </p>
            </div>
          )}

          {/* Edit Schedule Form */}
          <Card padding="lg" className="mb-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Pencil className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Edit Flight Schedule</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Update flight details and routing information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Flight ID"
                icon={Plane}
                type="text"
                placeholder="e.g., FL001"
                value={flightId}
                onChange={(e) => setFlightId(e.target.value)}
              />

              <Input
                label="Runway Number"
                type="text"
                placeholder="e.g., RW01"
                value={runwayNo}
                onChange={(e) => setRunwayNo(e.target.value)}
              />

              <Input
                label="New Source"
                icon={MapPin}
                type="text"
                placeholder="e.g., DEL"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
              />

              <Input
                label="New Destination"
                icon={MapPin}
                type="text"
                placeholder="e.g., BOM"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
              />

              <Input
                label="New Time"
                icon={Clock}
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />

              <Input
                label="Departure Date"
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>

            <div className="mt-6">
              <Button onClick={handleEditSchedule} size="lg">
                <Pencil className="mr-2" />
                Update Flight Schedule
              </Button>
            </div>
          </Card>

          {/* Alternative Flights */}
          {alternativeFlights.length > 0 && (
            <Card padding="lg">
              <h3 className="text-xl font-bold mb-4">Alternative Flights</h3>
              <div className="space-y-4">
                {alternativeFlights.map((flight, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-800/50" padding="md">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Flight ID:</span>
                        <p className="font-semibold">{flight.flight_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Airline:</span>
                        <p className="font-semibold">{flight.airline_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Departure:</span>
                        <p className="font-semibold">{flight.departure}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Arrival:</span>
                        <p className="font-semibold">{flight.arrival}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Available Seats:</span>
                        <p className="font-semibold">{flight.available_seats}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Price:</span>
                        <p className="font-semibold text-primary">{formatPrice(flight.price)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminPage;
