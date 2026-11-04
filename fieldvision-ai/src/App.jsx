import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { MatchInfoBar } from './components/MatchInfoBar';
import { PresetSelector } from './components/PresetSelector';
import { CricketGround } from './components/CricketGround';
import { GroundControls } from './components/GroundControls';
import { RuleComplianceBadge } from './components/RuleComplianceBadge';
import { PlayerDetailsCard } from './components/PlayerDetailsCard';
import { AITacticalPanel } from './components/AITacticalPanel';
import { ExportModal } from './components/ExportModal';
import { FieldComparisonModal } from './components/FieldComparisonModal';
import { CricketExplainerModal } from './components/CricketExplainerModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { IdeaJourneySection } from './components/IdeaJourneySection';
import { AlertTriangle } from 'lucide-react';

import { FIELD_PRESETS, buildMatchFieldState } from './data/presets';
import { MOCK_MATCH_DATA, createMatchState, AVAILABLE_MATCHES } from './data/mockMatch';
import { 
  validateFieldCompliance, 
  resolveCricketPosition,
  getDistance,
  isInsideCircle,
  SVG_CENTER,
  BOUNDARY_RADIUS
} from './utils/cricketCalculations';
import { serializeFieldTelemetry } from './utils/telemetrySerializer';
import { validateTeamMapping } from './utils/teamValidation';
import { validateAdjustmentRules } from './services/aiService';

