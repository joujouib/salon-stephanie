import { calculateFormula } from "./colorFormula";

// Base case builder — each test overrides only what it cares about
function calc(overrides = {}) {
  return calculateFormula({
    currentLevel: 5,
    targetLevel: 6,
    hairStatus: "virgin",
    hairCondition: "healthy",
    desiredTone: "natural",
    ...overrides,
  });
}

describe("RULE 1 — input validation", () => {
  test("rejects levels outside 1–10", () => {
    expect(() => calc({ currentLevel: 0 })).toThrow();
    expect(() => calc({ targetLevel: 11 })).toThrow();
  });

  test("rejects unknown enum values", () => {
    expect(() => calc({ hairStatus: "bleached" })).toThrow();
    expect(() => calc({ hairCondition: "crispy" })).toThrow();
    expect(() => calc({ desiredTone: "purple" })).toThrow();
  });
});

describe("RULE 2 — lift calculation", () => {
  test("lift is target minus current", () => {
    expect(calc({ currentLevel: 5, targetLevel: 8 }).liftNeeded).toBe(3);
    expect(calc({ currentLevel: 7, targetLevel: 5 }).liftNeeded).toBe(-2);
    expect(calc({ currentLevel: 6, targetLevel: 6 }).liftNeeded).toBe(0);
  });
});

describe("RULE 3 — deposit only when not lifting", () => {
  test("going darker deposits, no pigment exposed", () => {
    const r = calc({ currentLevel: 7, targetLevel: 5 });
    expect(r.method).toBe("Deposit only (toner / gloss)");
    expect(r.developer).toBe("10 vol");
    expect(r.mixRatio).toBe("1:1");
    expect(r.underlyingPigment).toBeNull();
    expect(r.neutralizingTone).toBeNull();
  });

  test("same level deposits", () => {
    expect(calc({ currentLevel: 6, targetLevel: 6 }).method).toBe("Deposit only (toner / gloss)");
  });

  test("very damaged hair may still deposit (no refusal)", () => {
    const r = calc({ currentLevel: 7, targetLevel: 5, hairCondition: "very-damaged" });
    expect(r.method).toBe("Deposit only (toner / gloss)");
    expect(r.multiSession).toBe(false);
    expect(r.warnings.length).toBeGreaterThan(0); // gentle-product note
  });
});

describe("RULE 3 — color does not lift color", () => {
  test("previously colored hair needs bleach or remover, never permanent color", () => {
    const r = calc({ currentLevel: 6, targetLevel: 8, hairStatus: "previously-colored" });
    expect(r.method).toBe("Bleach or color remover");
    expect(r.mixRatio).toBe("1:2");
    expect(r.warnings.some((w) => w.includes("cannot lift artificial pigment"))).toBe(true);
    expect(r.alternativeMethod).toBeNull(); // no high-lift shortcut on colored hair
  });
});

describe("RULE 4 — virgin lift ladder", () => {
  test("lift 1 uses permanent color at 20 vol", () => {
    const r = calc({ currentLevel: 6, targetLevel: 7 });
    expect(r.method).toBe("Permanent color");
    expect(r.developer).toBe("20 vol");
    expect(r.mixRatio).toBe("1:1");
  });

  test("lift 2 uses permanent color at 30 vol", () => {
    const r = calc({ currentLevel: 5, targetLevel: 7 });
    expect(r.method).toBe("Permanent color");
    expect(r.developer).toBe("30 vol");
  });

  test("lift 3 prefers bleach, offering high-lift only on HEALTHY virgin hair", () => {
    const healthy = calc({ currentLevel: 5, targetLevel: 8, hairCondition: "healthy" });
    expect(healthy.method).toBe("Bleach (lightener)");
    expect(healthy.alternativeMethod.method).toBe("High-lift color");
    expect(healthy.alternativeMethod.developer).toBe("40 vol");

    const dry = calc({ currentLevel: 5, targetLevel: 8, hairCondition: "dry" });
    expect(dry.method).toBe("Bleach (lightener)");
    expect(dry.alternativeMethod).toBeNull(); // not healthy → no high-lift option
  });

  test("lift 4+ requires bleach with no alternative", () => {
    const r = calc({ currentLevel: 4, targetLevel: 8 });
    expect(r.method).toBe("Bleach (lightener)");
    expect(r.alternativeMethod).toBeNull();
  });
});

