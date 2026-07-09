import { type Band, BANDS, DEFAULT_BAND, ITEM_BY_ID, SLOTS } from './exp-data';

// slotKey -> equipped itemId
export type Selection = Map<string, number>;

export interface ExpState {
  band: Band;
  selection: Selection;
}

// Slots that draw from each pool, in UI order (accessory pool has two slots).
const SLOTS_BY_POOL: ReadonlyMap<string, string[]> = (() => {
  const m = new Map<string, string[]>();
  for (const s of SLOTS) {
    const arr = m.get(s.pool);
    if (arr) arr.push(s.key);
    else m.set(s.pool, [s.key]);
  }
  return m;
})();

export function readExpState(): ExpState {
  const url = new URL(window.location.href);
  return {
    band: parseBand(url.searchParams.get('b')),
    selection: parseSelection(url.searchParams.get('g')),
  };
}

export function writeExpState(state: ExpState): void {
  const url = new URL(window.location.href);
  applyParams(url.searchParams, state);
  history.replaceState(null, '', url.toString());
}

export function buildExpShareUrl(state: ExpState): string {
  const url = new URL(window.location.href);
  applyParams(url.searchParams, state);
  return url.toString();
}

function applyParams(params: URLSearchParams, state: ExpState): void {
  const bandIdx = BANDS.findIndex((b) => b.key === state.band);
  if (state.band === DEFAULT_BAND || bandIdx < 0) params.delete('b');
  else params.set('b', String(bandIdx));

  const ids = serializeSelection(state.selection);
  if (ids) params.set('g', ids);
  else params.delete('g');
}

// Emit ids in slot order so grouping-by-pool round-trips (incl. accessory dups).
function serializeSelection(selection: Selection): string {
  const ids: number[] = [];
  for (const slot of SLOTS) {
    const id = selection.get(slot.key);
    if (id != null) ids.push(id);
  }
  return ids.join(',');
}

function parseBand(raw: string | null): Band {
  if (raw == null) return DEFAULT_BAND;
  const idx = Number.parseInt(raw, 10);
  return BANDS[idx]?.key ?? DEFAULT_BAND;
}

function parseSelection(raw: string | null): Selection {
  const selection: Selection = new Map();
  if (!raw) return selection;
  const cursor = new Map<string, number>();
  for (const part of raw.split(',')) {
    const id = Number.parseInt(part, 10);
    if (!Number.isFinite(id)) continue;
    const item = ITEM_BY_ID.get(id);
    if (!item) continue;
    const slots = SLOTS_BY_POOL.get(item.slot);
    if (!slots) continue;
    const next = cursor.get(item.slot) ?? 0;
    if (next >= slots.length) continue; // more ids than slots for this pool
    selection.set(slots[next]!, id);
    cursor.set(item.slot, next + 1);
  }
  return selection;
}
