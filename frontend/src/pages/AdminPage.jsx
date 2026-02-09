import { useState, useEffect } from 'react';
import { TrendingUp, Route, Pencil, Plane, Clock, MapPin, Plus, Trash2, X, DollarSign, Users, Hash } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Button, Input, Badge } from '../components/ui';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { getAuthHeaders } from '../utils/auth';
import { formatPrice } from '../utils/formatters';

const EMPTY_FORM = {
  flight_id: '',
  airline_id: '',
  status: 'scheduled',
  source: '',
  destination: '',
  departure: '',
  arrival: '',
  available_seats: '',
  price: '',
  date: '',
  runway_no: '',
};

function AdminPage() {
  const [flights, setFlights] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingFlightId, setEditingFlightId] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);

  const showMessage = (message, type = 'success') => {
    setResponseMessage(message);
    setMessageType(type);
  };

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(ENDPOINTS.ADMIN_FLIGHTS), {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch flights');
      const data = await response.json();
      setFlights(data.flights || []);
    } catch (err) {
      console.error('Error fetching flights:', err);
      showMessage('Error fetching flights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingFlightId(null);
  };

  const handleEditClick = (flight) => {
    setEditingFlightId(flight.flight_id);
    setForm({
      flight_id: flight.flight_id,
      airline_id: flight.airline_id || '',
      status: flight.status || 'scheduled',
      source: flight.source || '',
      destination: flight.destination || '',
      departure: flight.departure ? flight.departure.slice(0, 5) : '',
      arrival: flight.arrival ? flight.arrival.slice(0, 5) : '',
      available_seats: flight.available_seats ?? '',
      price: flight.price ?? '',
      date: flight.date ? new Date(flight.date).toISOString().split('T')[0] : '',
      runway_no: flight.runway_no ?? '',
    });
    window.scrollTo({ top: document.getElementById('flight-form')?.offsetTop - 20, behavior: 'smooth' });
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.EDIT_SCHEDULE), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create flight');
      showMessage(data.message || 'Flight created successfully');
      resetForm();
      fetchFlights();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      const { flight_id, ...updates } = form;
      const response = await fetch(getApiUrl(ENDPOINTS.ADMIN_UPDATE_FLIGHT(editingFlightId)), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update flight');
      showMessage(data.message || 'Flight updated successfully');
      resetForm();
      fetchFlights();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleDelete = async (flightId) => {
    if (!window.confirm(`Delete flight ${flightId}? This cannot be undone.`)) return;
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.ADMIN_DELETE_FLIGHT(flightId)), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete flight');
      showMessage(data.message || 'Flight deleted successfully');
      if (editingFlightId === flightId) resetForm();
      fetchFlights();
    } catch (err) {
      showMessage(err.message, 'error');
    }
  };

  const handleSubmit = () => {
    if (editingFlightId) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleDynamicPricing = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.DYNAMIC_PRICING), {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update pricing');
      showMessage(data.message || 'Dynamic price updated');
    } catch (err) {
      showMessage(err.message || 'Error updating dynamic pricing', 'error');
    }
  };

  const handleMonitorRoutes = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.MONITOR_ROUTES), {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to monitor routes');
      showMessage(data.message || 'Routes monitored successfully');
    } catch (err) {
      showMessage(err.message || 'Error monitoring routes', 'error');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'air': return 'success';
      case 'canceled': return 'danger';
      default: return 'default';
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
              className={`mb-8 p-4 rounded-lg border flex justify-between items-center ${
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
              <button onClick={() => setResponseMessage('')} className="p-1 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Flight Form */}
          <Card padding="lg" className="mb-8" id="flight-form">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  {editingFlightId ? <Pencil className="w-8 h-8 text-warning" /> : <Plus className="w-8 h-8 text-warning" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {editingFlightId ? `Edit Flight ${editingFlightId}` : 'Add New Flight'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {editingFlightId ? 'Update flight details below' : 'Fill in flight details to create a new schedule'}
                  </p>
                </div>
              </div>
              {editingFlightId && (
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4 mr-1" /> Cancel Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <Input
                label="Flight ID"
                icon={Plane}
                type="text"
                placeholder="e.g., 101"
                value={form.flight_id}
                onChange={(e) => updateField('flight_id', e.target.value)}
                disabled={!!editingFlightId}
              />
              <Input
                label="Airline ID"
                icon={Hash}
                type="text"
                placeholder="e.g., 1"
                value={form.airline_id}
                onChange={(e) => updateField('airline_id', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="air">In Air</option>
                  <option value="canceled">Cancelled</option>
                </select>
              </div>
              <Input
                label="Source"
                icon={MapPin}
                type="text"
                placeholder="e.g., DEL"
                value={form.source}
                onChange={(e) => updateField('source', e.target.value)}
              />
              <Input
                label="Destination"
                icon={MapPin}
                type="text"
                placeholder="e.g., BOM"
                value={form.destination}
                onChange={(e) => updateField('destination', e.target.value)}
              />
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
              />
              <Input
                label="Departure"
                icon={Clock}
                type="time"
                value={form.departure}
                onChange={(e) => updateField('departure', e.target.value)}
              />
              <Input
                label="Arrival"
                icon={Clock}
                type="time"
                value={form.arrival}
                onChange={(e) => updateField('arrival', e.target.value)}
              />
              <Input
                label="Runway"
                type="text"
                placeholder="e.g., 1"
                value={form.runway_no}
                onChange={(e) => updateField('runway_no', e.target.value)}
              />
              <Input
                label="Available Seats"
                icon={Users}
                type="number"
                min="0"
                placeholder="e.g., 180"
                value={form.available_seats}
                onChange={(e) => updateField('available_seats', e.target.value)}
              />
              <Input
                label="Price"
                icon={DollarSign}
                type="number"
                min="0"
                placeholder="e.g., 5000"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
              />
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={handleSubmit} size="lg">
                {editingFlightId ? (
                  <><Pencil className="mr-2 w-5 h-5" /> Update Flight</>
                ) : (
                  <><Plus className="mr-2 w-5 h-5" /> Add Flight</>
                )}
              </Button>
              {editingFlightId && (
                <Button variant="outline" size="lg" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </Card>

          {/* Flights Table */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">All Flights</h2>
              <Badge variant="primary" size="md">{flights.length} flights</Badge>
            </div>

            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading flights...</p>
            ) : flights.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No flights found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Flight</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Route</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Time</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Seats</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Price</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Runway</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((flight) => (
                      <tr
                        key={flight.flight_id}
                        className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                          editingFlightId === flight.flight_id ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold">{flight.flight_id}</td>
                        <td className="py-3 px-3">{flight.source} &rarr; {flight.destination}</td>
                        <td className="py-3 px-3">{flight.date ? new Date(flight.date).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-3 px-3">
                          {flight.departure ? flight.departure.slice(0, 5) : '—'} - {flight.arrival ? flight.arrival.slice(0, 5) : '—'}
                        </td>
                        <td className="py-3 px-3">{flight.available_seats}</td>
                        <td className="py-3 px-3 font-semibold text-primary">{formatPrice(flight.price)}</td>
                        <td className="py-3 px-3">
                          <Badge variant={statusColor(flight.status)} size="sm">
                            {flight.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">{flight.runway_no}</td>
                        <td className="py-3 px-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(flight)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(flight.flight_id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default AdminPage;
