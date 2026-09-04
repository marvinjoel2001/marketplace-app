'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  CreditCard,
  Smartphone,
  MapPin,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  ChevronRight,
  Phone,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatBs } from '@/lib/utils';
import { marketplaceApi } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export function CheckoutFlow() {
  const { cart, subtotal, shippingFee, totalAmount, clearCart, savedCity } = useCart();
  const { user, isAuthenticated, isProfileComplete, openAuthModal } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD' | 'WALLET'>('QR');
  const [customerName, setCustomerName] = useState(user?.name || 'Cliente Invitado');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+591 77098765');
  const [customerAddress, setCustomerAddress] = useState(
    user?.address ? `${user.address}, ${user.city || savedCity}` : `Av. San Martín, Calle 5 Oeste, ${savedCity}`
  );
  const [addressReference, setAddressReference] = useState(user?.addressReference || 'Frente al restaurante La Casona');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [orderCreated, setOrderCreated] = useState<any>(null);

  // Sync with user profile when logged in
  React.useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.address) setCustomerAddress(`${user.address}, ${user.city || savedCity}`);
      if (user.addressReference) setAddressReference(user.addressReference);
    }
  }, [user, savedCity]);

  // Default item fallback if cart is empty for demo purposes
  const displayItems =
    cart.length > 0
      ? cart
      : [
          {
            productOfferId: 'demo-offer',
            productId: 'demo-prod',
            productTitle: 'Chompa Oversize Beige - Talla M',
            productSlug: 'chompa-oversize-beige-talla-m',
            storeId: 'store-modabol',
            storeName: 'ModaBol (Tienda Oficial)',
            unitPrice: 189,
            quantity: 1,
            productImage: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500',
            shippingCost: 0,
            estimatedDelivery: 'Llega mañana con OpenDSP',
          },
        ];

  const currentSubtotal = cart.length > 0 ? subtotal : 189;
  const currentShipping = cart.length > 0 ? shippingFee : 0;
  const currentTotal = currentSubtotal + currentShipping;

  const handleConfirmOrder = async () => {
    setIsProcessing(true);

    try {
      const order = await marketplaceApi.createOrder({
        userId: user?.id,
        customerEmail: user?.email || 'cliente@bolivia.bo',
        customerName,
        customerPhone,
        customerAddress: `${customerAddress} (Ref: ${addressReference})`,
        customerLat: -17.7695,
        customerLng: -63.194,
        paymentMethod:
          paymentMethod === 'QR'
            ? 'QR_SIMPLE'
            : paymentMethod === 'CARD'
            ? 'CREDIT_CARD'
            : 'TIGO_MONEY',
        shippingFee: currentShipping,
        items: displayItems.map((it) => ({
          productOfferId: it.productOfferId,
          storeId: it.storeId,
          productTitle: it.productTitle,
          storeName: it.storeName,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          productImage: it.productImage,
          storeLat: -17.7685,
          storeLng: -63.1952,
          storeAddress: 'Santa Cruz de la Sierra',
        })),
      });

      setOrderCreated(order);
      clearCart();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Redirect to live DSP tracking after short celebration
      setTimeout(() => {
        router.push(`/order/track/${order.orderNumber}`);
      }, 1500);
    } catch {
      // Fallback demo order creation
      const mockOrderNumber = `CY-${Date.now().toString().slice(-6)}-412`;
      setOrderCreated({ orderNumber: mockOrderNumber });
      clearCart();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        router.push(`/order/track/${mockOrderNumber}`);
      }, 1500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutAction = () => {
    if (!isAuthenticated) {
      openAuthModal({
        onComplete: () => {
          handleConfirmOrder();
        },
      });
      return;
    }

    if (!isProfileComplete) {
      openAuthModal({
        initialStep: 'enrich',
        onComplete: () => {
          handleConfirmOrder();
        },
      });
      return;
    }

    handleConfirmOrder();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-black">{t('nav_home', 'Inicio')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/cart" className="hover:text-black">{t('cart_drawer_title', 'Carrito')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-bold">{t('checkout_page_title', 'Checkout')}</span>
      </nav>

      {/* Guest Mode Conversion Banner */}
      {!isAuthenticated && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
              🔐
            </div>
            <div>
              <h4 className="text-sm font-black text-gray-950">
                {language === 'es'
                  ? 'Punto de Conversión: Inicia sesión en un clic para finalizar'
                  : 'Fast Checkout: Sign in with 1-click to complete your order'}
              </h4>
              <p className="text-xs text-gray-700 font-medium mt-0.5">
                {language === 'es'
                  ? 'Navegaste como invitado. Vincula tu cuenta de TikTok, Google o correo para coordinar la entrega express por WhatsApp.'
                  : 'Browsing as guest. Link your TikTok, Google or email account to track your OpenDSP express driver.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal()}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-full shadow-md transition-all shrink-0 active:scale-95"
          >
            {t('nav_login', 'Iniciar Sesión')}
          </button>
        </div>
      )}

      {/* Main Checkout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Col 1: Resumen de tu pedido */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {t('checkout_summary_title', 'Resumen del Pedido')}
            </h3>

            <div className="space-y-3">
              {displayItems.map((item, idx) => (
                <div key={idx} className="flex space-x-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={item.productImage}
                      alt={item.productTitle}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                      {item.productTitle}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {language === 'es' ? 'Vendido por' : 'Sold by'}: {item.storeName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-black text-gray-900">{formatBs(item.unitPrice)}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {language === 'es' ? 'Cant' : 'Qty'}: {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-gray-100 pt-3 mt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>{t('cart_subtotal', 'Subtotal')}</span>
              <span className="font-semibold text-gray-900">{formatBs(currentSubtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span className="flex items-center">
                <Truck className="w-3.5 h-3.5 mr-1" /> {t('cart_shipping', 'Envío OpenDSP Express')}
              </span>
              <span>{currentShipping === 0 ? t('cart_free_shipping', '¡Gratis!') : formatBs(currentShipping)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline font-black text-gray-900">
              <span className="text-sm">{t('cart_total', 'Total a pagar')}</span>
              <span className="text-lg text-emerald-800 font-black">{formatBs(currentTotal)}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Método de pago */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {t('checkout_payment_step', '2. Método de Pago')}
            </h3>

            <div className="space-y-2.5">
              {/* QR Option (Active by default) */}
              <label
                onClick={() => setPaymentMethod('QR')}
                className={`flex items-start p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'QR'
                    ? 'border-black bg-amber-50/20 shadow-xs ring-2 ring-black/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mr-3">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Pagar con QR</span>
                    {paymentMethod === 'QR' && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Escanea y paga desde tu banco (BNB, BCP, Banco Unión, Ganadero, etc.)
                  </p>
                </div>
              </label>

              {/* Card Option */}
              <label
                onClick={() => setPaymentMethod('CARD')}
                className={`flex items-start p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-black bg-amber-50/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mr-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Tarjeta de débito/crédito</span>
                    {paymentMethod === 'CARD' && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Visa, Mastercard y más</p>
                </div>
              </label>

              {/* Wallet Option */}
              <label
                onClick={() => setPaymentMethod('WALLET')}
                className={`flex items-start p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'WALLET'
                    ? 'border-black bg-amber-50/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mr-3">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Billetera móvil</span>
                    {paymentMethod === 'WALLET' && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Tigo Money, BNB Móvil, etc.</p>
                </div>
              </label>
            </div>
          </div>

          {/* SSL Protection Badge */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-2 text-[11px] text-green-800">
            <Lock className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <p className="font-bold">Pago 100% seguro</p>
              <p className="text-[10px] text-gray-500">Tus datos están protegidos con encriptación SSL</p>
            </div>
          </div>
        </div>

        {/* Col 3: Dirección de entrega & Mapa */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900">
                {t('checkout_delivery_step', '1. Dirección de Entrega')}
              </h3>
              <span className="text-xs font-bold text-emerald-700 cursor-pointer hover:underline">
                {language === 'es' ? 'Cambiar' : 'Change'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-extrabold text-gray-900">{customerAddress}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {language === 'es' ? 'Referencia' : 'Reference'}: {addressReference}
                  </p>
                </div>
              </div>

              {/* Map Illustration with Pin */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-[#E8ECEF] aspect-[4/3] flex items-center justify-center shadow-inner">
                {/* Simulated Street Grid */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Animated Route Line */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 150">
                  <path
                    d="M 30,120 Q 80,40 160,50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="4,4"
                  />
                </svg>

                {/* Pin on Map */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-200 animate-bounce">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-bold bg-white text-gray-800 px-2 py-0.5 rounded-full shadow-xs mt-1">
                    {language === 'es' ? 'Punto de Entrega' : 'Delivery Point'}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded-md cursor-pointer hover:bg-white shadow-2xs">
                  {language === 'es' ? 'Ver en mapa' : 'View on map'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500">
            {language === 'es'
              ? 'Entrega gestionada con geolocalización satelital OpenDSP.'
              : 'Delivery managed with OpenDSP satellite geolocation.'}
          </div>
        </div>

        {/* Col 4: Seguimiento de tu pedido & Botón de Confirmación */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              {language === 'es' ? 'Seguimiento de tu pedido' : 'Order Tracking'}
            </h3>

            {/* Status & ETA */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-extrabold text-emerald-700">
                  {language === 'es' ? 'Tu pedido va en camino' : 'Your order is on the way'}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-800">
                {language === 'es' ? 'Llegada estimada' : 'Estimated arrival'}:{' '}
                <span className="text-emerald-600 font-extrabold">15 - 25 min</span>
              </p>

              {/* Rider Route Graphic */}
              <div className="relative rounded-2xl overflow-hidden bg-emerald-50/50 border border-emerald-100 aspect-[16/9] flex items-center justify-center p-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl animate-pulse">🛵</span>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-gray-800">
                      {language === 'es' ? 'Motorizado OpenDSP' : 'OpenDSP Courier'}
                    </p>
                    <p className="text-[9px] text-gray-500">
                      {language === 'es' ? 'En ruta directa hacia tu dirección' : 'Direct route to your location'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver Card */}
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200/70 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                    alt="Carlos Mendoza"
                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Carlos Mendoza</h5>
                    <p className="text-[10px] text-gray-500">
                      {language === 'es' ? 'Tu repartidor' : 'Your driver'} • ★ 4.9
                    </p>
                  </div>
                </div>
                <a
                  href="tel:+59177012345"
                  className="p-2 rounded-full bg-white text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 transition-colors shadow-2xs"
                  title="Llamar repartidor"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Action Button: Confirm Order with OpenDSP */}
          <div className="pt-2">
            <button
              disabled={isProcessing}
              onClick={handleCheckoutAction}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white font-black text-sm rounded-full flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
            >
              {isProcessing ? (
                <span>{t('checkout_processing', 'Procesando despacho OpenDSP...')}</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>{t('checkout_confirm_btn', 'Confirmar y Pagar Pedido')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
