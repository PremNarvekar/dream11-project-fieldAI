import { 
  validateFieldCompliance, 
  getDistance, 
  isInsideCircle,
  resolveCricketPosition,
  SVG_CENTER, 
  BOUNDARY_RADIUS 
} from '../utils/cricketCalculations';

/**
 * Resolves the backend API base URL safely across environments.
 * - If VITE_BACKEND_URL is explicitly set (e.g. Render production URL), use it.
 * - If running in production (e.g. *.netlify.app) and no backend URL is set, return null
 *   to run the rich on-device tactical heuristic engine without throwing browser network errors.
 * - If running locally on localhost/127.0.0.1, fallback to local backend at http://localhost:8000.
 */
function getBackendUrl() {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Detect whether we are running on a remote/production domain (e.g. Netlify)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
    if (!isLocalhost) {
      // Connect directly to the live verified Render backend service
      return 'https://fieldvision-ai-backend.onrender.com';
    }
  }

  return 'http://localhost:8000';
}

/**
 * Validates AI-generated fielder adjustments:
 * 1. Checks that target coordinates are physically within the boundary rope.
 * 2. Checks that applying the adjustments does not violate ICC Law 28.
 */
export function validateAdjustmentRules(currentFielders, adjustments, presetId, handedness) {
  if (!adjustments || !Array.isArray(adjustments)) return { isValid: true, sanitizedAdjustments: [] };

  const sanitized = [];
  const simulatedFielders = currentFielders.map(f => ({ ...f }));

  for (const adj of adjustments) {
    if (!adj.fielderId || adj.targetX === undefined || adj.targetY === undefined) continue;

    // Check boundary constraint (radius <= 370)
    const dist = getDistance({ x: adj.targetX, y: adj.targetY }, SVG_CENTER);
    let validX = adj.targetX;
    let validY = adj.targetY;
    if (dist > BOUNDARY_RADIUS - 10) {
      const angle = Math.atan2(validY - SVG_CENTER.y, validX - SVG_CENTER.x);
      validX = Math.round(SVG_CENTER.x + Math.cos(angle) * (BOUNDARY_RADIUS - 10));
      validY = Math.round(SVG_CENTER.y + Math.sin(angle) * (BOUNDARY_RADIUS - 10));
    }

    sanitized.push({
      ...adj,
      targetX: validX,
      targetY: validY,
    });

    // Update simulated fielder with proper ring zone and position name
    const targetIdx = simulatedFielders.findIndex(f => f.id === adj.fielderId);
    if (targetIdx !== -1) {
      const inCircle = isInsideCircle({ x: validX, y: validY });
      const posName = adj.recommendedPosition || resolveCricketPosition(
        { x: validX, y: validY, role: simulatedFielders[targetIdx].role }, 
        handedness
      );

      simulatedFielders[targetIdx] = {
        ...simulatedFielders[targetIdx],
        x: validX,
        y: validY,
        ring: inCircle ? 'inner' : 'outer',
        posName: posName,
      };
    }
  }

  // Verify compliance of the adjusted field
  const compliance = validateFieldCompliance(simulatedFielders, presetId, handedness);

  return {
    isValid: compliance.isValid,
    violations: compliance.violations,
    sanitizedAdjustments: sanitized,
    simulatedFielders,
  };
}

/**
 * Queries the FastAPI Gemini backend with the full field telemetry payload.
 * Uses an AbortController with a 15-second timeout to prevent frontend hangs.
 */
export async function queryAITacticalAdvisor(question, telemetry) {
  const backendUrl = getBackendUrl();

  // If no live backend is available (e.g. deployed on Netlify without Render URL yet),
  // run the local rule-based tactical engine directly without attempting a doomed network call to localhost
  if (!backendUrl) {
    return {
      success: false,
      isLocalEngine: true,
      fallback: generateLocalFallbackResponse(question, telemetry),
    };
  }

  // Allow up to 60s for Render free-tier cold starts and Gemini 2.5 structured generation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${backendUrl}/api/tactical-advice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        telemetry,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        data,
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name !== 'AbortError') {
      console.info('Backend request notice:', err.message);
    }
  }

  // Graceful local fallback without hardcoded player names or arbitrary confidence percentages
  return {
    success: false,
    fallback: generateLocalFallbackResponse(question, telemetry),
  };
}

/**
 * Context-aware local tactical fallback dynamically derived from telemetry.
 */
function generateLocalFallbackResponse(question, telemetry) {
  const { striker, bowler, preset, fieldingRestrictions, fielders } = telemetry;
  const qLower = question.toLowerCase();

  const gaps = [];
  const deepCount = fieldingRestrictions.currentOutsideCircle;
  const legCount = fieldingRestrictions.legSideCount;

  if (legCount < 4) {
    gaps.push('Mid-Wicket / Cow Corner corridor has sparse coverage with only ' + legCount + ' fielders on the leg-side.');
  }
  if (deepCount < fieldingRestrictions.maxOutsideCircle) {
    gaps.push('Deep boundary has ' + (fieldingRestrictions.maxOutsideCircle - deepCount) + ' unused boundary rider allowance.');
  }

  // Find a fielder to adjust
  const coverFielder = fielders.find(f => f.sector === 'Off Side' && f.inCircle && f.role !== 'wk');
  const recommendedAdjustments = [];

  if (qLower.includes('gap') || qLower.includes('contain') || qLower.includes('boundary')) {
    if (coverFielder) {
      recommendedAdjustments.push({
        fielderId: coverFielder.id,
        currentPosition: coverFielder.currentLabel,
        recommendedPosition: 'Deep Extra Cover',
        targetX: striker.handedness === 'RHB' ? 220 : 680,
        targetY: 340,
        explanation: `Shift ${coverFielder.name} deeper to protect the primary driving arc against ${bowler.name}'s angled attack.`,
      });
    }
  }

  const warnings = [];
  if (!fieldingRestrictions.isCompliant) {
    warnings.push(...fieldingRestrictions.violations);
  }

  return {
    tacticalSummary: `Strategic field assessment for ${striker.name} (${striker.handedness}) against ${bowler.name} in the ${preset.name} phase.`,
    identifiedFieldGaps: gaps.length > 0 ? gaps : ['Deep backward square corridor requires vigilance against pull shots.'],
    recommendedAdjustments,
    explanations: recommendedAdjustments.map(a => a.explanation),
    applicableRuleWarnings: warnings,
    suggestedPreset: preset.id === 'powerplay' ? 'attacking' : 'defensive',
  };
}
