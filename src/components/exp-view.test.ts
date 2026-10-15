import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderExpCalculator } from './exp-view';

afterEach(() => vi.unstubAllGlobals());

describe('EXP calculator after the Baby Shark event', () => {
  it.each([
    ['', 0],
    ['?g=480824,300834,300835,401367', 10],
    ['?g=24052', 0],
    ['?g=24052,24062', 3],
  ])('renders %s without the empty garment card slot (total +%i%%)', (query, total) => {
    vi.stubGlobal('window', {
      location: { href: `https://ragcalc.test/calc/exp/${query}` },
      matchMedia: () => ({ matches: true }),
    });
    vi.stubGlobal('document', { addEventListener: vi.fn() });
    vi.stubGlobal('localStorage', { getItem: () => null });
    // Capture the renderer's markup; event binding has no targets in this smoke test.
    const root = {
      innerHTML: '',
      querySelector: () => null,
      querySelectorAll: () => [],
    };

    renderExpCalculator(root as unknown as HTMLElement);

    expect(root.innerHTML).toContain(`class="exp-total-value">+${total}%`);
    expect(root.innerHTML).toContain('data-slot="capa"');
    expect(root.innerHTML).not.toContain('data-slot="cartaCapa"');
    expect(root.innerHTML).not.toContain('Carta Baby Shark');
    expect(root.innerHTML).not.toContain('Carta Família Tubarão');
    expect(root.innerHTML).not.toContain('[Visual] Cabeça do Baby Shark');
  });
});
