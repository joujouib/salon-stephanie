// src/lib/colorFormula.js
//
// Formula Calculator — pure rule engine (§7.10 of docs/requirements.md).
//
// This is a rule-based expert system: deterministic, with NO React / fetch / DB,
// so it is trivially unit-testable (same pattern as src/lib/waitTime.js).
//
// Professional level system: level 1 (black) … 10 (lightest blonde). "Lift" is how
// many levels lighter we need to go. Guiding principles (Rule 11):
//   • color does not lift color   • toner does not lighten
//   • condition beats target      • if unsafe in one session, use multiple sessions
//
// Each block below is tagged with the numbered RULE it encodes.

// ─────────────────────────────────────────────────────────────────────────────
// Option constants — shared by the page + future tests (single source of truth)
// ─────────────────────────────────────────────────────────────────────────────
export const HAIR_STATUS = ["virgin", "previously-colored"];
export const CONDITIONS = ["healthy", "dry", "damaged", "very-damaged"];
export const TONES = [
  "natural", "ash", "pearl", "violet", "beige",
  "golden", "copper", "red", "chocolate", "mahogany",
];

export const LEVEL_MIN = 1;
export const LEVEL_MAX = 10;

// ─────────────────────────────────────────────────────────────────────────────
// Thresholds & lookup tables — adjust the numbers here (RULES 4, 5, 6, 7, 8, 9)
// ─────────────────────────────────────────────────────────────────────────────

// RULE 4 — virgin lift thresholds
const HIGH_LIFT_LIFT = 3;       // lift of exactly 3: bleach preferred; high-lift OK only on healthy virgin
const BLEACH_REQUIRED_LIFT = 4; // lift >= 4: bleach required

// RULE 11 / 9 — a big lift on already-damaged hair should be split across sessions
const MULTI_SESSION_LIFT = 4;

// RULE 5 — developer for depositing and the permanent-color lift ladder
const DEV_DEPOSIT = "10 vol";
const DEV_LIFT_1 = "20 vol";
const DEV_LIFT_2 = "30 vol";
const DEV_HIGH_LIFT = "40 vol";
// RULE 5 — bleach developer chosen by hair condition (very-damaged never bleaches)
const BLEACH_DEV_BY_CONDITION = { healthy: "30 vol", dry: "20 vol", damaged: "20 vol" };

// RULE 8 — mix ratios
const RATIO_PERMANENT = "1:1";
const RATIO_HIGH_LIFT = "1:2";
const RATIO_BLEACH = "1:2";

// RULE 6 — underlying pigment exposed at the level you lift TO
const PIGMENT_BY_LEVEL = {
  5: "Red-orange",
  6: "Orange",
  7: "Orange-yellow",
  8: "Yellow",
  9: "Pale yellow",
  10: "Very pale yellow",
};
// Approved extension: lifts that LAND at level <= 4 stay dark — a deep warm base shows.
// (The spec's pigment table only defines levels 5–10.)
const PIGMENT_DARK_BASE = "Deep red / brown base";

// RULE 7 — neutralizing tone = complement of the exposed pigment, keyed by level reached
const NEUTRALIZER_BY_LEVEL = {
  5: "Blue-green / ash",
  6: "Blue (ash)",
  7: "Blue-violet",
  8: "Violet",
  9: "Violet",
  10: "Pearl / violet",
};
const NEUTRALIZER_DARK_BASE = "Green / ash"; // complement of the deep red/brown base (extension)

// RULE 9 — exact owner-approved message for very-damaged hair (must be verbatim)
const VERY_DAMAGED_MESSAGE =
  "Lightening is not recommended. Consider multiple sessions or restorative treatments before bleaching.";

// RULE 3 / 11 — "color does not lift color"
const COLOR_CANNOT_LIFT_MESSAGE =
  "Permanent color cannot lift artificial pigment already in the hair — use bleach or a color remover, not permanent color alone.";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

// RULES 6 & 7 — look up exposed pigment + its neutralizer for the level lifted to.
function pigmentAndNeutralizer(targetLevel) {
  if (targetLevel >= 5) {
    return {
      underlyingPigment: PIGMENT_BY_LEVEL[targetLevel],
      neutralizingTone: NEUTRALIZER_BY_LEVEL[targetLevel],
    };
  }
  // Approved extension for lifts landing at level <= 4.
  return { underlyingPigment: PIGMENT_DARK_BASE, neutralizingTone: NEUTRALIZER_DARK_BASE };
}

function isIntegerNumber(n) {
  return typeof n === "number" && Number.isInteger(n);
}

