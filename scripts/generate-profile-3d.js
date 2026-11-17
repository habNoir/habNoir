/**
 * 3D Isometric Forest Contribution Graph Generator for habNoir
 * Renders a full 3D isometric voxel landscape where contribution blocks
 * rise up as green forest pedestals topped with consistent stepped pixel pine trees.
 * Generates:
 *   - profile-3d-contrib/profile-green-animate.svg
 *   - profile-3d-contrib/profile-green.svg
 */

const fs = require('fs');
const path = require('path');

const USERNAME = process.env.GH_USERNAME || 'habNoir';
const OUTPUT_DIR = path.join(__dirname, '..', 'profile-3d-contrib');

async function fetchContributions() {
  const url = `https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Profile3DGenerator' } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}

function generate3DGraph(contributions, totalTrees, isAnimated = true) {
  // SVG Canvas dimensions
  const svgWidth = 960;
  const svgHeight = 440;

  // Group into weeks (53 weeks, 7 days each)
  const weeks = [];
  let curWeek = [];
  for (let i = 0; i < contributions.length; i++) {
    curWeek.push(contributions[i]);
    if (curWeek.length === 7 || i === contributions.length - 1) {
      weeks.push(curWeek);
      curWeek = [];
    }
  }

  // Isometric projection constants
  // u: week index (0..52), v: day index (0..6)
  // X axis points down-right (30 deg)
  // Y axis points down-left (150 deg)
  // Z axis points straight UP (-Y)
  const originX = 490;
  const originY = 120;
  const uStepX = 7.6;
  const uStepY = 4.3;
  const vStepX = -13.2;
  const vStepY = 7.5;

  // Block dimensions (rhombus top)
  const tileHalfW = 8.5;
  const tileHalfH = 4.8;

  // Color palette - consistent full nature green
  const palette = {
    0: { top: '#082316', left: '#04160d', right: '#061c11', treeTier: 0 },
    1: { top: '#0f482a', left: '#0a301c', right: '#0c3a22', treeTier: 1 },
    2: { top: '#166534', left: '#114a27', right: '#14572e', treeTier: 2 },
    3: { top: '#15803d', left: '#105e2d', right: '#136f35', treeTier: 3 },
    4: { top: '#22c55e', left: '#15803d', right: '#16a34a', treeTier: 4 }
  };

  const blockHeights = [3, 10, 20, 32, 46];

  let blocksSvg = '';

  // Render back-to-front (top-to-bottom in isometric depth)
  // Depth key: u + v ensures proper painters algorithm ordering
  const items = [];
  weeks.forEach((week, wIdx) => {
    week.forEach((day, dIdx) => {
      const depth = wIdx + dIdx * 7.5;
      items.push({ wIdx, dIdx, day, depth });
    });
  });

  items.sort((a, b) => a.depth - b.depth);

  items.forEach((item, index) => {
    const { wIdx, dIdx, day } = item;
    const level = day.level || 0;
    const height = blockHeights[level];
    const colors = palette[level];

    // Center base position
    const baseX = originX + wIdx * uStepX + dIdx * vStepX;
    const baseY = originY + wIdx * uStepY + dIdx * vStepY;

    // Top face position (elevated by height)
    const topY = baseY - height;

    // Points for Isometric Box
    // Top rhombus
    const tCenter = `${baseX},${topY}`;
    const tNorth = `${baseX},${topY - tileHalfH}`;
    const tEast = `${baseX + tileHalfW},${topY}`;
    const tSouth = `${baseX},${topY + tileHalfH}`;
    const tWest = `${baseX - tileHalfW},${topY}`;

    // Bottom points
    const bSouth = `${baseX},${baseY + tileHalfH}`;
    const bWest = `${baseX - tileHalfW},${baseY}`;
    const bEast = `${baseX + tileHalfW},${baseY}`;

    const delay = isAnimated ? (index * 0.003).toFixed(3) : 0;
    const animStyle = isAnimated ? `style="animation: growBlock 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both;"` : '';

    let blockMarkup = `<g class="iso-block" ${animStyle}>`;

    // Left vertical face (if height > 0)
    if (height > 0) {
      blockMarkup += `<polygon points="${tWest} ${tSouth} ${bSouth} ${bWest}" fill="${colors.left}" />`;
    }
    // Right vertical face (if height > 0)
    if (height > 0) {
      blockMarkup += `<polygon points="${tSouth} ${tEast} ${bEast} ${bSouth}" fill="${colors.right}" />`;
    }
    // Top face
    blockMarkup += `<polygon points="${tNorth} ${tEast} ${tSouth} ${tWest}" fill="${colors.top}" stroke="#165b38" stroke-width="0.3" />`;

    // TOPPED WITH CONSISTENT STEPPED PIXEL PINE TREE!
    // Level 0: Tiny 2-pixel sprout on top of the moss block
    if (level === 0) {
      blockMarkup += `
        <circle cx="${baseX}" cy="${topY}" r="1" fill="#14532d" opacity="0.6"/>
      `;
    } else if (level === 1) {
      // Level 1: Sapling (Tiny 1-tier stepped pine)
      blockMarkup += `
        <rect x="${baseX - 0.7}" y="${topY - 3}" width="1.4" height="3" fill="#713f12"/>
        <polygon points="${baseX},${topY - 8} ${baseX - 3.5},${topY - 3} ${baseX + 3.5},${topY - 3}" fill="#166534"/>
        <polygon points="${baseX},${topY - 8} ${baseX - 2.5},${topY - 4.5} ${baseX + 2.5},${topY - 4.5}" fill="#22c55e"/>
        <circle cx="${baseX}" cy="${topY - 7.5}" r="0.8" fill="#86efac"/>
      `;
    } else if (level === 2) {
      // Level 2: Young Pine (2-tier stepped pine)
      blockMarkup += `
        <rect x="${baseX - 0.8}" y="${topY - 4}" width="1.6" height="4" fill="#713f12"/>
        <!-- Tier 1 -->
        <polygon points="${baseX},${topY - 8} ${baseX - 4.5},${topY - 4} ${baseX + 4.5},${topY - 4}" fill="#14532d"/>
        <polygon points="${baseX},${topY - 8} ${baseX - 3.5},${topY - 5} ${baseX + 3.5},${topY - 5}" fill="#16a34a"/>
        <!-- Tier 2 -->
        <polygon points="${baseX},${topY - 12} ${baseX - 3},${topY - 7.5} ${baseX + 3},${topY - 7.5}" fill="#22c55e"/>
        <circle cx="${baseX}" cy="${topY - 11.5}" r="0.9" fill="#86efac"/>
      `;
    } else if (level === 3) {
      // Level 3: Thriving Pine (3-tier stepped pine)
      blockMarkup += `
        <rect x="${baseX - 1}" y="${topY - 4}" width="2" height="4" fill="#713f12"/>
        <!-- Tier 1 -->
        <polygon points="${baseX},${topY - 8} ${baseX - 5.5},${topY - 4} ${baseX + 5.5},${topY - 4}" fill="#052e16"/>
        <polygon points="${baseX},${topY - 8} ${baseX - 4.5},${topY - 5} ${baseX + 4.5},${topY - 5}" fill="#15803d"/>
        <!-- Tier 2 -->
        <polygon points="${baseX},${topY - 12} ${baseX - 4},${topY - 7.5} ${baseX + 4},${topY - 7.5}" fill="#16a34a"/>
        <!-- Tier 3 -->
        <polygon points="${baseX},${topY - 15.5} ${baseX - 2.8},${topY - 11} ${baseX + 2.8},${topY - 11}" fill="#22c55e"/>
        <circle cx="${baseX}" cy="${topY - 15}" r="1" fill="#86efac"/>
      `;
    } else if (level === 4) {
      // Level 4: Elder Pine (4-tier majestic stepped pine)
      blockMarkup += `
        <rect x="${baseX - 1.2}" y="${topY - 5}" width="2.4" height="5" fill="#713f12"/>
        <!-- Tier 1 -->
        <polygon points="${baseX},${topY - 8} ${baseX - 6.5},${topY - 4.5} ${baseX + 6.5},${topY - 4.5}" fill="#052e16"/>
        <polygon points="${baseX},${topY - 8} ${baseX - 5.5},${topY - 5.5} ${baseX + 5.5},${topY - 5.5}" fill="#15803d"/>
        <!-- Tier 2 -->
        <polygon points="${baseX},${topY - 12} ${baseX - 4.8},${topY - 8} ${baseX + 4.8},${topY - 8}" fill="#16a34a"/>
        <!-- Tier 3 -->
        <polygon points="${baseX},${topY - 16} ${baseX - 3.8},${topY - 11.5} ${baseX + 3.8},${topY - 11.5}" fill="#22c55e"/>
        <!-- Tier 4 Spire -->
        <polygon points="${baseX},${topY - 19.5} ${baseX - 2.5},${topY - 15} ${baseX + 2.5},${topY - 15}" fill="#4ade80"/>
        <circle cx="${baseX}" cy="${topY - 19}" r="1.2" fill="#bbf7d0"/>
      `;
    }

    blockMarkup += '</g>';
    blocksSvg += blockMarkup;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="${svgHeight}">
  <defs>
    <style>
      text { font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace; }
      ${isAnimated ? `
      @keyframes growBlock {
        0% { transform: translateY(30px) scale(0.6); opacity: 0; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      ` : ''}
    </style>
    <linearGradient id="forest-3d-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#02140a" />
      <stop offset="50%" stop-color="#042013" />
      <stop offset="100%" stop-color="#010f07" />
    </linearGradient>
    <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Forest 3D Canvas Background -->
  <rect width="${svgWidth}" height="${svgHeight}" rx="14" fill="url(#forest-3d-bg)" stroke="#165b38" stroke-width="1.6" />
  <rect x="2" y="2" width="${svgWidth - 4}" height="${svgHeight - 4}" rx="12" fill="none" stroke="#22c55e" stroke-width="0.8" stroke-opacity="0.25" />

  <!-- Terminal Top Bar -->
  <path d="M 0 14 Q 0 0 14 0 L ${svgWidth - 14} 0 Q ${svgWidth} 0 ${svgWidth} 14 L ${svgWidth} 36 L 0 36 Z" fill="#02180d" />
  <line x1="0" y1="36" x2="${svgWidth}" y2="36" stroke="#165b38" stroke-width="1.2" />

  <!-- Terminal Window Controls -->
  <circle cx="24" cy="18" r="5" fill="#15803d" />
  <circle cx="40" cy="18" r="5" fill="#22c55e" />
  <circle cx="56" cy="18" r="5" fill="#4ade80" />

  <!-- Terminal Command Header -->
  <text x="76" y="22" font-size="11" font-weight="600" fill="#a7f3d0">
    habnoir@arch-forest:~$ <tspan fill="#4ade80">tree</tspan> <tspan fill="#86efac">--isometric-3d</tspan> <tspan fill="#6ee7b7">--biome=evergreen --year=2026</tspan>
  </text>

  <!-- Telemetry Meta -->
  <text x="${svgWidth - 25}" y="22" text-anchor="end" font-size="10" fill="#6ee7b7">
    🌿 3D VOXEL GROVE // <tspan fill="#f0fdf4" font-weight="bold">${totalTrees} COMMITS PLANTED</tspan>
  </text>

  <!-- 3D Voxel Blocks & Trees -->
  <g id="iso-forest">
    ${blocksSvg}
  </g>

  <!-- Bottom Legend Bar -->
  <g transform="translate(40, ${svgHeight - 34})">
    <line x1="0" y1="0" x2="${svgWidth - 80}" y2="0" stroke="#0e3d26" stroke-width="1" />
    
    <circle cx="6" cy="18" r="3.5" fill="#4ade80" filter="url(#emerald-glow)" />
    <text x="18" y="21" font-size="9.5" fill="#86efac">
      TERRAIN: <tspan fill="#4ade80" font-weight="bold">VOXEL MOSS PEDESTALS</tspan> | CANOPY: <tspan fill="#f0fdf4">STEPPED PINE FAMILY</tspan>
    </text>

    <!-- Legend Scale -->
    <g transform="translate(680, 8)" font-size="9" fill="#86efac">
      <text x="-15" y="12" text-anchor="end" fill="#6ee7b7">Dormant</text>
      <rect x="0" y="4" width="10" height="10" rx="2" fill="#082316" stroke="#165b38" stroke-width="0.8"/>
      <rect x="22" y="4" width="10" height="10" rx="2" fill="#0f482a" stroke="#165b38" stroke-width="0.8"/>
      <rect x="44" y="4" width="10" height="10" rx="2" fill="#166534" stroke="#22c55e" stroke-width="0.8"/>
      <rect x="66" y="4" width="10" height="10" rx="2" fill="#15803d" stroke="#4ade80" stroke-width="0.8"/>
      <rect x="88" y="4" width="10" height="10" rx="2" fill="#22c55e" stroke="#86efac" stroke-width="0.8"/>
      <text x="112" y="12" fill="#6ee7b7">Elder Pine</text>
    </g>
  </g>
</svg>`;
}

async function main() {
  console.log(`[🌲] Generating 3D Isometric Green Forest Contribution Graph for @${USERNAME}...`);
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const data = await fetchContributions();
  const contributions = data.contributions || [];
  const totalTrees = data.total ? (data.total[Object.keys(data.total)[0]] || 44) : 44;

  // 1. Generate Animated 3D SVG
  const animSvg = generate3DGraph(contributions, totalTrees, true);
  const animPath = path.join(OUTPUT_DIR, 'profile-green-animate.svg');
  fs.writeFileSync(animPath, animSvg, 'utf-8');
  console.log(`[✔] Animated 3D Graph written to: ${animPath}`);

  // 2. Generate Static 3D SVG
  const staticSvg = generate3DGraph(contributions, totalTrees, false);
  const staticPath = path.join(OUTPUT_DIR, 'profile-green.svg');
  fs.writeFileSync(staticPath, staticSvg, 'utf-8');
  console.log(`[✔] Static 3D Graph written to: ${staticPath}`);
}

main().catch(err => {
  console.error('[-] Error generating 3D profile:', err);
  process.exit(1);
});
