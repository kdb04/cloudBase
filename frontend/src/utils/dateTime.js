/**
 * Extracts "HH:MM" from various time formats:
 * - "14:30:00" (MySQL TIME)
 * - "14:30" (already short)
 * - "2026-02-15T14:30:00Z" (ISO timestamp)
 */
export const formatTime = (timeStr, fallback = '--:--') => {
  if (!timeStr) return fallback;

  // ISO timestamp — parse and extract hours/minutes
  if (timeStr.includes('T')) {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return fallback;
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // "HH:MM" or "HH:MM:SS" — extract first 5 characters
  const match = timeStr.match(/^(\d{1,2}:\d{2})/);
  return match ? match[1].padStart(5, '0') : fallback;
};

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
