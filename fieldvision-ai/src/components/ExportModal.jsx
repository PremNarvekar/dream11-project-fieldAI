import { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export function ExportModal({ 
  isOpen, 
  onClose, 
  fielders, 
  activePreset, 
  handedness, 
  matchData, 
  compliance 
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const battingTeam = matchData.battingTeam || matchData.innings.battingTeam;
  const bowlingTeam = matchData.bowlingTeam || matchData.innings.bowlingTeam;

  const exportPayload = {
    generatedAt: new Date().toISOString(),
    tournament: matchData.tournament,
    venue: matchData.venue,
    match: `${battingTeam.code || battingTeam.teamShortName} vs ${bowlingTeam.code || bowlingTeam.teamShortName}`,
    teams: {
      batting: `${battingTeam.name || battingTeam.teamName} (${battingTeam.code || battingTeam.teamShortName})`,
      bowling: `${bowlingTeam.name || bowlingTeam.teamName} (${bowlingTeam.code || bowlingTeam.teamShortName})`,
    },
    striker: {
      name: matchData.currentStriker.playerName || matchData.currentStriker.name,
      team: battingTeam.code || battingTeam.teamShortName,
      stance: handedness,
    },
    nonStriker: {
      name: matchData.currentNonStriker.playerName || matchData.currentNonStriker.name,
      team: battingTeam.code || battingTeam.teamShortName,
    },
    bowler: {
      name: matchData.currentBowler.playerName || matchData.currentBowler.name,
      team: bowlingTeam.code || bowlingTeam.teamShortName,
      style: matchData.currentBowler.style,
    },
    preset: activePreset.name,
    iccCompliance: compliance.isValid ? 'Valid' : 'Breach',
    fielders: fielders.map(f => ({
      playerId: f.playerId || f.id,
      playerName: f.playerName || f.name,
      team: f.teamShortName || bowlingTeam.code || bowlingTeam.teamShortName,
      position: f.posName,
      coordinates: { x: f.x, y: f.y },
      ring: f.ring,
      role: f.role
    })),
  };

  const handleCopy = async () => {
    try {
      const text = JSON.stringify(exportPayload, null, 2);
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fieldvision-${activePreset.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200/90 rounded-3xl max-w-xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-[#d6f944] flex items-center justify-center font-bold shadow-sm">
              <span className="text-base select-none leading-none">✻</span>
            </div>
            <div>
              <h3 className="font-bold text-zinc-950 text-base">
                Export Tactical Field Plan
              </h3>
              <p className="text-xs text-zinc-500">
                Ground telemetry & validated team identities
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

        {/* Plan Summary Card */}
        <div className="my-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2.5 bg-[#f8faf9] p-3.5 rounded-2xl border border-zinc-200/70">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Match Teams</span>
              <span className="font-bold text-zinc-900 text-sm">
                {battingTeam.flag} {battingTeam.code || battingTeam.teamShortName} (Bat) vs {bowlingTeam.flag} {bowlingTeam.code || bowlingTeam.teamShortName} (Bowl)
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Striker & Bowler</span>
              <span className="font-bold text-zinc-900 text-sm">
                {matchData.currentStriker.playerName || matchData.currentStriker.name} vs {matchData.currentBowler.playerName || matchData.currentBowler.name}
              </span>
            </div>
            <div className="col-span-2 pt-2 border-t border-zinc-200/60 flex items-center justify-between">
              <span className="text-zinc-500">Law 28 Rule Status</span>
              <span className={`inline-flex items-center gap-1 font-semibold ${
                compliance.isValid ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {compliance.isValid ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {compliance.isValid ? 'Legal Field' : 'Rule Violation'}
              </span>
            </div>
          </div>

          {/* Fielder Positions Table */}
          <div className="bg-[#f8faf9] rounded-2xl border border-zinc-200/70 p-3.5 max-h-48 overflow-y-auto">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Bowling Team Roster: {bowlingTeam.name || bowlingTeam.teamName} ({fielders.length} Players on Ground)
            </span>
            <div className="space-y-1.5">
              {fielders.map((f, i) => (
                <div key={f.id} className="flex items-center justify-between py-1 border-b border-zinc-200/50 last:border-0 text-zinc-700">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-400 w-4">{i + 1}.</span>
                    <span className="font-semibold text-zinc-900">{f.posName}</span>
                    <span className="text-[11px] text-zinc-500 font-medium">({f.playerName || f.name})</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {f.teamShortName || bowlingTeam.code || bowlingTeam.teamShortName}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    f.ring === 'outer' ? 'bg-zinc-950 text-white' : 'bg-zinc-200/80 text-zinc-700'
                  }`}>
                    {f.ring === 'outer' ? 'Deep' : 'Ring'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200/80 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white hover:text-[#d6f944] text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
