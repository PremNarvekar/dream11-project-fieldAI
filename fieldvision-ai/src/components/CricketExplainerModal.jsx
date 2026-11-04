import { useState } from 'react';
import { 
  X, 
  BookOpen, 
  ChevronRight, 
  Send,
  Sparkles 
} from 'lucide-react';
import { CRICKET_CONCEPTS } from '../data/cricketConcepts';

export function CricketExplainerModal({
  isOpen,
  onClose,
  onAskAI
}) {
  const [selectedConcept, setSelectedConcept] = useState(CRICKET_CONCEPTS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200/90 rounded-3xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-[#d6f944] flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-950 text-base">
                  Cricket Concepts & Rules Explainer
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Beginner Friendly
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Understand core cricket tactics, field settings, and fielding laws
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-4 flex-1 overflow-hidden">
          
          {/* Concept Selector List */}
          <div className="md:col-span-5 overflow-y-auto space-y-1.5 pr-1">
            {CRICKET_CONCEPTS.map((c) => {
              const isSelected = selectedConcept.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedConcept(c)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                      : 'bg-[#f8faf9] text-zinc-800 border-zinc-200/70 hover:bg-zinc-100'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{c.term}</div>
                    <div className={`text-[10px] truncate max-w-[190px] mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {c.shortDesc}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#d6f944]' : 'text-zinc-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Detailed Explainer Card */}
          <div className="md:col-span-7 bg-[#f8faf9] border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Concept Deep-Dive
                </span>
              </div>

              <h4 className="font-bold text-zinc-950 text-lg mb-3">
                {selectedConcept.term}
              </h4>

              <p className="text-xs text-zinc-700 leading-relaxed mb-4">
                {selectedConcept.fullExplanation}
              </p>

              <div className="bg-white p-3.5 rounded-xl border border-zinc-200/70 text-xs">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Tactical Application
                </span>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  {selectedConcept.tacticalTip}
                </p>
              </div>
            </div>

            {/* Quick Ask AI Button */}
            <div className="pt-4 border-t border-zinc-200/60 mt-4 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Want custom tactical analysis for this match?
              </span>
              <button
                onClick={() => {
                  if (onAskAI) onAskAI(selectedConcept.term);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white hover:text-[#d6f944] text-xs font-semibold shadow-sm transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Ask AI Advisor</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
