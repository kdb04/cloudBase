export const API_BASE_URL = 'http://localhost:3000/api';

export const ENDPOINTS = {
  // Booking
  LOCATIONS: '/bookings/locations',
  AVAILABLE_FLIGHTS: '/bookings/available-flights',
  CREATE_BOOKING: '/bookings',
  CANCEL_BOOKING: (ticketId) => `/bookings/${ticketId}`,
  ALTERNATE_FLIGHTS: '/bookings/alternate-flights',
  FLIGHT_STATUS: (flightId) => `/bookings/flight-status/${flightId}`,
  TAKEN_SEATS: (flightId) => `/bookings/taken-seats/${flightId}`,
  MY_TICKETS: '/bookings/my-tickets',
  MY_WAITLIST: '/bookings/my-waitlist',
  LOYALTY: '/bookings/loyalty',
  JOIN_WAITLIST: '/bookings/waitlist',
  LEAVE_WAITLIST: (id) => `/bookings/waitlist/${id}`,
  // Payment
  CREATE_INTENT: '/payment/create-intent',
  ROUND_TRIP_INTENT: '/payment/create-round-trip-intent',
  // Auth
  LOGIN: '/login',
  SIGNUP: '/login/signup',
  LOGOUT: '/login/logout',
  // Forgot Password
  SEND_OTP: '/forgot-password/send-otp',
  VERIFY_OTP: '/forgot-password/verify-otp',
  RESET_PASSWORD: '/forgot-password/reset-password',
  // Contact
  CONTACT_SEND: '/contact/send',
  // Admin
  DYNAMIC_PRICING: '/admin/dynamic-pricing',
  MONITOR_ROUTES: '/admin/monitor-routes',
  EDIT_SCHEDULE: '/admin/edit-schedule',
  ADMIN_FLIGHTS: '/admin/flights',
  ADMIN_UPDATE_FLIGHT: (flightId) => `/admin/flights/${flightId}`,
  ADMIN_DELETE_FLIGHT: (flightId) => `/admin/flights/${flightId}`
};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
