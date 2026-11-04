// FieldVision AI - Cricket Field Presets & Formations
// Coordinates based on SVG viewBox 0 0 900 900, ground center (450, 450)
// Striker is at South crease (y ~ 505), Bowler at North crease (y ~ 395)
//
// Bowling team: Wicketkeeper + 9 Fielders + 1 Bowler
// Batting team: Striker + Non-Striker

import { resolveCricketPosition } from '../utils/cricketCalculations.js';

export const FIELD_PRESETS = {
  powerplay: {
    id: 'powerplay',
    name: 'Powerplay (Overs 1-6)',
    badge: 'T20 Mandatory PP',
    description: 'Maximum 2 fielders allowed outside the 30-yard circle. Aggressive catching cordon with boundary protection at Third Man and Fine Leg.',
    tacticalObjective: 'Wicket-taking mindset while containing boundary leakage through slips and backward point.',
    outsideCircleAllowed: 2,
    fielders: [
      { id: 'wk', role: 'wk', posName: 'Wicketkeeper', x: 450, y: 555, ring: 'inner', icon: 'shield' },
      { id: 'f1', role: 'fielder', posName: '1st Slip', x: 418, y: 545, ring: 'inner' },
      { id: 'f2', role: 'fielder', posName: 'Backward Point', x: 330, y: 500, ring: 'inner' },
      { id: 'f3', role: 'fielder', posName: 'Cover', x: 320, y: 440, ring: 'inner' },
      { id: 'f4', role: 'fielder', posName: 'Mid-Off', x: 390, y: 350, ring: 'inner' },
      { id: 'f5', role: 'fielder', posName: 'Mid-On', x: 510, y: 350, ring: 'inner' },
      { id: 'f6', role: 'fielder', posName: 'Mid-Wicket', x: 570, y: 460, ring: 'inner' },
      { id: 'f7', role: 'fielder', posName: 'Square Leg', x: 565, y: 515, ring: 'inner' },
      { id: 'f8', role: 'fielder', posName: 'Deep Fine Leg', x: 670, y: 690, ring: 'outer' },
      { id: 'f9', role: 'fielder', posName: 'Deep Third Man', x: 230, y: 690, ring: 'outer' },
    ],
    bowler: { id: 'bowler', role: 'bowler', posName: 'Bowler', x: 450, y: 365 },
    striker: { id: 'striker', role: 'striker', posName: 'Striker (RHB)', x: 450, y: 505 },
    nonStriker: { id: 'nonStriker', role: 'nonStriker', posName: 'Non-Striker', x: 450, y: 395 },
  },

  attacking: {
    id: 'attacking',
    name: 'Attacking / Red Ball Pressure',
    badge: 'Slip Cordon Attack',
    description: 'Multi-slip catching cordon, gully, and short leg to apply maximum pressure on new batsmen or swinging ball conditions.',
    tacticalObjective: 'Induce edges and false strokes with close catchers squeezing single options.',
    outsideCircleAllowed: 5,
    fielders: [
      { id: 'wk', role: 'wk', posName: 'Wicketkeeper', x: 450, y: 555, ring: 'inner', icon: 'shield' },
      { id: 'f1', role: 'fielder', posName: '1st Slip', x: 420, y: 548, ring: 'inner' },
      { id: 'f2', role: 'fielder', posName: '2nd Slip', x: 398, y: 540, ring: 'inner' },
      { id: 'f3', role: 'fielder', posName: 'Gully', x: 360, y: 520, ring: 'inner' },
      { id: 'f4', role: 'fielder', posName: 'Extra Cover', x: 310, y: 440, ring: 'inner' },
      { id: 'f5', role: 'fielder', posName: 'Mid-Off', x: 385, y: 340, ring: 'inner' },
      { id: 'f6', role: 'fielder', posName: 'Mid-On', x: 515, y: 340, ring: 'inner' },
      { id: 'f7', role: 'fielder', posName: 'Short Leg', x: 488, y: 495, ring: 'inner' },
      { id: 'f8', role: 'fielder', posName: 'Deep Fine Leg', x: 685, y: 680, ring: 'outer' },
      { id: 'f9', role: 'fielder', posName: 'Deep Point', x: 190, y: 490, ring: 'outer' },
    ],
    bowler: { id: 'bowler', role: 'bowler', posName: 'Bowler', x: 450, y: 365 },
    striker: { id: 'striker', role: 'striker', posName: 'Striker (RHB)', x: 450, y: 505 },
    nonStriker: { id: 'nonStriker', role: 'nonStriker', posName: 'Non-Striker', x: 450, y: 395 },
  },

  defensive: {
    id: 'defensive',
    name: 'Defensive (Middle Overs)',
    badge: 'Boundary Lock & Ring Squeeze',
    description: '5 boundary riders placed to cut off 4s and 6s. Ring fielders stationed at single-saving positions to build dot-ball pressure.',
    tacticalObjective: 'Starve boundaries, force risk-taking, and choke the scoring rate to under 6.5 RPO.',
    outsideCircleAllowed: 5,
    fielders: [
      { id: 'wk', role: 'wk', posName: 'Wicketkeeper', x: 450, y: 550, ring: 'inner', icon: 'shield' },
      { id: 'f1', role: 'fielder', posName: 'Point (Single Saver)', x: 345, y: 505, ring: 'inner' },
      { id: 'f2', role: 'fielder', posName: 'Cover (Single Saver)', x: 340, y: 430, ring: 'inner' },
      { id: 'f3', role: 'fielder', posName: 'Mid-Wicket (Single Saver)', x: 555, y: 460, ring: 'inner' },
      { id: 'f4', role: 'fielder', posName: 'Square Leg', x: 550, y: 520, ring: 'inner' },
      { id: 'f5', role: 'fielder', posName: 'Deep Extra Cover', x: 220, y: 340, ring: 'outer' },
      { id: 'f6', role: 'fielder', posName: 'Long-Off', x: 310, y: 175, ring: 'outer' },
      { id: 'f7', role: 'fielder', posName: 'Long-On', x: 590, y: 175, ring: 'outer' },
      { id: 'f8', role: 'fielder', posName: 'Deep Mid-Wicket', x: 720, y: 410, ring: 'outer' },
      { id: 'f9', role: 'fielder', posName: 'Deep Square Leg', x: 710, y: 590, ring: 'outer' },
    ],
    bowler: { id: 'bowler', role: 'bowler', posName: 'Bowler', x: 450, y: 365 },
    striker: { id: 'striker', role: 'striker', posName: 'Striker (RHB)', x: 450, y: 505 },
    nonStriker: { id: 'nonStriker', role: 'nonStriker', posName: 'Non-Striker', x: 450, y: 395 },
  },

  death_overs: {
    id: 'death_overs',
    name: 'Death Overs (Overs 17-20)',
    badge: 'Wide Yorker & Arc Defence',
    description: 'Designed specifically for wide yorker / slower bouncer execution. Deep backward point, long-off, and deep mid-wicket loaded.',
    tacticalObjective: 'Deny maximums straight and squarer through off side. Force batters to hit against the larger boundary dimensions.',
    outsideCircleAllowed: 5,
    fielders: [
      { id: 'wk', role: 'wk', posName: 'Wicketkeeper (Stood Back)', x: 450, y: 565, ring: 'inner', icon: 'shield' },
      { id: 'f1', role: 'fielder', posName: 'Short Third Man', x: 365, y: 575, ring: 'inner' },
      { id: 'f2', role: 'fielder', posName: 'Extra Cover (Inside)', x: 350, y: 450, ring: 'inner' },
      { id: 'f3', role: 'fielder', posName: 'Short Mid-Wicket', x: 545, y: 480, ring: 'inner' },
      { id: 'f4', role: 'fielder', posName: 'Deep Backward Point', x: 200, y: 560, ring: 'outer' },
      { id: 'f5', role: 'fielder', posName: 'Mid-Off (Single Saver)', x: 395, y: 360, ring: 'inner' },
      { id: 'f6', role: 'fielder', posName: 'Long-Off (Straight)', x: 360, y: 160, ring: 'outer' },
      { id: 'f7', role: 'fielder', posName: 'Long-On (Straight)', x: 540, y: 160, ring: 'outer' },
      { id: 'f8', role: 'fielder', posName: 'Deep Mid-Wicket (Cow Corner)', x: 720, y: 380, ring: 'outer' },
      { id: 'f9', role: 'fielder', posName: 'Deep Fine Leg', x: 670, y: 690, ring: 'outer' },
    ],
    bowler: { id: 'bowler', role: 'bowler', posName: 'Bowler', x: 450, y: 365 },
    striker: { id: 'striker', role: 'striker', posName: 'Striker (RHB)', x: 450, y: 505 },
    nonStriker: { id: 'nonStriker', role: 'nonStriker', posName: 'Non-Striker', x: 450, y: 395 },
  },
};

