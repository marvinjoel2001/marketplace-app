'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/** Main photo with thumbnails underneath. */
export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const main = images[active];
  return (
    <div className="space-y-3">
      <div className="aspect-square w-full rounded-[2rem] overflow-hidden bg-slate-50 border border-white/80 shadow-sm flex items-center justify-center">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={main} alt={title} className="h-full w-full object-cover" />
        ) : (
          <ImageOff className="h-10 w-10 text-slate-300" />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-pressed={i === active}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all ${i === active ? 'border-[#5B4DF0] shadow-md' : 'border-white/80 opacity-80 hover:opacity-100'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
