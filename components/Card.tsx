
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // FIX: Add onClick prop to allow Card components to be clickable.
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div onClick={onClick} className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${className} relative`}>
      {children}
    </div>
  );
};