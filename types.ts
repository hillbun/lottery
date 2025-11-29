export interface LotterySet {
  id: string;
  reds: number[];
  blue: number;
  timestamp: number;
  source: 'random' | 'ai';
  aiReasoning?: string;
}

export interface NumberStat {
  number: number;
  count: number;
  type: 'red' | 'blue';
}

export enum BallType {
  RED = 'RED',
  BLUE = 'BLUE'
}
