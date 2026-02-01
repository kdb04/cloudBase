export const calculateFlightDuration = (departureTime, arrivalTime) => {
  if (!departureTime || !arrivalTime) return { hours: 0, minutes: 0 };

  const [depH, depM] = departureTime.split(':').map(Number);
  const [arrH, arrM] = arrivalTime.split(':').map(Number);

  let diffMins = (arrH * 60 + arrM) - (depH * 60 + depM);
  if (diffMins < 0) diffMins += 24 * 60; // overnight flight

  return {
    hours: Math.floor(diffMins / 60),
    minutes: diffMins % 60
  };
};

export const formatDuration = (hours, minutes) => `${hours}h ${minutes}m`;

export const getFormattedFlightDuration = (departure, arrival) => {
  const { hours, minutes } = calculateFlightDuration(departure, arrival);
  return formatDuration(hours, minutes);
};
