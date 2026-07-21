interface DisplayConnection {
  id: string;
  rating?: number | null;
}

interface HistoryPoint {
  label: string;
  rating: number;
}

const RATING_HISTORY_BASE = [15, 25, -10, 30, 45, -15, 20, 35, 10, -5, 25, 15, -20, 10, 35, 40];

export function getHistoryForFilter(conn: DisplayConnection | undefined, filter: string): HistoryPoint[] {
  if (!conn || !conn.rating) return [];
  const rating = conn.rating;

  let count = 12;
  let labels: string[] = [];
  let stepMultiplier = 1;

  if (filter === '3m') {
    count = 8;
    labels = ['Mar 08', 'Mar 22', 'Apr 05', 'Apr 19', 'May 03', 'May 17', 'May 31', 'Jun 14'];
    stepMultiplier = 0.5;
  } else if (filter === '6m') {
    count = 12;
    labels = ['Jan 01', 'Jan 15', 'Feb 01', 'Feb 15', 'Mar 01', 'Mar 15', 'Apr 01', 'Apr 15', 'May 01', 'May 15', 'Jun 01', 'Jun 15'];
    stepMultiplier = 1.0;
  } else if (filter === '1y') {
    count = 12;
    labels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    stepMultiplier = 2.0;
  } else {
    count = 12;
    labels = ["Jan '25", "Mar '25", "May '25", "Jul '25", "Sep '25", "Nov '25", "Dec '25", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26"];
    stepMultiplier = 3.5;
  }

  const history: number[] = [];
  let curr = rating;
  for (let i = count - 1; i >= 0; i--) {
    history[i] = curr;
    const baseChange = RATING_HISTORY_BASE[i % RATING_HISTORY_BASE.length] || 15;
    const change = Math.round(baseChange * stepMultiplier);
    curr = Math.max(800, curr - change);
  }

  return history.map((val, idx) => ({ label: labels[idx], rating: val }));
}

export function getInitials(name?: string | null): string {
  if (!name) return '?';
  const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const TAG_MAPPING: Record<string, string> = {
  array: 'Arrays',
  string: 'Strings',
  'dynamic programming': 'DP',
  greedy: 'Greedy',
  tree: 'Trees',
  'binary tree': 'Trees',
  'binary search tree': 'Trees',
  graph: 'Graphs',
  'breadth-first search': 'Graphs',
  'depth-first search': 'Graphs',
  'shortest path': 'Graphs',
  math: 'Math',
  geometry: 'Math',
  'number theory': 'Math',
  backtracking: 'Backtracking',
  arrays: 'Arrays',
  'data structures': 'Arrays',
  strings: 'Strings',
  dp: 'DP',
  trees: 'Trees',
  graphs: 'Graphs',
  'dfs and similar': 'Graphs',
  'shortest paths': 'Graphs',
};
