import { CALCULATORS } from './lib/enchant-configs';
import { applySeo, siteJsonLd } from './lib/seo';
import './styles/global.css';
import './styles/home.css';

applySeo({
  title: 'RagCalc — Calculadoras para Ragnarok Online',
  description:
    'Calculadoras para mecânicas do Ragnarok Online: encantamento de insígnia (Chapéu Memorável), Diadema Temporal e mais. Em português brasileiro.',
  path: '/',
  jsonLd: siteJsonLd(),
});

const root = document.getElementById('app')!;
const url = (slug: string) => `/calc/${slug}/`;

root.innerHTML = `
  <header class="hero">
    <h1>RagCalc</h1>
    <p>Calculadoras para mecânicas do Ragnarok Online.</p>
  </header>
  <main class="cards">
    ${CALCULATORS.map((c) => `
      <a class="calc-card" href="${url(c.slug)}">
        <h2>${escapeHtml(c.shortTitle)}</h2>
        <p class="calc-card-item">Item: ${escapeHtml(c.itemName)}</p>
        <p class="calc-card-desc">${escapeHtml(c.description)}</p>
        <span class="calc-card-cta">Abrir calculadora →</span>
      </a>
    `).join('')}
  </main>
  <footer class="site-footer">
    <p>Veja mais ferramentas em <a href="https://latam-tools.com.br" target="_blank" rel="noopener noreferrer">latam-tools.com.br</a>.</p>
    <p>Entre no nosso <a href="https://discord.gg/JCXTqqWq9Q" target="_blank" rel="noopener noreferrer">Discord</a>. Projeto open source no <a href="https://github.com/adsonpleal/ragcalc" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
  </footer>
`;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return c;
    }
  });
}
