import React from 'react';
import { BallType } from '../types';
import { formatNumber } from '../utils/lotteryUtils';

interface BallProps {
  number: number;
  type: BallType;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export const Ball: React.FC<BallProps> = ({ number, type, size = 'md', animate = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-14 h-14 text-xl font-bold',
  };

  const colorClasses = type === BallType.RED
    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-700'
    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-700';

  const animationClass = animate ? 'animate-bounce' : '';

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses}
        ${animationClass}
        rounded-full flex items-center justify-center
        lottery-ball-shadow border border-opacity-20
        select-none shadow-md
        transition-transform hover:scale-110
      `}
    >
      {formatNumber(number)}
    </div>
  );
};
