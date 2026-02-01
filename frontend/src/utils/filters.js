export const SORT_OPTIONS = {
  RECOMMENDED: 'recommended',
  CHEAPEST: 'cheapest',
  FASTEST: 'fastest'
};

export const sortFlights = (flights, sortBy = 'recommended') => {
  const sorted = [...flights];
  switch (sortBy) {
    case 'cheapest':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'fastest':
      return sorted.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    default:
      return sorted;
  }
};
