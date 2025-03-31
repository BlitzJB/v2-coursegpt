import { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export const Container = ({ children, className = '' }: ContainerProps) => {
  return (
    <div className={`container mx-auto px-1.5 sm:px-2 lg:px-8 max-w-6xl ${className}`}>
      {children}
    </div>
  );
};

export default Container; 