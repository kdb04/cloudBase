import { useState, useEffect, useMemo } from 'react';
import { getApiUrl, ENDPOINTS } from '../../utils/api';
import { formatPrice } from '../../utils/formatters';

const CLASS_MULTIPLIERS = { first: 2.0, business: 1.5, economy: 1.0 };

const SEAT_LAYOUT = [
  { className: 'first', label: 'First Class', rows: 2, seatsPerRow: 4, startSeat: 1, aisleAfter: 2 },
  { className: 'business', label: 'Business Class', rows: 5, seatsPerRow: 6, startSeat: 9, aisleAfter: 3 },
  { className: 'economy', label: 'Economy Class', rows: 18, seatsPerRow: 6, startSeat: 39, aisleAfter: 3 },
];

const seatColorMap = {
  available: 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/10 text-gray-700 dark:text-gray-300',
  selected: 'bg-green-500 border-green-500 text-white',
  taken: 'bg-gray-200 dark:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed',
  locked: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50',
};

/**
 * @param {string} flightId
 * @param {number[]} selectedSeats - array of selected seat numbers
 * @param {function} onSeatsChange - callback(seats: {seatNo, className, multiplier}[])
 * @param {number} basePrice
 * @param {string} allowedClass - 'first' | 'business' | 'economy'
 * @param {number} maxSeats - max seats user can select (= passenger count)
 */
const SeatMap = ({ flightId, selectedSeats = [], onSeatsChange = () => {}, basePrice = 0, allowedClass = 'economy', maxSeats = 1 }) => {
  const [takenSeats, setTakenSeats] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!flightId) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(getApiUrl(ENDPOINTS.TAKEN_SEATS(flightId)), {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setTakenSeats(new Set(data.takenSeats || []));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Error fetching taken seats:', err);
          setError('Failed to load seat availability');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [flightId, retryCount]);

  const selectedSet = useMemo(() => new Set(selectedSeats.map(s => s.seatNo)), [selectedSeats]);

  const sections = useMemo(() => {
    return SEAT_LAYOUT.map(section => {
      const rows = [];
      let seatNum = section.startSeat;
      for (let r = 0; r < section.rows; r++) {
        const rowSeats = [];
        for (let s = 0; s < section.seatsPerRow; s++) {
          rowSeats.push(seatNum++);
        }
        rows.push(rowSeats);
      }
      return { ...section, rows };
    });
  }, []);

  const getRowLabel = (sectionIndex, rowIndex) => {
    let rowNum = rowIndex + 1;
    for (let i = 0; i < sectionIndex; i++) {
      rowNum += SEAT_LAYOUT[i].rows;
    }
    return rowNum;
  };

  const handleSeatClick = (seatNum, className, multiplier) => {
    if (takenSeats.has(seatNum) || className !== allowedClass) return;

    if (selectedSet.has(seatNum)) {
      // Deselect
      onSeatsChange(selectedSeats.filter(s => s.seatNo !== seatNum));
    } else if (selectedSeats.length < maxSeats) {
      // Select
      onSeatsChange([...selectedSeats, { seatNo: seatNum, className, multiplier }]);
    }
  };

  const getSeatState = (seatNum, sectionClass) => {
    if (takenSeats.has(seatNum)) return 'taken';
    if (selectedSet.has(seatNum)) return 'selected';
    if (sectionClass !== allowedClass) return 'locked';
    if (selectedSeats.length >= maxSeats) return 'locked';
    return 'available';
  };

  const multiplier = CLASS_MULTIPLIERS[allowedClass] || 1.0;
  const totalPrice = selectedSeats.length * Math.round(basePrice * multiplier);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
        Loading seat map...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-700 dark:text-red-300 mb-2">{error}</p>
        <button
          onClick={() => {setRetryCount(prev => prev + 1)}}
          className="text-sm text-primary hover:underline font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection counter */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 px-1">
        <span>
          {selectedSeats.length} of {maxSeats} seat{maxSeats > 1 ? 's' : ''} selected
        </span>
        {selectedSeats.length > 0 && (
          <button
            onClick={() => onSeatsChange([])}
            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Seat grid */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 md:p-6 overflow-x-auto">
        {/* Plane nose */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-t-full"></div>
        </div>

        {sections.map((section, sectionIndex) => {
          const sectionMultiplier = CLASS_MULTIPLIERS[section.className];
          const sectionPrice = Math.round(basePrice * sectionMultiplier);
          const isAllowed = section.className === allowedClass;

          return (
            <div key={section.className} className={`mb-6 ${isAllowed ? '' : 'opacity-40'}`}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-3 px-2">
                <h4 className={`text-sm font-semibold ${isAllowed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                  {section.label}
                  {isAllowed && (
                    <span className="ml-2 text-xs font-normal text-primary">
                      (Your class)
                    </span>
                  )}
                </h4>
                {basePrice > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(sectionPrice)} ({sectionMultiplier}x)
                  </span>
                )}
              </div>

              {/* Rows */}
              <div className="space-y-1.5">
                {section.rows.map((rowSeats, rowIndex) => (
                  <div key={rowIndex} className="flex items-center justify-center gap-1">
                    <span className="w-6 text-xs text-gray-400 text-right mr-1">
                      {getRowLabel(sectionIndex, rowIndex)}
                    </span>

                    {rowSeats.map((seatNum, seatIndex) => {
                      const state = getSeatState(seatNum, section.className);
                      return (
                        <div key={seatNum} className="flex items-center">
                          {seatIndex === section.aisleAfter && (
                            <div className="w-4 md:w-6"></div>
                          )}
                          <button
                            disabled={state === 'taken' || state === 'locked'}
                            onClick={() => handleSeatClick(seatNum, section.className, sectionMultiplier)}
                            className={`w-7 h-7 md:w-8 md:h-8 rounded text-xs font-medium border-2 transition-all ${seatColorMap[state]}`}
                            title={
                              state === 'taken' ? `Seat ${seatNum} - Taken`
                              : state === 'locked' ? `Seat ${seatNum} - ${section.label} (select ${allowedClass} class)`
                              : state === 'selected' ? `Seat ${seatNum} - Click to deselect`
                              : `Seat ${seatNum} - ${section.label}`
                            }
                          >
                            {seatNum}
                          </button>
                        </div>
                      );
                    })}

                    <span className="w-6"></span>
                  </div>
                ))}
              </div>

              {sectionIndex < sections.length - 1 && (
                <div className="border-t border-dashed border-gray-300 dark:border-gray-600 mt-4 pt-2"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-green-500 border-2 border-green-500"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-700"></div>
          <span>Taken</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 opacity-50"></div>
          <span>Other Class</span>
        </div>
      </div>

      {/* Selected seats summary */}
      {selectedSeats.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              <span>Seats: </span>
              {selectedSeats.map((s, i) => (
                <span key={s.seatNo}>
                  {i > 0 && ', '}
                  <span className="inline-flex items-center bg-green-100 dark:bg-green-800/40 px-2 py-0.5 rounded text-xs font-bold">
                    {s.seatNo}
                  </span>
                </span>
              ))}
            </div>
            {basePrice > 0 && (
              <div className="text-sm font-bold text-green-700 dark:text-green-300">
                Total: {formatPrice(totalPrice)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { CLASS_MULTIPLIERS, SEAT_LAYOUT };
export default SeatMap;
