import { 
  RotateCcw, 
  Share2, 
  Eye, 
  Activity, 
  UserCheck,
  BookOpen
} from 'lucide-react';
import { AVAILABLE_MATCHES } from '../data/mockMatch';

export function Header({ 
  handedness, 
  setHandedness, 
  onResetField, 
  activePresetName,
  showHeatmap,
  setShowHeatmap,
  showCatchRadius,
  setShowCatchRadius,
  onExport,
  onOpenExplainer,
  onOpenIdeaJourney,
  selectedMatchId = 'ind_vs_aus',
  onSelectMatch
}) {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-40 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Editorial Title */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            {/* Modern geometric cricket mark (Ventrix-inspired) */}
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center shadow-sm">
              <span className="text-[#d6f944] text-base font-black">✻</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-zinc-950 font-display">
                  FieldVision<span className="text-emerald-700">.AI</span>
                </span>
                
                {/* Clear DEMO MATCH badge (Requirement A) */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  DEMO MATCH
                </span>
              </div>
              <p className="text-xs text-stone-500 font-normal hidden sm:block">
                Interactive cricket field placement, gap detection & tactical advisor
              </p>
            </div>
          </div>

          {/* Active Preset Tag on mobile */}
          <div className="md:hidden">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {activePresetName.split(' (')[0]}
            </span>
          </div>
        </div>

        {/* Tactical Controls & Switchers */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full md:w-auto">
          
          {/* Match Selector Dropdown (Requirement A) */}
          {onSelectMatch && (
            <div className="flex items-center bg-stone-100/90 px-2 py-1 rounded-full border border-stone-200/80 text-xs">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mr-1.5 hidden sm:inline">
                Match:
              </span>
              <select
                value={selectedMatchId}
                onChange={(e) => onSelectMatch(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-900 outline-none cursor-pointer pr-1"
                title="Select demonstration match"
              >
                {AVAILABLE_MATCHES.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Striker Handedness Switcher */}
          <div className="flex items-center bg-stone-100/90 p-1 rounded-full border border-stone-200/80 text-xs">
            <span className="pl-2.5 pr-1.5 text-stone-500 text-[11px] font-medium flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Batter:</span>
            </span>
            <button
              onClick={() => setHandedness('RHB')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                handedness === 'RHB'
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-stone-600 hover:text-zinc-900'
              }`}
              title="Right Hand Batsman stance"
            >
              Right (RHB)
            </button>
            <button
              onClick={() => setHandedness('LHB')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                handedness === 'LHB'
                  ? 'bg-zinc-950 text-white shadow-sm'
                  : 'text-stone-600 hover:text-zinc-900'
              }`}
              title="Left Hand Batsman stance"
            >
              Left (LHB)
            </button>
          </div>

          {/* Clean View Toggles: Catch Zones & Field Gaps */}
          <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-full border border-stone-200/80 text-xs">
            <button
              onClick={() => setShowCatchRadius(!showCatchRadius)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
                showCatchRadius
                  ? 'bg-white text-emerald-800 shadow-sm border border-stone-200/60 font-semibold'
                  : 'text-stone-600 hover:text-zinc-950'
              }`}
              title="Show fielder coverage radius"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Catch Zones</span>
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all ${
                showHeatmap
                  ? 'bg-white text-amber-800 shadow-sm border border-stone-200/60 font-semibold'
                  : 'text-stone-600 hover:text-zinc-950'
              }`}
              title="Highlight scoring gaps & vulnerable boundary zones"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Field Gaps</span>
            </button>
          </div>

          {/* Cricket Concepts Explainer Button (Requirement H) */}
          {onOpenExplainer && (
            <button
              onClick={onOpenExplainer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-zinc-800 text-xs font-semibold border border-stone-200/80 transition-all shadow-2xs"
              title="Cricket concepts explainer for beginners"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
              <span className="hidden sm:inline">Concepts</span>
            </button>
          )}

          {/* Idea Journey Reference Document (User Requirement) */}
          {onOpenIdeaJourney && (
            <button
              onClick={onOpenIdeaJourney}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200/90 transition-all shadow-2xs"
              title="View original Reddit inspiration and Idea Journey PDF"
            >
              <span className="text-[12px] leading-none">📄</span>
              <span className="hidden sm:inline">Idea Journey</span>
            </button>
          )}

          {/* Reset Field Button */}
          <button
            onClick={onResetField}
            className="p-2 rounded-xl text-stone-500 hover:text-zinc-900 hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all"
            title="Reset field placement to formation default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export Plan Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-sm"
            title="Export tactical field telemetry and plan"
          >
            <Share2 className="w-3.5 h-3.5 text-[#d6f944]" />
            <span className="hidden sm:inline">Export Plan</span>
          </button>

        </div>

      </div>
    </header>
  );
}