export default function App() {
  const [activePresetId, setActivePresetId] = useState('death_overs');
  const [handedness, setHandedness] = useState('RHB'); // 'RHB' or 'LHB'
  
  // Selected Demonstration Match (Requirement A)
  const [selectedMatchId, setSelectedMatchId] = useState('ind_vs_aus');

  // Centralized dynamic match state
  const [matchData, setMatchData] = useState(() => MOCK_MATCH_DATA);

  // Synchronized player state initialized from centralized match data & preset
  const [fielders, setFielders] = useState(() => {
    const initial = buildMatchFieldState('death_overs', MOCK_MATCH_DATA, 'RHB');
    return initial.fielders;
  });
  const [bowler, setBowler] = useState(() => {
    const initial = buildMatchFieldState('death_overs', MOCK_MATCH_DATA, 'RHB');
    return initial.bowler;
  });
  const [striker, setStriker] = useState(() => {
    const initial = buildMatchFieldState('death_overs', MOCK_MATCH_DATA, 'RHB');
    return initial.striker;
  });
  const [nonStriker, setNonStriker] = useState(() => {
    const initial = buildMatchFieldState('death_overs', MOCK_MATCH_DATA, 'RHB');
    return initial.nonStriker;
  });

  // Layer & Ground View toggles
  const [showLabels, setShowLabels] = useState(true);
  const [showCircle, setShowCircle] = useState(true);
  const [showSectors, setShowSectors] = useState(false);
  const [showCatchRadius, setShowCatchRadius] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonAdjustments, setComparisonAdjustments] = useState([]);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  // Selected player for deep dive card
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId) return null;
    if (bowler.id === selectedPlayerId || bowler.playerId === selectedPlayerId) return bowler;
    if (striker.id === selectedPlayerId || striker.playerId === selectedPlayerId) return striker;
    if (nonStriker.id === selectedPlayerId || nonStriker.playerId === selectedPlayerId) return nonStriker;
    return fielders.find(f => f.id === selectedPlayerId || f.playerId === selectedPlayerId) || null;
  }, [selectedPlayerId, bowler, striker, nonStriker, fielders]);

  // Active preset object
  const activePreset = FIELD_PRESETS[activePresetId] || FIELD_PRESETS.powerplay;

  // Real-time ICC Law 28 compliance validation (circle counts, leg side restrictions)
  const compliance = useMemo(() => {
    return validateFieldCompliance(fielders, activePresetId, handedness);
  }, [fielders, activePresetId, handedness]);

  // Strict Cricket Team Mapping Validation
  const teamValidation = useMemo(() => {
    return validateTeamMapping({
      battingTeam: matchData.battingTeam,
      bowlingTeam: matchData.bowlingTeam,
      striker,
      nonStriker,
      bowler,
      fielders,
    });
  }, [matchData, striker, nonStriker, bowler, fielders]);

  // Centralized telemetry serialization for AI tactical processing
  const telemetry = useMemo(() => {
    return serializeFieldTelemetry({
      matchData,
      activePreset,
      handedness,
      fielders,
      bowler,
      striker,
      compliance,
    });
  }, [matchData, activePreset, handedness, fielders, bowler, striker, compliance]);

  // Comparison modal rule validation
  const comparisonValidation = useMemo(() => {
    if (!comparisonAdjustments || comparisonAdjustments.length === 0) return null;
    return validateAdjustmentRules(fielders, comparisonAdjustments, activePresetId, handedness);
  }, [fielders, comparisonAdjustments, activePresetId, handedness]);

  // Handle switching preset (applies formation while preserving strict team mapping)
  const handleSelectPreset = (presetId) => {
    const preset = FIELD_PRESETS[presetId];
    if (!preset) return;

    setActivePresetId(presetId);
    const updated = buildMatchFieldState(presetId, matchData, handedness);
    
    setFielders(updated.fielders);
    setBowler(updated.bowler);
    setStriker(updated.striker);
    setNonStriker(updated.nonStriker);
    setSelectedPlayerId(null);
  };

  // Handle switching match from match selector (Requirement A)
  const handleSelectMatch = (matchId) => {
    setSelectedMatchId(matchId);
    const matchMeta = AVAILABLE_MATCHES.find(m => m.id === matchId) || AVAILABLE_MATCHES[0];
    const newMatch = createMatchState(matchMeta.battingCode, matchMeta.bowlingCode, matchMeta);
    const newHandedness = newMatch.currentStriker.handedness || 'RHB';

    setMatchData(newMatch);
    setHandedness(newHandedness);

    const updated = buildMatchFieldState(activePresetId, newMatch, newHandedness);
    setFielders(updated.fielders);
    setBowler(updated.bowler);
    setStriker(updated.striker);
    setNonStriker(updated.nonStriker);
    setSelectedPlayerId(null);
  };

  // Handle swapping batting and bowling teams (e.g. India batting -> Australia batting)
  const handleSwapTeams = () => {
    const currentBattingCode = matchData.battingTeam.teamShortName;
    let nextBattingCode;
    let nextBowlingCode;

    if (currentBattingCode === 'IND') {
      nextBattingCode = 'AUS';
      nextBowlingCode = 'IND';
    } else if (currentBattingCode === 'AUS') {
      nextBattingCode = 'IND';
      nextBowlingCode = 'AUS';
    } else if (currentBattingCode === 'ENG') {
      nextBattingCode = 'SA';
      nextBowlingCode = 'ENG';
    } else {
      nextBattingCode = 'ENG';
      nextBowlingCode = 'SA';
    }

    const newMatch = createMatchState(nextBattingCode, nextBowlingCode);
    const newHandedness = newMatch.currentStriker.handedness || 'RHB';

    setMatchData(newMatch);
    setHandedness(newHandedness);

    const updated = buildMatchFieldState(activePresetId, newMatch, newHandedness);
    setFielders(updated.fielders);
    setBowler(updated.bowler);
    setStriker(updated.striker);
    setNonStriker(updated.nonStriker);
    setSelectedPlayerId(null);
  };

  // Handle batsman handedness change (mirrors fielders symmetrically across pitch axis)
  const handleHandednessChange = (newHandedness) => {
    if (newHandedness === handedness) return;
    setHandedness(newHandedness);

    // Mirror all fielders horizontally across center (x = 450) and recalculate position names
    setFielders(prev => prev.map(f => {
      const mirroredX = 900 - f.x;
      return {
        ...f,
        x: mirroredX,
        playerCoordinates: { x: mirroredX, y: f.y },
        posName: resolveCricketPosition({ x: mirroredX, y: f.y, role: f.role }, newHandedness),
      };
    }));

    setStriker(prev => ({
      ...prev,
      handedness: newHandedness,
      posName: `Striker (${newHandedness})`,
    }));
  };

  // Reset field back to default for active preset and team mapping
  const handleResetField = () => {
    const updated = buildMatchFieldState(activePresetId, matchData, handedness);
    setFielders(updated.fielders);
    setSelectedPlayerId(null);
  };

  // Apply AI-recommended adjustments from comparison modal or panel
  const handleApplyAdjustments = (adjustments) => {
    const validation = validateAdjustmentRules(fielders, adjustments, activePresetId, handedness);
    if (validation.isValid) {
      setFielders(validation.simulatedFielders);
    }
  };

  // Fine nudge selected fielder with circular boundary constraint and ring update
  const handleNudge = (id, dx, dy) => {
    setFielders(prev => prev.map(f => {
      if (f.id === id || f.playerId === id) {
        let nextX = f.x + dx;
        let nextY = f.y + dy;
        const dist = getDistance({ x: nextX, y: nextY }, SVG_CENTER);
        if (dist > BOUNDARY_RADIUS - 10) {
          const angle = Math.atan2(nextY - SVG_CENTER.y, nextX - SVG_CENTER.x);
          nextX = SVG_CENTER.x + Math.cos(angle) * (BOUNDARY_RADIUS - 10);
          nextY = SVG_CENTER.y + Math.sin(angle) * (BOUNDARY_RADIUS - 10);
        }
        nextX = Math.round(nextX);
        nextY = Math.round(nextY);
        const inCircle = isInsideCircle({ x: nextX, y: nextY });
        const resolved = resolveCricketPosition({ x: nextX, y: nextY, role: f.role }, handedness);
        return { 
          ...f, 
          x: nextX, 
          y: nextY, 
          playerCoordinates: { x: nextX, y: nextY },
          posName: resolved, 
          ring: inCircle ? 'inner' : 'outer' 
        };
      }
      return f;
    }));
  };

  return (
    <div className="min-h-screen bg-[#f6f7f6] text-zinc-900 flex flex-col font-sans selection:bg-[#d6f944] selection:text-zinc-950">
      
      {/* 1. Top Minimal Header */}
      <Header
        handedness={handedness}
        setHandedness={handleHandednessChange}
        onResetField={handleResetField}
        activePresetName={activePreset.name}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        showCatchRadius={showCatchRadius}
        setShowCatchRadius={setShowCatchRadius}
        onExport={() => setIsExportOpen(true)}
        onOpenExplainer={() => setIsExplainerOpen(true)}
        onOpenIdeaJourney={() => setIsPdfViewerOpen(true)}
        selectedMatchId={selectedMatchId}
        onSelectMatch={handleSelectMatch}
      />

      {/* 2. Editorial Match Overview Bar (Synchronized with Centralized Match State) */}
      <MatchInfoBar
        matchData={matchData}
        onSwapTeams={handleSwapTeams}
      />

      {/* Team Mapping Validation Error Alert Banner (If Any Cricket Rule Violated) */}
      {!teamValidation.isValid && (
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide text-rose-800">
                Cricket Team Mapping Rule Alert
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {teamValidation.errors.join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Tactical Dashboard Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left & Center Section: Ground Visualizer & Presets (7 cols on desktop) */}
        <section className="xl:col-span-7 flex flex-col gap-5">
          
          {/* Preset Selector Cards */}
          <PresetSelector
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />

          {/* ICC Compliance & Telemetry Status Bar */}
          <RuleComplianceBadge
            compliance={compliance}
          />

          {/* Ground Canvas with Floating Controls */}
          <div className="relative flex flex-col gap-3">
            
            {/* Ground View Floating Toolbar */}
            <GroundControls
              showLabels={showLabels}
              setShowLabels={setShowLabels}
              showCircle={showCircle}
              setShowCircle={setShowCircle}
              showSectors={showSectors}
              setShowSectors={setShowSectors}
              zoom={zoom}
              setZoom={setZoom}
              onResetZoom={() => setZoom(1)}
            />

            {/* SVG Cricket Ground */}
            <CricketGround
              fielders={fielders}
              onUpdateFielders={setFielders}
              bowler={bowler}
              striker={striker}
              nonStriker={nonStriker}
              handedness={handedness}
              showLabels={showLabels}
              showCircle={showCircle}
              showSectors={showSectors}
              showCatchRadius={showCatchRadius}
              showHeatmap={showHeatmap}
              zoom={zoom}
              selectedPlayer={selectedPlayer}
              onSelectPlayer={(p) => setSelectedPlayerId(p ? (p.playerId || p.id) : null)}
              matchData={matchData}
            />

            {/* Selected Player Telemetry Card (Anchored below ground when active) */}
            {selectedPlayer && (
              <div className="mt-1">
                <PlayerDetailsCard
                  player={selectedPlayer}
                  handedness={handedness}
                  onDeselect={() => setSelectedPlayerId(null)}
                  onNudge={handleNudge}
                  matchData={matchData}
                />
              </div>
            )}
          </div>
        </section>

        {/* Right Section: AI Tactical Insights Panel & Natural Language Field Optimizer (5 cols on desktop) */}
        <section className="xl:col-span-5 flex flex-col h-full">
          <AITacticalPanel
            activePresetId={activePresetId}
            onApplyPreset={handleSelectPreset}
            handedness={handedness}
            matchData={matchData}
            telemetry={telemetry}
            fielders={fielders}
            onUpdateFielders={setFielders}
            onCompareAdjustments={(adjs) => {
              setComparisonAdjustments(adjs);
              setIsComparisonOpen(true);
            }}
            onOpenExplainer={() => setIsExplainerOpen(true)}
          />
        </section>

        {/* 4. Idea Journey – How We Got Here (Reddit Inspiration & Reference Document) */}
        <div className="xl:col-span-12 mt-4">
          <IdeaJourneySection onOpenViewer={() => setIsPdfViewerOpen(true)} />
        </div>

      </main>

      {/* Export Plan Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        fielders={fielders}
        activePreset={activePreset}
        handedness={handedness}
        matchData={matchData}
        compliance={compliance}
      />

      {/* Before & After Field Comparison Modal (Requirement G) */}
      <FieldComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        currentFielders={fielders}
        recommendedAdjustments={comparisonAdjustments}
        onApplyChanges={handleApplyAdjustments}
        onRejectChanges={() => setComparisonAdjustments([])}
        onResetField={handleResetField}
        activePresetName={activePreset.name}
        handedness={handedness}
        validationResult={comparisonValidation}
      />

      {/* Cricket Concepts & Rules Explainer Modal (Requirement H) */}
      <CricketExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        onAskAI={(conceptQuery) => {
          // Triggers user query into AI Tactical Panel
          console.log('Query sent to AI advisor:', conceptQuery);
        }}
      />

      {/* Embedded PDF Document Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => setIsPdfViewerOpen(false)}
      />
    </div>
  );
}
