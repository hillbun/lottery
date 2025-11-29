import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Lucky Assistant
            </h2>
            <p className="text-purple-100 text-sm mt-1">Tell me about your day, dreams, or lucky signs.</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Today is my 30th birthday and I feel great!' or 'I dreamt of golden dragons flying in the sky.'"
            className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 mb-4"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
              ${!prompt.trim() || isLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/30'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Consulting the Oracle...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Lucky Numbers
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
