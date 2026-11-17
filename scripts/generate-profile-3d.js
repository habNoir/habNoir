/**
 * 3D Isometric Forest Contribution Graph Generator for habNoir
 * Seamless Canvas Match (#0D1117 + Emerald Ambient Glow)
 * Close-up dramatic camera POV with prominent 3D voxel moss pedestals
 * and consistent stepped pixel pine trees.
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
  const svgWidth = 960;
  const svgHeight = 470;

  const weeks = [];
  let curWeek = [];
  for (let i = 0; i < contributions.length; i++) {
    curWeek.push(contributions[i]);
    if (curWeek.length === 7 || i === contributions.length - 1) {
      weeks.push(curWeek);
      curWeek = [];
    }
  }

  const originX = 185;
  const originY = 126;
  const uStepX = 14.2;
  const uStepY = 4.2;
  const vStepX = -21.0;
  const vStepY = 11.8;

  const tileHalfW = 12.0;
  const tileHalfH = 6.8;

  // Color palette - Seamless with GitHub Dark canvas #0D1117
  const palette = {
    0: { top: '#161b22', left: '#0d1117', right: '#12161d' },
    1: { top: '#0f3823', left: '#092115', right: '#0c2d1c' },
    2: { top: '#166534', left: '#104926', right: '#13572d' },
    3: { top: '#15803d', left: '#0e5c2b', right: '#126e34' },
    4: { top: '#22c55e', left: '#15803d', right: '#16a34a' }
  };

  const blockHeights = [4, 14, 26, 42, 60];

  let blocksSvg = '';

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

    const baseX = Number((originX + wIdx * uStepX + dIdx * vStepX).toFixed(1));
    const baseY = Number((originY + wIdx * uStepY + dIdx * vStepY).toFixed(1));
    const topY = Number((baseY - height).toFixed(1));

    const tCenter = `${baseX},${topY}`;
    const tNorth = `${baseX},${(topY - tileHalfH).toFixed(1)}`;
    const tEast = `${(baseX + tileHalfW).toFixed(1)},${topY}`;
    const tSouth = `${baseX},${(topY + tileHalfH).toFixed(1)}`;
    const tWest = `${(baseX - tileHalfW).toFixed(1)},${topY}`;

    const bSouth = `${baseX},${(baseY + tileHalfH).toFixed(1)}`;
    const bWest = `${(baseX - tileHalfW).toFixed(1)},${baseY}`;
    const bEast = `${(baseX + tileHalfW).toFixed(1)},${baseY}`;

    const delay = isAnimated ? (index * 0.0025).toFixed(3) : 0;
    const animStyle = isAnimated ? `style="animation: growBlock 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both;"` : '';

    let blockMarkup = `<g class="iso-block" ${animStyle}>`;

    if (height > 0) {
      blockMarkup += `<polygon points="${tWest} ${tSouth} ${bSouth} ${bWest}" fill="${colors.left}" />`;
    }
    if (height > 0) {
      blockMarkup += `<polygon points="${tSouth} ${tEast} ${bEast} ${bSouth}" fill="${colors.right}" />`;
    }
    blockMarkup += `<polygon points="${tNorth} ${tEast} ${tSouth} ${tWest}" fill="${colors.top}" stroke="${level === 0 ? '#21262d' : '#165b38'}" stroke-width="0.5" />`;

    if (level === 0) {
      blockMarkup += `<circle cx="${baseX}" cy="${topY}" r="1.2" fill="#165b38" opacity="0.6"/>`;
    } else if (level === 1) {
      blockMarkup += `
        <rect x="${(baseX - 1).toFixed(1)}" y="${(topY - 4).toFixed(1)}" width="2" height="4" fill="#713f12"/>
        <polygon points="${baseX},${(topY - 12).toFixed(1)} ${(baseX - 5).toFixed(1)},${(topY - 4).toFixed(1)} ${(baseX + 5).toFixed(1)},${(topY - 4).toFixed(1)}" fill="#166534"/>
        <polygon points="${baseX},${(topY - 12).toFixed(1)} ${(baseX - 3.5).toFixed(1)},${(topY - 6).toFixed(1)} ${(baseX + 3.5).toFixed(1)},${(topY - 6).toFixed(1)}" fill="#22c55e"/>
        <circle cx="${baseX}" cy="${(topY - 11).toFixed(1)}" r="1.2" fill="#86efac"/>
      `;
    } else if (level === 2) {
      blockMarkup += `
        <rect x="${(baseX - 1.2).toFixed(1)}" y="${(topY - 5).toFixed(1)}" width="2.4" height="5" fill="#713f12"/>
        <polygon points="${baseX},${(topY - 11).toFixed(1)} ${(baseX - 6).toFixed(1)},${(topY - 5).toFixed(1)} ${(baseX + 6).toFixed(1)},${(topY - 5).toFixed(1)}" fill="#14532d"/>
        <polygon points="${baseX},${(topY - 17).toFixed(1)} ${(baseX - 4).toFixed(1)},${(topY - 10).toFixed(1)} ${(baseX + 4).toFixed(1)},${(topY - 10).toFixed(1)}" fill="#22c55e"/>
        <circle cx="${baseX}" cy="${(topY - 16).toFixed(1)}" r="1.3" fill="#86efac"/>
      `;
    } else if (level === 3) {
      blockMarkup += `
        <rect x="${(baseX - 1.5).toFixed(1)}" y="${(topY - 6).toFixed(1)}" width="3" height="6" fill="#713f12"/>
        <polygon points="${baseX},${(topY - 11).toFixed(1)} ${(baseX - 7).toFixed(1)},${(topY - 5).toFixed(1)} ${(baseX + 7).toFixed(1)},${(topY - 5).toFixed(1)}" fill="#052e16"/>
        <polygon points="${baseX},${(topY - 11).toFixed(1)} ${(baseX - 5.5).toFixed(1)},${(topY - 6).toFixed(1)} ${(baseX + 5.5).toFixed(1)},${(topY - 6).toFixed(1)}" fill="#15803d"/>
        <polygon points="${baseX},${(topY - 17).toFixed(1)} ${(baseX - 5).toFixed(1)},${(topY - 10).toFixed(1)} ${(baseX + 5).toFixed(1)},${(topY - 10).toFixed(1)}" fill="#16a34a"/>
        <polygon points="${baseX},${(topY - 22).toFixed(1)} ${(baseX - 3.5).toFixed(1)},${(topY - 15).toFixed(1)} ${(baseX + 3.5).toFixed(1)},${(topY - 15).toFixed(1)}" fill="#22c55e"/>
        <circle cx="${baseX}" cy="${(topY - 21).toFixed(1)}" r="1.5" fill="#86efac"/>
      `;
    } else if (level === 4) {
      blockMarkup += `
        <rect x="${(baseX - 1.8).toFixed(1)}" y="${(topY - 7).toFixed(1)}" width="3.6" height="7" fill="#713f12"/>
        <polygon points="${baseX},${(topY - 12).toFixed(1)} ${(baseX - 8.5).toFixed(1)},${(topY - 5).toFixed(1)} ${(baseX + 8.5).toFixed(1)},${(topY - 5).toFixed(1)}" fill="#052e16"/>
        <polygon points="${baseX},${(topY - 18).toFixed(1)} ${(baseX - 6.8).toFixed(1)},${(topY - 11).toFixed(1)} ${(baseX + 6.8).toFixed(1)},${(topY - 11).toFixed(1)}" fill="#15803d"/>
        <polygon points="${baseX},${(topY - 24).toFixed(1)} ${(baseX - 5).toFixed(1)},${(topY - 17).toFixed(1)} ${(baseX + 5).toFixed(1)},${(topY - 17).toFixed(1)}" fill="#16a34a"/>
        <polygon points="${baseX},${(topY - 29).toFixed(1)} ${(baseX - 3.5).toFixed(1)},${(topY - 23).toFixed(1)} ${(baseX + 3.5).toFixed(1)},${(topY - 23).toFixed(1)}" fill="#4ade80"/>
        <circle cx="${baseX}" cy="${(topY - 28).toFixed(1)}" r="1.8" fill="#bbf7d0"/>
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
        0% { transform: translateY(35px) scale(0.7); opacity: 0; }
        100% { transform: translateY(0) scale(1); opacity: 1; }
      }
      ` : ''}
    </style>
    <!-- Seamless Canvas Match (#0D1117) with Emerald Ambient Gradient -->
    <linearGradient id="forest-3d-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="50%" stop-color="#0e1f18" />
      <stop offset="100%" stop-color="#0d1117" />
    </linearGradient>

    <radialGradient id="forest-3d-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0" />
    </radialGradient>

    <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Seamless Canvas Background (#0D1117) -->
  <rect width="${svgWidth}" height="${svgHeight}" rx="14" fill="url(#forest-3d-bg)" stroke="#165b38" stroke-width="1.2" />
  <rect width="${svgWidth}" height="${svgHeight}" rx="14" fill="url(#forest-3d-glow)" />
  <rect x="1.5" y="1.5" width="${svgWidth - 3}" height="${svgHeight - 3}" rx="12.5" fill="none" stroke="#22c55e" stroke-width="0.7" stroke-opacity="0.25" />

  <!-- Terminal Top Bar (GitHub Dark Unified) -->
  <path d="M 0 14 Q 0 0 14 0 L ${svgWidth - 14} 0 Q ${svgWidth} 0 ${svgWidth} 14 L ${svgWidth} 36 L 0 36 Z" fill="#161b22" />
  <line x1="0" y1="36" x2="${svgWidth}" y2="36" stroke="#21262d" stroke-width="1" />

  <!-- Terminal Window Controls -->
  <circle cx="24" cy="18" r="5" fill="#15803d" />
  <circle cx="40" cy="18" r="5" fill="#22c55e" />
  <circle cx="56" cy="18" r="5" fill="#4ade80" />

  <!-- Terminal Command Header -->
  <text x="76" y="22" font-size="11" font-weight="600" fill="#a7f3d0">
    habnoir@arch-forest:~$ <tspan fill="#4ade80">tree</tspan> <tspan fill="#86efac">--isometric-3d</tspan> <tspan fill="#6ee7b7">--biome=evergreen --close-up</tspan>
  </text>

  <!-- Telemetry Meta -->
  <text x="${svgWidth - 25}" y="22" text-anchor="end" font-size="10" fill="#6ee7b7">
    🌿 CLOSE-UP 3D GROVE // <tspan fill="#f0fdf4" font-weight="bold">${totalTrees} COMMITS PLANTED</tspan>
  </text>

  <!-- 3D Voxel Blocks & Trees -->
  <g id="iso-forest">
    ${blocksSvg}
  </g>

  <!-- Bottom Legend Bar -->
  <g transform="translate(40, ${svgHeight - 34})">
    <line x1="0" y1="0" x2="${svgWidth - 80}" y2="0" stroke="#21262d" stroke-width="1" />
    
    <circle cx="6" cy="18" r="3.5" fill="#4ade80" filter="url(#emerald-glow)" />
    <text x="18" y="21" font-size="9.5" fill="#86efac">
      TERRAIN: <tspan fill="#4ade80" font-weight="bold">VOXEL MOSS PEDESTALS</tspan> | CANOPY: <tspan fill="#f0fdf4">STEPPED PINE FAMILY</tspan>
    </text>

    <!-- Legend Scale -->
    <g transform="translate(680, 8)" font-size="9" fill="#86efac">
      <text x="-15" y="12" text-anchor="end" fill="#6ee7b7">Dormant</text>
      <rect x="0" y="4" width="10" height="10" rx="2" fill="#161b22" stroke="#21262d" stroke-width="0.8"/>
      <rect x="22" y="4" width="10" height="10" rx="2" fill="#0f3823" stroke="#165b38" stroke-width="0.8"/>
      <rect x="44" y="4" width="10" height="10" rx="2" fill="#166534" stroke="#22c55e" stroke-width="0.8"/>
      <rect x="66" y="4" width="10" height="10" rx="2" fill="#15803d" stroke="#4ade80" stroke-width="0.8"/>
      <rect x="88" y="4" width="10" height="10" rx="2" fill="#22c55e" stroke="#86efac" stroke-width="0.8"/>
      <text x="112" y="12" fill="#6ee7b7">Elder Pine</text>
    </g>
  </g>
</svg>`;
}

async function main() {
  console.log(`[🌲] Generating Close-up 3D Isometric Forest for @${USERNAME}...`);
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const data = await fetchContributions();
  const contributions = data.contributions || [];
  const totalTrees = data.total ? (data.total[Object.keys(data.total)[0]] || 44) : 44;

  const animSvg = generate3DGraph(contributions, totalTrees, true);
  const animPath = path.join(OUTPUT_DIR, 'profile-green-animate.svg');
  fs.writeFileSync(animPath, animSvg, 'utf-8');
  console.log(`[✔] Animated Close-up 3D Graph written to: ${animPath}`);

  const staticSvg = generate3DGraph(contributions, totalTrees, false);
  const staticPath = path.join(OUTPUT_DIR, 'profile-green.svg');
  fs.writeFileSync(staticPath, staticSvg, 'utf-8');
  console.log(`[✔] Static Close-up 3D Graph written to: ${staticPath}`);
}

main().catch(err => {
  console.error('[-] Error generating 3D profile:', err);
  process.exit(1);
});