// RULE 1 — validate inputs; throw a clear error the caller can surface.
function validate({ currentLevel, targetLevel, hairStatus, hairCondition, desiredTone }) {
  if (!isIntegerNumber(currentLevel) || currentLevel < LEVEL_MIN || currentLevel > LEVEL_MAX) {
    throw new Error(`currentLevel must be an integer ${LEVEL_MIN}–${LEVEL_MAX}.`);
  }
  if (!isIntegerNumber(targetLevel) || targetLevel < LEVEL_MIN || targetLevel > LEVEL_MAX) {
    throw new Error(`targetLevel must be an integer ${LEVEL_MIN}–${LEVEL_MAX}.`);
  }
  if (!HAIR_STATUS.includes(hairStatus)) {
    throw new Error(`hairStatus must be one of: ${HAIR_STATUS.join(", ")}.`);
  }
  if (!CONDITIONS.includes(hairCondition)) {
    throw new Error(`hairCondition must be one of: ${CONDITIONS.join(", ")}.`);
  }
  if (!TONES.includes(desiredTone)) {
    throw new Error(`desiredTone must be one of: ${TONES.join(", ")}.`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────────────────────
export function calculateFormula(input) {
  validate(input);
  const { currentLevel, targetLevel, hairStatus, hairCondition, desiredTone } = input;

  // Base result — each branch fills in the formula fields it needs.
  const result = {
    currentLevel,
    targetLevel,
    liftNeeded: 0,
    hairStatus,
    hairCondition,
    desiredTone,
    method: null,
    developer: null,
    mixRatio: null,
    underlyingPigment: null,
    neutralizingTone: null,
    alternativeMethod: null, // {method, developer, mixRatio, note} when an acceptable alt exists
    warnings: [],
    multiSession: false,
  };

  // RULE 2 — levels of lift needed (can be 0 or negative when depositing/going darker).
  const liftNeeded = targetLevel - currentLevel;
  result.liftNeeded = liftNeeded;
  const isLifting = liftNeeded > 0;

  // ── RULE 9 — highest precedence ────────────────────────────────────────────
  // Very damaged hair overrides every lifting recommendation. Never show a formula.
  if (hairCondition === "very-damaged" && isLifting) {
    result.method = "No lifting recommended — restore hair first";
    result.warnings.push(VERY_DAMAGED_MESSAGE);
    result.multiSession = true;
    return result;
  }

  // ── RULE 3 — deposit ───────────────────────────────────────────────────────
  // Lift <= 0 → depositing / toning only (virgin or colored). No pigment exposed.
  if (!isLifting) {
    result.method = "Deposit only (toner / gloss)";
    result.developer = DEV_DEPOSIT;
    result.mixRatio = RATIO_PERMANENT;
    // Depositing is not lifting, so it is allowed on compromised hair — but note it.
    if (hairCondition === "very-damaged" || hairCondition === "damaged") {
      result.warnings.push(
        "Hair is compromised — even when only depositing, use a gentle, conditioning product."
      );
    }
    return result;
  }

  // From here on: isLifting === true and hair is not very damaged.
  // RULES 6 & 7 — the pigment exposed by lifting and how to neutralize it.
  const { underlyingPigment, neutralizingTone } = pigmentAndNeutralizer(targetLevel);
  result.underlyingPigment = underlyingPigment;
  result.neutralizingTone = neutralizingTone;

  // ── RULE 3 — previously colored overrides the virgin ladder ────────────────
  // Color cannot lift color → bleach or remover, never permanent color alone.
  if (hairStatus === "previously-colored") {
    result.method = "Bleach or color remover";
    result.developer = BLEACH_DEV_BY_CONDITION[hairCondition];
    result.mixRatio = RATIO_BLEACH;
    result.warnings.push(COLOR_CANNOT_LIFT_MESSAGE);
  } else {
    // ── RULE 4 — virgin ladder (highest threshold checked first) ─────────────
    if (liftNeeded >= BLEACH_REQUIRED_LIFT) {
      // lift >= 4 → bleach required
      result.method = "Bleach (lightener)";
      result.developer = BLEACH_DEV_BY_CONDITION[hairCondition];
      result.mixRatio = RATIO_BLEACH;
    } else if (liftNeeded === HIGH_LIFT_LIFT) {
      // lift 3 → BLEACH is preferred; high-lift color is acceptable ONLY on healthy virgin hair.
      result.method = "Bleach (lightener)";
      result.developer = BLEACH_DEV_BY_CONDITION[hairCondition];
      result.mixRatio = RATIO_BLEACH;
      if (hairCondition === "healthy") {
        result.alternativeMethod = {
          method: "High-lift color",
          developer: DEV_HIGH_LIFT,
          mixRatio: RATIO_HIGH_LIFT,
          note: "Acceptable alternative on healthy virgin hair only",
        };
      }
    } else {
      // lift 1–2 → permanent color
      result.method = "Permanent color";
      result.developer = liftNeeded === 1 ? DEV_LIFT_1 : DEV_LIFT_2;
      result.mixRatio = RATIO_PERMANENT;
    }
  }

  // ── RULES 9 & 11 — warnings for compromised (but not very-damaged) hair ─────
  if (hairCondition === "damaged") {
    result.warnings.push(
      "Hair is damaged — keep developer at 20 vol maximum, do a strand test, and watch processing closely."
    );
    // RULE 11 — a big lift on damaged hair is not safe in one session.
    if (liftNeeded >= MULTI_SESSION_LIFT) {
      result.warnings.push(
        "This is a large lift (4+ levels) on damaged hair — consider splitting it into multiple sessions."
      );
      result.multiSession = true;
    }
  } else if (hairCondition === "dry" && result.method !== "Permanent color") {
    // Explain the gentler developer choice when lightening dry hair.
    result.warnings.push("Hair is dry — using a gentler 20 vol developer for lightening.");
  }

  return result;
}
