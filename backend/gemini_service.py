import os
import json
import logging
from typing import Optional
from dotenv import load_dotenv

from models import FieldTelemetryPayload, TacticalAdviceResponse, FielderAdjustment
from cricket_rules import validate_and_sanitize_adjustments

load_dotenv()

logger = logging.getLogger("fieldvision.gemini")

SYSTEM_INSTRUCTION = """
You are FieldVision AI, a premier elite cricket tactical analyst, biomechanics specialist, and fielding strategist.
You evaluate cricket field placements using precise spatial coordinates, 30-yard restriction circles, boundary geometry, and pitch dynamics.

Rules & Guidelines:
1. Ground dimensions: SVG coordinate space is 900x900. Center is (450, 450).
   Boundary rope radius is 380 units (~70 meters).
   North (y < 450) is Straight down the ground towards the bowler.
   South (y > 450) is behind the wickets towards the wicketkeeper.
   Batsman stands at popping crease (450, 498).
   For RHB: x < 450 is Off Side, x > 450 is Leg Side.
   For LHB: x > 450 is Off Side, x < 450 is Leg Side.
2. Fielding Restrictions (ICC Law 28):
   - At most 5 fielders permitted on the Leg Side at any time (Law 28.1).
   - At most 2 fielders (excluding wicketkeeper) permitted behind the popping crease on the leg side (Law 28.4).
   - In Powerplay: Maximum 2 fielders outside the 30-yard circle.
   - Non-Powerplay: Maximum 5 fielders outside the 30-yard circle.
3. GROUND REALITY & LIVE CONTEXT:
   - Always refer specifically to the real match context provided: batsman name, runs, strike rate, bowler name, style, bowling spell, and live score.
   - Reference the REAL player names in the fielding squad (e.g. Pat Cummins, Glenn Maxwell, Marcus Stoinis, Mitchell Starc, etc.).
   - Cite specific metric distances (e.g. '28 meters from batsman', 'boundary rider 68 meters out').
   - State specific open gaps based on the actual coordinate layout.
4. Your output must strictly conform to the required JSON schema:
   - tacticalSummary: Concise, high-level strategic reasoning referencing real players.
   - identifiedFieldGaps: Specific boundary gaps and vulnerabilities based on current coordinates.
   - recommendedAdjustments: Concrete adjustments with valid targetX and targetY coordinates.
   - explanations: Clear justification for each repositioning.
   - applicableRuleWarnings: Any rule constraints or warning flags.
   - suggestedPreset: One of 'powerplay', 'attacking', 'defensive', 'death_overs'.
"""

def generate_tactical_advice(question: str, telemetry: FieldTelemetryPayload) -> TacticalAdviceResponse:
    """
    Calls the Gemini API using the official Google GenAI Python SDK with automatic model failover,
    or falls back gracefully to a rules-backed tactical calculation if API key is not configured or all models busy.
    """
    if isinstance(telemetry, dict):
        telemetry = FieldTelemetryPayload(**telemetry)

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()

    # Detect placeholder / fake development keys
    is_fake_key = (
        not api_key
        or "fake" in api_key.lower()
        or "placeholder" in api_key.lower()
        or "your_gemini_api_key_here" in api_key.lower()
    )

    if not is_fake_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            telemetry_data = telemetry.model_dump() if hasattr(telemetry, "model_dump") else dict(telemetry)
            prompt = f"""
Current Match & Field Telemetry:
{json.dumps(telemetry_data, indent=2)}

User Question / Tactical Inquiry:
"{question}"

Analyze the spatial coordinates, gaps, and match context. Produce an optimal, rule-compliant field recommendation.
"""

            # Cascade across verified available flash models in case of temporary 503 load spikes
            candidate_models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.5-flash"]
            response = None
            used_model = "gemini-2.5-flash"

            for model_name in candidate_models:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=SYSTEM_INSTRUCTION,
                            response_mime_type="application/json",
                            response_schema=TacticalAdviceResponse,
                            temperature=0.2,
                        ),
                    )
                    if response and response.text:
                        used_model = model_name
                        break
                except Exception as model_err:
                    logger.warning(f"Gemini model {model_name} transient error: {model_err}, trying next candidate...")
                    continue

            if response and response.text:
                data = json.loads(response.text)
                advice = TacticalAdviceResponse(**data)
                advice.isLiveAI = True
                advice.modelUsed = used_model

                # Validate and sanitize coordinates against ICC rules
                sanitized_adj, warnings = validate_and_sanitize_adjustments(
                    fielders=telemetry.fielders,
                    adjustments=advice.recommendedAdjustments,
                    is_powerplay=telemetry.fieldingRestrictions.isPowerplay,
                    handedness=telemetry.striker.handedness,
                )
                advice.recommendedAdjustments = sanitized_adj
                if warnings:
                    advice.applicableRuleWarnings = list(set(advice.applicableRuleWarnings + warnings))

                return advice

        except Exception as e:
            logger.error(f"Gemini API cascade failed, using rule-based tactical fallback: {e}")

    # Fallback: Rule-backed tactical heuristics without arbitrary percentages or hardcoded player names
    return generate_rule_based_fallback(question, telemetry)

def generate_rule_based_fallback(question: str, telemetry: FieldTelemetryPayload) -> TacticalAdviceResponse:
    if isinstance(telemetry, dict):
        telemetry = FieldTelemetryPayload(**telemetry)

    striker = telemetry.striker
    bowler = telemetry.bowler
    preset = telemetry.preset
    restrictions = telemetry.fieldingRestrictions
    fielders = telemetry.fielders

    gaps = []
    if restrictions.legSideCount < 4:
        gaps.append(f"Mid-Wicket to Cow Corner corridor has sparse coverage ({restrictions.legSideCount} on Leg Side).")
    if restrictions.currentOutsideCircle < restrictions.maxOutsideCircle:
        gaps.append(f"Deep outfield has {restrictions.maxOutsideCircle - restrictions.currentOutsideCircle} available boundary protection slot(s).")
    if not gaps:
        gaps.append("Deep backward point boundary is vulnerable against upper cuts and thick outside edges.")

    # Select an appropriate fielder to reposition
    adjustments = []
    candidate = next((f for f in fielders if f.sector == "Off Side" and f.inCircle and f.role != "wk"), None)
    
    if candidate:
        target_x = 220.0 if striker.handedness == "RHB" else 680.0
        adjustments.append(
            FielderAdjustment(
                fielderId=candidate.id,
                currentPosition=candidate.currentLabel,
                recommendedPosition="Deep Extra Cover",
                targetX=target_x,
                targetY=330.0,
                explanation=f"Deepen {candidate.name} to the boundary rope to intercept {striker.name}'s lofted drive corridor against {bowler.name}."
            )
        )

    sanitized_adj, warnings = validate_and_sanitize_adjustments(
        fielders=fielders,
        adjustments=adjustments,
        is_powerplay=restrictions.isPowerplay,
        handedness=striker.handedness,
    )

    if not restrictions.isCompliant:
        warnings.extend(restrictions.violations)

    return TacticalAdviceResponse(
        tacticalSummary=f"Spatial evaluation for {striker.name} ({striker.handedness}) against {bowler.name} ({bowler.style}) in the {preset.name} phase.",
        identifiedFieldGaps=gaps,
        recommendedAdjustments=sanitized_adj,
        explanations=[a.explanation for a in sanitized_adj],
        applicableRuleWarnings=warnings,
        suggestedPreset="defensive" if preset.id == "powerplay" else "death_overs",
        isLiveAI=False,
        modelUsed="local-rules-engine",
    )
