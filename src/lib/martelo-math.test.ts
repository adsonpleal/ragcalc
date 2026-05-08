import { describe, expect, it } from 'vitest';
import {
  chanceForHammers,
  chancePerHammer,
  expectedHammers,
  hammersForChance,
  MARTELO_CONFIG,
  MARTELO_REFINEMENT_TABLE,
} from './martelo-math';

describe('martelo refinement table', () => {
  it('sums to 1.0', () => {
    const sum = MARTELO_REFINEMENT_TABLE.reduce((a, r) => a + r.chance, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it('covers refinements +1 through +10', () => {
    expect(MARTELO_REFINEMENT_TABLE).toHaveLength(10);
    MARTELO_REFINEMENT_TABLE.forEach((r, i) => {
      expect(r.level).toBe(i + 1);
    });
  });
});

describe('chancePerHammer', () => {
  it('is 1 for target +1 (any roll satisfies it)', () => {
    expect(chancePerHammer(MARTELO_CONFIG, 1)).toBeCloseTo(1, 9);
  });

  it('is 0.0825 for target +7 (sum of +7..+10 chances)', () => {
    // 0.044 + 0.022 + 0.011 + 0.0055 = 0.0825
    expect(chancePerHammer(MARTELO_CONFIG, 7)).toBeCloseTo(0.0825, 9);
  });

  it('is 0.0055 for target +10', () => {
    expect(chancePerHammer(MARTELO_CONFIG, 10)).toBeCloseTo(0.0055, 9);
  });

  it('is monotonically decreasing as target increases', () => {
    let prev = Infinity;
    for (let t = 1; t <= 10; t++) {
      const p = chancePerHammer(MARTELO_CONFIG, t);
      expect(p).toBeLessThanOrEqual(prev);
      prev = p;
    }
  });

  it('throws for out-of-range target', () => {
    expect(() => chancePerHammer(MARTELO_CONFIG, 0)).toThrow();
    expect(() => chancePerHammer(MARTELO_CONFIG, 11)).toThrow();
  });
});

describe('expectedHammers', () => {
  it('matches 1/p for non-degenerate target', () => {
    for (const t of [2, 5, 7, 9, 10]) {
      const p = chancePerHammer(MARTELO_CONFIG, t);
      expect(expectedHammers(MARTELO_CONFIG, t)).toBeCloseTo(1 / p, 9);
    }
  });

  it('is 1 for target +1 (p = 1)', () => {
    expect(expectedHammers(MARTELO_CONFIG, 1)).toBe(1);
  });

  it('is ~12.12 for target +7', () => {
    expect(expectedHammers(MARTELO_CONFIG, 7)).toBeCloseTo(12.121, 2);
  });

  it('is ~181.8 for target +10', () => {
    expect(expectedHammers(MARTELO_CONFIG, 10)).toBeCloseTo(181.818, 2);
  });
});

describe('hammersForChance', () => {
  it('returns 1 for target +1 regardless of chance', () => {
    expect(hammersForChance(MARTELO_CONFIG, 1, 0.25)).toBe(1);
    expect(hammersForChance(MARTELO_CONFIG, 1, 0.5)).toBe(1);
    expect(hammersForChance(MARTELO_CONFIG, 1, 0.99)).toBe(1);
  });

  it('returns 0 for chance <= 0', () => {
    expect(hammersForChance(MARTELO_CONFIG, 7, 0)).toBe(0);
    expect(hammersForChance(MARTELO_CONFIG, 7, -0.5)).toBe(0);
  });

  it('matches geometric quantile pinned values for target +7', () => {
    expect(hammersForChance(MARTELO_CONFIG, 7, 0.5)).toBe(9);
    expect(hammersForChance(MARTELO_CONFIG, 7, 0.9)).toBe(27);
    expect(hammersForChance(MARTELO_CONFIG, 7, 0.99)).toBe(54);
  });

  it('matches a brute-force search for several (target, chance) pairs', () => {
    for (const target of [2, 4, 7, 9]) {
      for (const chance of [0.25, 0.5, 0.75, 0.9, 0.95, 0.99]) {
        const got = hammersForChance(MARTELO_CONFIG, target, chance);
        const p = chancePerHammer(MARTELO_CONFIG, target);
        let n = 0;
        let cum = 0;
        while (cum < chance && n < 100_000) {
          n++;
          cum = 1 - Math.pow(1 - p, n);
        }
        expect(got).toBe(n);
      }
    }
  });
});

describe('chanceForHammers', () => {
  it('returns 0 for 0 hammers', () => {
    expect(chanceForHammers(MARTELO_CONFIG, 7, 0)).toBe(0);
  });

  it('returns p for 1 hammer', () => {
    const p = chancePerHammer(MARTELO_CONFIG, 7);
    expect(chanceForHammers(MARTELO_CONFIG, 7, 1)).toBeCloseTo(p, 9);
  });

  it('returns 1 for target +1 with any positive hammer count', () => {
    expect(chanceForHammers(MARTELO_CONFIG, 1, 1)).toBe(1);
    expect(chanceForHammers(MARTELO_CONFIG, 1, 100)).toBe(1);
  });

  it('round-trips with hammersForChance', () => {
    for (const target of [2, 5, 7, 10]) {
      for (const chance of [0.25, 0.5, 0.9, 0.99]) {
        const n = hammersForChance(MARTELO_CONFIG, target, chance);
        // n hammers should clear the bar
        expect(chanceForHammers(MARTELO_CONFIG, target, n)).toBeGreaterThanOrEqual(
          chance - 1e-9,
        );
        // n-1 hammers should fall short (when n > 1)
        if (n > 1) {
          expect(chanceForHammers(MARTELO_CONFIG, target, n - 1)).toBeLessThan(chance);
        }
      }
    }
  });
});
