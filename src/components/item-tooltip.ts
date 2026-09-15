import { ITEM_BY_ID } from '../lib/exp-data';
import { escapeHtml, formatItemDescription, loadDescriptions } from '../lib/item-desc';

// Hover popover with an item's in-game description, modelled on latam-ro-calc's
// item tooltip: a white card (the client's colors are picked for a light
// background), readable width, scrolling when a description is taller than the
// window, and it stays open while the pointer is on it so it can be scrolled
// and copied from.
//
// Any element with `data-desc-id="<item id>"` inside `root` triggers it. Events
// are delegated to `root` because the calculator re-renders with innerHTML.

// Long enough that sweeping the pointer across a list opens nothing.
const SHOW_DELAY_MS = 350;
// The pointer crosses a gap between trigger and popover; don't close mid-way.
const HIDE_GRACE_MS = 150;
const GAP = 8;
const EDGE = 4;

export interface ItemTooltip {
  hide(): void;
}

export function attachItemTooltip(root: HTMLElement): ItemTooltip {
  // Touch screens have no hover; a tap would open it and nothing would close it.
  if (window.matchMedia('(hover: none)').matches) return { hide() {} };

  const pop = document.createElement('div');
  pop.className = 'item-tooltip';
  pop.setAttribute('role', 'tooltip');
  pop.hidden = true;
  document.body.appendChild(pop);

  let target: HTMLElement | null = null;
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  function hide(): void {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    target = null;
    pop.hidden = true;
  }

  function scheduleHide(): void {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, HIDE_GRACE_MS);
  }

  async function show(el: HTMLElement): Promise<void> {
    const id = Number(el.dataset.descId);
    const item = ITEM_BY_ID.get(id);
    if (!item) return;
    const desc = (await loadDescriptions())[id];
    // The pointer may have moved on, or a re-render replaced the element.
    if (target !== el || !el.isConnected) return;

    pop.innerHTML = `<div class="item-tooltip-title">${escapeHtml(item.name)}</div>${
      desc
        ? `<div class="item-tooltip-body">${formatItemDescription(desc)}</div>`
        : '<div class="item-tooltip-empty">O cliente não tem descrição para este item.</div>'
    }`;
    pop.scrollTop = 0;
    pop.hidden = false;
    place(el);
  }

  // Beside the trigger (right, else left), so a dropdown row never hides the
  // rows around it; below it when neither side fits. Always inside the window.
  function place(el: HTMLElement): void {
    const r = el.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = r.right + GAP;
    let top = r.top;
    if (left + w > vw - EDGE) left = r.left - GAP - w;
    if (left < EDGE) {
      left = r.left;
      top = r.bottom + GAP;
      if (top + h > vh - EDGE && r.top - GAP - h >= EDGE) top = r.top - GAP - h;
    }
    left = Math.max(EDGE, Math.min(left, vw - EDGE - w));
    top = Math.max(EDGE, Math.min(top, vh - EDGE - h));
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  }

  root.addEventListener('mouseover', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-desc-id]');
    if (!el || !root.contains(el)) return;
    clearTimeout(hideTimer);
    if (el === target) return;
    clearTimeout(showTimer);
    target = el;
    // Moving between items while one is open swaps it at once.
    if (!pop.hidden) void show(el);
    else showTimer = setTimeout(() => void show(el), SHOW_DELAY_MS);
  });

  root.addEventListener('mouseout', (e) => {
    const from = (e.target as Element).closest<HTMLElement>('[data-desc-id]');
    if (!from) return;
    const to = e.relatedTarget as Node | null;
    if (to && (from.contains(to) || pop.contains(to))) return;
    scheduleHide();
  });

  pop.addEventListener('mouseenter', () => clearTimeout(hideTimer));
  pop.addEventListener('mouseleave', (e) => {
    const to = e.relatedTarget as Node | null;
    if (to && target?.contains(to)) return;
    scheduleHide();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });
  // The popover is fixed-position: once the page scrolls it points at nothing.
  window.addEventListener(
    'scroll',
    (e) => {
      if (!pop.hidden && !pop.contains(e.target as Node)) hide();
    },
    true,
  );
  window.addEventListener('resize', hide);

  return { hide };
}
