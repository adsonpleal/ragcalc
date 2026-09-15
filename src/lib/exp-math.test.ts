import { describe, expect, it } from 'vitest';
import { type Grade, ITEM_BY_ID, SLOT_BY_KEY } from './exp-data';
import { computeBreakdown, itemExp, totalExp } from './exp-math';

describe('computeBreakdown / totalExp', () => {
  it('Super Óculos Poring alone gives +5%', () => {
    const b = computeBreakdown([19117], 'de100a174');
    expect(b.itemsTotal).toBe(5);
    expect(b.setsTotal).toBe(0);
    expect(b.total).toBe(5);
  });

  it('Super Óculos Poring + Botas do ArchAngeling gives +5% set (total +10%)', () => {
    const b = computeBreakdown([19117, 22101], 'de100a174');
    expect(b.itemsTotal).toBe(5); // botas have no exp of their own
    expect(b.setsTotal).toBe(5);
    expect(b.total).toBe(10);
    expect(b.sets).toHaveLength(1);
    expect(b.sets[0]!.set.note).toContain('Super Óculos Poring');
  });

  it('the three Pedras de EXP give 2+2+2 plus a +3% set', () => {
    const b = computeBreakdown([25171, 25141, 25015], 'de100a174');
    expect(b.itemsTotal).toBe(6);
    expect(b.setsTotal).toBe(3);
    expect(b.total).toBe(9);
  });

  it('two of the three pedras do NOT trigger the set bonus', () => {
    const b = computeBreakdown([25171, 25141], 'de100a174');
    expect(b.setsTotal).toBe(0);
    expect(b.total).toBe(4);
  });

  it('Manopla + Escudo Sombrio de EXP: 30+30 up to nv.174, 20+20 at 175+', () => {
    expect(totalExp([24770, 24683], 'ate99')).toBe(60);
    expect(totalExp([24770, 24683], 'de100a174')).toBe(60);
    expect(totalExp([24770, 24683], 'nv175mais')).toBe(40);
  });

  it('Tiara Felina is +10% up to 99 and +4% otherwise', () => {
    expect(totalExp([19242], 'ate99')).toBe(10);
    expect(totalExp([19242], 'de100a174')).toBe(4);
    expect(totalExp([19242], 'nv175mais')).toBe(4);
  });

  it('Luvas de Caça + Carta Diabinho: 5 + 10 items plus a +5% (raça Bruto) set', () => {
    const b = computeBreakdown([2984, 4204], 'de100a174');
    expect(b.itemsTotal).toBe(15);
    expect(b.setsTotal).toBe(5);
    expect(b.total).toBe(20);
    expect(b.sets[0]!.set.note).toContain('Bruto');
  });

  it('a band-restricted set only applies inside its bands', () => {
    // Escudo+Greva Sombria do Iniciante: bonus only on band "ate99".
    expect(computeBreakdown([24211, 24210], 'ate99').setsTotal).toBe(20);
    expect(computeBreakdown([24211, 24210], 'de100a174').setsTotal).toBe(0);
  });

  it('Escudo+Greva Sombria Avançada only exist at nv.100-149: 3+3 plus a +4% set', () => {
    expect(totalExp([24215, 24214], 'ate99')).toBe(0);
    expect(totalExp([24215, 24214], 'de100a174')).toBe(10);
    expect(totalExp([24215, 24214], 'nv175mais')).toBe(0);
  });

  it('Escudo+Greva Sombria do Novato: +1% a cada 2 refinos each, plus a +10% set', () => {
    expect(totalExp([24213, 24212], 'ate99')).toBe(20);
  });

  it('Carta Baby Shark counts in the garment card slot', () => {
    expect(ITEM_BY_ID.get(300834)?.slot).toBe('cartaCapa');
    expect(SLOT_BY_KEY.get('cartaCapa')?.pool).toBe('cartaCapa');
    expect(totalExp([480824, 300834], 'de100a174')).toBe(25);
  });

  it('Mestre dos Mestres only counts on a Balão Poring', () => {
    const alone = computeBreakdown([311004], 'de100a174');
    expect(alone.total).toBe(0);
    expect(alone.items[0]!.inactive).toBe(true);
    expect(totalExp([19143, 311004], 'de100a174')).toBe(10);
    // Balões da Família Poring is not enchantable.
    expect(totalExp([19095, 311004], 'de100a174')).toBe(5);
  });

  it('Medalha de Experiência needs the Chapéu de Oficial-LT: +10% to nv.174, +4% at 175+', () => {
    expect(totalExp([312406], 'de100a174')).toBe(0);
    expect(totalExp([400445, 312406], 'de100a174')).toBe(10);
    expect(totalExp([400445, 312406], 'nv175mais')).toBe(4);
    expect(ITEM_BY_ID.get(312414)?.raceOnly).toBe('Humanoide');
    expect(SLOT_BY_KEY.get('encantoTopo')?.pool).toBe('encantoTopo');
  });

  it('Medalha grade bonuses stack per tier on top of the base value', () => {
    const exp = (grade: Grade | null) =>
      totalExp([400445, 312406], 'de100a174', undefined, new Map(grade ? [[312406, grade]] : []));
    expect(exp(null)).toBe(10);
    expect(exp('D')).toBe(11);
    expect(exp('C')).toBe(13);
    expect(exp('B')).toBe(16);
    expect(exp('A')).toBe(16);
    // Race medal at nv.175+: 7 + 1 + 3 + 5.
    expect(itemExp(ITEM_BY_ID.get(312409)!, 'nv175mais', 'B')).toBe(16);
    // A grade cannot make an unusable band count (the hat needs nv.100).
    expect(itemExp(ITEM_BY_ID.get(312409)!, 'ate99', 'B')).toBe(0);
  });

  it('duplicate accessory ids each contribute item exp but count once for sets', () => {
    // Luvas de Caça in both accessory slots + Carta Diabinho.
    const b = computeBreakdown([2984, 2984, 4204], 'de100a174');
    expect(b.itemsTotal).toBe(20); // 5 + 5 + 10
    expect(b.setsTotal).toBe(5); // set still satisfied exactly once
    expect(b.sets).toHaveLength(1);
  });

  it('Boné do Aluno gives 0 alone and +5% only with the full combo', () => {
    // Boné do Aluno Exemplar (18816) has no EXP of its own now.
    expect(totalExp([18816], 'de100a174')).toBe(0);
    // Add Uniforme Escolar (15088) + Lápis Vermelho (18818) → combo completes.
    const b = computeBreakdown([18816, 15088, 18818], 'de100a174');
    expect(b.itemsTotal).toBe(0);
    expect(b.setsTotal).toBe(5);
    expect(b.total).toBe(5);
  });

  it('Pombo Revelador needs Asas de Anjo for its +5%', () => {
    expect(totalExp([18912], 'de100a174')).toBe(0);
    expect(totalExp([18912, 2254], 'de100a174')).toBe(5);
  });

  it('Corvo needs Coroa do Líder for its +5%', () => {
    expect(totalExp([18913], 'de100a174')).toBe(0);
    expect(totalExp([18913, 5007], 'de100a174')).toBe(5);
  });

  it('ignores unknown ids', () => {
    expect(totalExp([999999], 'ate99')).toBe(0);
  });
});
