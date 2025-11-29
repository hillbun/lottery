import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LotterySet } from '../types';

interface StatsChartProps {
  history: LotterySet[];
}

export const StatsChart: React.FC<StatsChartProps> = ({ history }) => {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    // Initialize counts for top display
    
    history.forEach(set => {
      set.reds.forEach(num => {
        const key = `R-${num}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
      const key = `B-${set.blue}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    // Convert to array and take top frequently appearing numbers
    const chartData = Array.from(counts.entries())
      .map(([key, count]) => {
        const [type, numStr] = key.split('-');
        return {
          name: numStr,
          count,
          type: type === 'R' ? 'Red' : 'Blue',
          rawNum: parseInt(numStr, 10)
        };
      })
      .sort((a, b) => b.count - a.count) // Sort by frequency
      .slice(0, 15); // Show top 15 numbers

    return chartData;
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
        Generate some numbers to see statistics
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-gray-700 font-semibold mb-4 text-sm">Top Frequent Numbers (Current Session)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.type === 'Red' ? '#ef4444' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
