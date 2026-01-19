import { useState } from 'react';

const Select = ({ 
  label, 
  options = [],
  value,
  onChange,
  error,
  className = '',
  wrapperClassName = '',
  ...props 
}) => {
  return (
    <div className={`${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`
          block w-full rounded-md border border-gray-300 dark:border-gray-600
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          focus:ring-2 focus:ring-primary focus:border-primary
          transition-colors
          px-3 py-2
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select;
