import type { TikTokLiveItem } from './api';

export function liveFreshness(live: Pick<TikTokLiveItem, 'verified_at'>, now: number, freshSeconds = 60, retentionSeconds = 300): 'fresh' | 'refreshing' | 'expired' {
  const verified = Date.parse(live.verified_at);
  if (!Number.isFinite(verified) || verified > now) return 'expired';
  const age = now - verified;
  if (age >= retentionSeconds * 1000) return 'expired';
  return age < freshSeconds * 1000 ? 'fresh' : 'refreshing';
}