/**
 * Builds synchronized player entities for a given preset and match state.
 * Strictly maps bowling team members to bowler/wicketkeeper/fielders,
 * and batting team members to striker/nonStriker.
 */
export function buildMatchFieldState(presetId, matchData, handedness = 'RHB') {
  const preset = FIELD_PRESETS[presetId] || FIELD_PRESETS.death_overs;
  const { battingTeam, bowlingTeam, currentStriker, currentNonStriker, currentBowler, wicketkeeper, squadFielders } = matchData;

  // 1. Map Fielders (1 Wicketkeeper + 9 Outfield Fielders)
  const populatedFielders = preset.fielders.map((posTemplate, idx) => {
    const isWK = posTemplate.role === 'wk' || posTemplate.id === 'wk';
    const targetX = handedness === 'LHB' ? 900 - posTemplate.x : posTemplate.x;
    const targetY = posTemplate.y;

    // Resolve player identity from bowling squad
    const playerIdentity = isWK
      ? wicketkeeper
      : squadFielders[idx - 1] || { playerId: `f_${idx}`, playerName: `Fielder ${idx}` };

    const resolvedPosName = resolveCricketPosition(
      { x: targetX, y: targetY, role: posTemplate.role },
      handedness
    );

    return {
      id: posTemplate.id,
      playerId: playerIdentity.playerId,
      playerName: playerIdentity.playerName,
      name: playerIdentity.playerName,
      teamId: bowlingTeam.teamId,
      teamName: bowlingTeam.teamName,
      teamShortName: bowlingTeam.teamShortName,
      role: posTemplate.role,
      posName: resolvedPosName,
      x: targetX,
      y: targetY,
      playerCoordinates: { x: targetX, y: targetY },
      ring: posTemplate.ring,
      icon: posTemplate.icon || null,
    };
  });

  // 2. Map Bowler (Belongs to Bowling Team)
  const populatedBowler = {
    id: 'bowler',
    playerId: currentBowler.playerId,
    playerName: currentBowler.playerName,
    name: currentBowler.playerName,
    teamId: bowlingTeam.teamId,
    teamName: bowlingTeam.teamName,
    teamShortName: bowlingTeam.teamShortName,
    role: 'bowler',
    posName: 'Bowler',
    x: preset.bowler.x,
    y: preset.bowler.y,
    playerCoordinates: { x: preset.bowler.x, y: preset.bowler.y },
    style: currentBowler.style,
  };

  // 3. Map Striker (Belongs to Batting Team)
  const populatedStriker = {
    id: 'striker',
    playerId: currentStriker.playerId,
    playerName: currentStriker.playerName,
    name: currentStriker.playerName,
    teamId: battingTeam.teamId,
    teamName: battingTeam.teamName,
    teamShortName: battingTeam.teamShortName,
    role: 'striker',
    handedness: handedness,
    posName: `Striker (${handedness})`,
    x: preset.striker.x,
    y: preset.striker.y,
    playerCoordinates: { x: preset.striker.x, y: preset.striker.y },
  };

  // 4. Map Non-Striker (Belongs to Batting Team)
  const populatedNonStriker = {
    id: 'nonStriker',
    playerId: currentNonStriker.playerId,
    playerName: currentNonStriker.playerName,
    name: currentNonStriker.playerName,
    teamId: battingTeam.teamId,
    teamName: battingTeam.teamName,
    teamShortName: battingTeam.teamShortName,
    role: 'nonStriker',
    posName: 'Non-Striker',
    x: preset.nonStriker.x,
    y: preset.nonStriker.y,
    playerCoordinates: { x: preset.nonStriker.x, y: preset.nonStriker.y },
  };

  return {
    fielders: populatedFielders,
    bowler: populatedBowler,
    striker: populatedStriker,
    nonStriker: populatedNonStriker,
  };
}
