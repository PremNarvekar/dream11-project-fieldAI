import { 
  Trophy, 
  MapPin,
  ArrowLeftRight
} from 'lucide-react';

export function MatchInfoBar({ matchData, onSwapTeams }) {
  const { innings, currentStriker, currentNonStriker, currentBowler, pitchReport, battingTeam, bowlingTeam } = matchData;

  const currentBatting = battingTeam || innings.battingTeam;
  const currentBowling = bowlingTeam || innings.bowlingTeam;

  return (
    <div className="bg-white border-b border-stone-200/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Primary Match Scorecard */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{currentBatting.flag}</span>
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-extrabold text-2xl lg:text-3xl tracking-tight text-zinc-950 font-display">
                  {currentBatting.score}
                </span>
                <span className="text-sm font-semibold text-stone-500">
                  {currentBatting.overs} ov
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200 uppercase tracking-wide">
                  {currentBatting.code || currentBatting.teamShortName} Batting
                </span>
              </div>
              <div className="text-xs text-stone-500 font-medium flex items-center gap-2 mt-0.5">
                <span>Run Rate: <strong className="text-zinc-900 font-semibold">{currentBatting.runRate}</strong></span>
                <span className="text-stone-300">•</span>
                <span>Projected: <strong className="text-zinc-900 font-semibold">{currentBatting.projectedScore}</strong></span>
                <span className="text-stone-300">•</span>
                <span className="text-emerald-700 font-semibold">vs {currentBowling.flag} {currentBowling.name || currentBowling.teamName} (Bowling)</span>
              </div>
            </div>
          </div>

          {/* Swap Innings / Switch Teams Action */}
          {onSwapTeams && (
            <button
              onClick={onSwapTeams}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-zinc-800 text-xs font-semibold border border-stone-200/80 transition-all shadow-2xs"
              title="Switch batting and bowling teams to test team identity synchronization"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-700" />
              <span>Swap Teams</span>
            </button>
          )}

          <div className="hidden xl:flex flex-col border-l border-stone-200 pl-4 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600 font-medium">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>{matchData.tournament}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-400 mt-0.5 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{matchData.venue}</span>
            </div>
          </div>
        </div>

        {/* Players At The Crease (Strict Team Identity Display) */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          
          {/* Striker Card (Batting Team - Orange Accent) */}
          <div className="flex items-center gap-2.5 bg-orange-50/60 px-3.5 py-2 rounded-xl border border-orange-200/80 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#ea580c] text-white font-bold text-[10px] flex items-center justify-center">
              BAT
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                <span className="text-[10px] px-1 py-0.2 rounded bg-orange-200/80 text-orange-900 font-mono">
                  {currentBatting.code || currentBatting.teamShortName}
                </span>
                <span>{currentStriker.playerName || currentStriker.name}</span>
                <span className="text-orange-700 font-display text-sm font-black">{currentStriker.runs}*</span>
                <span className="text-stone-400 font-normal text-[11px]">({currentStriker.balls}b)</span>
              </div>
              <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1.5">
                <span>SR: {currentStriker.strikeRate}</span>
                <span className="text-stone-300">•</span>
                <span className="text-orange-800 font-semibold">On Strike</span>
              </div>
            </div>
          </div>

          {/* Non-Striker Card (Batting Team) */}
          <div className="hidden sm:flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-stone-200 text-stone-600">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-zinc-800">
                <span className="text-[10px] px-1 py-0.2 rounded bg-stone-100 text-stone-700 font-mono">
                  {currentBatting.code || currentBatting.teamShortName}
                </span>
                <span>{currentNonStriker.playerName || currentNonStriker.name}</span>
                <span className="text-stone-900 font-display font-bold">{currentNonStriker.runs}*</span>
                <span className="text-stone-400 font-normal text-[11px]">({currentNonStriker.balls}b)</span>
              </div>
              <div className="text-[11px] text-stone-400">
                Non-Striker
              </div>
            </div>
          </div>

          {/* Bowler Card (Bowling Team - Green/Teal Accent) */}
          <div className="flex items-center gap-2.5 bg-emerald-50/60 px-3.5 py-2 rounded-xl border border-emerald-200/80 shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#059669] text-white font-bold text-[10px] flex items-center justify-center">
              BWL
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-zinc-900">
                <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-200/80 text-emerald-900 font-mono">
                  {currentBowling.code || currentBowling.teamShortName}
                </span>
                <span>{currentBowler.playerName || currentBowler.name}</span>
                <span className="text-emerald-800 font-display text-sm font-black">{currentBowler.wickets}/{currentBowler.runs}</span>
                <span className="text-stone-400 font-normal text-[11px]">({currentBowler.overs})</span>
              </div>
              <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1.5">
                <span>{currentBowler.avgSpeed}</span>
                <span className="text-stone-300">•</span>
                <span>{currentBowler.style}</span>
              </div>
            </div>
          </div>

          {/* Pitch Dimension Pill */}
          <div className="hidden 2xl:flex items-center gap-2 bg-stone-100/80 px-3 py-2 rounded-xl border border-stone-200/70 text-[11px] text-stone-600">
            <span className="font-semibold text-zinc-900">Boundary:</span>
            <span>Straight <strong>{pitchReport.dimensions.straight}m</strong></span>
            <span className="text-stone-300">•</span>
            <span>Square <strong>{pitchReport.dimensions.squareOff}m</strong></span>
          </div>

        </div>

      </div>
    </div>
  );
}
