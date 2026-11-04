import { 
  getDistanceFromBat, 
  getSide, 
  isInsideCircle, 
  resolveCricketPosition 
} from './cricketCalculations.js';

/**
 * Centralized Field Telemetry Serializer
 * Formats complete match, pitch, player, and fielding restriction context
 * into a standardized JSON payload for AI tactical processing.
 */
export function serializeFieldTelemetry({
  matchData,
  activePreset,
  handedness,
  fielders,
  bowler,
  striker,
  compliance
}) {
  return {
    matchInfo: {
      tournament: matchData.tournament,
      matchType: matchData.matchType,
      venue: matchData.venue,
      innings: {
        battingTeam: matchData.innings.battingTeam.name,
        battingTeamCode: matchData.innings.battingTeam.code,
        bowlingTeam: matchData.innings.bowlingTeam.name,
        bowlingTeamCode: matchData.innings.bowlingTeam.code,
        score: matchData.innings.battingTeam.score,
        overs: matchData.innings.battingTeam.overs,
        runRate: matchData.innings.battingTeam.runRate,
        projectedScore: matchData.innings.battingTeam.projectedScore,
      },
      pitchReport: matchData.pitchReport,
    },
    striker: {
      name: striker?.playerName || striker?.name || matchData.currentStriker.name,
      team: striker?.teamShortName || matchData.battingTeam?.teamShortName || matchData.innings?.battingTeam?.code || 'IND',
      handedness: handedness, // 'RHB' or 'LHB'
      runs: matchData.currentStriker.runs,
      balls: matchData.currentStriker.balls,
      strikeRate: matchData.currentStriker.strikeRate,
      fours: matchData.currentStriker.fours,
      sixes: matchData.currentStriker.sixes,
      strongZones: matchData.currentStriker.strongZones,
      vulnerabilities: matchData.currentStriker.vulnerabilities,
    },
    bowler: {
      name: bowler?.playerName || bowler?.name || matchData.currentBowler.name,
      team: bowler?.teamShortName || matchData.bowlingTeam?.teamShortName || matchData.innings?.bowlingTeam?.code || 'AUS',
      style: matchData.currentBowler.style,
      overs: matchData.currentBowler.overs,
      runs: matchData.currentBowler.runs,
      wickets: matchData.currentBowler.wickets,
      economy: matchData.currentBowler.economy,
      avgSpeed: matchData.currentBowler.avgSpeed,
      releaseAngle: matchData.currentBowler.releaseAngle,
    },
    preset: {
      id: activePreset.id,
      name: activePreset.name,
      badge: activePreset.badge,
      tacticalObjective: activePreset.tacticalObjective,
      maxDeepFieldersAllowed: activePreset.outsideCircleAllowed,
    },
    fieldingRestrictions: {
      isPowerplay: activePreset.id === 'powerplay',
      maxOutsideCircle: compliance.maxOutside,
      currentOutsideCircle: compliance.outsideCount,
      isCompliant: compliance.isValid,
      violations: compliance.violations,
      legSideCount: compliance.legSideCount,
      maxLegSideAllowed: 5,
      offSideCount: compliance.offSideCount,
      behindSquareLegCount: compliance.behindSquareLegCount,
      maxBehindSquareLegAllowed: 2,
    },
    fielders: fielders.map((f) => {
      const distM = getDistanceFromBat(f);
      const sector = getSide(f, handedness);
      const insideRing = isInsideCircle(f);
      const resolvedPos = resolveCricketPosition(f, handedness);

      return {
        id: f.id,
        playerId: f.playerId || f.id,
        name: f.playerName || f.name,
        playerName: f.playerName || f.name,
        team: f.teamShortName || matchData.bowlingTeam?.teamShortName || matchData.innings?.bowlingTeam?.code || 'AUS',
        role: f.role,
        currentLabel: f.posName,
        resolvedPosition: resolvedPos,
        coordinates: { x: f.x, y: f.y },
        distanceFromBatMeters: distM,
        sector: sector, // 'Off Side' or 'Leg Side'
        inCircle: insideRing,
        zone: insideRing ? 'Infield' : 'Deep Boundary',
      };
    }),
  };
}
