import React from 'react';

interface TikTokIconProps {
  className?: string;
  size?: number;
  variant?: 'color' | 'white' | 'badge';
}

const TIKTOK_BOLD_PATH =
  'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.11V8.98a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.28 6.34 6.34 0 0 0 9.34 21.6c3.5 0 6.34-2.84 6.34-6.33V9.17c1.3.93 2.87 1.48 4.57 1.52V7.24a4.83 4.83 0 0 1-.66-.55z';

export function TikTokIcon({
  className = 'w-4 h-4',
  size = 18,
  variant = 'color',
}: TikTokIconProps) {
  if (variant === 'white') {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d={TIKTOK_BOLD_PATH} fill="white" />
      </svg>
    );
  }

  // Official TikTok Chromatic 3D Glitch Icon with high-contrast Pure White note
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="-2 -2 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Cyan layer shifted top-left */}
      <g transform="translate(-1.4, -1.2)">
        <path d={TIKTOK_BOLD_PATH} fill="#25F4EE" />
      </g>
      {/* Magenta layer shifted bottom-right */}
      <g transform="translate(1.4, 1.2)">
        <path d={TIKTOK_BOLD_PATH} fill="#FE2C55" />
      </g>
      {/* Brilliant pure white central note */}
      <path
        d={TIKTOK_BOLD_PATH}
        fill="#FFFFFF"
        style={{ filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.8))' }}
      />
    </svg>
  );
}

export function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
