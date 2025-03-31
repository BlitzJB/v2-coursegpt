import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900',
  secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100',
  success: 'bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900',
  error: 'bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900',
  info: 'bg-purple-100 text-purple-800 dark:bg-purple-200 dark:text-purple-900',
};

export const Badge = ({ children, variant = 'primary', className = '' }: BadgeProps) => {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge; 