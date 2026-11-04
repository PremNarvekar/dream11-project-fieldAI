// Cricket Calculations, Realistic Coordinate Conversions, and Law 28 Compliance Engine
// Ground dimensions: SVG viewBox 0 0 900 900
// Ground Center: (450, 450)
// Boundary Radius: 380 SVG units (representing an official 70-meter boundary)
// Scale: 70m / 380 units = 0.1842105 meters/unit (5.42857 units/meter)

export const SVG_CENTER = { x: 450, y: 450 };
export const BOUNDARY_RADIUS = 380; // 70.0 meters
export const SCALE_METERS_PER_UNIT = 70.0 / BOUNDARY_RADIUS; // ~0.18421 m/unit
export const SCALE_UNITS_PER_METER = BOUNDARY_RADIUS / 70.0; // ~5.42857 units/m

// Real cricket pitch dimensions:
// Pitch length: 22 yards (66 ft = 20.1168 m) stump-to-stump
// In SVG units: 20.1168 * 5.42857 ≈ 109.2 units
// Bowling creases / Stumps:
export const NORTH_STUMPS = { x: 450, y: 395 }; // Bowler release end bowling crease (450 - 54.6)
export const SOUTH_STUMPS = { x: 450, y: 505 }; // Striker end bowling crease (450 + 54.6)

// Popping crease is 4 feet (1.2192 m = 6.6 SVG units) in front of the bowling crease
export const BATSMAN_STANCE = { x: 450, y: 498 }; // Striker popping crease stance (505 - 6.6 = 498.4)
export const NON_STRIKER_STANCE = { x: 450, y: 402 }; // Non-striker popping crease

// 30-Yard Infield Circle (Fielding Restriction Area):
// 30 yards = 90 feet = 27.432 meters
// In SVG units: 27.432 * 5.42857 ≈ 148.92 units (approx 149 units)
export const INNER_CIRCLE_RADIUS_UNITS = 27.432 * SCALE_UNITS_PER_METER; // ~148.9 units
export const INNER_CIRCLE_RADIUS = 149;

/**
 * Calculates Euclidean distance between two points in SVG coordinates
 */
export function getDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Checks whether a coordinate is inside the official ICC 30-yard fielding restriction area.
 * Officially, the area is defined by two semi-circles of radius 30 yards centered on the middle stump 
 * of each bowling crease, joined by straight lines 30 yards parallel to the pitch center-line.
 */
export function isInsideCircle(pos) {
  const r = INNER_CIRCLE_RADIUS_UNITS;

  // If north of north stumps (y < 395), check distance to north stumps
  if (pos.y < NORTH_STUMPS.y) {
    return getDistance(pos, NORTH_STUMPS) <= r;
  }
  // If south of south stumps (y > 505), check distance to south stumps
  if (pos.y > SOUTH_STUMPS.y) {
    return getDistance(pos, SOUTH_STUMPS) <= r;
  }
  // Between stumps along the pitch: lateral distance from center-line must be <= 30 yards
  return Math.abs(pos.x - SVG_CENTER.x) <= r;
}

/**
 * Exact distance in real-world meters from the batsman's batting stance (450, 498)
 */
export function getDistanceFromBat(pos) {
  const units = getDistance(pos, BATSMAN_STANCE);
  return Math.round((units * SCALE_METERS_PER_UNIT) * 10) / 10;
}

/**
 * Determines whether a position is Off-Side or Leg-Side based on batter handedness.
 * Striker stands at (450, 498) facing North towards bowler at (450, 395).
 * For RHB:
 *   Left (x < 450) is Off Side
 *   Right (x > 450) is Leg / On Side
 * For LHB:
 *   Right (x > 450) is Off Side
 *   Left (x < 450) is Leg / On Side
 */
export function getSide(pos, handedness = 'RHB') {
  if (Math.abs(pos.x - SVG_CENTER.x) < 4) return 'Straight';
  const isLeft = pos.x < SVG_CENTER.x;
  if (handedness === 'RHB') {
    return isLeft ? 'Off Side' : 'Leg Side';
  } else {
    return isLeft ? 'Leg Side' : 'Off Side';
  }
}

/**
 * Checks if a position is behind the popping crease (Law 28.4: behind square on leg-side)
 * Striker popping crease is at y = 498. Behind the crease is y > 498 towards south boundary.
 */
export function isBehindPoppingCrease(pos) {
  return pos.y > BATSMAN_STANCE.y;
}

/**
 * Accurately derives the official cricket fielding position name based on:
 * - Distance from striker in real meters
 * - Polar angle relative to striker's line of sight (facing North towards bowler)
 * - Batter handedness (RHB vs LHB)
 */
