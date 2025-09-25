import React, { ReactNode } from 'react';

// Fix: Extend standard div props to allow `onClick` and other attributes.
// Omit 'children' to redefine it as a required prop for the Card component.
interface CardProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
