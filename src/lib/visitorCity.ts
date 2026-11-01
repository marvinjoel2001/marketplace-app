/**
 * Where a visitor is, to show lives from their city first (then the rest of Bolivia).
 * Order: their own choice (`?cerca=` or the cookie set by the picker / "use my location"), then
 * the IP geolocation headers the host adds (Vercel, Cloudflare). Nothing is sent to third parties.
 */
export const BO_CITIES = [
  'Santa Cruz',
  'La Paz',
  'El Alto',
  'Cochabamba',
  'Sucre',
  'Tarija',
  'Oruro',
  'Potosí',
  'Beni',
  'Pando',
] as const;
export type BoCity = (typeof BO_CITIES)[number];

export const NEAR_COOKIE = 'vitrina_cerca';
/** Cookie value for "show all of Bolivia", which also overrides the IP guess. */
export const NEAR_ALL = 'todo';

export type NearSource = 'eleccion' | 'ip' | null;

const normalize = (text: string) =>
  text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** City spellings geolocation databases and people use, including towns of each metro area. */
const ALIASES: [BoCity, string[]][] = [
  ['Santa Cruz', ['santa cruz', 'santa cruz de la sierra', 'montero', 'warnes', 'la guardia', 'cotoca', 'el torno', 'scz']],
  ['El Alto', ['el alto']],
  ['La Paz', ['la paz', 'viacha', 'achocalla', 'lpz']],
  ['Cochabamba', ['cochabamba', 'quillacollo', 'sacaba', 'tiquipaya', 'colcapirhua', 'vinto', 'cbba']],
  ['Sucre', ['sucre', 'chuquisaca']],
  ['Tarija', ['tarija', 'yacuiba', 'bermejo']],
  ['Oruro', ['oruro']],
  ['Potosí', ['potosi', 'uyuni', 'villazon']],
  ['Beni', ['beni', 'el beni', 'trinidad', 'riberalta', 'guayaramerin']],
  ['Pando', ['pando', 'cobija']],
];

/** ISO 3166-2:BO department codes (Vercel sends "S", Cloudflare may send "S" or "BO-S"). */
const DEPARTMENTS: Record<string, BoCity> = {
  S: 'Santa Cruz',
  L: 'La Paz',
  C: 'Cochabamba',
  H: 'Sucre',
  T: 'Tarija',
  O: 'Oruro',
  P: 'Potosí',
  B: 'Beni',
  N: 'Pando',
};

export function cityFromName(raw: string | null | undefined): BoCity | null {
  if (!raw) return null;
  let text = raw;
  try {
    text = decodeURIComponent(raw);
  } catch {
    /* already decoded */
  }
  const name = normalize(text);
  return ALIASES.find(([, names]) => names.includes(name))?.[0] ?? null;
}

/** City from the host's IP geolocation headers; null outside Bolivia or when the host adds none. */
export function cityFromHeaders(headers: Headers): BoCity | null {
  const country = (headers.get('x-vercel-ip-country') ?? headers.get('cf-ipcountry') ?? '').toUpperCase();
  if (country !== 'BO') return null;
  const city = cityFromName(headers.get('x-vercel-ip-city') ?? headers.get('cf-ipcity'));
  if (city) return city;
  const region = (headers.get('x-vercel-ip-country-region') ?? headers.get('cf-region-code') ?? '')
    .toUpperCase()
    .replace(/^BO-/, '');
  return DEPARTMENTS[region] ?? null;
}

export function resolveNear({ param, cookie, headers }: {
  param?: string | null;
  cookie?: string | null;
  headers: Headers;
}): { city: BoCity | null; source: NearSource } {
  for (const choice of [param, cookie]) {
    if (!choice) continue;
    if (choice === NEAR_ALL) return { city: null, source: 'eleccion' };
    const city = cityFromName(choice);
    if (city) return { city, source: 'eleccion' };
  }
  const city = cityFromHeaders(headers);
  return { city, source: city ? 'ip' : null };
}

/** City centres, to turn the browser's GPS position into a city without any geocoding service. */
const CENTRES: [BoCity, number, number][] = [
  ['Santa Cruz', -17.7833, -63.1821],
  ['Santa Cruz', -17.3417, -63.2533], // Montero
  ['La Paz', -16.4955, -68.1336],
  ['El Alto', -16.5207, -68.1985],
  ['Cochabamba', -17.3895, -66.1568],
  ['Sucre', -19.0196, -65.262],
  ['Tarija', -21.5355, -64.7296],
  ['Oruro', -17.9647, -67.106],
  ['Potosí', -19.5836, -65.7531],
  ['Beni', -14.8333, -64.9],
  ['Beni', -11.0083, -66.0731], // Riberalta
  ['Pando', -11.0267, -68.7692],
];

/** Nearest city within 150 km of the position, or null (the visitor is elsewhere). */
export function nearestCity(lat: number, lon: number): BoCity | null {
  const rad = Math.PI / 180;
  let best: { city: BoCity; km: number } | null = null;
  for (const [city, clat, clon] of CENTRES) {
    const dLat = (clat - lat) * rad;
    const dLon = (clon - lon) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * rad) * Math.cos(clat * rad) * Math.sin(dLon / 2) ** 2;
    const km = 12742 * Math.asin(Math.sqrt(a));
    if (!best || km < best.km) best = { city, km };
  }
  return best && best.km <= 150 ? best.city : null;
}
