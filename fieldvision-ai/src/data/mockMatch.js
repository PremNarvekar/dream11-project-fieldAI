import { SQUAD_ROSTERS, AVAILABLE_MATCHES } from './teamRosters.js';

/**
 * Creates a synchronized match state adhering to strict cricket rules:
 * - Batting Team provides Striker and Non-Striker
 * - Bowling Team provides Bowler, Wicketkeeper, and 9 Outfield Fielders
 */
export function createMatchState(battingCode = 'IND', bowlingCode = 'AUS', matchMeta = null) {
  const battingSquad = SQUAD_ROSTERS[battingCode] || SQUAD_ROSTERS.IND;
  const bowlingSquad = SQUAD_ROSTERS[bowlingCode] || SQUAD_ROSTERS.AUS;

  const defaultMeta = AVAILABLE_MATCHES[0];
  const meta = matchMeta || (battingCode === 'ENG' || bowlingCode === 'SA' ? AVAILABLE_MATCHES[1] : defaultMeta);

  return {
    isDemoMatch: true, // Explicitly declare simulated/demo match
    tournament: meta.tournament || "ICC Men's T20 World Cup 2026",
    matchType: meta.matchType || 'Super 8 - Match 42',
    venue: meta.venue || 'Narendra Modi Stadium, Ahmedabad',
    pitchReport: {
      surface: 'Black Soil Pitch #4',
      pace: 'High pace & true bounce',
      turn: 'Slight grip for wrist-spinners (2.8° avg deviation)',
      dewFactor: 'Moderate (expected in 2nd innings after 8:30 PM)',
      dimensions: {
        straight: 74,
        squareOff: 66,
        squareLeg: 66,
        fineLeg: 62,
        thirdMan: 62,
      },
    },
    battingTeam: {
      teamId: battingSquad.teamId,
      teamName: battingSquad.teamName,
      teamShortName: battingSquad.teamShortName,
      code: battingSquad.teamShortName,
      name: battingSquad.teamName,
      flag: battingSquad.flag,
      score: battingSquad.score,
      overs: battingSquad.overs,
      runRate: battingSquad.runRate,
      projectedScore: battingSquad.projectedScore,
      themeColor: battingSquad.themeColor,
      badgeBg: battingSquad.badgeBg,
      badgeBorder: battingSquad.badgeBorder,
      badgeText: battingSquad.badgeText,
    },
    bowlingTeam: {
      teamId: bowlingSquad.teamId,
      teamName: bowlingSquad.teamName,
      teamShortName: bowlingSquad.teamShortName,
      code: bowlingSquad.teamShortName,
      name: bowlingSquad.teamName,
      flag: bowlingSquad.flag,
      themeColor: bowlingSquad.themeColor,
      badgeBg: bowlingSquad.badgeBg,
      badgeBorder: bowlingSquad.badgeBorder,
      badgeText: bowlingSquad.badgeText,
    },
    // Backwards-compatible innings structure
    innings: {
      battingTeam: {
        code: battingSquad.teamShortName,
        name: battingSquad.teamName,
        flag: battingSquad.flag,
        score: battingSquad.score,
        overs: battingSquad.overs,
        runRate: battingSquad.runRate,
        projectedScore: battingSquad.projectedScore,
        themeColor: battingSquad.themeColor,
      },
      bowlingTeam: {
        code: bowlingSquad.teamShortName,
        name: bowlingSquad.teamName,
        flag: bowlingSquad.flag,
        themeColor: bowlingSquad.themeColor,
      },
    },
    currentStriker: {
      ...battingSquad.striker,
      posName: `Striker (${battingSquad.striker.handedness})`,
    },
    currentNonStriker: {
      ...battingSquad.nonStriker,
      posName: 'Non-Striker',
    },
    currentBowler: {
      ...bowlingSquad.bowler,
      posName: 'Bowler',
    },
    wicketkeeper: {
      ...bowlingSquad.wicketkeeper,
      posName: 'Wicketkeeper',
    },
    squadFielders: bowlingSquad.fielders,
    activePhase: 'Death Overs',
    target: battingCode === 'AUS' || battingCode === 'SA' ? '147' : null,
  };
}

// Default export is India batting vs Australia bowling
export const MOCK_MATCH_DATA = createMatchState('IND', 'AUS');
export { AVAILABLE_MATCHES };
