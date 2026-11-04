import { useState, useRef } from 'react';
import { 
  SVG_CENTER, 
  BOUNDARY_RADIUS, 
  INNER_CIRCLE_RADIUS, 
  NORTH_STUMPS,
  SOUTH_STUMPS,
  BATSMAN_STANCE,
  getDistance, 
  getDistanceFromBat, 
  isInsideCircle,
  resolveCricketPosition
} from '../utils/cricketCalculations';

export function CricketGround({
  fielders,
  onUpdateFielders,
  bowler,
  striker,
  nonStriker,
  handedness,
  showLabels,
  showCircle,
  showSectors,
  showCatchRadius,
  showHeatmap,
  zoom,
  selectedPlayer,
  onSelectPlayer,
  matchData,
}) {
  const svgRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const battingTeam = matchData?.battingTeam || { teamName: 'India', teamShortName: 'IND', flag: '🇮🇳' };
  const bowlingTeam = matchData?.bowlingTeam || { teamName: 'Australia', teamShortName: 'AUS', flag: '🇦🇺' };

  // Handle pointer down on a fielder
  const handlePointerDown = (e, player) => {
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore if pointer capture unsupported
    }
    onSelectPlayer(player);

    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    setDraggingId(player.id);
    setDragOffset({
      x: svgP.x - player.x,
      y: svgP.y - player.y,
    });
  };

  // Handle pointer move across SVG
  const handlePointerMove = (e) => {
    if (!draggingId) return;

    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

    let newX = svgP.x - dragOffset.x;
    let newY = svgP.y - dragOffset.y;

    // Constrain strictly inside boundary rope (radius 370)
    const distFromCenter = getDistance({ x: newX, y: newY }, SVG_CENTER);
    if (distFromCenter > BOUNDARY_RADIUS - 10) {
      const angle = Math.atan2(newY - SVG_CENTER.y, newX - SVG_CENTER.x);
      newX = SVG_CENTER.x + Math.cos(angle) * (BOUNDARY_RADIUS - 10);
      newY = SVG_CENTER.y + Math.sin(angle) * (BOUNDARY_RADIUS - 10);
    }

    // Update the position of the dragged fielder with live cricket position resolution
    onUpdateFielders((prevFielders) =>
      prevFielders.map((f) => {
        if (f.id === draggingId) {
          const updatedCoords = { x: Math.round(newX), y: Math.round(newY), role: f.role };
          const resolvedName = resolveCricketPosition(updatedCoords, handedness);
          return {
            ...f,
            x: Math.round(newX),
            y: Math.round(newY),
            playerCoordinates: { x: Math.round(newX), y: Math.round(newY) },
            posName: resolvedName,
            ring: isInsideCircle(updatedCoords) ? 'inner' : 'outer',
          };
        }
        return f;
      })
    );
  };

  const handlePointerUp = (e) => {
    try {
      if (e?.currentTarget?.releasePointerCapture && e?.pointerId) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore if pointer capture unsupported
    }
    setDraggingId(null);
  };

  // Dynamic headers for Off / Leg side based on handedness
  const offSideLabel = handedness === 'RHB' ? 'OFF SIDE' : 'LEG SIDE';
  const legSideLabel = handedness === 'RHB' ? 'LEG SIDE' : 'OFF SIDE';

  // Authentic ICC 30-Yard Fielding Restriction Oval Path
  const r = INNER_CIRCLE_RADIUS;
  const thirtyYardPath = `
    M ${SVG_CENTER.x - r} ${NORTH_STUMPS.y}
    A ${r} ${r} 0 0 1 ${SVG_CENTER.x + r} ${NORTH_STUMPS.y}
    L ${SVG_CENTER.x + r} ${SOUTH_STUMPS.y}
    A ${r} ${r} 0 0 1 ${SVG_CENTER.x - r} ${SOUTH_STUMPS.y}
    Z
  `;

  // Find wicketkeeper in fielders
  const wkFielder = fielders.find(f => f.role === 'wk' || f.id === 'wk');

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-[860px] mx-auto select-none">
      
      {/* 1. Clear Team Identity Legend Bar (Top of Ground) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border border-stone-200/90 rounded-2xl shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#ea580c] ring-2 ring-orange-200 shrink-0"></span>
          <span className="font-bold text-zinc-950 flex items-center gap-1">
            <span>{battingTeam.flag}</span>
            <span>{battingTeam.teamName} ({battingTeam.teamShortName})</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 border border-orange-200 ml-1">
              BATTING
            </span>
          </span>
          <span className="text-zinc-500 text-[11px] hidden sm:inline">
            • {striker.playerName || striker.name} (Striker), {nonStriker.playerName || nonStriker.name} (Non-Striker)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#059669] ring-2 ring-emerald-200 shrink-0"></span>
          <span className="font-bold text-zinc-950 flex items-center gap-1">
            <span>{bowlingTeam.flag}</span>
            <span>{bowlingTeam.teamName} ({bowlingTeam.teamShortName})</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-200 ml-1">
              BOWLING
            </span>
          </span>
          <span className="text-zinc-500 text-[11px] hidden sm:inline">
            • {bowler.playerName || bowler.name} (Bowler), {wkFielder?.playerName || 'WK'} & 9 Fielders
          </span>
        </div>
      </div>

      {/* 2. SVG Cricket Ground Visualizer */}
      <div 
        className="relative w-full aspect-square overflow-hidden rounded-3xl bg-white p-2 sm:p-4 border border-stone-200/90 shadow-sm flex items-center justify-center transition-all"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 900 900"
          className="w-full h-full cursor-crosshair transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            {/* Natural Outfield Grass Radial Gradient */}
            <radialGradient id="outfieldGrass" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2b6b44" />
              <stop offset="50%" stopColor="#235c39" />
              <stop offset="85%" stopColor="#1e5031" />
              <stop offset="100%" stopColor="#194328" />
            </radialGradient>

            {/* Infield Grass Gradient (Manicured inner turf) */}
            <radialGradient id="infieldGrass" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#357c51" />
              <stop offset="70%" stopColor="#2d6d45" />
              <stop offset="100%" stopColor="#265e3b" />
            </radialGradient>

            {/* Authentic Pitch Clay Texture */}
            <linearGradient id="pitchTexture" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c8ad81" />
              <stop offset="25%" stopColor="#dbc298" />
              <stop offset="50%" stopColor="#e7d1ab" />
              <stop offset="75%" stopColor="#dbc298" />
              <stop offset="100%" stopColor="#c8ad81" />
            </linearGradient>

            {/* Fielder Catch Radius Gradient */}
            <radialGradient id="catchZoneGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(214, 249, 68, 0.4)" />
              <stop offset="70%" stopColor="rgba(214, 249, 68, 0.15)" />
              <stop offset="100%" stopColor="rgba(214, 249, 68, 0)" />
            </radialGradient>

            {/* Heatmap High Risk Zone Gradient */}
            <radialGradient id="heatRiskGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(244, 63, 94, 0.6)" />
              <stop offset="60%" stopColor="rgba(245, 158, 11, 0.3)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
            </radialGradient>

            {/* Clean Drop Shadow for Markers */}
            <filter id="markerShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.35)" />
            </filter>
          </defs>

          {/* Stadium Grass Surround */}
          <circle
            cx={SVG_CENTER.x}
            cy={SVG_CENTER.y}
            r={BOUNDARY_RADIUS + 28}
            fill="#e9ece8"
          />

          {/* Outer Cricket Ground Turf Circle (70m radius) */}
          <circle
            cx={SVG_CENTER.x}
            cy={SVG_CENTER.y}
            r={BOUNDARY_RADIUS}
            fill="url(#outfieldGrass)"
          />

          {/* Mower Lawn Cuts */}
          {[340, 290, 240, 190, 140, 90].map((radius, idx) => (
            <circle
              key={idx}
              cx={SVG_CENTER.x}
              cy={SVG_CENTER.y}
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="20"
            />
          ))}

          {/* Official ICC 30-Yard Infield Restriction Area */}
          {showCircle && (
            <g>
              <path
                d={thirtyYardPath}
                fill="url(#infieldGrass)"
                opacity="0.9"
              />
              <path
                d={thirtyYardPath}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                opacity="0.85"
              />
              <text
                x={SVG_CENTER.x}
                y={NORTH_STUMPS.y - r + 18}
                textAnchor="middle"
                fill="rgba(255, 255, 255, 0.75)"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="2"
              >
                30-YARD INFIELD CIRCLE
              </text>
            </g>
          )}

          {/* Field Sectors & Angles (If enabled) */}
          {showSectors && (
            <g opacity="0.3">
              <line x1={SVG_CENTER.x} y1={70} x2={SVG_CENTER.x} y2={830} stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 6" />
              <line x1={70} y1={SVG_CENTER.y} x2={830} y2={SVG_CENTER.y} stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 6" />
              <line x1={180} y1={180} x2={720} y2={720} stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 5" />
              <line x1={720} y1={180} x2={180} y2={720} stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 5" />
            </g>
          )}

          {/* Field Gaps & Risk Overlay (Requirement E: AI Gap Detection & Visual Highlighting) */}
          {showHeatmap && (
            <g className="pointer-events-none select-none">
              {/* Gap 1: Off-side Lofted Drive Corridor */}
              <ellipse
                cx={handedness === 'RHB' ? 240 : 660}
                cy={350}
                rx={95}
                ry={70}
                fill="url(#heatRiskGrad)"
                opacity="0.9"
              />
              <path
                d={`M 450 ${BATSMAN_STANCE.y} Q ${handedness === 'RHB' ? 320 : 580} 440 ${handedness === 'RHB' ? 240 : 660} 350`}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                opacity="0.9"
              />
              <circle cx={handedness === 'RHB' ? 240 : 660} cy={350} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <rect
                x={(handedness === 'RHB' ? 240 : 660) - 70}
                y={362}
                width="140"
                height="18"
                rx="4"
                fill="rgba(24, 24, 27, 0.9)"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x={handedness === 'RHB' ? 240 : 660}
                y={374}
                textAnchor="middle"
                fill="#fde68a"
                fontSize="8.5"
                fontWeight="bold"
              >
                VULNERABLE: Cover Drive Corridor
              </text>

              {/* Gap 2: Leg-side Sweep & Pull Arc */}
              <ellipse
                cx={handedness === 'RHB' ? 680 : 220}
                cy={370}
                rx={85}
                ry={65}
                fill="url(#heatRiskGrad)"
                opacity="0.8"
              />
              <path
                d={`M 450 ${BATSMAN_STANCE.y} Q ${handedness === 'RHB' ? 570 : 330} 460 ${handedness === 'RHB' ? 680 : 220} 370`}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                opacity="0.9"
              />
              <circle cx={handedness === 'RHB' ? 680 : 220} cy={370} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <rect
                x={(handedness === 'RHB' ? 680 : 220) - 70}
                y={382}
                width="140"
                height="18"
                rx="4"
                fill="rgba(24, 24, 27, 0.9)"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x={handedness === 'RHB' ? 680 : 220}
                y={394}
                textAnchor="middle"
                fill="#fde68a"
                fontSize="8.5"
                fontWeight="bold"
              >
                EXPOSED: Mid-Wicket Pull Gap
              </text>
            </g>
          )}

          {/* Pitch Area (22 Yards) */}
          <g>
            <rect
              x={SVG_CENTER.x - 14}
              y={NORTH_STUMPS.y - 12}
              width={28}
              height={SOUTH_STUMPS.y - NORTH_STUMPS.y + 24}
              rx={3}
              fill="url(#pitchTexture)"
              stroke="#a1845c"
              strokeWidth="1.5"
            />
            {/* North Bowling Crease & Stumps */}
            <line x1={SVG_CENTER.x - 22} y1={NORTH_STUMPS.y} x2={SVG_CENTER.x + 22} y2={NORTH_STUMPS.y} stroke="#ffffff" strokeWidth="2" opacity="0.95" />
            <line x1={SVG_CENTER.x - 22} y1={NORTH_STUMPS.y + 7} x2={SVG_CENTER.x + 22} y2={NORTH_STUMPS.y + 7} stroke="#ffffff" strokeWidth="1.5" opacity="0.75" />
            <circle cx={NORTH_STUMPS.x - 4} cy={NORTH_STUMPS.y} r="2" fill="#451a03" />
            <circle cx={NORTH_STUMPS.x} cy={NORTH_STUMPS.y} r="2" fill="#451a03" />
            <circle cx={NORTH_STUMPS.x + 4} cy={NORTH_STUMPS.y} r="2" fill="#451a03" />

            {/* South Bowling Crease & Stumps */}
            <line x1={SVG_CENTER.x - 22} y1={SOUTH_STUMPS.y} x2={SVG_CENTER.x + 22} y2={SOUTH_STUMPS.y} stroke="#ffffff" strokeWidth="2" opacity="0.9" />
            <line x1={SVG_CENTER.x - 22} y1={BATSMAN_STANCE.y} x2={SVG_CENTER.x + 22} y2={BATSMAN_STANCE.y} stroke="#ffffff" strokeWidth="2.5" opacity="0.95" />
            <circle cx={SOUTH_STUMPS.x - 4} cy={SOUTH_STUMPS.y} r="2" fill="#451a03" />
            <circle cx={SOUTH_STUMPS.x} cy={SOUTH_STUMPS.y} r="2" fill="#451a03" />
            <circle cx={SOUTH_STUMPS.x + 4} cy={SOUTH_STUMPS.y} r="2" fill="#451a03" />

            <text
              x={SVG_CENTER.x + 18}
              y={SVG_CENTER.y + 3}
              fill="rgba(255, 255, 255, 0.65)"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
            >
              22 YDS
            </text>
          </g>

          {/* Boundary Rope */}
          <circle
            cx={SVG_CENTER.x}
            cy={SVG_CENTER.y}
            r={BOUNDARY_RADIUS}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeDasharray="14 5"
          />

          {/* Boundary Distance Flags */}
          <g fontSize="11" fontWeight="bold" fill="rgba(255, 255, 255, 0.85)" textAnchor="middle">
            <text x={SVG_CENTER.x} y={SVG_CENTER.y - BOUNDARY_RADIUS + 24}>74m Straight</text>
            <text x={SVG_CENTER.x} y={SVG_CENTER.y + BOUNDARY_RADIUS - 14}>72m</text>
            <text x={SVG_CENTER.x - BOUNDARY_RADIUS + 34} y={SVG_CENTER.y + 4} textAnchor="start">66m Square</text>
            <text x={SVG_CENTER.x + BOUNDARY_RADIUS - 34} y={SVG_CENTER.y + 4} textAnchor="end">66m Square</text>
          </g>

          {/* Off Side / Leg Side Typography */}
          <g fontSize="16" fontWeight="800" letterSpacing="4" fill="rgba(255, 255, 255, 0.35)">
            <text x={180} y={110} textAnchor="middle">{offSideLabel}</text>
            <text x={720} y={110} textAnchor="middle">{legSideLabel}</text>
          </g>

          {/* Catching Zones (If enabled) */}
          {showCatchRadius && (
            <g className="pointer-events-none">
              {fielders.map((f) => (
                <circle
                  key={`catch-${f.id}`}
                  cx={f.x}
                  cy={f.y}
                  r={f.role === 'wk' ? 32 : 44}
                  fill="url(#catchZoneGrad)"
                  stroke="rgba(214, 249, 68, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              ))}
            </g>
          )}

          {/* ======================================================== */}
          {/* PLAYERS DISPLAY: STRICT TEAM LOGIC & CLEAR IDENTITY      */}
          {/* ======================================================== */}

          {/* 1. BOWLER (Australia / Bowling Team - Green/Teal Marker) */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectPlayer(bowler)}
          >
            <line
              x1={bowler.x}
              y1={bowler.y - 28}
              x2={bowler.x}
              y2={bowler.y}
              stroke="#059669"
              strokeWidth="2.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
            {/* Bowler Marker Disc */}
            <circle
              cx={bowler.x}
              cy={bowler.y}
              r="14"
              fill="#059669"
              stroke="#ffffff"
              strokeWidth="2.5"
              filter="url(#markerShadow)"
              className="group-hover:scale-110 transition-transform origin-center"
            />
            {/* White seam / ball icon */}
            <circle cx={bowler.x} cy={bowler.y} r="4" fill="#ffffff" />

            {/* Bowler Label: Team Badge + Name + Role */}
            {showLabels && (
              <g className="pointer-events-none select-none">
                <rect
                  x={bowler.x - 65}
                  y={bowler.y - 34}
                  width="130"
                  height="22"
                  rx="6"
                  fill="#18181b"
                  stroke="#059669"
                  strokeWidth="1.5"
                  filter="url(#markerShadow)"
                />
                <text
                  x={bowler.x}
                  y={bowler.y - 23}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  [{bowlingTeam.teamShortName}] {bowler.playerName || bowler.name}
                </text>
                <text
                  x={bowler.x}
                  y={bowler.y - 14}
                  textAnchor="middle"
                  fill="#a7f3d0"
                  fontSize="7.5"
                  fontWeight="600"
                >
                  BOWLER • {bowler.style || 'Fast'}
                </text>
              </g>
            )}
          </g>

          {/* 2. NON-STRIKER (India / Batting Team - Orange Marker) */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectPlayer(nonStriker)}
          >
            <circle
              cx={nonStriker.x + 22}
              cy={nonStriker.y}
              r="13"
              fill="#ea580c"
              stroke="#ffffff"
              strokeWidth="2.5"
              filter="url(#markerShadow)"
              className="group-hover:scale-110 transition-transform origin-center"
            />
            {/* Bat indicator */}
            <rect
              x={nonStriker.x + 30}
              y={nonStriker.y - 7}
              width="3"
              height="14"
              rx="1"
              fill="#fef08a"
            />
            {/* Non-Striker Label: Team Badge + Name + Role */}
            {showLabels && (
              <g className="pointer-events-none select-none">
                <rect
                  x={nonStriker.x + 40}
                  y={nonStriker.y - 12}
                  width="125"
                  height="22"
                  rx="6"
                  fill="#18181b"
                  stroke="#ea580c"
                  strokeWidth="1.5"
                  filter="url(#markerShadow)"
                />
                <text
                  x={nonStriker.x + 102}
                  y={nonStriker.y}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  [{battingTeam.teamShortName}] {nonStriker.playerName || nonStriker.name}
                </text>
                <text
                  x={nonStriker.x + 102}
                  y={nonStriker.y + 8}
                  textAnchor="middle"
                  fill="#fed7aa"
                  fontSize="7.5"
                  fontWeight="600"
                >
                  NON-STRIKER
                </text>
              </g>
            )}
          </g>

          {/* 3. STRIKER BATSMAN (India / Batting Team - Orange Marker) */}
          <g
            className="cursor-pointer group"
            onClick={() => onSelectPlayer(striker)}
          >
            {/* Stance guidance circle */}
            <circle
              cx={BATSMAN_STANCE.x}
              cy={BATSMAN_STANCE.y}
              r="18"
              fill="none"
              stroke="#ea580c"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />
            {/* Striker Marker Disc */}
            <circle
              cx={BATSMAN_STANCE.x}
              cy={BATSMAN_STANCE.y}
              r="15"
              fill="#ea580c"
              stroke="#ffffff"
              strokeWidth="2.5"
              filter="url(#markerShadow)"
              className="group-hover:scale-110 transition-transform origin-center"
            />
            {/* Bat angled to batter stance */}
            <rect
              x={BATSMAN_STANCE.x + (handedness === 'RHB' ? -20 : 16)}
              y={BATSMAN_STANCE.y - 7}
              width="4"
              height="16"
              rx="1"
              fill="#fef08a"
              transform={`rotate(${handedness === 'RHB' ? -25 : 25} ${BATSMAN_STANCE.x} ${BATSMAN_STANCE.y})`}
            />

            {/* Striker Label: Team Badge + Name + Role */}
            {showLabels && (
              <g className="pointer-events-none select-none">
                <rect
                  x={BATSMAN_STANCE.x - 70}
                  y={BATSMAN_STANCE.y + 20}
                  width="140"
                  height="24"
                  rx="6"
                  fill="#18181b"
                  stroke="#ea580c"
                  strokeWidth="1.5"
                  filter="url(#markerShadow)"
                />
                <text
                  x={BATSMAN_STANCE.x}
                  y={BATSMAN_STANCE.y + 32}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  [{battingTeam.teamShortName}] {striker.playerName || striker.name}
                </text>
                <text
                  x={BATSMAN_STANCE.x}
                  y={BATSMAN_STANCE.y + 41}
                  textAnchor="middle"
                  fill="#fed7aa"
                  fontSize="8"
                  fontWeight="600"
                >
                  STRIKER • {handedness}
                </text>
              </g>
            )}
          </g>

          {/* 4. AUSTRALIA FIELDERS (9 Fielders + 1 Wicketkeeper = 10 Players in Green/Teal) */}
          {fielders.map((fielder) => {
            const isSelected = selectedPlayer?.id === fielder.id;
            const isDragging = draggingId === fielder.id;
            const isWK = fielder.role === 'wk' || fielder.id === 'wk';
            const distMeters = getDistanceFromBat(fielder);

            // Bowling team markers in Green/Teal
            let markerFill = isWK ? '#047857' : fielder.ring === 'outer' ? '#059669' : '#10b981';
            if (isSelected) markerFill = '#18181b';

            return (
              <g
                key={fielder.id}
                transform={`translate(${fielder.x}, ${fielder.y})`}
                className="cursor-grab active:cursor-grabbing transition-transform"
                onPointerDown={(e) => handlePointerDown(e, fielder)}
              >
                {/* Distance connecting line if selected */}
                {isSelected && (
                  <line
                    x1={0}
                    y1={0}
                    x2={BATSMAN_STANCE.x - fielder.x}
                    y2={BATSMAN_STANCE.y - fielder.y}
                    stroke="#d6f944"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="pointer-events-none"
                  />
                )}

                {/* Selection pulse halo */}
                {isSelected && (
                  <circle
                    cx={0}
                    cy={0}
                    r="24"
                    fill="none"
                    stroke="#d6f944"
                    strokeWidth="2.5"
                    className="gentle-pulse pointer-events-none"
                    opacity="0.9"
                  />
                )}

                {/* Fielder Marker Circle */}
                <circle
                  cx={0}
                  cy={0}
                  r={isWK ? 15 : 12.5}
                  fill={markerFill}
                  stroke={isSelected ? '#d6f944' : '#ffffff'}
                  strokeWidth={isSelected ? 3.5 : 2}
                  filter="url(#markerShadow)"
                  className={`transition-all ${isDragging ? 'scale-125' : 'hover:scale-115'}`}
                />

                {/* Inner glyph: WK or Fielder dot */}
                {isWK ? (
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="black"
                    className="pointer-events-none select-none font-mono"
                  >
                    WK
                  </text>
                ) : (
                  <circle cx={0} cy={0} r="3" fill="#ffffff" className="pointer-events-none" />
                )}

                {/* Fielder Label: 2-line clean badge (Team + Player Name & Position) */}
                {showLabels && (
                  <g className="pointer-events-none select-none">
                    <rect
                      x={-56}
                      y={isWK ? 19 : 17}
                      width={112}
                      height={isSelected ? 36 : 26}
                      rx={6}
                      fill={isSelected ? '#18181b' : 'rgba(255, 255, 255, 0.96)'}
                      stroke={isSelected ? '#d6f944' : 'rgba(5, 150, 105, 0.4)'}
                      strokeWidth={isSelected ? 1.5 : 1}
                      filter="url(#markerShadow)"
                    />
                    {/* Line 1: Team & Player Name */}
                    <text
                      x={0}
                      y={isWK ? 29 : 27}
                      textAnchor="middle"
                      fill={isSelected ? '#d6f944' : '#047857'}
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      [{bowlingTeam.teamShortName}] {fielder.playerName || fielder.name}
                    </text>
                    {/* Line 2: Position Name */}
                    <text
                      x={0}
                      y={isWK ? 39 : 37}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#18181b'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {fielder.posName}
                    </text>
                    {/* Line 3: Distance from bat (if selected) */}
                    {isSelected && (
                      <text
                        x={0}
                        y={isWK ? 50 : 48}
                        textAnchor="middle"
                        fill="#d6f944"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        {distMeters}m from bat
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* Permanent In-SVG Legend (Bottom Left & Right) */}
          <g fontSize="10" fontWeight="bold">
            <rect x="25" y="845" width="230" height="28" rx="8" fill="rgba(24, 24, 27, 0.85)" stroke="#ea580c" strokeWidth="1" />
            <circle cx="42" cy="859" r="6" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />
            <text x="56" y="863" fill="#ffffff">
              {battingTeam.teamShortName} Batting: 2 Batsmen
            </text>

            <rect x="635" y="845" width="240" height="28" rx="8" fill="rgba(24, 24, 27, 0.85)" stroke="#059669" strokeWidth="1" />
            <circle cx="652" cy="859" r="6" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
            <text x="666" y="863" fill="#ffffff">
              {bowlingTeam.teamShortName} Bowling: 10 Fielders + Bowler
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
