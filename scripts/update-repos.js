/**
 * Dynamic GitHub Repository Auto-Updater for habNoir Profile README
 * Runs via GitHub Actions to fetch the latest active repositories and update README.md
 */

const fs = require('fs');

const GITHUB_USERNAME = process.env.GH_USERNAME || 'habNoir';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MAX_REPOS = 6;
const README_PATH = './README.md';

const START_MARKER = '<!-- REPOS-LIST:START -->';
const END_MARKER = '<!-- REPOS-LIST:END -->';

async function fetchLatestRepos() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'habNoir-Readme-Updater'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&direction=desc&per_page=15`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
  }

  const repos = await response.json();
  // Filter out forks and profile repository itself, take top MAX_REPOS
  return repos
    .filter(r => !r.fork && r.name.toLowerCase() !== GITHUB_USERNAME.toLowerCase())
    .slice(0, MAX_REPOS);
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return `${Math.floor(diffSec / 2592000)}mo ago`;
}

function getLanguageBadge(language) {
  if (!language) return '`Plain Text`';
  const langColorMap = {
    'C++': '🔵 C++',
    'Python': '🐍 Python',
    'JavaScript': '🟨 JavaScript',
    'TypeScript': '🔷 TypeScript',
    'PHP': '🐘 PHP',
    'Shell': '🐚 Shell / Bash',
    'C': '⚙️ C',
    'Java': '☕ Java',
    'Kotlin': '🟣 Kotlin',
    'Rust': '🦀 Rust'
  };
  return langColorMap[language] || `\`${language}\``;
}

function generateMarkdownTable(repos) {
  if (!repos.length) {
    return '\n> *No public repositories found or all repositories are currently private.*\n';
  }

  let table = '\n| 📦 Project / Repository | 📝 Focus / Description | ⚡ Primary Tech | ⭐ Stars | 🕒 Last Push |\n';
  table += '| :--- | :--- | :---: | :---: | :---: |\n';

  for (const repo of repos) {
    const name = `[\`habNoir / ${repo.name}\`](${repo.html_url})`;
    const desc = repo.description ? repo.description.replace(/\|/g, '\\|') : '*No description provided*';
    const lang = getLanguageBadge(repo.language);
    const stars = repo.stargazers_count > 0 ? `★ ${repo.stargazers_count}` : '—';
    const updated = formatRelativeTime(repo.pushed_at);

    table += `| **${name}** | ${desc} | ${lang} | \`${stars}\` | \`${updated}\` |\n`;
  }

  table += '\n';
  return table;
}

async function main() {
  try {
    console.log(`[+] Fetching latest active repositories for @${GITHUB_USERNAME}...`);
    const repos = await fetchLatestRepos();
    console.log(`[+] Found ${repos.length} eligible repositories.`);

    const tableMarkdown = generateMarkdownTable(repos);

    if (!fs.existsSync(README_PATH)) {
      console.error(`[-] File not found: ${README_PATH}`);
      process.exit(1);
    }

    const readmeContent = fs.readFileSync(README_PATH, 'utf-8');
    const startIndex = readmeContent.indexOf(START_MARKER);
    const endIndex = readmeContent.indexOf(END_MARKER);

    if (startIndex === -1 || endIndex === -1) {
      console.warn(`[!] Markers ${START_MARKER} and ${END_MARKER} not found in ${README_PATH}. Skipping replace.`);
      return;
    }

    const updatedReadme = 
      readmeContent.substring(0, startIndex + START_MARKER.length) +
      tableMarkdown +
      readmeContent.substring(endIndex);

    fs.writeFileSync(README_PATH, updatedReadme, 'utf-8');
    console.log(`[✔] Successfully updated ${README_PATH} with auto-generated repositories!`);
  } catch (err) {
    console.error('[-] Error running repository updater:', err);
    process.exit(1);
  }
}

main();
