import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaneTakeoff, PlaneLanding, Calendar, Ticket, X, Clock } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Badge, Button } from '../components/ui';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { getAuthToken, getAuthHeaders } from '../utils/auth';

const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
};

const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr.substring(0, 5);
};

const isUpcoming = (ticket) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const flightDate = new Date(ticket.date);
    flightDate.setHours(0, 0, 0, 0);
    return flightDate >= today && ticket.flight_status !== 'canceled';
};

const TicketCard = ({ ticket, onCancel }) => {
    const upcoming = isUpcoming(ticket);
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async () => {
        if (!window.confirm(`Cancel ticket #${ticket.ticket_id}? This action cannot be undone.`)) return;
        setCancelling(true);
        try {
            const res = await fetch(getApiUrl(ENDPOINTS.CANCEL_BOOKING(ticket.ticket_id)), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!res.ok) {
                let message = 'Failed to cancel ticket';
                try {
                    const data = await res.json();
                    message = data.message || message;
                } catch {
                    // Ignore non-JSON responses
                }
                alert(message);
                return;
            }
            onCancel(ticket.ticket_id);
        } catch {
            alert('Network error. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            #{ticket.ticket_id}
                        </span>
                        {ticket.airline_name && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                · {ticket.airline_name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5">
                            <PlaneTakeoff className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                                {ticket.source}
                            </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-1.5">
                            <PlaneLanding className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                                {ticket.destination}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(ticket.date)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Dep </span>
                            {formatTime(ticket.departure)}
                            {ticket.arrival && (
                                <>
                                    <span className="text-gray-400"> · Arr </span>
                                    {formatTime(ticket.arrival)}
                                </>
                            )}
                        </div>
                        <div>
                            <span className="text-gray-400">Class </span>
                            <span className="capitalize">{ticket.class || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Seat </span>
                            {ticket.seat_no || 'N/A'}
                        </div>
                    </div>

                    {ticket.food_preference && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Food: {ticket.food_preference}
                        </p>
                    )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant={ticket.payment_status === 'Paid' ? 'success' : 'warning'}>
                            {ticket.payment_status}
                        </Badge>
                        {ticket.amount_paid != null && (
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                ₹{Number(ticket.amount_paid).toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    {upcoming && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="flex items-center gap-1"
                        >
                            <X className="w-3.5 h-3.5" />
                            {cancelling ? 'Cancelling…' : 'Cancel'}
                        </Button>
                    )}

                    {!upcoming && ticket.flight_status === 'canceled' && (
                        <Badge variant="danger">Flight Cancelled</Badge>
                    )}
                </div>
            </div>
        </Card>
    );
};

const WAITLIST_STATUS_VARIANT = {
    waiting: 'warning',
    confirmed: 'success',
    cancelled: 'danger',
    expired: 'secondary',
};

const WaitlistCard = ({ entry, onLeave }) => {
    const [leaving, setLeaving] = useState(false);
    const canLeave = entry.status === 'waiting' || entry.status === 'confirmed';

    const handleLeave = async () => {
        if (!window.confirm('Remove yourself from this waitlist?')) return;
        setLeaving(true);
        try {
            const res = await fetch(getApiUrl(ENDPOINTS.LEAVE_WAITLIST(entry.waitlist_id)), {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!res.ok) {
                let message = 'Failed to leave waitlist';
                try { const d = await res.json(); message = d.message || message; } catch { /* ignore */ }
                alert(message);
                return;
            }
            onLeave(entry.waitlist_id);
        } catch {
            alert('Network error. Please try again.');
        } finally {
            setLeaving(false);
        }
    };

    return (
        <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            Waitlist #{entry.waitlist_id}
                        </span>
                        {entry.airline_name && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                · {entry.airline_name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5">
                            <PlaneTakeoff className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                                {entry.source}
                            </span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-1.5">
                            <PlaneLanding className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                                {entry.destination}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(entry.date)}</span>
                        </div>
                        <div>
                            <span className="text-gray-400">Class </span>
                            <span className="capitalize">{entry.class || 'Any'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Requested {formatDate(entry.requested_at)}</span>
                        </div>
                    </div>

                    {entry.status === 'confirmed' && (
                        <p className="mt-3 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-3 py-2">
                            A seat is available! Book now before it expires.
                        </p>
                    )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
                    <Badge variant={WAITLIST_STATUS_VARIANT[entry.status] || 'secondary'}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Badge>
                    {canLeave && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleLeave}
                            disabled={leaving}
                            className="flex items-center gap-1"
                        >
                            <X className="w-3.5 h-3.5" />
                            {leaving ? 'Leaving…' : 'Leave'}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

const MyBookingsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [waitlist, setWaitlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            navigate('/login');
            return;
        }

        const controller = new AbortController();
        const opts = { headers: getAuthHeaders(), signal: controller.signal };

        Promise.all([
            fetch(getApiUrl(ENDPOINTS.MY_TICKETS), opts).then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            }),
            fetch(getApiUrl(ENDPOINTS.MY_WAITLIST), opts).then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            }),
        ])
            .then(([ticketData, waitlistData]) => {
                setTickets(ticketData.tickets || []);
                setWaitlist(waitlistData.waitlist || []);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error('[ERROR]: Failed to fetch bookings:', err);
                    setError(err.message);
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [navigate]);

    const handleCancelled = (ticketId) => {
        setTickets((prev) => prev.filter((t) => t.ticket_id !== ticketId));
    };

    const handleWaitlistLeave = (waitlistId) => {
        setWaitlist((prev) => prev.filter((w) => w.waitlist_id !== waitlistId));
    };

    const upcoming = tickets.filter(isUpcoming);
    const past = tickets.filter((t) => !isUpcoming(t));

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <Ticket className="w-7 h-7 text-primary" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
                </div>

                {loading && (
                    <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                        Loading your bookings…
                    </div>
                )}

                {error && (
                    <div className="text-center py-16 text-red-600 dark:text-red-400">
                        Failed to load bookings: {error}
                    </div>
                )}

                {!loading && !error && tickets.length === 0 && (
                    <div className="text-center py-16">
                        <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No bookings yet.</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                            Search for flights to get started.
                        </p>
                        <Button
                            variant="primary"
                            className="mt-6"
                            onClick={() => navigate('/booking')}
                        >
                            Search Flights
                        </Button>
                    </div>
                )}

                {!loading && !error && waitlist.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                            Waitlist ({waitlist.length})
                        </h2>
                        <div className="flex flex-col gap-4">
                            {waitlist.map((w) => (
                                <WaitlistCard key={w.waitlist_id} entry={w} onLeave={handleWaitlistLeave} />
                            ))}
                        </div>
                    </section>
                )}

                {!loading && !error && upcoming.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                            Upcoming ({upcoming.length})
                        </h2>
                        <div className="flex flex-col gap-4">
                            {upcoming.map((t) => (
                                <TicketCard key={t.ticket_id} ticket={t} onCancel={handleCancelled} />
                            ))}
                        </div>
                    </section>
                )}

                {!loading && !error && past.length > 0 && (
                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                            Past / Cancelled ({past.length})
                        </h2>
                        <div className="flex flex-col gap-4 opacity-75">
                            {past.map((t) => (
                                <TicketCard key={t.ticket_id} ticket={t} onCancel={handleCancelled} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
};

export default MyBookingsPage;
