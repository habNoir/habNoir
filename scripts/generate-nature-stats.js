/**
 * Nature Stats Card Generator for habNoir
 * Generates assets/nature-stats.svg matching output/bonsai.svg (384x320)
 * 100% Full Custom - No third party Vercel downtime/503 errors
 */

const fs = require('fs');
const path = require('path');

const USERNAME = process.env.GH_USERNAME || 'habNoir';
const OUTPUT_PATH = path.join(__dirname, '..', 'assets', 'nature-stats.svg');

async function fetchAllStats() {
  const headers = { 'User-Agent': 'NatureStatsGenerator' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const [userRes, reposRes, contribRes] = await Promise.all([
    fetch(`https://api.github.com/users/${USERNAME}`, { headers }),
    fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, { headers }),
    fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`).catch(() => null)
  ]);

  const user = userRes.ok ? await userRes.json() : { public_repos: 8 };
  const repos = reposRes.ok ? await reposRes.json() : [];
  const contrib = contribRes && contribRes.ok ? await contribRes.json() : null;

  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const totalContribs = contrib && contrib.total ? (contrib.total[Object.keys(contrib.total)[0]] || 44) : 44;

  const langMap = {};
  repos.forEach(r => {
    if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
  });

  return {
    publicRepos: user.public_repos || repos.length || 8,
    totalStars,
    totalForks,
    totalContribs,
    languages: langMap
  };
}

async function main() {
  console.log(`[📊] Fetching live stats for @${USERNAME}...`);
  const stats = await fetchAllStats();
  console.log(`[📊] Stats fetched:`, stats);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 320" width="384" height="320">
  <defs>
    <style>
      text { font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace; }
    </style>
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#02140a" />
      <stop offset="50%" stop-color="#052416" />
      <stop offset="100%" stop-color="#021208" />
    </linearGradient>
    <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Frame -->
  <rect width="384" height="320" rx="12" fill="url(#card-grad)" stroke="#165b38" stroke-width="1.4" />
  <rect x="2" y="2" width="380" height="316" rx="10" fill="none" stroke="#22c55e" stroke-width="0.8" stroke-opacity="0.2" />

  <!-- Terminal Top Bar -->
  <path d="M 0 12 Q 0 0 12 0 L 372 0 Q 384 0 384 12 L 384 32 L 0 32 Z" fill="#03190e" />
  <line x1="0" y1="32" x2="384" y2="32" stroke="#165b38" stroke-width="1" />

  <!-- Window Dots -->
  <circle cx="18" cy="16" r="4.5" fill="#15803d" />
  <circle cx="32" cy="16" r="4.5" fill="#22c55e" />
  <circle cx="46" cy="16" r="4.5" fill="#4ade80" />

  <!-- Terminal Title -->
  <text x="50%" y="20" text-anchor="middle" font-size="10.5" fill="#86efac" letter-spacing="0.5">
    habnoir@arch-forest: ~ (stats)
  </text>

  <!-- Title & Subtitle -->
  <text x="20" y="58" font-size="12" font-weight="bold" fill="#4ade80" letter-spacing="1">FOREST TELEMETRY &amp; METRICS</text>
  <text x="20" y="74" font-size="9" fill="#86efac" opacity="0.8">Real-time GitHub developer velocity</text>

  <!-- 2x2 Metric Cards Grid -->
  <g transform="translate(20, 88)">
    <!-- Card 1: Contributions / Trees -->
    <g transform="translate(0, 0)">
      <rect width="166" height="54" rx="6" fill="#042113" stroke="#165b38" stroke-width="1" />
      <text x="12" y="20" font-size="9" fill="#86efac">🌲 CONTRIBUTIONS</text>
      <text x="12" y="42" font-size="17" font-weight="900" fill="#f0fdf4">${stats.totalContribs} <tspan font-size="10" font-weight="normal" fill="#4ade80">trees</tspan></text>
    </g>

    <!-- Card 2: Public Repos -->
    <g transform="translate(178, 0)">
      <rect width="166" height="54" rx="6" fill="#042113" stroke="#165b38" stroke-width="1" />
      <text x="12" y="20" font-size="9" fill="#86efac">📦 PUBLIC REPOS</text>
      <text x="12" y="42" font-size="17" font-weight="900" fill="#f0fdf4">${stats.publicRepos} <tspan font-size="10" font-weight="normal" fill="#4ade80">active</tspan></text>
    </g>

    <!-- Card 3: Stars Earned -->
    <g transform="translate(0, 62)">
      <rect width="166" height="54" rx="6" fill="#042113" stroke="#165b38" stroke-width="1" />
      <text x="12" y="20" font-size="9" fill="#86efac">⭐ TOTAL STARS</text>
      <text x="12" y="42" font-size="17" font-weight="900" fill="#f0fdf4">${stats.totalStars} <tspan font-size="10" font-weight="normal" fill="#4ade80">stars</tspan></text>
    </g>

    <!-- Card 4: Forks -->
    <g transform="translate(178, 62)">
      <rect width="166" height="54" rx="6" fill="#042113" stroke="#165b38" stroke-width="1" />
      <text x="12" y="20" font-size="9" fill="#86efac">🌿 FORKS / REPO</text>
      <text x="12" y="42" font-size="17" font-weight="900" fill="#f0fdf4">${stats.totalForks} <tspan font-size="10" font-weight="normal" fill="#4ade80">forks</tspan></text>
    </g>
  </g>

  <!-- Language Spectrum Bar -->
  <g transform="translate(20, 222)">
    <text x="0" y="0" font-size="9" font-weight="bold" fill="#86efac">STACK SPECTRUM (ACTIVE REPOS)</text>
    
    <!-- Multi-segmented Progress Bar -->
    <rect x="0" y="10" width="344" height="8" rx="4" fill="#042113" />
    <rect x="0" y="10" width="130" height="8" rx="4" fill="#22c55e" />
    <rect x="132" y="10" width="90" height="8" rx="2" fill="#16a34a" />
    <rect x="224" y="10" width="60" height="8" rx="2" fill="#38bdf8" />
    <rect x="286" y="10" width="58" height="8" rx="4" fill="#86efac" />

    <!-- Language Legend -->
    <g transform="translate(0, 32)" font-size="8.5">
      <circle cx="4" cy="-3" r="3" fill="#22c55e" />
      <text x="12" y="0" fill="#f0fdf4">Node.js/JS</text>

      <circle cx="85" cy="-3" r="3" fill="#16a34a" />
      <text x="93" y="0" fill="#f0fdf4">PHP</text>

      <circle cx="135" cy="-3" r="3" fill="#38bdf8" />
      <text x="143" y="0" fill="#f0fdf4">C++20</text>

      <circle cx="195" cy="-3" r="3" fill="#86efac" />
      <text x="203" y="0" fill="#f0fdf4">HTML/Py</text>
    </g>
  </g>

  <!-- Bottom Arch Linux Status Footer -->
  <g transform="translate(20, 290)">
    <line x1="0" y1="0" x2="344" y2="0" stroke="#0e3d26" stroke-width="1" />
    <circle cx="5" cy="14" r="3.5" fill="#4ade80" filter="url(#emerald-glow)" />
    <text x="16" y="17" font-size="9" fill="#86efac">
      HOST: <tspan fill="#4ade80" font-weight="bold">ARCH LINUX</tspan> | SERVER: <tspan fill="#f0fdf4">APACHE 2.4</tspan>
    </text>
  </g>
</svg>`;

  fs.writeFileSync(OUTPUT_PATH, svgContent, 'utf-8');
  console.log(`[✔] Custom nature stats written to: ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('[-] Error generating nature stats:', err);
  process.exit(1);
});
