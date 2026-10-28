'use client';

import React, { useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';
import { mediaUrl } from '@/lib/catalog';

/** Shrinks a photo to at most 1280 px and re-encodes it as JPEG, so uploads stay small on mobile data. */
async function compress(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.82);
}

export async function uploadPhoto(file: File, folder: 'products' | 'stores') {
  const base64Data = await compress(file);
  const { url } = await marketplaceApi.uploadImage({ base64Data, fileName: 'foto.jpg', folder });
  return url;
}

/**
 * Photos from the camera or the gallery. On phones "Tomar foto" opens the camera directly.
 * `value` holds uploaded URLs.
 */
export function ImagePicker({
  value,
  onChange,
  max = 5,
  folder = 'products',
  label = 'Fotos',
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  folder?: 'products' | 'stores';
  label?: string;
}) {
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = max - value.length;
    const picked = Array.from(files).slice(0, room);
    setError('');
    setUploading(picked.length);
    const urls: string[] = [];
    for (const file of picked) {
      try {
        urls.push(await uploadPhoto(file, folder));
      } catch {
        setError('Una foto no se pudo subir. Prueba de nuevo.');
      }
      setUploading((n) => n - 1);
    }
    onChange([...value, ...urls]);
  };

  const full = value.length >= max;
  return (
    <div>
      <p className="field-label">{label}</p>
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl border border-line bg-paper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl(url)} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && max > 1 && (
              <span className="absolute bottom-1 left-1 rounded bg-ink/75 px-1.5 text-[10px] font-semibold text-white">Principal</span>
            )}
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute right-1 top-1 rounded-full bg-ink/70 p-1 text-white"
              aria-label={`Quitar foto ${i + 1}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-line bg-paper">
            <Loader2 className="h-5 w-5 animate-spin text-muted" />
          </div>
        ))}
      </div>
      {!full && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => camera.current?.click()}>
            <Camera className="h-5 w-5 text-verde" /> Tomar foto
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => gallery.current?.click()}>
            <ImagePlus className="h-5 w-5 text-verde" /> Galería
          </button>
        </div>
      )}
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => add(e.target.files).finally(() => (e.target.value = ''))} />
      <input ref={gallery} type="file" accept="image/*" multiple={max > 1} hidden onChange={(e) => add(e.target.files).finally(() => (e.target.value = ''))} />
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
