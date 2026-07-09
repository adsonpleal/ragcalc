import rawClasses from './classes.json';

export type Gender = 'male' | 'female';

// A playable class/job for the paperdoll. `id` is the sprite ClassNum sent as
// the `job` param to the ragassets gateway. `genders` lists which body sprites
// exist (some classes are gender-locked, e.g. Musa is female-only).
export interface CharClass {
  id: number;
  name: string;
  group: string;
  genders: Gender[];
}

interface RawClass {
  id: number;
  name: string;
  group: string;
  palettes: { m?: unknown; f?: unknown };
}

// Group display order + pt-BR labels for the grouped <select>.
export const CLASS_GROUPS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'novice', label: 'Inicial' },
  { key: 'first', label: 'Primeira Classe' },
  { key: 'second', label: 'Segunda Classe' },
  { key: 'trans', label: 'Transcendental' },
  { key: 'third', label: 'Terceira Classe' },
  { key: 'fourth', label: 'Quarta Classe' },
  { key: 'expanded', label: 'Classes Expandidas' },
  { key: 'doram', label: 'Doram' },
];

export const CLASSES: ReadonlyArray<CharClass> = (rawClasses.classes as RawClass[]).map(
  (c) => {
    const genders: Gender[] = [];
    if (c.palettes.m) genders.push('male');
    if (c.palettes.f) genders.push('female');
    return { id: c.id, name: c.name, group: c.group, genders };
  },
);

export const CLASS_BY_ID: ReadonlyMap<number, CharClass> = new Map(
  CLASSES.map((c) => [c.id, c]),
);

export const DEFAULT_CLASS_ID = 0; // Aprendiz

// Fall back to an available gender when the picked class is gender-locked.
export function resolveGender(classId: number, desired: Gender): Gender {
  const cls = CLASS_BY_ID.get(classId);
  if (!cls || cls.genders.length === 0) return desired;
  return cls.genders.includes(desired) ? desired : cls.genders[0]!;
}

// The newest 4th jobs have no party-emblem icon in the client, so ragassets
// can't serve /icons/job/<id>.png for them — fall back to a head-framed sprite
// render (same trick latamvisuais uses). Gender-locked ones render in their sex.
const JOB_ICON_FALLBACK: Record<number, Gender> = {
  4302: 'male', // Sky Emperor
  4303: 'male', // Soul Ascetic
  4304: 'male', // Shinkiro (male-locked)
  4305: 'female', // Shiranui (female-locked)
  4306: 'male', // Night Watch
  4307: 'male', // Hyper Novice
};

// Party-emblem icon for a class (25×25), with a sprite-render fallback.
export function jobIconUrl(id: number): string {
  const gender = JOB_ICON_FALLBACK[id];
  if (gender) {
    const p = new URLSearchParams();
    p.set('job', String(id));
    p.set('gender', gender);
    p.set('head', '1');
    p.set('action', '0');
    p.set('frame', '0');
    p.set('headdir', '0');
    p.set('canvas', '44x40+22+86');
    return `https://assets.latam-tools.com.br/image?${p.toString()}`;
  }
  return `https://assets.latam-tools.com.br/icons/job/${id}.png`;
}
