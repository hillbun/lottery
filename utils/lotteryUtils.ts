import { LotterySet } from '../types';

export const generateRandomSet = (): Omit<LotterySet, 'id' | 'timestamp'> => {
  const reds = new Set<number>();
  while (reds.size < 6) {
    reds.add(Math.floor(Math.random() * 33) + 1);
  }
  
  // Sort red balls numerically
  const sortedReds = Array.from(reds).sort((a, b) => a - b);
  
  const blue = Math.floor(Math.random() * 16) + 1;

  return {
    reds: sortedReds,
    blue,
    source: 'random'
  };
};

export const formatNumber = (num: number): string => {
  return num.toString().padStart(2, '0');
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
