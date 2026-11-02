'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { marketplaceApi } from '@/lib/api';
import { formatBs } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

/**
 * Bank-style payment QR for a QR_PREPAID order. There is no bank integration yet: the code is a test
 * payload and "Ya pagué" marks the order paid only while the backend runs with PAYMENTS_TEST_MODE=true.
 */
export function QrPayment({ orderNumber, amount, storeName }: { orderNumber: string; amount: number; storeName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const payload = `VITRINA-PRUEBA|${orderNumber}|${amount.toFixed(2)}|BOB`;

  const confirm = async () => {
    setBusy(true);
    try {
      await marketplaceApi.confirmOrderPayment(orderNumber);
      toast('¡Pago recibido! Ya preparamos tu pedido');
      router.refresh();
    } catch (err) {
      toast((err as Error).message, 'error');
      setBusy(false);
    }
  };

  return (
    <section className="panel flex flex-col items-center gap-3 p-5 text-center" aria-labelledby="qr-title">
      <h2 id="qr-title" className="type-sign text-lg font-extrabold">Paga con QR</h2>
      <p className="text-sm text-ink-soft">Abre la app de tu banco, escanea el código y paga {formatBs(amount)}.</p>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">QR de cobro · Vitrina Market</p>
        <QRCodeSVG value={payload} size={192} level="M" marginSize={1} />
        <p className="mt-2 text-xl font-extrabold tabular-nums">{formatBs(amount)}</p>
        <p className="text-xs text-slate-500">Para: {storeName} · Pedido {orderNumber}</p>
      </div>
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Modo de prueba: este QR no cobra dinero real.</p>
      <button type="button" className="btn btn-primary w-full" onClick={confirm} disabled={busy}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
        Ya pagué
      </button>
    </section>
  );
}
