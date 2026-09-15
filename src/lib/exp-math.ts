import { type Band, type ExpItem, type ExpSet, type Grade, ITEM_BY_ID, SETS } from './exp-data';

export interface ItemContribution {
  item: ExpItem;
  value: number;
  // An enchant whose base item is not equipped: listed, but worth nothing.
  inactive: boolean;
}

export interface SetContribution {
  set: ExpSet;
  bonus: number;
}

export interface ExpBreakdown {
  items: ItemContribution[];
  sets: SetContribution[];
  itemsTotal: number;
  setsTotal: number;
  total: number;
}

// Resolve a multiset of selected item ids (duplicates allowed — e.g. the same
// accessory in both accessory slots) into per-item and per-set contributions
// for a given level band, plus the grand total.
export function computeBreakdown(
  selectedIds: ReadonlyArray<number>,
  band: Band,
  sets: ReadonlyArray<ExpSet> = SETS,
  grades: ReadonlyMap<number, Grade> = new Map(),
): ExpBreakdown {
  const uniqueIds = new Set(selectedIds);
  const items: ItemContribution[] = [];
  for (const id of selectedIds) {
    const item = ITEM_BY_ID.get(id);
    if (!item) continue;
    const inactive = !requirementMet(item, uniqueIds);
    items.push({ item, value: inactive ? 0 : itemExp(item, band, grades.get(id)), inactive });
  }

  const setContribs: SetContribution[] = [];
  for (const set of sets) {
    if (set.bands && !set.bands.includes(band)) continue;
    if (set.items.every((itemId) => uniqueIds.has(itemId))) {
      setContribs.push({ set, bonus: set.bonus });
    }
  }

  const itemsTotal = items.reduce((sum, c) => sum + c.value, 0);
  const setsTotal = setContribs.reduce((sum, c) => sum + c.bonus, 0);
  return {
    items,
    sets: setContribs,
    itemsTotal,
    setsTotal,
    total: itemsTotal + setsTotal,
  };
}

const GRADE_TIERS: ReadonlyArray<'D' | 'C' | 'B'> = ['D', 'C', 'B'];
const GRADE_RANK: Record<Grade, number> = { D: 1, C: 2, B: 3, A: 4 };

// An item's EXP in a band at a given grade. Grade bonuses only add to a band
// where the item already counts: a 0 there means it cannot be used at all.
export function itemExp(item: ExpItem, band: Band, grade?: Grade | null): number {
  const base = item.exp[band];
  if (!grade || !item.gradeBonus || base === 0) return base;
  const bonus = item.gradeBonus;
  return GRADE_TIERS.reduce(
    (sum, tier) => (GRADE_RANK[grade] >= GRADE_RANK[tier] ? sum + bonus[tier] : sum),
    base,
  );
}

export function requirementMet(item: ExpItem, equipped: ReadonlySet<number>): boolean {
  return !item.requires || item.requires.some((id) => equipped.has(id));
}

export function totalExp(
  selectedIds: ReadonlyArray<number>,
  band: Band,
  sets: ReadonlyArray<ExpSet> = SETS,
  grades: ReadonlyMap<number, Grade> = new Map(),
): number {
  return computeBreakdown(selectedIds, band, sets, grades).total;
}
