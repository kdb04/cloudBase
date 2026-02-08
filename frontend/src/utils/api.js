export const API_BASE_URL = 'http://localhost:3000/api';

export const ENDPOINTS = {
  // Booking
  AVAILABLE_FLIGHTS: '/bookings/available-flights',
  CREATE_BOOKING: '/bookings',
  CANCEL_BOOKING: (ticketId) => `/bookings/${ticketId}`,
  ALTERNATE_FLIGHTS: '/bookings/alternate-flights',
  // Payment
  CREATE_INTENT: '/payment/create-intent',
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
  EDIT_SCHEDULE: '/admin/edit-schedule'
};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
