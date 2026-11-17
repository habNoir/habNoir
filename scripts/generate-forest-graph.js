/**
 * Forest Contribution Graph Generator for habNoir
 * Renders each contribution day as a consistent Stepped Pixel Evergreen Pine Tree
 * Full Nature Theme (Deep Forest Green) + Arch Linux Integration
 * 100% Unified Botanical Morphology (1-tier -> 2-tier -> 3-tier -> 4-tier Pine)
 */

const fs = require('fs');
const path = require('path');

const USERNAME = process.env.GH_USERNAME || 'habNoir';
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'forest-graph.svg');

async function fetchContributions() {
  const url = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ForestGraphGenerator' } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}

function renderTree(level, x, y) {
  // Cell bounding box: 11x11, placed inside a 15x15 week/day slot
  // Level 0: Dormant moss / tiny seedling sprout
  if (level === 0) {
    return `
      <rect x="${x}" y="${y + 2}" width="11" height="11" rx="2" fill="#082316" stroke="#0e3d26" stroke-width="0.6"/>
      <circle cx="${x + 5.5}" cy="${y + 7.5}" r="1" fill="#14532d" opacity="0.6"/>
    `;
  }

  // Level 1: Sapling (1-Tier Stepped Pine)
  if (level === 1) {
    return `
      <rect x="${x}" y="${y + 2}" width="11" height="11" rx="2" fill="#0b301e" stroke="#165b38" stroke-width="0.7"/>
      <!-- trunk -->
      <rect x="${x + 4.5}" y="${y + 8}" width="2" height="4" fill="#713f12"/>
      <!-- Tier 1 Pine Canopy -->
      <polygon points="${x + 5.5},${y + 3} ${x + 2},${y + 8} ${x + 9},${y + 8}" fill="#166534"/>
      <polygon points="${x + 5.5},${y + 3} ${x + 3},${y + 6.5} ${x + 8},${y + 6.5}" fill="#22c55e"/>
      <circle cx="${x + 5.5}" cy="${y + 3.5}" r="0.8" fill="#86efac"/>
    `;
  }

  // Level 2: Young Pine (2-Tier Stepped Pine)
  if (level === 2) {
    return `
      <rect x="${x}" y="${y + 2}" width="11" height="11" rx="2" fill="#0e3d26" stroke="#22c55e" stroke-width="0.7" stroke-opacity="0.6"/>
      <!-- trunk -->
      <rect x="${x + 4.5}" y="${y + 8}" width="2" height="4" fill="#713f12"/>
      <!-- Lower Tier -->
      <polygon points="${x + 5.5},${y + 5} ${x + 1.5},${y + 9} ${x + 9.5},${y + 9}" fill="#14532d"/>
      <!-- Upper Tier -->
      <polygon points="${x + 5.5},${y + 2} ${x + 2.5},${y + 6} ${x + 8.5},${y + 6}" fill="#22c55e"/>
      <circle cx="${x + 5.5}" cy="${y + 2.5}" r="0.9" fill="#86efac"/>
    `;
  }

  // Level 3: Thriving Pine (3-Tier Stepped Pine)
  if (level === 3) {
    return `
      <rect x="${x}" y="${y + 2}" width="11" height="11" rx="2" fill="#134e2a" stroke="#4ade80" stroke-width="0.8"/>
      <!-- trunk -->
      <rect x="${x + 4.5}" y="${y + 8}" width="2" height="4.5" fill="#713f12"/>
      <!-- Tier 1: Lower -->
      <polygon points="${x + 5.5},${y + 6} ${x + 0.5},${y + 9.5} ${x + 10.5},${y + 9.5}" fill="#052e16"/>
      <polygon points="${x + 5.5},${y + 6} ${x + 1.5},${y + 9} ${x + 9.5},${y + 9}" fill="#15803d"/>
      <!-- Tier 2: Mid -->
      <polygon points="${x + 5.5},${y + 3.5} ${x + 2},${y + 7} ${x + 9},${y + 7}" fill="#16a34a"/>
      <!-- Tier 3: Top -->
      <polygon points="${x + 5.5},${y + 1} ${x + 3},${y + 4.5} ${x + 8},${y + 4.5}" fill="#22c55e"/>
      <circle cx="${x + 5.5}" cy="${y + 1.5}" r="1" fill="#86efac"/>
    `;
  }

  // Level 4: Elder Pine / Giant Evergreen (4-Tier Stepped Pine - 100% Consistent Family!)
  return `
    <rect x="${x}" y="${y + 2}" width="11" height="11" rx="2" fill="#14532d" stroke="#86efac" stroke-width="1"/>
    <!-- trunk -->
    <rect x="${x + 4.5}" y="${y + 8}" width="2" height="4.5" fill="#713f12"/>
    <!-- Tier 1: Grand Base -->
    <polygon points="${x + 5.5},${y + 6.5} ${x + 0.5},${y + 9.5} ${x + 10.5},${y + 9.5}" fill="#052e16"/>
    <!-- Tier 2: Lower Mid -->
    <polygon points="${x + 5.5},${y + 4.5} ${x + 1.5},${y + 7.5} ${x + 9.5},${y + 7.5}" fill="#15803d"/>
    <!-- Tier 3: Upper Mid -->
    <polygon points="${x + 5.5},${y + 2.5} ${x + 2.5},${y + 5.5} ${x + 8.5},${y + 5.5}" fill="#22c55e"/>
    <!-- Tier 4: Crowning Spire -->
    <polygon points="${x + 5.5},${y + 0.5} ${x + 3.5},${y + 3.5} ${x + 7.5},${y + 3.5}" fill="#4ade80"/>
    <circle cx="${x + 5.5}" cy="${y + 1}" r="1.1" fill="#bbf7d0"/>
  `;
}

async function main() {
  console.log(`[🌲] Fetching GitHub contribution tree data for @${USERNAME}...`);
  const data = await fetchContributions();
  const contributions = data.contributions || [];
  const totalTrees = data.total ? (data.total[Object.keys(data.total)[0]] || 44) : 44;

  console.log(`[🌲] Total contributions / trees planted: ${totalTrees}`);

  const weeks = [];
  let currentWeek = [];

  for (let i = 0; i < contributions.length; i++) {
    currentWeek.push(contributions[i]);
    if (currentWeek.length === 7 || i === contributions.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const startX = 60;
  const startY = 88;
  const cellW = 15;
  const cellH = 15;

  let forestCellsSvg = '';
  const monthLabels = [];
  let lastMonth = '';

  weeks.forEach((week, wIdx) => {
    const x = startX + wIdx * cellW;

    if (week[0]) {
      const d = new Date(week[0].date);
      const mStr = d.toLocaleString('en-US', { month: 'short' });
      if (mStr !== lastMonth && wIdx % 4 === 0) {
        monthLabels.push(`<text x="${x}" y="${startY - 8}" fill="#86efac" font-size="9" font-family="'JetBrains Mono', monospace" opacity="0.8">${mStr}</text>`);
        lastMonth = mStr;
      }
    }

    week.forEach((day, dIdx) => {
      const y = startY + dIdx * cellH;
      forestCellsSvg += renderTree(day.level, x, y);
    });
  });

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 250" width="100%" height="250">
  <defs>
    <!-- Deep Forest Nature Gradient -->
    <linearGradient id="forest-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#02140a" />
      <stop offset="45%" stop-color="#052416" />
      <stop offset="100%" stop-color="#03170d" />
    </linearGradient>

    <!-- Organic Moss Texture Pattern -->
    <pattern id="moss-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="0.8" fill="#22c55e" opacity="0.08" />
      <circle cx="14" cy="10" r="1.2" fill="#15803d" opacity="0.06" />
      <circle cx="20" cy="18" r="0.8" fill="#4ade80" opacity="0.05" />
    </pattern>

    <!-- Emerald Leaf Glow -->
    <filter id="leaf-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Forest Background Frame -->
  <rect width="920" height="250" rx="14" fill="url(#forest-bg)" stroke="#165b38" stroke-width="1.4" />
  <rect width="920" height="250" rx="14" fill="url(#moss-pattern)" />
  <rect x="1" y="1" width="918" height="248" rx="13" fill="none" stroke="#22c55e" stroke-width="0.8" stroke-opacity="0.3" />

  <!-- Terminal Window Top Bar -->
  <path d="M 0 14 Q 0 0 14 0 L 906 0 Q 920 0 920 14 L 920 36 L 0 36 Z" fill="#03190e" />
  <line x1="0" y1="36" x2="920" y2="36" stroke="#165b38" stroke-width="1" />

  <!-- Window Dots -->
  <circle cx="24" cy="18" r="5" fill="#15803d" opacity="0.9" />
  <circle cx="40" cy="18" r="5" fill="#22c55e" opacity="0.9" />
  <circle cx="56" cy="18" r="5" fill="#4ade80" opacity="0.9" />

  <!-- Linux Command Line Header -->
  <text x="76" y="22" font-family="'JetBrains Mono', 'Fira Code', monospace" font-size="11" font-weight="600" fill="#a7f3d0">
    habnoir@arch-forest:~$ <tspan fill="#4ade80">tree</tspan> <tspan fill="#86efac">/sys/kernel/contributions</tspan> <tspan fill="#34d399">--biome=evergreen --trees</tspan>
  </text>

  <!-- Forest Telemetry / Metadata Right -->
  <text x="895" y="22" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="10" fill="#6ee7b7" opacity="0.9">
    🌿 ECOSYSTEM: <tspan fill="#4ade80" font-weight="bold">HEALTHY</tspan> | CANOPY: <tspan fill="#ffffff" font-weight="bold">${totalTrees} TREES</tspan>
  </text>

  <!-- Weekday Labels -->
  <g font-family="'JetBrains Mono', monospace" font-size="9" fill="#6ee7b7" opacity="0.75" text-anchor="end">
    <text x="${startX - 10}" y="${startY + 1 * cellH + 9}">Mon</text>
    <text x="${startX - 10}" y="${startY + 3 * cellH + 9}">Wed</text>
    <text x="${startX - 10}" y="${startY + 5 * cellH + 9}">Fri</text>
  </g>

  <!-- Month Labels -->
  ${monthLabels.join('\n  ')}

  <!-- 52x7 Forest Trees Grid (Consistent Stepped Pines) -->
  <g id="forest-grid">
    ${forestCellsSvg}
  </g>

  <!-- Bottom Legend Bar -->
  <g transform="translate(60, 210)">
    <line x1="0" y1="0" x2="800" y2="0" stroke="#0e3d26" stroke-width="1" />
    
    <text x="0" y="20" font-family="'JetBrains Mono', monospace" font-size="10" fill="#6ee7b7">
      <tspan fill="#4ade80">●</tspan> ARCH LINUX NATURE GROVE // STEPPED PINE TREE ARCHITECTURE
    </text>

    <!-- Legend Scale (1-tier -> 2-tier -> 3-tier -> 4-tier) -->
    <g transform="translate(560, 8)" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="#86efac">
      <text x="-32" y="10" text-anchor="end" fill="#6ee7b7">Dormant</text>
      ${renderTree(0, 0, 0)}
      ${renderTree(1, 24, 0)}
      ${renderTree(2, 48, 0)}
      ${renderTree(3, 72, 0)}
      ${renderTree(4, 96, 0)}
      <text x="124" y="10" fill="#6ee7b7">Elder Pine</text>
    </g>
  </g>
</svg>`;

  fs.writeFileSync(OUTPUT_PATH, svgContent, 'utf-8');
  console.log(`[✔] Consistent forest contribution tree graph written to: ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('[-] Error generating forest graph:', err);
  process.exit(1);
});
