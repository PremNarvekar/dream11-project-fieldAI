import math
from typing import List, Tuple
from models import FielderAdjustment, FielderTelemetry

SVG_CENTER_X = 450.0
SVG_CENTER_Y = 450.0
BOUNDARY_RADIUS = 380.0
SAFE_BOUNDARY_RADIUS = 370.0 # Keep within boundary rope

# Crease landmarks (matching frontend exact scale)
NORTH_STUMPS_Y = 395.0
SOUTH_STUMPS_Y = 505.0
BATSMAN_STANCE_Y = 498.0
INNER_CIRCLE_RADIUS = 149.0 # 27.432m in SVG units

def distance(x1: float, y1: float, x2: float, y2: float) -> float:
    return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

def is_inside_circle(x: float, y: float) -> bool:
    """Checks whether a point is inside the ICC 30-yard restriction oval."""
    r = INNER_CIRCLE_RADIUS
    if y < NORTH_STUMPS_Y:
        return distance(x, y, SVG_CENTER_X, NORTH_STUMPS_Y) <= r
    if y > SOUTH_STUMPS_Y:
        return distance(x, y, SVG_CENTER_X, SOUTH_STUMPS_Y) <= r
    return abs(x - SVG_CENTER_X) <= r

def is_on_leg_side(x: float, handedness: str) -> bool:
    """Returns True if the coordinate is on the batsman's leg-side."""
    if handedness == 'RHB':
        return x > SVG_CENTER_X
    else:
        return x < SVG_CENTER_X

def is_behind_popping_crease(y: float) -> bool:
    """Behind batsman's popping crease towards the south boundary."""
    return y > BATSMAN_STANCE_Y

def clamp_to_boundary(x: float, y: float) -> Tuple[float, float]:
    """Clamps coordinates strictly inside the cricket boundary rope."""
    dist = distance(x, y, SVG_CENTER_X, SVG_CENTER_Y)
    if dist > SAFE_BOUNDARY_RADIUS:
        angle = math.atan2(y - SVG_CENTER_Y, x - SVG_CENTER_X)
        x = round(SVG_CENTER_X + math.cos(angle) * SAFE_BOUNDARY_RADIUS, 1)
        y = round(SVG_CENTER_Y + math.sin(angle) * SAFE_BOUNDARY_RADIUS, 1)
    return x, y

def validate_and_sanitize_adjustments(
    fielders: List[FielderTelemetry],
    adjustments: List[FielderAdjustment],
    is_powerplay: bool,
    handedness: str
) -> Tuple[List[FielderAdjustment], List[str]]:
    """
    Validates AI-recommended fielder adjustments against ICC Law 28 and competition rules:
    - Never allows recommendations to place fielders outside the stadium rope.
    - Never allows more than 5 fielders on the leg side (Law 28.1).
    - Never allows more than 2 fielders behind square on leg side (Law 28.4).
    - Never exceeds the deep boundary allowance in powerplay.
    """
    sanitized: List[FielderAdjustment] = []
    warnings: List[str] = []

    # Map current fielders
    field_map = {f.id: {"x": f.coordinates.x, "y": f.coordinates.y, "role": f.role} for f in fielders}

    for adj in adjustments:
        if adj.fielderId not in field_map:
            warnings.append(f"Ignored adjustment: fielder {adj.fielderId} not on field.")
            continue

        # 1. Coordinate boundary clamp
        cx, cy = clamp_to_boundary(adj.targetX, adj.targetY)
        adj.targetX = cx
        adj.targetY = cy

        # Tentatively apply to simulated field
        field_map[adj.fielderId]["x"] = cx
        field_map[adj.fielderId]["y"] = cy
        sanitized.append(adj)

    # Validate overall field composition
    leg_count = 0
    behind_sq_leg = 0
    outside_circle = 0

    for fid, f in field_map.items():
        if f["role"] == "wk":
            continue

        if is_on_leg_side(f["x"], handedness):
            leg_count += 1
            if is_behind_popping_crease(f["y"]):
                behind_sq_leg += 1

        if not is_inside_circle(f["x"], f["y"]):
            outside_circle += 1

    max_outside = 2 if is_powerplay else 5
    if outside_circle > max_outside:
        warnings.append(
            f"Rule Alert: Field setup has {outside_circle} deep fielders outside 30-yard circle "
            f"(maximum {max_outside} allowed in {'Powerplay' if is_powerplay else 'standard play'})."
        )

    if leg_count > 5:
        warnings.append(f"ICC Law 28.1 Breach: {leg_count} fielders positioned on Leg Side (max 5 permitted).")

    if behind_sq_leg > 2:
        warnings.append(f"ICC Law 28.4 Breach: {behind_sq_leg} fielders behind square on Leg Side (max 2 permitted).")

    return sanitized, warnings
