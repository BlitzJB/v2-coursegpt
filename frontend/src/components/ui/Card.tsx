import { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
};

export const Card = ({ 
  children, 
  onClick, 
  className = '',
  hoverable = true
}: CardProps) => {
  const hoverClass = hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : '';
  
  return (
    <div 
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 transition duration-200 bg-white dark:bg-gray-800 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card; 