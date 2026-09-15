// Item descriptions as the client writes them, turned into popover HTML.
//
// The text comes from ragassets (tools/sync-item-descriptions.mjs →
// exp-descriptions.json). It is ~100 kB and only ever read on hover, so it is
// loaded on demand instead of riding in the page bundle.

let descriptions: Promise<Record<string, string>> | null = null;

export function loadDescriptions(): Promise<Record<string, string>> {
  descriptions ??= import('./exp-descriptions.json').then((m) => m.default as Record<string, string>);
  return descriptions;
}

const COLOR = /\^([0-9a-fA-F]{6})/g;

/**
 * Client description → safe HTML. The client marks colors with `^RRGGBB`, where
 * `^000000` means "back to the default text color", and embeds navigation links
 * as `<NAVI>[label]<INFO>coords</INFO></NAVI>`: only the label is for reading.
 * The colors are the client's own, picked for a light background.
 */
export function formatItemDescription(desc: string): string {
  const text = desc
    .replace(/<INFO>[\s\S]*?<\/INFO>/g, '')
    .replace(/<\/?[A-Z_]+>/g, '');

  let html = '';
  let open = false;
  let last = 0;
  for (const m of text.matchAll(COLOR)) {
    html += escapeHtml(text.slice(last, m.index));
    if (open) html += '</span>';
    open = m[1] !== '000000';
    if (open) html += `<span style="color:#${m[1]!.toLowerCase()}">`;
    last = m.index + m[0].length;
  }
  html += escapeHtml(text.slice(last));
  if (open) html += '</span>';
  return html.replace(/\n/g, '<br>');
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
