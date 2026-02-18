import { calculateFlightDuration } from './dateTime';

export const SORT_OPTIONS = {
  RECOMMENDED: 'recommended',
  CHEAPEST: 'cheapest',
  FASTEST: 'fastest'
};

const getDurationMinutes = (flight) => {
  if (!flight.departure || !flight.arrival) return Infinity;
  const { hours, minutes } = calculateFlightDuration(flight.departure, flight.arrival);
  return hours * 60 + minutes;
};

export const sortFlights = (flights, sortBy = 'recommended') => {
  const sorted = [...flights];
  switch (sortBy) {
    case 'cheapest':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'fastest':
      return sorted.sort((a, b) => getDurationMinutes(a) - getDurationMinutes(b));
    default:
      return sorted;
  }
};

export const filterFlights = (flights, { minPrice = '', maxPrice = '' } = {}) => {
  let filtered = flights;

  // Price range filter (client-side, supplements backend filtering)
  const min = minPrice !== '' ? Number(minPrice) : null;
  const max = maxPrice !== '' ? Number(maxPrice) : null;

  if (min !== null) {
    filtered = filtered.filter((f) => (f.price || 0) >= min);
  }
  if (max !== null) {
    filtered = filtered.filter((f) => (f.price || 0) <= max);
  }

  return filtered;
};
