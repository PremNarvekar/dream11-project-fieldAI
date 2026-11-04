import { createMatchState } from './src/data/mockMatch.js';
import { buildMatchFieldState, FIELD_PRESETS } from './src/data/presets.js';
import { validateTeamMapping } from './src/utils/teamValidation.js';
import { serializeFieldTelemetry } from './src/utils/telemetrySerializer.js';
import { validateFieldCompliance } from './src/utils/cricketCalculations.js';

console.log('====================================================');
console.log('FIELDVISION AI - TEAM MAPPING VERIFICATION TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// ===============================================================
// TEST SCENARIO 1: INDIA BATTING VS AUSTRALIA BOWLING
// ===============================================================
console.log('--- TEST 1: Default Demonstration (IND Batting vs AUS Bowling) ---');
const matchIndBat = createMatchState('IND', 'AUS');

assert(matchIndBat.battingTeam.teamShortName === 'IND', 'Batting team is India (IND)');
assert(matchIndBat.bowlingTeam.teamShortName === 'AUS', 'Bowling team is Australia (AUS)');
assert(matchIndBat.currentStriker.name === 'Virat Kohli', 'Striker is Virat Kohli');
assert(matchIndBat.currentStriker.teamShortName === 'IND', 'Virat Kohli belongs to IND (batting team)');
assert(matchIndBat.currentStriker.role === 'striker', 'Virat Kohli role is striker');
assert(matchIndBat.currentNonStriker.name === 'Hardik Pandya', 'Non-striker is Hardik Pandya');
assert(matchIndBat.currentNonStriker.teamShortName === 'IND', 'Hardik Pandya belongs to IND (batting team)');
assert(matchIndBat.currentBowler.name === 'Mitchell Starc', 'Bowler is Mitchell Starc');
assert(matchIndBat.currentBowler.teamShortName === 'AUS', 'Mitchell Starc belongs to AUS (bowling team)');
assert(matchIndBat.wicketkeeper.name === 'Josh Inglis', 'Wicketkeeper is Josh Inglis');
assert(matchIndBat.wicketkeeper.teamShortName === 'AUS', 'Josh Inglis belongs to AUS (bowling team)');

// Test across presets
for (const presetId of ['powerplay', 'attacking', 'defensive', 'death_overs']) {
  const fieldState = buildMatchFieldState(presetId, matchIndBat, 'RHB');
  
  assert(fieldState.fielders.length === 10, `Preset ${presetId} has 10 fielders (1 WK + 9 outfielders)`);
  assert(fieldState.bowler.name === 'Mitchell Starc', `Preset ${presetId} bowler is Mitchell Starc`);
  assert(fieldState.bowler.teamShortName === 'AUS', `Preset ${presetId} bowler is AUS`);
  assert(fieldState.striker.name === 'Virat Kohli', `Preset ${presetId} striker is Virat Kohli`);
  assert(fieldState.striker.teamShortName === 'IND', `Preset ${presetId} striker is IND`);
  assert(fieldState.nonStriker.name === 'Hardik Pandya', `Preset ${presetId} non-striker is Hardik Pandya`);
  assert(fieldState.nonStriker.teamShortName === 'IND', `Preset ${presetId} non-striker is IND`);
  
  const allFieldersAus = fieldState.fielders.every(f => f.teamShortName === 'AUS');
  assert(allFieldersAus, `Preset ${presetId} all 10 fielders belong to Australia (AUS)`);

  const validation = validateTeamMapping({
    battingTeam: matchIndBat.battingTeam,
    bowlingTeam: matchIndBat.bowlingTeam,
    striker: fieldState.striker,
    nonStriker: fieldState.nonStriker,
    bowler: fieldState.bowler,
    fielders: fieldState.fielders,
  });
  assert(validation.isValid === true, `Preset ${presetId} validation passed with 0 errors`);
}

// ===============================================================
// TEST SCENARIO 2: AUSTRALIA BATTING VS INDIA BOWLING (SWAPPED)
// ===============================================================
console.log('\n--- TEST 2: Swapped Innings (AUS Batting vs IND Bowling) ---');
const matchAusBat = createMatchState('AUS', 'IND');

assert(matchAusBat.battingTeam.teamShortName === 'AUS', 'Swapped batting team is Australia (AUS)');
assert(matchAusBat.bowlingTeam.teamShortName === 'IND', 'Swapped bowling team is India (IND)');
assert(matchAusBat.currentStriker.name === 'Travis Head', 'Swapped striker is Travis Head');
assert(matchAusBat.currentStriker.teamShortName === 'AUS', 'Travis Head belongs to AUS (batting team)');
assert(matchAusBat.currentNonStriker.name === 'Steve Smith', 'Swapped non-striker is Steve Smith');
assert(matchAusBat.currentNonStriker.teamShortName === 'AUS', 'Steve Smith belongs to AUS (batting team)');
assert(matchAusBat.currentBowler.name === 'Jasprit Bumrah', 'Swapped bowler is Jasprit Bumrah');
assert(matchAusBat.currentBowler.teamShortName === 'IND', 'Jasprit Bumrah belongs to IND (bowling team)');
assert(matchAusBat.wicketkeeper.name === 'Rishabh Pant', 'Swapped wicketkeeper is Rishabh Pant');
assert(matchAusBat.wicketkeeper.teamShortName === 'IND', 'Rishabh Pant belongs to IND (bowling team)');

const swappedField = buildMatchFieldState('death_overs', matchAusBat, 'LHB');
const allFieldersInd = swappedField.fielders.every(f => f.teamShortName === 'IND');
assert(allFieldersInd, 'Swapped fielders all belong to India (IND)');

const swappedValidation = validateTeamMapping({
  battingTeam: matchAusBat.battingTeam,
  bowlingTeam: matchAusBat.bowlingTeam,
  striker: swappedField.striker,
  nonStriker: swappedField.nonStriker,
  bowler: swappedField.bowler,
  fielders: swappedField.fielders,
});
assert(swappedValidation.isValid === true, 'Swapped innings validation passed with 0 errors');

// ===============================================================
// TEST SCENARIO 3: NEGATIVE TESTS & RULE BREACH DETECTION
// ===============================================================
console.log('\n--- TEST 3: Negative Rule Breach Detection ---');

// Case A: Identical batting and bowling teams
const badSameTeam = validateTeamMapping({
  battingTeam: { teamId: 'ind', teamName: 'India', teamShortName: 'IND' },
  bowlingTeam: { teamId: 'ind', teamName: 'India', teamShortName: 'IND' },
  striker: { teamId: 'ind', playerName: 'Kohli' },
  nonStriker: { teamId: 'ind', playerName: 'Pandya' },
  bowler: { teamId: 'ind', playerName: 'Bumrah' },
  wicketkeeper: { teamId: 'ind', playerName: 'Pant' },
  fielders: [{ teamId: 'ind', playerName: 'Rohit', posName: 'Cover' }],
});
assert(badSameTeam.isValid === false, 'Detects identical batting and bowling teams error');
assert(badSameTeam.errors.some(e => e.includes('cannot be identical')), 'Contains descriptive identical team error message');

// Case B: Contradictory striker (Australia batsman placed while India batting)
const badStriker = validateTeamMapping({
  battingTeam: { teamId: 'ind', teamName: 'India', teamShortName: 'IND' },
  bowlingTeam: { teamId: 'aus', teamName: 'Australia', teamShortName: 'AUS' },
  striker: { teamId: 'aus', teamName: 'Australia', playerName: 'Travis Head' },
  nonStriker: { teamId: 'ind', teamName: 'India', playerName: 'Hardik Pandya' },
  bowler: { teamId: 'aus', teamName: 'Australia', playerName: 'Mitchell Starc' },
  wicketkeeper: { teamId: 'aus', teamName: 'Australia', playerName: 'Josh Inglis' },
  fielders: [{ teamId: 'aus', teamName: 'Australia', playerName: 'Pat Cummins', posName: 'Mid-Off' }],
});
assert(badStriker.isValid === false, 'Detects contradictory striker error');
assert(badStriker.errors.some(e => e.includes('Striker Travis Head belongs to Australia')), 'Contains descriptive striker error message');

// Case C: Contradictory fielder (Indian fielder placed in Australian bowling lineup)
const badFielder = validateTeamMapping({
  battingTeam: { teamId: 'ind', teamName: 'India', teamShortName: 'IND' },
  bowlingTeam: { teamId: 'aus', teamName: 'Australia', teamShortName: 'AUS' },
  striker: { teamId: 'ind', teamName: 'India', playerName: 'Virat Kohli' },
  nonStriker: { teamId: 'ind', teamName: 'India', playerName: 'Hardik Pandya' },
  bowler: { teamId: 'aus', teamName: 'Australia', playerName: 'Mitchell Starc' },
  wicketkeeper: { teamId: 'aus', teamName: 'Australia', playerName: 'Josh Inglis' },
  fielders: [{ teamId: 'ind', teamName: 'India', playerName: 'Virat Kohli', posName: 'Cover' }],
});
assert(badFielder.isValid === false, 'Detects illegal fielder team mapping error');
assert(badFielder.errors.some(e => e.includes('Fielder #1 (Virat Kohli at Cover) belongs to India')), 'Contains descriptive fielder error message');

// ===============================================================
// TEST SCENARIO 4: AI TELEMETRY SERIALIZATION INTEGRITY
// ===============================================================
console.log('\n--- TEST 4: Telemetry Serializer Output Integrity ---');
const compliance = validateFieldCompliance(matchIndBat.squadFielders, 'death_overs', 'RHB');
const telemetry = serializeFieldTelemetry({
  matchData: matchIndBat,
  activePreset: FIELD_PRESETS.death_overs,
  handedness: 'RHB',
  fielders: swappedField.fielders,
  bowler: matchIndBat.currentBowler,
  striker: matchIndBat.currentStriker,
  compliance,
});

assert(telemetry.striker.name === 'Virat Kohli', 'Telemetry contains striker name');
assert(telemetry.striker.team === 'IND', 'Telemetry contains striker team IND');
assert(telemetry.bowler.name === 'Mitchell Starc', 'Telemetry contains bowler name');
assert(telemetry.bowler.team === 'AUS', 'Telemetry contains bowler team AUS');
assert(Array.isArray(telemetry.fielders), 'Telemetry fielders is array');
assert(telemetry.fielders.length > 0, 'Telemetry has fielders');
assert(telemetry.fielders[0].team !== undefined, 'Telemetry fielder includes team');

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('====================================================');

if (passedTests === totalTests) {
  console.log('ALL TEAM IDENTITY & PLAYER MAPPING TESTS PASSED SUCCESSFULLY!');
}
