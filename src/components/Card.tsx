import React, { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, hover = false, gradient = false }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 transition-all duration-300',
        hover && 'hover:shadow-xl hover:-translate-y-1 cursor-pointer',
        gradient && 'bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;