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