describe("RULE 5 — bleach developer follows hair condition", () => {
  test("healthy 30 vol, dry and damaged 20 vol", () => {
    expect(calc({ currentLevel: 4, targetLevel: 8, hairCondition: "healthy" }).developer).toBe("30 vol");
    expect(calc({ currentLevel: 4, targetLevel: 8, hairCondition: "dry" }).developer).toBe("20 vol");
    expect(calc({ currentLevel: 4, targetLevel: 8, hairCondition: "damaged" }).developer).toBe("20 vol");
  });
});

describe("RULES 6 & 7 — exposed pigment and its neutralizer", () => {
  test("pigment matches the level lifted TO", () => {
    expect(calc({ currentLevel: 4, targetLevel: 5 }).underlyingPigment).toBe("Red-orange");
    expect(calc({ currentLevel: 4, targetLevel: 6 }).underlyingPigment).toBe("Orange");
    expect(calc({ currentLevel: 5, targetLevel: 7 }).underlyingPigment).toBe("Orange-yellow");
    expect(calc({ currentLevel: 6, targetLevel: 8 }).underlyingPigment).toBe("Yellow");
    expect(calc({ currentLevel: 7, targetLevel: 9 }).underlyingPigment).toBe("Pale yellow");
    expect(calc({ currentLevel: 8, targetLevel: 10 }).underlyingPigment).toBe("Very pale yellow");
  });

  test("neutralizer is the complement of the exposed pigment", () => {
    expect(calc({ currentLevel: 4, targetLevel: 6 }).neutralizingTone).toBe("Blue (ash)");
    expect(calc({ currentLevel: 6, targetLevel: 8 }).neutralizingTone).toBe("Violet");
    expect(calc({ currentLevel: 8, targetLevel: 10 }).neutralizingTone).toBe("Pearl / violet");
  });

  test("lifts landing at level 4 or below expose a deep warm base (approved extension)", () => {
    const r = calc({ currentLevel: 2, targetLevel: 4 });
    expect(r.underlyingPigment).toBe("Deep red / brown base");
    expect(r.neutralizingTone).toBe("Green / ash");
  });
});

describe("RULE 9 — condition beats target", () => {
  test("very damaged hair refuses lifting with the exact approved message", () => {
    const r = calc({ currentLevel: 7, targetLevel: 10, hairCondition: "very-damaged" });
    expect(r.method).toBe("No lifting recommended — restore hair first");
    expect(r.warnings).toContain(
      "Lightening is not recommended. Consider multiple sessions or restorative treatments before bleaching."
    );
    expect(r.multiSession).toBe(true);
    // No formula may be offered
    expect(r.developer).toBeNull();
    expect(r.mixRatio).toBeNull();
    expect(r.alternativeMethod).toBeNull();
  });

  test("damaged hair always warns", () => {
    const r = calc({ currentLevel: 6, targetLevel: 7, hairCondition: "damaged" });
    expect(r.warnings.some((w) => w.includes("damaged"))).toBe(true);
  });
});

describe("RULE 11 — multiple sessions when one is unsafe", () => {
  test("damaged hair with a 4+ level lift is flagged multi-session", () => {
    expect(calc({ currentLevel: 3, targetLevel: 8, hairCondition: "damaged" }).multiSession).toBe(true);
  });

  test("damaged hair with a small lift is not", () => {
    expect(calc({ currentLevel: 6, targetLevel: 7, hairCondition: "damaged" }).multiSession).toBe(false);
  });

  test("healthy hair with a big lift is not flagged", () => {
    expect(calc({ currentLevel: 3, targetLevel: 8, hairCondition: "healthy" }).multiSession).toBe(false);
  });
});