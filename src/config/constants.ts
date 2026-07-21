export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  ONBOARDING: '/onboarding',
  ABOUT: '/about',
};

export const API_BASE_URL = '/api';

export const BRANCH_SHORT_NAMES: Record<string, string> = {
  cs: "CSE",
  it: "IT",
  mac: "M&C",
  ece: "ECE",
  ee: "EE",
  ice: "ICE",
  me: "ME",
};

/**
 * Branches commonly grouped under "circuital" in placement eligibility.
 */
export const CIRCUITAL_BRANCHES = [
  "CSE", "CSAI", "CSDS", "CSDA", "CIOT",
  "IT", "ITNS",
  "ECE", "ECAM", "EVDT",
  "EE",
  "ICE",
];

/** Ready-to-use display label for circuital eligibility text. */
export const CIRCUITAL_BRANCHES_LABEL = "CSE, IT, ECE, EE, ICE, and related branches";

// ── Coding Platforms ────────────────────────────────────────────────────────

/** Single source of truth for all supported coding platforms. */
export const PLATFORMS = [
  { id: 'leetcode',   name: 'LeetCode',   key: 'LEETCODE',   logo: '/icons/leetcode.svg',   color: '#FFA116' },
  { id: 'codechef',   name: 'CodeChef',   key: 'CODECHEF',   logo: '/icons/codechef.svg',   color: '#B97A57' },
  { id: 'codeforces', name: 'Codeforces', key: 'CODEFORCES', logo: '/icons/codeforces.svg', color: '#1F8ACB' },
  { id: 'gfg',        name: 'GFG',        key: 'GFG',        logo: '/icons/gfg.svg',        color: '#2F8D46' },
];

// ── Questions ────────────────────────────────────────────────────────────────

/** Colour tokens for each difficulty level. Used by DifficultyBadge. */
export const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  EASY:   { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', border: 'rgba(34,197,94,0.25)' },
  MEDIUM: { bg: 'rgba(234,179,8,0.12)',  text: '#eab308', border: 'rgba(234,179,8,0.25)' },
  HARD:   { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', border: 'rgba(239,68,68,0.25)' },
};

/** Colour tokens for each solve-status. Used by StatusBadge. */
export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SOLVED:    { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e',   border: 'rgba(34,197,94,0.3)' },
  ATTEMPTED: { bg: 'rgba(234,179,8,0.15)',  text: '#eab308',   border: 'rgba(234,179,8,0.3)' },
  SKIPPED:   { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8',  border: 'rgba(148,163,184,0.3)' },
};

/** Single source of truth for all supported social/portfolio links shown on a profile. */
export const SOCIAL_LINKS = [
  { id: 'linkedin',  name: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username',  color: '#0A66C2' },
  { id: 'github',    name: 'GitHub',    placeholder: 'https://github.com/username',        color: '#E5E7EB' },
  { id: 'twitter',   name: 'X (Twitter)', placeholder: 'https://x.com/username',           color: '#1DA1F2' },
  { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/username',      color: '#E1306C' },
  { id: 'youtube',   name: 'YouTube',   placeholder: 'https://youtube.com/@username',       color: '#FF0000' },
  { id: 'portfolio', name: 'Portfolio', placeholder: 'https://yourwebsite.com',             color: '#35b9f1' },
];

/** Human-readable label for each source platform enum value. */
export const PLATFORM_LABELS: Record<string, string> = {
  LEETCODE:   'LeetCode',
  CODEFORCES: 'Codeforces',
  CODECHEF:   'CodeChef',
  GFG:        'GFG',
};

/** Ordered list of statuses shown in the solve-status sidebar. */
export const STATUS_OPTIONS = ['SOLVED', 'ATTEMPTED', 'SKIPPED'];
