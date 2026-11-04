import { 
  Ruler, 
  Compass, 
  Shield, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  X
} from 'lucide-react';
import { getDistanceFromBat, getSide, isInsideCircle } from '../utils/cricketCalculations';

export function PlayerDetailsCard({ player, handedness, onDeselect, onNudge, matchData }) {
  if (!player) return null;

  const isFielder = player.role === 'fielder' || player.role === 'wk';
  const isBattingRole = player.role === 'striker' || player.role === 'nonStriker' || player.role === 'batsman';
  const distMeters = getDistanceFromBat(player);
  const side = getSide(player, handedness);
  const inCircle = isInsideCircle(player);

  const teamName = player.teamName || (isBattingRole ? matchData?.battingTeam?.teamName : matchData?.bowlingTeam?.teamName) || 'Team';
  const teamShort = player.teamShortName || (isBattingRole ? matchData?.battingTeam?.teamShortName : matchData?.bowlingTeam?.teamShortName) || 'TM';
  const flag = isBattingRole ? matchData?.battingTeam?.flag : matchData?.bowlingTeam?.flag;

  return (
    <div className="bg-white border border-zinc-200/90 rounded-3xl p-4 lg:p-5 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          {/* Role Icon Badge */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs tracking-tight shadow-sm ${
            isBattingRole
              ? 'bg-[#ea580c] text-white shadow-orange-500/20'
              : player.role === 'bowler'
              ? 'bg-[#059669] text-white shadow-emerald-500/20'
              : player.role === 'wk'
              ? 'bg-zinc-900 text-[#d6f944]'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}>
            {player.role === 'wk' ? 'WK' : player.role === 'bowler' ? 'BWL' : isBattingRole ? 'BAT' : 'FLD'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-zinc-950 text-sm lg:text-base tracking-tight">
                {player.playerName || player.name}
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200/70">
                {player.posName}
              </span>
            </div>

            {/* Team Affiliation and Role Indicator */}
            <div className="flex items-center gap-2 mt-0.5 text-xs">
              <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.2 rounded-full text-[10px] ${
                isBattingRole
                  ? 'bg-orange-100 text-orange-900 border border-orange-200'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}>
                <span>{flag}</span>
                <span>{teamName} ({teamShort})</span>
                <span>•</span>
                <span>{isBattingRole ? 'Batting Team' : 'Bowling Team'}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onDeselect}
          className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors"
          title="Close player card"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Spatial Telemetry Grid */}
      <div className="grid grid-cols-3 gap-2.5 my-3.5 text-xs">
        <div className="bg-[#f8faf9] p-3 rounded-2xl border border-zinc-200/70">
          <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
            <Ruler className="w-3 h-3 text-zinc-600" />
            Dist from Bat
          </span>
          <span className="font-bold font-display text-zinc-950 text-base mt-1 block">
            {distMeters}<span className="text-xs font-normal text-zinc-400 ml-0.5">m</span>
          </span>
        </div>

        <div className="bg-[#f8faf9] p-3 rounded-2xl border border-zinc-200/70">
          <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
            <Compass className="w-3 h-3 text-zinc-600" />
            Orientation
          </span>
          <span className="font-bold text-zinc-950 text-sm mt-1 block truncate">
            {side}
          </span>
        </div>

        <div className="bg-[#f8faf9] p-3 rounded-2xl border border-zinc-200/70">
          <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
            <Shield className="w-3 h-3 text-zinc-600" />
            Ring Zone
          </span>
          <span className={`font-semibold text-xs mt-1 block truncate ${
            inCircle ? 'text-zinc-950' : 'text-emerald-700'
          }`}>
            {inCircle ? 'Infield (30y)' : 'Deep Outfield'}
          </span>
        </div>
      </div>

      {/* Micro-Adjustment Controls for Fielder */}
      {isFielder && onNudge && (
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-700 font-semibold block">
              Micro Nudge
            </span>
            <span className="text-[10px] text-zinc-400">
              Shift position by ~3.7 meters
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onNudge(player.id, 0, -20)}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70 transition-colors"
              title="Nudge Forward"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNudge(player.id, 0, 20)}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70 transition-colors"
              title="Nudge Deeper"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNudge(player.id, -20, 0)}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70 transition-colors"
              title="Nudge Left"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNudge(player.id, 20, 0)}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70 transition-colors"
              title="Nudge Right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
