/** What each order status means, in words for customers and for stores. */
export const ORDER_STATUS: Record<string, { customer: string; store: string; tone: 'wait' | 'go' | 'done' | 'off' }> = {
  SCHEDULED: { customer: 'Programado', store: 'Por preparar', tone: 'wait' },
  CONFIRMED: { customer: 'Confirmado', store: 'Por preparar', tone: 'wait' },
  PREPARING: { customer: 'En preparación', store: 'Preparando', tone: 'wait' },
  DSP_DISPATCHED: { customer: 'Repartidor asignado', store: 'Repartidor en camino a la tienda', tone: 'go' },
  IN_TRANSIT: { customer: 'En camino', store: 'En camino al cliente', tone: 'go' },
  DELIVERED: { customer: 'Entregado', store: 'Entregado', tone: 'done' },
  CANCELLED: { customer: 'Cancelado', store: 'Cancelado', tone: 'off' },
};

export const STATUS_TONE_CLASS = {
  wait: 'bg-tag/40 text-ink',
  go: 'bg-verde-tint text-verde-dark',
  done: 'bg-paper text-ink-soft',
  off: 'bg-red-50 text-danger',
};

export const PAYMENT_LABEL: Record<string, string> = {
  CASH_ON_DELIVERY: 'Efectivo al recibir',
  QR_ON_DELIVERY: 'QR al recibir',
};
