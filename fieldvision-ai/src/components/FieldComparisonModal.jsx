import { 
  X, 
  ArrowRight, 
  AlertTriangle, 
  RotateCcw, 
  Check, 
  SlidersHorizontal, 
  ShieldCheck
} from 'lucide-react';
import { getDistance, isInsideCircle } from '../utils/cricketCalculations';

export function FieldComparisonModal({
  isOpen,
  onClose,
  currentFielders = [],
  recommendedAdjustments = [],
  onApplyChanges,
  onRejectChanges,
  onResetField,
  activePresetName = 'Active Preset',
  handedness = 'RHB',
  validationResult
}) {
  if (!isOpen || !recommendedAdjustments || recommendedAdjustments.length === 0) return null;

  // Build before-and-after comparison items
  const comparisonItems = recommendedAdjustments.map((adj) => {
    const currentFielder = currentFielders.find(f => f.id === adj.fielderId || f.playerId === adj.fielderId);
    const origX = currentFielder ? currentFielder.x : 450;
    const origY = currentFielder ? currentFielder.y : 450;
    const origPos = currentFielder ? currentFielder.posName : adj.currentPosition;
    const playerName = currentFielder ? (currentFielder.playerName || currentFielder.name) : 'Fielder';
    const playerRole = currentFielder?.role === 'wk' ? 'WK' : 'Fielder';

    // Calculate displacement in SVG units and scaled meters (~0.184m per unit)
    const displacementUnits = Math.round(getDistance({ x: origX, y: origY }, { x: adj.targetX, y: adj.targetY }));
    const displacementMeters = Math.round(displacementUnits * (70 / 380));

    const origInCircle = isInsideCircle({ x: origX, y: origY });
    const newInCircle = isInsideCircle({ x: adj.targetX, y: adj.targetY });

    return {
      fielderId: adj.fielderId,
      playerName,
      playerRole,
      origPos,
      newPos: adj.recommendedPosition,
      origCoords: { x: Math.round(origX), y: Math.round(origY) },
      newCoords: { x: Math.round(adj.targetX), y: Math.round(adj.targetY) },
      origRing: origInCircle ? 'Infield' : 'Deep Outfield',
      newRing: newInCircle ? 'Infield' : 'Deep Outfield',
      displacementMeters,
      explanation: adj.explanation,
    };
  });

  const isLegal = validationResult?.isValid ?? true;
  const violations = validationResult?.violations || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200/90 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-[#d6f944] flex items-center justify-center font-bold shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-950 text-base">
                  Before & After Field Comparison
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {comparisonItems.length} Player{comparisonItems.length > 1 ? 's' : ''} Repositioned
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Compare current positions with AI tactical recommendations ({activePresetName})
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

        {/* ICC Law 28 Compliance Status Banner */}
        <div className="mt-4 mb-2">
          <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
            isLegal
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {isLegal ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-semibold">
                {isLegal 
                  ? 'Proposed field complies with ICC Law 28 fielding regulations.' 
                  : `Rule Violation: ${violations.join(', ')}`}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/80 border border-black/5 font-bold">
              {handedness} Stance
            </span>
          </div>
        </div>

        {/* Before vs After Cards List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-3">
          {comparisonItems.map((item, idx) => (
            <div 
              key={idx}
              className="bg-[#f8faf9] border border-zinc-200/80 rounded-2xl p-4 text-xs transition-all hover:border-zinc-300"
            >
              {/* Player Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-zinc-950 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-950"></span>
                  {item.playerName}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                  Shifted ~{item.displacementMeters}m
                </span>
              </div>

              {/* Side-by-side Before and After Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
                {/* Current / Before */}
                <div className="bg-white p-3 rounded-xl border border-zinc-200/70">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Current Field Position
                  </span>
                  <div className="font-bold text-zinc-800 text-xs">
                    {item.origPos}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    Coords: ({item.origCoords.x}, {item.origCoords.y}) • {item.origRing}
                  </div>
                </div>

                {/* AI Proposed / After */}
                <div className="bg-white p-3 rounded-xl border border-emerald-300/80 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 text-emerald-600" />
                    AI Recommended Setup
                  </span>
                  <div className="font-bold text-emerald-950 text-xs">
                    {item.newPos}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    Coords: ({item.newCoords.x}, {item.newCoords.y}) • {item.newRing}
                  </div>
                </div>
              </div>

              {/* Tactical Explanation */}
              <div className="mt-2 text-[11px] text-zinc-600 bg-zinc-100/70 p-2.5 rounded-xl border border-zinc-200/50">
                <strong className="text-zinc-800 font-semibold">Strategic Reason: </strong>
                <span>{item.explanation}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Action Controls: Apply, Reject, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 border-t border-zinc-100">
          <button
            onClick={() => {
              if (onResetField) onResetField();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold border border-zinc-200/70 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Preset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onRejectChanges) onRejectChanges();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold border border-zinc-200/80 transition-colors"
            >
              Reject Changes
            </button>

            <button
              onClick={() => {
                if (onApplyChanges) onApplyChanges(recommendedAdjustments);
                onClose();
              }}
              disabled={!isLegal}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white hover:text-[#d6f944] text-xs font-semibold shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
