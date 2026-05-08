import type { CalculatorCard } from './enchant-dp';

export interface MarteloRefinement {
  level: number;
  chance: number;
}

// Reroll table sums to 1.0. Source: browiki.org/wiki/Combinação
export const MARTELO_REFINEMENT_TABLE: ReadonlyArray<MarteloRefinement> = [
  { level: 1, chance: 0.044 },
  { level: 2, chance: 0.0879 },
  { level: 3, chance: 0.1703 },
  { level: 4, chance: 0.3516 },
  { level: 5, chance: 0.1758 },
  { level: 6, chance: 0.0879 },
  { level: 7, chance: 0.044 },
  { level: 8, chance: 0.022 },
  { level: 9, chance: 0.011 },
  { level: 10, chance: 0.0055 },
];

export interface MarteloConfig extends CalculatorCard {
  id: string;
  title: string;
  itemNameShort: string;
  itemNameShortPlural: string;
  referenceUrl: string;
  referenceLabel: string;
  refinements: ReadonlyArray<MarteloRefinement>;
  minTarget: number;
  maxTarget: number;
}

export const MARTELO_CONFIG: MarteloConfig = {
  id: 'martelo',
  slug: 'martelo',
  title: 'Martelo de Refino Sombrio',
  shortTitle: 'Martelo de Refino Sombrio',
  itemName: 'Martelo de Refino Sombrio',
  itemNameShort: 'Martelo',
  itemNameShortPlural: 'Martelos',
  description:
    'Calcule a quantidade de Martelos de Refino Sombrio para alcançar um refino alvo (≥+N).',
  referenceUrl: 'https://browiki.org/wiki/Combina%C3%A7%C3%A3o',
  referenceLabel: 'Combinação (browiki.org)',
  refinements: MARTELO_REFINEMENT_TABLE,
  minTarget: 1,
  maxTarget: 10,
};

function validateTarget(cfg: MarteloConfig, target: number): void {
  if (!Number.isInteger(target)) {
    throw new Error(`target must be integer, got ${target}`);
  }
  if (target < cfg.minTarget || target > cfg.maxTarget) {
    throw new Error(
      `target ${target} out of range [${cfg.minTarget}, ${cfg.maxTarget}]`,
    );
  }
}

// Per-hammer probability of landing >= target. Each hammer rerolls independently.
export function chancePerHammer(cfg: MarteloConfig, target: number): number {
  validateTarget(cfg, target);
  let p = 0;
  for (const r of cfg.refinements) {
    if (r.level >= target) p += r.chance;
  }
  return Math.min(1, p);
}

// Mean of the geometric distribution: 1/p.
export function expectedHammers(cfg: MarteloConfig, target: number): number {
  const p = chancePerHammer(cfg, target);
  if (p >= 1) return 1;
  if (p <= 0) return Infinity;
  return 1 / p;
}

// Smallest N such that 1 - (1-p)^N >= chance.
// Closed form: N = ceil(log(1-chance) / log(1-p)). At least 1 when chance > 0.
export function hammersForChance(
  cfg: MarteloConfig,
  target: number,
  chance: number,
): number {
  if (chance <= 0) return 0;
  if (chance > 1) throw new Error(`chance must be <= 1, got ${chance}`);
  const p = chancePerHammer(cfg, target);
  if (p >= 1) return 1;
  if (p <= 0) return Infinity;
  if (chance >= 1) return Infinity;
  const n = Math.log(1 - chance) / Math.log(1 - p);
  return Math.max(1, Math.ceil(n));
}

// P(success after N hammers) = 1 - (1-p)^N.
export function chanceForHammers(
  cfg: MarteloConfig,
  target: number,
  hammers: number,
): number {
  if (!Number.isFinite(hammers) || hammers <= 0) return 0;
  const n = Math.floor(hammers);
  if (n <= 0) return 0;
  const p = chancePerHammer(cfg, target);
  if (p >= 1) return 1;
  if (p <= 0) return 0;
  return 1 - Math.pow(1 - p, n);
}
