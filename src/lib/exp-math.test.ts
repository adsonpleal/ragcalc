import { describe, expect, it } from 'vitest';
import { computeBreakdown, totalExp } from './exp-math';

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
