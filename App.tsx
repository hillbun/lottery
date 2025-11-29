import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, Sparkles, History as HistoryIcon, BarChart3, Ticket } from 'lucide-react';
import { Ball } from './components/Ball';
import { StatsChart } from './components/StatsChart';
import { AIModal } from './components/AIModal';
import { LotterySet, BallType } from './types';
import { generateRandomSet, generateId, formatNumber } from './utils/lotteryUtils';
import { generateAILuckyNumbers } from './services/geminiService';

const App: React.FC = () => {
  const [history, setHistory] = useState<LotterySet[]>([]);
  const [latestBatch, setLatestBatch] = useState<LotterySet[]>([]);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const statsRef = useRef<HTMLDivElement>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const createSet = (base: Omit<LotterySet, 'id' | 'timestamp'>): LotterySet => ({
    ...base,
    id: generateId(),
    timestamp: Date.now(),
  });

  const handleGenerateOne = useCallback(() => {
    const newSet = createSet(generateRandomSet());
    setHistory(prev => [newSet, ...prev]);
    setLatestBatch([newSet]);
  }, []);

  const handleGenerateFive = useCallback(() => {
    const newSets = Array(5).fill(null).map(() => createSet(generateRandomSet()));
    setHistory(prev => [...newSets, ...prev]);
    setLatestBatch(newSets);
  }, []);

  // Effect to reset confirmation state after 3 seconds
  useEffect(() => {
    let timeoutId: number;
    if (isConfirmingClear) {
      timeoutId = window.setTimeout(() => {
        setIsConfirmingClear(false);
      }, 3000);
    }
    return () => window.clearTimeout(timeoutId);
  }, [isConfirmingClear]);

  const handleClearHistory = useCallback(() => {
    if (isConfirmingClear) {
      setHistory([]);
      setLatestBatch([]);
      setIsConfirmingClear(false);
      showNotification("History cleared!");
    } else {
      setIsConfirmingClear(true);
    }
  }, [isConfirmingClear]);

  const handleAICall = async (prompt: string) => {
    setIsAILoading(true);
    try {
      const result = await generateAILuckyNumbers(prompt);
      const newSet = createSet({
        reds: result.reds,
        blue: result.blue,
        source: 'ai',
        aiReasoning: result.reasoning
      });
      
      setHistory(prev => [newSet, ...prev]);
      setLatestBatch([newSet]);
      setIsAIModalOpen(false);
      showNotification("AI numbers generated successfully!");
    } catch (error) {
      console.error(error);
      showNotification("Failed to generate AI numbers. Try again.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleCopy = (set: LotterySet) => {
    const text = `Red: ${set.reds.map(formatNumber).join(', ')} | Blue: ${formatNumber(set.blue)}`;
    navigator.clipboard.writeText(text);
    showNotification("Numbers copied to clipboard!");
  };

  const renderHeroContent = () => {
    if (latestBatch.length === 0) {
      return (
        <div className="text-center text-gray-400">
          <Ticket className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>Ready to try your luck?</p>
          <p className="text-sm">Press a button below to generate numbers.</p>
        </div>
      );
    }

    const isBatch = latestBatch.length > 1;
    const firstSet = latestBatch[0];
    const isAI = firstSet.source === 'ai';

    return (
      <div className="relative z-10 flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
        <div className="mb-4 text-sm text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-2">
          {isAI && <Sparkles size={16} className="text-purple-500" />}
          {isAI ? 'AI Pick' : (isBatch ? `Random Pick (${latestBatch.length})` : 'Random Pick')}
        </div>
        
        {isBatch ? (
          // Batch View (Multiple Sets)
          <div className="flex flex-col gap-3 w-full max-w-lg">
            {latestBatch.map((set, idx) => (
              <div key={set.id} className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-2 rounded-lg border border-gray-100 shadow-sm">
                 <span className="w-6 text-center text-xs font-bold text-gray-400">#{idx + 1}</span>
                 <div className="flex gap-2">
                    {set.reds.map((num, i) => (
                      <Ball key={`batch-${idx}-red-${i}`} number={num} type={BallType.RED} size="sm" />
                    ))}
                    <Ball number={set.blue} type={BallType.BLUE} size="sm" />
                 </div>
              </div>
            ))}
          </div>
        ) : (
          // Single View (Existing Large Design)
          <>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {firstSet.reds.map((num, i) => (
                <Ball key={`latest-red-${i}`} number={num} type={BallType.RED} size="lg" animate={false} />
              ))}
              <Ball number={firstSet.blue} type={BallType.BLUE} size="lg" animate={false} />
            </div>

            {firstSet.aiReasoning && (
                <div className="max-w-md text-center bg-purple-50 text-purple-700 p-3 rounded-lg text-sm border border-purple-100 italic">
                  "{firstSet.aiReasoning}"
                </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Improved Logo: Red Badge with Union Lotto Text (Robust SVG) */}
            <svg className="h-10 w-auto shrink-0 drop-shadow-sm" viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="140" height="50" rx="6" fill="#DC2626" />
              <text x="70" y="32" fontSize="22" fontWeight="900" fill="white" textAnchor="middle" fontFamily="sans-serif" letterSpacing="2">双色球</text>
              <text x="70" y="44" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1" opacity="0.9">UNION LOTTO</text>
            </svg>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
             中国福利彩票双色球
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Latest Result Display */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
            {renderHeroContent()}
        </section>

        {/* Action Buttons */}
        <section className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleGenerateOne}
            className="flex flex-col items-center justify-center py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
              <Plus size={20} />
            </div>
            <span className="font-semibold text-sm">Pick 1</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateFive}
            className="flex flex-col items-center justify-center py-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition-colors">
              <Ticket size={20} />
            </div>
            <span className="font-semibold text-sm">Pick 5</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAIModalOpen(true)}
            className="flex flex-col items-center justify-center py-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all shadow-md relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
              <Sparkles size={20} />
            </div>
            <span className="font-semibold text-sm">AI Lucky</span>
          </button>
        </section>

        {/* Stats Section */}
        {history.length > 0 && (
          <section ref={statsRef}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <BarChart3 size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-700">Frequency Analysis</h2>
            </div>
            <StatsChart history={history} />
          </section>
        )}

        {/* History List */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <HistoryIcon size={18} className="text-gray-500" />
              <h2 className="font-semibold text-gray-700">History ({history.length})</h2>
            </div>
            {history.length > 0 && (
              <button 
                type="button"
                onClick={handleClearHistory}
                className={`text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-200
                  ${isConfirmingClear 
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm ring-2 ring-red-100' 
                    : 'text-red-500 hover:text-red-600 hover:bg-red-50'
                  }`}
              >
                <Trash2 size={12} /> 
                {isConfirmingClear ? 'Confirm Clear?' : 'Clear'}
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {history.map((set, index) => (
              <div key={set.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold shrink-0">
                    {history.length - index}
                  </span>

                  <div className={`p-1.5 rounded-md ${set.source === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                    {set.source === 'ai' ? <Sparkles size={14} /> : <Ticket size={14} />}
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(set.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar justify-start sm:justify-center">
                  {set.reds.map((num, i) => (
                    <Ball key={i} number={num} type={BallType.RED} size="sm" />
                  ))}
                  <Ball number={set.blue} type={BallType.BLUE} size="sm" />
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                    <button 
                      type="button"
                      onClick={() => handleCopy(set)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy numbers"
                    >
                      <Copy size={16} />
                    </button>
                </div>
              </div>
            ))}
            
            {history.length === 0 && (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No history yet. Start generating!
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Modals & Notifications */}
      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onGenerate={handleAICall}
        isLoading={isAILoading}
      />

      {notification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-4">
          {notification}
        </div>
      )}
    </div>
  );
};

export default App;