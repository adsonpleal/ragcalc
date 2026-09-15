import { type Band, BANDS, DEFAULT_BAND, type Grade, GRADES, ITEM_BY_ID, SLOTS } from './exp-data';

// slotKey -> equipped itemId
export type Selection = Map<string, number>;

// slotKey -> grade of the item that slot's enchant sits on
export type Grades = Map<string, Grade>;

export interface ExpState {
  band: Band;
  selection: Selection;
  grades: Grades;
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
    grades: parseGrades(url.searchParams.get('gd')),
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

  const grades = serializeGrades(state);
  if (grades) params.set('gd', grades);
  else params.delete('gd');
}

// "encantoTopo.B,…" — only for slots holding an item a grade can change.
function serializeGrades(state: ExpState): string {
  const parts: string[] = [];
  for (const slot of SLOTS) {
    const grade = state.grades.get(slot.key);
    const id = state.selection.get(slot.key);
    if (!grade || id == null || !ITEM_BY_ID.get(id)?.gradeBonus) continue;
    parts.push(`${slot.key}.${grade}`);
  }
  return parts.join(',');
}

function parseGrades(raw: string | null): Grades {
  const grades: Grades = new Map();
  if (!raw) return grades;
  for (const part of raw.split(',')) {
    const [slotKey, grade] = part.split('.');
    if (!slotKey || !SLOTS.some((s) => s.key === slotKey)) continue;
    if (!GRADES.some((g) => g.key === grade)) continue;
    grades.set(slotKey, grade as Grade);
  }
  return grades;
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
