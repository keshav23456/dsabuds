// Minimal inline brand SVGs (lucide-react ships no brand/logo icons).
export const SOCIAL_ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  linkedin: ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.13 2.07 2.07 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  ),
  github: ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.58 2 12.19c0 4.49 2.87 8.3 6.84 9.64.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.61-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.55 2.36 1.11 2.94.85.09-.66.35-1.11.64-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.4 9.4 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0022 12.19C22 6.58 17.52 2 12 2z" />
    </svg>
  ),
  twitter: ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.02l-5.5-7.19L4.5 22H1.4l8.13-9.3L1 2h7.2l4.97 6.58L18.9 2zm-1.23 18h1.95L7.4 3.9H5.3l12.37 16.1z" />
    </svg>
  ),
  instagram: ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.5 6.5a3 3 0 00-2.1-2.1C19.5 4 12 4 12 4s-7.5 0-9.4.4A3 3 0 00.5 6.5 31 31 0 000 12a31 31 0 00.5 5.5 3 3 0 002.1 2.1c1.9.4 9.4.4 9.4.4s7.5 0 9.4-.4a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.5zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  ),
  portfolio: ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5c2.5 2.6 3.8 5.9 3.8 9.5s-1.3 6.9-3.8 9.5c-2.5-2.6-3.8-5.9-3.8-9.5S9.5 5.1 12 2.5z" />
    </svg>
  ),
};

export function SocialIcon({ id, className = 'w-4 h-4' }: { id: string; className?: string }) {
  const Icon = SOCIAL_ICONS[id];
  if (!Icon) return null;
  return <Icon className={className} />;
}
