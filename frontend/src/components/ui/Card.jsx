const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = 'md',
  ...props 
}) => {
  const baseStyles = 'bg-white dark:bg-dark-surface rounded-lg shadow-soft border border-gray-200 dark:border-dark-border transition-all';
  
  const hoverStyles = hover ? 'hover:shadow-elevated hover:-translate-y-0.5' : '';
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-5',
    lg: 'p-6 md:p-8',
  };
  
  return (
    <div
      className={`
        ${baseStyles}
        ${hoverStyles}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