export function resolveCricketPosition(pos, handedness = 'RHB') {
  if (pos.role === 'wk') {
    return 'Wicketkeeper';
  }
  if (pos.role === 'bowler') {
    return 'Bowler';
  }

  const dx = pos.x - BATSMAN_STANCE.x;
  const dy = pos.y - BATSMAN_STANCE.y; // -dy is forward towards bowler
  const distM = getDistance(pos, BATSMAN_STANCE) * SCALE_METERS_PER_UNIT;

  // Lateral direction: positive is Off-side, negative is Leg-side
  const lateral = (handedness === 'RHB' ? -1 : 1) * dx;
  const forward = -dy; // North is positive forward

  // Angle in degrees from line of sight (0° = straight down ground, 90° = square off, 180° = behind keeper, -90° = square leg)
  let angleDeg = Math.atan2(lateral, forward) * (180 / Math.PI); // -180 to 180

  const isOff = lateral > 0;
  const absAngle = Math.abs(angleDeg);

  // 1. In-close Catching Cordon (< 18m)
  if (distM < 18) {
    if (isOff) {
      if (absAngle > 140) return 'Slip Cordon';
      if (absAngle > 95) return 'Gully';
      if (absAngle > 65) return 'Silly Point';
      return 'Silly Mid-Off';
    } else {
      if (absAngle > 145) return 'Leg Slip';
      if (absAngle > 70) return 'Short Leg';
      return 'Silly Mid-On';
    }
  }

  // 2. 30-Yard Infield Ring (18m - 32m)
  if (distM <= 32) {
    if (isOff) {
      if (absAngle > 125) return 'Short Third Man';
      if (absAngle > 95) return 'Backward Point';
      if (absAngle > 75) return 'Point';
      if (absAngle > 50) return 'Cover';
      if (absAngle > 25) return 'Extra Cover';
      return 'Mid-Off';
    } else {
      if (absAngle > 130) return 'Short Fine Leg';
      if (absAngle > 100) return 'Backward Square Leg';
      if (absAngle > 75) return 'Square Leg';
      if (absAngle > 35) return 'Mid-Wicket';
      return 'Mid-On';
    }
  }

  // 3. Deep Boundary Positions (> 32m)
  if (isOff) {
    if (absAngle > 130) return 'Deep Third Man';
    if (absAngle > 95) return 'Deep Backward Point';
    if (absAngle > 75) return 'Deep Point';
    if (absAngle > 45) return 'Deep Extra Cover';
    if (absAngle > 15) return 'Long-Off';
    return 'Straight Long-Off';
  } else {
    if (absAngle > 130) return 'Deep Fine Leg';
    if (absAngle > 95) return 'Deep Backward Square Leg';
    if (absAngle > 75) return 'Deep Square Leg';
    if (absAngle > 35) return 'Deep Mid-Wicket';
    if (absAngle > 15) return 'Long-On';
    return 'Straight Long-On';
  }
}

/**
 * Validates ICC fielding restriction compliance (Laws 28.1 & 28.4 and Competition Playing Conditions)
 */
export function validateFieldCompliance(fielders, presetId, handedness = 'RHB') {
  let outsideCount = 0;
  let legSideCount = 0;
  let offSideCount = 0;
  let behindSquareLegCount = 0;

  fielders.forEach(f => {
    const inside = isInsideCircle(f);
    if (!inside && f.role !== 'wk') {
      outsideCount++;
    }

    const side = getSide(f, handedness);
    if (side === 'Leg Side') {
      legSideCount++;
      // Behind striker popping crease on leg side
      if (isBehindPoppingCrease(f) && f.role !== 'wk') {
        behindSquareLegCount++;
      }
    } else if (side === 'Off Side') {
      offSideCount++;
    }
  });

  const isPowerplay = presetId === 'powerplay';
  const maxOutside = isPowerplay ? 2 : 5;
  const outsideCircleValid = outsideCount <= maxOutside;
  const legSideValid = legSideCount <= 5;
  const behindSquareValid = behindSquareLegCount <= 2;

  const violations = [];
  if (!outsideCircleValid) {
    violations.push(
      isPowerplay
        ? `Powerplay Violation: ${outsideCount} fielders outside 30yd circle (max 2 allowed)`
        : `Field Restriction Violation: ${outsideCount} fielders outside 30yd circle (max 5 allowed)`
    );
  }
  if (!legSideValid) {
    violations.push(`Law 28.1 Violation: ${legSideCount} fielders on Leg Side (max 5 allowed)`);
  }
  if (!behindSquareValid) {
    violations.push(`Law 28.4 Violation: ${behindSquareLegCount} fielders behind square on leg-side (max 2 allowed)`);
  }

  return {
    isValid: violations.length === 0,
    outsideCount,
    maxOutside,
    insideCount: 10 - outsideCount,
    legSideCount,
    offSideCount,
    behindSquareLegCount,
    violations,
  };
}
