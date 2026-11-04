import { ShieldCheck, AlertTriangle } from 'lucide-react';

export function RuleComplianceBadge({ compliance }) {
  const { isValid, outsideCount, maxOutside, legSideCount, offSideCount, behindSquareLegCount, violations } = compliance;

  return (
    <div className={`p-3 rounded-2xl border transition-all ${
      isValid 
        ? 'bg-white border-stone-200/90 shadow-2xs' 
        : 'bg-rose-50/70 border-rose-200 shadow-sm'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Compliance Status */}
        <div className="flex items-center gap-2">
          {isValid ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Legal Field Placement</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Rule Alert ({violations.length} breach{violations.length > 1 ? 'es' : ''})</span>
            </div>
          )}

          <span className="text-xs text-stone-500 hidden sm:inline font-medium">
            Field Balance:
          </span>
        </div>

        {/* Fielder Counts in Simple Terms */}
        <div className="flex items-center gap-3.5 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="text-stone-400 font-normal">Deep Fielders:</span>
            <span className={outsideCount > maxOutside ? 'text-rose-600 font-black' : 'text-zinc-900 font-bold'}>
              {outsideCount} / {maxOutside}
            </span>
          </div>

          <div className="flex items-center gap-1 text-stone-700">
            <span className="text-stone-400 font-normal">Off / Leg:</span>
            <span className="text-emerald-700 font-bold">{offSideCount}</span>
            <span className="text-stone-300">/</span>
            <span className={legSideCount > 5 ? 'text-rose-600 font-black' : 'text-zinc-900 font-bold'}>
              {legSideCount}
            </span>
            <span className="text-[10px] text-stone-400 font-normal">(max 5)</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-stone-700">
            <span className="text-stone-400 font-normal">Behind Sq Leg:</span>
            <span className={behindSquareLegCount > 2 ? 'text-rose-600 font-black' : 'text-zinc-900 font-bold'}>
              {behindSquareLegCount} / 2
            </span>
          </div>
        </div>

      </div>

      {/* Friendly Rule Violation Message */}
      {!isValid && (
        <div className="mt-2.5 pt-2 border-t border-rose-200/80 space-y-1">
          {violations.map((violation, idx) => (
            <div key={idx} className="text-xs text-rose-800 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              <span>{violation}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
