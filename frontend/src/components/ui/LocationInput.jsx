import { useState, useEffect, useRef } from 'react';
import { getApiUrl, ENDPOINTS } from '../../utils/api';

const LocationInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  className = '',
  wrapperClassName = '',
  onFocus,
  ...props
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch suggestions whenever value changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!value || value.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${getApiUrl(ENDPOINTS.LOCATIONS)}?q=${encodeURIComponent(value)}`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.locations || []);
        setOpen((data.locations || []).length > 0);
        setHighlighted(-1);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 200);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (city) => {
    onChange({ target: { value: city } });
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      select(suggestions[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${wrapperClassName}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`
            block w-full rounded-md border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:ring-primary focus:border-primary
            transition-colors
            ${Icon ? 'pl-10' : 'pl-3'}
            pr-3 py-2
            ${className}
          `}
          {...props}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-52 overflow-y-auto">
          {suggestions.map((city, i) => (
            <li
              key={city}
              onMouseDown={() => select(city)}
              onMouseEnter={() => setHighlighted(i)}
              className={`px-4 py-2 cursor-pointer text-sm text-gray-900 dark:text-gray-100 ${
                highlighted === i
                  ? 'bg-primary/10 text-primary dark:text-primary'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;
