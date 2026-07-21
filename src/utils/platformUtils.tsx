const leetcodeSvg = '/icons/leetcode.svg';
const gfgSvg = '/icons/gfg.svg';
const codeforcesSvg = '/icons/codeforces.svg';
const codechefSvg = '/icons/codechef.svg';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

interface PlatformDefinition {
  name: string;
  color: string;
  bg: string;
  border: string;
  Icon: (props: IconProps) => React.JSX.Element;
}

export const PLATFORMS: Record<string, PlatformDefinition> = {
  leetcode: {
    name: 'LeetCode',
    color: '#FFA116',
    bg: 'bg-[#FFA116]/10',
    border: 'border-[#FFA116]/30',
    Icon: ({ className = 'w-4 h-4', style = {} }) => (
      <img src={leetcodeSvg} alt="LeetCode" className={`${className} object-contain`} style={style} />
    ),
  },
  gfg: {
    name: 'GeeksforGeeks',
    color: '#2F8D46',
    bg: 'bg-[#2F8D46]/10',
    border: 'border-[#2F8D46]/30',
    Icon: ({ className = 'w-4 h-4', style = {} }) => (
      <img src={gfgSvg} alt="GeeksforGeeks" className={`${className} object-contain`} style={style} />
    ),
  },
  codeforces: {
    name: 'Codeforces',
    color: '#1F8ACB',
    bg: 'bg-[#1F8ACB]/10',
    border: 'border-[#1F8ACB]/30',
    Icon: ({ className = 'w-4 h-4', style = {} }) => (
      <img src={codeforcesSvg} alt="Codeforces" className={`${className} object-contain`} style={style} />
    ),
  },
  codechef: {
    name: 'CodeChef',
    color: '#5B4638',
    bg: 'bg-[#5B4638]/10',
    border: 'border-[#5B4638]/30',
    Icon: ({ className = 'w-4 h-4', style = {} }) => (
      <img src={codechefSvg} alt="CodeChef" className={`${className} object-contain`} style={style} />
    ),
  },
  other: {
    name: 'Problem',
    color: '#6B7280',
    bg: 'bg-neutral-800',
    border: 'border-neutral-700',
    Icon: ({ className = 'w-4 h-4', style = {} }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 4h6v6M20 4l-10 10" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
};

export function getPlatformFromUrl(url?: string | null): string | null {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes('leetcode.com')) return 'leetcode';
  if (u.includes('geeksforgeeks.org') || u.includes('practice.geeks')) return 'gfg';
  if (u.includes('codeforces.com')) return 'codeforces';
  if (u.includes('codechef.com')) return 'codechef';
  return 'other';
}

export function PlatformIcon({ url, className = 'w-4 h-4' }: { url?: string | null; className?: string }) {
  const key = getPlatformFromUrl(url);
  if (!key) return null;
  const platform = PLATFORMS[key];
  if (!platform) return null;
  return <platform.Icon className={className} />;
}
