import { TikTokConnect } from '@/components/live/TikTokConnect';
import '../../live/live.css';

export const metadata = { title: 'Cuenta de TikTok del operador — Vitrina Market' };

/** Operator tool: sign in to TikTok so the scraper finds the lives TikTok recommends. Not for shoppers. */
export default function AdminTikTokPage() {
  return (
    <div className="live-page mx-auto max-w-2xl px-4 py-10" style={{ display: 'block' }}>
      <h1 className="text-2xl font-bold">Cuenta de TikTok para descubrir lives</h1>
      <p className="mt-2 mb-6 text-sm text-[#b4bec8]">
        Con tu sesión iniciada, el buscador de lives usa las recomendaciones de TikTok para tu cuenta. Solo funciona en la computadora donde corre el backend.
      </p>
      <TikTokConnect />
    </div>
  );
}
