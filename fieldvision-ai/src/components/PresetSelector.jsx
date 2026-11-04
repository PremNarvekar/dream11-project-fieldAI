import { 
  Zap, 
  Crosshair, 
  Shield, 
  Flame, 
  Check, 
  Layers
} from 'lucide-react';
import { FIELD_PRESETS } from '../data/presets';

const PRESET_ICONS = {
  powerplay: Zap,
  attacking: Crosshair,
  defensive: Shield,
  death_overs: Flame,
};

// Plain English one-line fan explanations
const FAN_DESCRIPTIONS = {
  powerplay: 'Only 2 fielders outside the ring to attack early wickets.',
  attacking: 'Slip cordon and close catchers hunting edges and false shots.',
  defensive: '5 boundary riders to squeeze singles and choke the run rate.',
  death_overs: 'Deep boundary denial to protect against maximums and yorkers.',
};

export function PresetSelector({ activePresetId, onSelectPreset }) {
  const presets = Object.values(FIELD_PRESETS);

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-4 lg:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-700" />
          <h3 className="font-bold text-sm lg:text-base text-zinc-950 tracking-tight">
            Field Formations
          </h3>
        </div>
        <span className="text-xs text-stone-500 font-medium">
          Click to switch field layout
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map((preset) => {
          const Icon = PRESET_ICONS[preset.id] || Zap;
          const isSelected = activePresetId === preset.id;
          const fanSummary = FAN_DESCRIPTIONS[preset.id] || preset.description;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-zinc-950 text-white border-zinc-950 shadow-md ring-2 ring-zinc-950/10'
                  : 'bg-stone-50/70 hover:bg-white text-zinc-900 border-stone-200/80 hover:border-stone-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-zinc-800 text-[#d6f944]'
                        : 'bg-white text-stone-600 border border-stone-200/60 group-hover:text-emerald-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected 
                        ? 'bg-[#d6f944] text-zinc-950 border-[#d6f944]' 
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {preset.id === 'powerplay' ? 'Overs 1-6' : preset.id === 'death_overs' ? 'Overs 17-20' : 'Mid Overs'}
                  </span>
                </div>

                <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                  {preset.name.split(' (')[0]}
                </div>
                <p className={`text-xs mt-1.5 leading-relaxed ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  {fanSummary}
                </p>
              </div>

              <div className={`mt-3.5 pt-2.5 border-t flex items-center justify-between text-xs ${
                isSelected ? 'border-zinc-800 text-stone-300' : 'border-stone-200/80 text-stone-500'
              }`}>
                <span>
                  Deep: <strong className={isSelected ? 'text-[#d6f944]' : 'text-emerald-700 font-bold'}>{preset.fielders.filter(f => f.ring === 'outer').length}</strong> / {preset.outsideCircleAllowed}
                </span>
                {isSelected && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#d6f944]">
                    <Check className="w-3.5 h-3.5" /> Active
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
