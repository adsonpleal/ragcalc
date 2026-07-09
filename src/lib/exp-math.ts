import { type Band, type ExpItem, type ExpSet, ITEM_BY_ID, SETS } from './exp-data';

export interface ItemContribution {
  item: ExpItem;
  value: number;
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
): ExpBreakdown {
  const items: ItemContribution[] = [];
  for (const id of selectedIds) {
    const item = ITEM_BY_ID.get(id);
    if (item) items.push({ item, value: item.exp[band] });
  }

  const uniqueIds = new Set(selectedIds);
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

export function totalExp(
  selectedIds: ReadonlyArray<number>,
  band: Band,
  sets: ReadonlyArray<ExpSet> = SETS,
): number {
  return computeBreakdown(selectedIds, band, sets).total;
}
