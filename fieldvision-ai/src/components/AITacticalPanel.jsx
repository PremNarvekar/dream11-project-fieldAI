import { useState, useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Send, 
  Lightbulb, 
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  SlidersHorizontal,
  BookOpen
} from 'lucide-react';
import { AI_TACTICAL_DATA } from '../data/mockAIResponses';
import { queryAITacticalAdvisor, validateAdjustmentRules } from '../services/aiService';
import { isInsideCircle } from '../utils/cricketCalculations';

export function AITacticalPanel({ 
  activePresetId, 
  onApplyPreset,
  handedness,
  matchData,
  telemetry,
  fielders,
  onUpdateFielders,
  onCompareAdjustments,
  onOpenExplainer
}) {
  const [question, setQuestion] = useState('');
  const strikerName = matchData.currentStriker.playerName || matchData.currentStriker.name;
  const strikerTeam = matchData.currentStriker.teamShortName || matchData.battingTeam.teamShortName || 'IND';
  const bowlerName = matchData.currentBowler.playerName || matchData.currentBowler.name;
  const bowlerTeam = matchData.currentBowler.teamShortName || matchData.bowlingTeam.teamShortName || 'AUS';

  // Real-time dynamic metrics calculated directly from actual fielder coordinates
  const infieldCount = useMemo(() => {
    return fielders.filter(f => f.ring === 'inner' || isInsideCircle(f)).length;
  }, [fielders]);

  const deepCount = useMemo(() => {
    return fielders.filter(f => f.ring === 'outer' && !isInsideCircle(f)).length;
  }, [fielders]);

  const dotBallPressure = useMemo(() => {
    // 8 infielders = ~88%, 5 infielders = ~60%, 3 infielders = ~38%
    return Math.min(96, Math.max(25, Math.round((infieldCount / 9) * 88 + 8)));
  }, [infieldCount]);

  const boundaryContainment = useMemo(() => {
    // 5 deep = 88%, 4 deep = 72%, 2 deep = 40%
    return Math.min(95, Math.max(20, Math.round((deepCount / 5) * 82 + 6)));
  }, [deepCount]);

  // Real-time spatial gap analysis computed from active ground coordinates
  const realTimeGaps = useMemo(() => {
    const gaps = [];

    // Check Off-side deep cover corridor (for RHB: x < 350, y < 450)
    const hasDeepCover = fielders.some(f => {
      const isOffSide = handedness === 'RHB' ? f.x < 420 : f.x > 480;
      const isDeep = !isInsideCircle(f);
      const isForward = f.y < 460 && f.y > 220;
      return isOffSide && isDeep && isForward;
    });

    if (!hasDeepCover) {
      gaps.push({
        id: 'gap_cover',
        type: 'warning',
        category: 'Off-Side Gap',
        title: 'Exposed Corridor: Deep Extra Cover Driving Lane',
        description: `With ${strikerName} (${strikerTeam}, ${handedness}) facing ${bowlerName}, leaving the 30°-60° off-side boundary unmanned invites aerial and ground boundaries.`,
        recommendation: 'Position Deep Extra Cover 25m deeper to protect the boundary rope.',
        impactScore: 'High Boundary Risk',
      });
    }

    // Check Leg-side deep mid-wicket corridor
    const hasDeepMidWicket = fielders.some(f => {
      const isLegSide = handedness === 'RHB' ? f.x > 480 : f.x < 420;
      const isDeep = !isInsideCircle(f);
      const isForward = f.y < 490 && f.y > 220;
      return isLegSide && isDeep && isForward;
    });

    if (!hasDeepMidWicket) {
      gaps.push({
        id: 'gap_midwicket',
        type: 'warning',
        category: 'Leg-Side Gap',
        title: 'Cow Corner / Deep Mid-Wicket Vacuum',
        description: `Pull shots and flicks towards the 90°-135° leg-side arc are vulnerable to boundary leakage.`,
        recommendation: 'Deploy Deep Mid-Wicket on the fence to contain lofted leg-side shots.',
        impactScore: 'Elevated Risk',
      });
    }

    // Check Third Man boundary protection
    const hasThirdMan = fielders.some(f => {
      const isOffSide = handedness === 'RHB' ? f.x < 450 : f.x > 450;
      const isBehind = f.y > 520;
      return isOffSide && isBehind;
    });

    if (!hasThirdMan) {
      gaps.push({
        id: 'gap_thirdman',
        type: 'info',
        category: 'Behind Square',
        title: 'Third Man Unattended',
        description: `Thick edges and late cuts off ${bowlerName}'s pace will race fine to the boundary.`,
        recommendation: 'Drop a boundary rider to Deep Third Man.',
        impactScore: 'Edged Boundary Risk',
      });
    }

    // Always include Law 28 status based on real positions
    const isCompliant = telemetry?.fieldingRestrictions?.isCompliant ?? true;
    const legSideCount = telemetry?.fieldingRestrictions?.legSideCount ?? 5;
    const behindSquare = telemetry?.fieldingRestrictions?.behindSquareLegCount ?? 1;

    gaps.push({
      id: 'compliance_card',
      type: isCompliant ? 'success' : 'warning',
      category: 'ICC Law 28 Restrictions',
      title: isCompliant ? 'Fielding Restrictions Verified' : 'Rule Breach Detected',
      description: `${legSideCount}/5 on Leg Side • ${behindSquare}/2 Behind Square • ${deepCount}/${telemetry?.fieldingRestrictions?.maxOutsideCircle ?? 5} Outside 30yd Circle.`,
      recommendation: isCompliant ? 'Field formation is 100% legal.' : 'Adjust illegal fielders immediately.',
      impactScore: isCompliant ? 'Fully Compliant' : 'Illegal Placement',
    });

    return gaps;
  }, [fielders, handedness, strikerName, strikerTeam, bowlerName, telemetry, deepCount]);

  const [chatLog, setChatLog] = useState([
    {
      type: 'ai',
      id: 'welcome',
      isLiveAI: false,
      summary: `Real-time spatial telemetry active for ${strikerName} (${strikerTeam}, ${handedness}) against ${bowlerName} (${bowlerTeam}, ${matchData.currentBowler.style}).`,
      bullets: [
        `Striker's current scoring zones: ${(matchData.currentStriker.strongZones || ['Extra Cover', 'Mid-Wicket']).slice(0, 2).join(', ')}.`,
        `Recommended bowling target: ${matchData.currentStriker.vulnerabilities?.[0] || 'Tight off-stump channel on a back of a length'}.`,
        `Real field telemetry: ${fielders.length} fielders loaded with live coordinates and metric distances.`,
      ],
      fieldGaps: [
        'Deep extra cover driving corridor is open', 
        'Square-leg sweep gap if bowler drops short'
      ],
      adjustments: [],
      ruleWarnings: [],
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Handle asking a question - connects directly to live Gemini LLM with real telemetry
  const handleAskQuestion = async (queryText) => {
    const q = queryText || question;
    if (!q.trim()) return;

    const userMessage = { type: 'user', text: q };
    setChatLog((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsThinking(true);
    setActionFeedback(null);

    // Call live AI service with full telemetry payload
    const result = await queryAITacticalAdvisor(q, telemetry);
    const aiData = result.success ? result.data : result.fallback;
    const isLive = result.success && aiData?.isLiveAI !== false;

    setChatLog((prev) => [
      ...prev,
      {
        type: 'ai',
        id: Date.now(),
        isLiveAI: isLive,
        modelUsed: aiData?.modelUsed || (isLive ? 'gemini-2.5-flash' : 'local-rules-engine'),
        telemetryTimestamp: new Date().toLocaleTimeString(),
        fieldersAnalyzed: telemetry.fielders.length,
        summary: aiData?.tacticalSummary || aiData?.summary || 'Tactical analysis completed.',
        bullets: aiData?.explanations || aiData?.bullets || [],
        fieldGaps: aiData?.identifiedFieldGaps || [],
        adjustments: aiData?.recommendedAdjustments || [],
        ruleWarnings: aiData?.applicableRuleWarnings || [],
        suggestedPreset: aiData?.suggestedPreset || aiData?.fieldAction || null,
      },
    ]);
    setIsThinking(false);
  };

  // Apply AI-recommended adjustments with strict cricket rule validation
  const handleApplyAdjustments = (adjustments) => {
    const validation = validateAdjustmentRules(fielders, adjustments, activePresetId, handedness);

    if (!validation.isValid) {
      setActionFeedback({
        type: 'error',
        message: `Adjustment blocked: ${validation.violations.join(', ')}`,
      });
      return;
    }

    // Apply the valid adjustments to fielders
    onUpdateFielders(validation.simulatedFielders);
    setActionFeedback({
      type: 'success',
      message: `Applied ${validation.sanitizedAdjustments.length} fielder adjustment(s) to the ground.`,
    });
    setTimeout(() => setActionFeedback(null), 3500);
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 lg:p-6 flex flex-col h-full shadow-sm">
      
      {/* 1. Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 text-[#d6f944] flex items-center justify-center font-bold shadow-sm">
            <span className="text-base select-none leading-none">✻</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm lg:text-base text-zinc-950 tracking-tight">
                AI Tactical Assistant
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-normal">
              Live spatial coordinates & real telemetry analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenExplainer && (
            <button
              onClick={onOpenExplainer}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-zinc-700 text-[11px] font-semibold border border-stone-200 transition-colors"
              title="Beginner guide to cricket tactics & terminology"
            >
              <BookOpen className="w-3 h-3 text-zinc-500" />
              <span>Guide</span>
            </button>
          )}
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">Engine</span>
            <span className="text-xs font-semibold text-zinc-800">FieldVision v2.0</span>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Dynamic Tactical Balance Cards (Computed from Live Field Coordinates) */}
      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="bg-[#f8faf9] p-3.5 rounded-2xl border border-zinc-200/70 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-600 mb-1.5">
            <span className="font-medium">Dot-Ball Pressure</span>
            <span className="font-bold font-display text-zinc-950 text-sm">{dotBallPressure}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-zinc-900 rounded-full transition-all duration-500" 
              style={{ width: `${dotBallPressure}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block font-mono">
            {infieldCount} infielders cutting singles
          </span>
        </div>

        <div className="bg-[#f8faf9] p-3.5 rounded-2xl border border-zinc-200/70 transition-all">
          <div className="flex items-center justify-between text-xs text-zinc-600 mb-1.5">
            <span className="font-medium">Boundary Containment</span>
            <span className="font-bold font-display text-emerald-700 text-sm">{boundaryContainment}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
              style={{ width: `${boundaryContainment}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-zinc-500 mt-1 block font-mono">
            {deepCount} boundary riders stationed
          </span>
        </div>
      </div>

      {/* 3. Action Feedback Notification */}
      {actionFeedback && (
        <div className={`p-3 rounded-2xl mb-3 text-xs flex items-center gap-2.5 transition-all ${
          actionFeedback.type === 'error'
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
        }`}>
          {actionFeedback.type === 'error' ? (
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span className="font-medium leading-snug">{actionFeedback.message}</span>
        </div>
      )}

      {/* 4. Real-Time Spatial Gaps & Field Insights (Calculated Live from Ground Positions) */}
      <div className="space-y-2.5 mb-4 max-h-[175px] overflow-y-auto pr-1">
        {realTimeGaps.map((ins) => (
          <div 
            key={ins.id}
            className={`p-3.5 rounded-2xl border text-xs transition-all ${
              ins.type === 'warning'
                ? 'bg-[#fffbf0] border-amber-200/90 text-amber-950'
                : ins.type === 'success'
                ? 'bg-[#f4fbf7] border-emerald-200/90 text-emerald-950'
                : 'bg-[#f8fafc] border-slate-200/90 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 opacity-80">
                {ins.type === 'warning' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                {ins.type === 'success' && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                {ins.type === 'info' && <ShieldCheck className="w-3 h-3 text-slate-600" />}
                {ins.category}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 border border-black/5 font-mono">
                {ins.impactScore}
              </span>
            </div>
            
            <div className="font-bold text-zinc-950 text-xs mb-1">
              {ins.title}
            </div>
            
            <p className="text-[11px] text-zinc-600 leading-relaxed mb-2">
              {ins.description}
            </p>
            
            <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">
                Recommendation: <strong className="text-zinc-900 font-semibold">{ins.recommendation}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Interactive Conversation & Tactical Advisor */}
      <div className="flex-1 flex flex-col justify-between border-t border-zinc-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
            Tactical Advisory Log
          </span>
          <span className="text-[11px] text-zinc-400">
            Ask any real tactical question
          </span>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto space-y-3 pr-1 mb-3">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`text-xs ${
                msg.type === 'user' ? 'flex justify-end' : 'flex justify-start'
              }`}
            >
              {msg.type === 'user' ? (
                <div className="bg-zinc-950 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] font-medium shadow-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="bg-[#fbfcfb] border border-zinc-200/90 rounded-2xl rounded-tl-sm p-4 text-zinc-800 shadow-sm w-full space-y-2.5">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <span className="font-bold text-zinc-950 flex items-center gap-1.5 text-xs">
                      <span className={`w-2 h-2 rounded-full ${msg.isLiveAI ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-950'}`}></span>
                      {msg.isLiveAI ? 'Gemini 2.5 Flash Strategy' : 'Tactical Assessment'}
                    </span>
                    {msg.isLiveAI && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200 font-mono">
                        ✨ Live LLM • {msg.fieldersAnalyzed || 11} Players
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                    {msg.summary}
                  </p>

                  {/* Identified Gaps Highlight Card */}
                  {msg.fieldGaps && msg.fieldGaps.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 text-amber-950">
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Identified Field Gaps
                      </span>
                      <ul className="space-y-0.5 text-[11px] text-amber-900 list-disc list-inside">
                        {msg.fieldGaps.map((gap, gIdx) => (
                          <li key={gIdx}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bulleted Tactical Advice */}
                  {msg.bullets && msg.bullets.length > 0 && (
                    <div className="space-y-1 text-[11px] text-zinc-600">
                      {msg.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-zinc-400 mt-0.5">•</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rule Warnings if any */}
                  {msg.ruleWarnings && msg.ruleWarnings.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-rose-700">
                        Applicable Law 28 Restrictions:
                      </span>
                      {msg.ruleWarnings.map((w, wIdx) => (
                        <p key={wIdx} className="text-[11px]">• {w}</p>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons: Compare Before & After AND Apply Field Setup */}
                  {msg.adjustments && msg.adjustments.length > 0 && (
                    <div className="mt-2.5 pt-2.5 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-zinc-700" />
                        {msg.adjustments.length} adjustment(s) proposed
                      </span>

                      <div className="flex items-center gap-2">
                        {onCompareAdjustments && (
                          <button
                            onClick={() => onCompareAdjustments(msg.adjustments)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 border border-zinc-200 transition-colors"
                            title="Compare original field positions with AI recommendations"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Compare Changes</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleApplyAdjustments(msg.adjustments)}
                          className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white hover:text-[#d6f944] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          Apply Setup <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Button: Apply Suggested Preset */}
                  {msg.suggestedPreset && (!msg.adjustments || msg.adjustments.length === 0) && (
                    <div className="mt-2.5 pt-2.5 border-t border-zinc-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">
                        Suggested Plan: <strong className="text-zinc-900 capitalize">{msg.suggestedPreset.replace('_', ' ')}</strong>
                      </span>
                      <button
                        onClick={() => onApplyPreset(msg.suggestedPreset)}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white hover:text-[#d6f944] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        Apply Setup <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs flex items-center gap-2 text-zinc-600">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-950" />
              <span>Analyzing live field telemetry & spatial coordinates with Gemini 2.5 Flash...</span>
            </div>
          )}
        </div>

        {/* 6. Quick Query Pills */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {AI_TACTICAL_DATA.sampleQueries.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(item.query)}
              className="text-[11px] px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950 border border-zinc-200/70 transition-all text-left truncate max-w-full flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">{item.query}</span>
            </button>
          ))}
          {/* Beginner explainer quick pill */}
          <button
            onClick={() => handleAskQuestion("What is a wide yorker and how do fielders defend it?")}
            className="text-[11px] px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Explain Wide Yorker</span>
          </button>
        </div>

        {/* 7. Question Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about field gaps, bowling lines, or tactics..."
            className="w-full bg-[#f8faf9] border border-zinc-300 focus:border-zinc-900 focus:bg-white rounded-2xl px-4 py-2.5 pr-12 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!question.trim() || isThinking}
            className="absolute right-1.5 p-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-950 text-white font-bold transition-all shadow-sm"
            title="Send query to AI"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
