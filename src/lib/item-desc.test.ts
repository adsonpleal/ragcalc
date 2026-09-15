import { describe, expect, it } from 'vitest';
import descriptions from './exp-descriptions.json';
import { ITEMS } from './exp-data';
import { formatItemDescription } from './item-desc';

describe('formatItemDescription', () => {
  it('turns ^RRGGBB into colored spans and ^000000 back into plain text', () => {
    expect(formatItemDescription('Tipo: ^777777Capa^000000 fim')).toBe(
      'Tipo: <span style="color:#777777">Capa</span> fim',
    );
  });

  it('closes a color the text never resets, and switches colors without nesting', () => {
    expect(formatItemDescription('^0000ffA^fa4e09B')).toBe(
      '<span style="color:#0000ff">A</span><span style="color:#fa4e09">B</span>',
    );
  });

  it('keeps a NAVI label but drops its coordinates', () => {
    expect(
      formatItemDescription('Pode receber um <NAVI>[Slot de carta]<INFO>itemmall,18,66,0,100,0,0</INFO></NAVI>.'),
    ).toBe('Pode receber um [Slot de carta].');
  });

  it('escapes HTML and turns newlines into <br>', () => {
    expect(formatItemDescription('a < b & "c"\nd')).toBe('a &lt; b &amp; &quot;c&quot;<br>d');
  });
});

describe('exp-descriptions.json', () => {
  it('only holds items the EXP list still has', () => {
    // A removed item should take its description with it on the next sync.
    const ids = new Set(ITEMS.map((i) => String(i.id)));
    expect(Object.keys(descriptions).filter((id) => !ids.has(id))).toEqual([]);
  });
});
