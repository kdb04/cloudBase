export const TRIP_TYPES = [
  { value: 'roundtrip', label: 'Round-trip' },
  { value: 'oneway', label: 'One-way' },
  { value: 'multicity', label: 'Multi-city' }
];

export const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' }
];

export const CURRENCIES = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' }
];

export const FLIGHT_STATUSES = {
  scheduled: { label: 'Scheduled', variant: 'info' },
  air: { label: 'In Air', variant: 'success' },
  canceled: { label: 'Canceled', variant: 'danger' },
  landed: { label: 'Landed', variant: 'default' },
  delayed: { label: 'Delayed', variant: 'warning' },
};

export const CONTACT_SUBJECTS = [
  { value: 'booking', label: 'Booking Inquiry' },
  { value: 'support', label: 'Customer Support' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' }
];
