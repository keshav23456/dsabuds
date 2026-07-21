'use client';

import { useState } from 'react';

interface LogoImageProps {
  name: string;
  logoUrl?: string | null;
  size?: string;
}

export function LogoImage({ name, logoUrl, size = 'w-12 h-12 text-2xl' }: LogoImageProps) {
  const [error, setError] = useState(false);
  const classes = size.split(' ');
  const dimensionClasses = classes
    .filter((c) => c.startsWith('w-') || c.startsWith('h-') || c.startsWith('aspect-'))
    .join(' ');
  const textClass = classes.find((c) => c.startsWith('text-')) || 'text-2xl';

  if (error || !logoUrl) {
    const char = name.charAt(0).toUpperCase();

    return (
      <div
        className={`${dimensionClasses} bg-[#161B22] border border-[#1F2937] rounded-xl flex items-center justify-center text-[#6B7280] font-bold ${textClass}`}
      >
        {char}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${name} Logo`}
      onError={(e) => {
        console.error(`Failed to load company logo: ${logoUrl}`);
        setError(true);
        if (e.currentTarget.parentNode) {
          (e.currentTarget.parentNode as HTMLElement).style.backgroundColor = 'rgba(13, 17, 23, 0.9)';
          (e.currentTarget.parentNode as HTMLElement).style.padding = '0';
        }
      }}
      className={`${dimensionClasses} object-contain rounded-xl p-1.5 bg-slate-100`}
    />
  );
}
