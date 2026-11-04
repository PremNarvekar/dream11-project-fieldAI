/**
 * Centralized Cricket Team Logic & Player Mapping Validation
 * 
 * Verifies that:
 * 1. Batting and bowling teams are distinct.
 * 2. Striker belongs to the batting team.
 * 3. Non-striker belongs to the batting team.
 * 4. Bowler belongs to the bowling team.
 * 5. Wicketkeeper belongs to the bowling team.
 * 6. Every fielder on the ground belongs to the bowling team.
 */

export function validateTeamMapping({
  battingTeam,
  bowlingTeam,
  striker,
  nonStriker,
  bowler,
  wicketkeeper,
  fielders = []
}) {
  const errors = [];

  if (!battingTeam || !bowlingTeam) {
    errors.push('Both batting and bowling teams must be defined.');
    return { isValid: false, errors };
  }

  // Rule 1: Batting and bowling teams cannot be identical
  if (battingTeam.teamId === bowlingTeam.teamId || battingTeam.teamShortName === bowlingTeam.teamShortName) {
    errors.push(`Batting team (${battingTeam.teamName}) and Bowling team (${bowlingTeam.teamName}) cannot be identical.`);
  }

  // Rule 2: Striker belongs to batting team
  if (!striker) {
    errors.push('Striker batsman is missing from match state.');
  } else if (striker.teamId !== battingTeam.teamId && striker.teamShortName !== battingTeam.teamShortName) {
    errors.push(`Striker ${striker.playerName || striker.name} belongs to ${striker.teamName || striker.teamShortName}, but batting team is ${battingTeam.teamName}.`);
  }

  // Rule 3: Non-striker belongs to batting team
  if (!nonStriker) {
    errors.push('Non-striker batsman is missing from match state.');
  } else if (nonStriker.teamId !== battingTeam.teamId && nonStriker.teamShortName !== battingTeam.teamShortName) {
    errors.push(`Non-striker ${nonStriker.playerName || nonStriker.name} belongs to ${nonStriker.teamName || nonStriker.teamShortName}, but batting team is ${battingTeam.teamName}.`);
  }

  // Rule 4: Bowler belongs to bowling team
  if (!bowler) {
    errors.push('Current bowler is missing from match state.');
  } else if (bowler.teamId !== bowlingTeam.teamId && bowler.teamShortName !== bowlingTeam.teamShortName) {
    errors.push(`Bowler ${bowler.playerName || bowler.name} belongs to ${bowler.teamName || bowler.teamShortName}, but bowling team is ${bowlingTeam.teamName}.`);
  }

  // Rule 5: Wicketkeeper belongs to bowling team
  // Check either standalone wicketkeeper or wk in fielders
  const wk = wicketkeeper || fielders.find(f => f.role === 'wk');
  if (!wk) {
    errors.push('Wicketkeeper is missing from bowling team roster.');
  } else if (wk.teamId !== bowlingTeam.teamId && wk.teamShortName !== bowlingTeam.teamShortName) {
    errors.push(`Wicketkeeper ${wk.playerName || wk.name} belongs to ${wk.teamName || wk.teamShortName}, but bowling team is ${bowlingTeam.teamName}.`);
  }

  // Rule 6: Every fielder belongs to bowling team
  fielders.forEach((f, idx) => {
    if (f.teamId !== bowlingTeam.teamId && f.teamShortName !== bowlingTeam.teamShortName) {
      errors.push(`Fielder #${idx + 1} (${f.playerName || f.name} at ${f.posName}) belongs to ${f.teamName || f.teamShortName}, expected ${bowlingTeam.teamName}.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
