import { motion } from 'framer-motion';

interface ArrowProps {
  direction: 'left' | 'right' | 'up' | 'down';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-indigo-600',
  white: 'text-white',
  gray: 'text-gray-600',
};

const arrowPaths = {
  left: 'M15 19l-7-7 7-7',
  right: 'M9 5l7 7-7 7',
  up: 'M19 14l-7-7-7 7',
  down: 'M5 10l7 7 7-7',
};

export const ArrowIcon = ({
  direction,
  size = 'md',
  color = 'primary',
  animated = true,
  className = '',
}: ArrowProps) => {
  const baseClasses = `${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  if (animated) {
    return (
      <motion.svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={baseClasses}
        whileHover={{ x: direction === 'left' ? -3 : direction === 'right' ? 3 : 0, y: direction === 'up' ? -3 : direction === 'down' ? 3 : 0 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <path d={arrowPaths[direction]} />
      </motion.svg>
    );
  }

  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={baseClasses}
    >
      <path d={arrowPaths[direction]} />
    </svg>
  );
};
