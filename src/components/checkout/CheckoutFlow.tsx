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
  AlertCircle,
  ChevronRight,
  Phone,
  ArrowRight,
  Sparkles,
  Lock,
  X,
  Clock,
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

  const [paymentMethod, setPaymentMethod] = useState<'QR' | 'CARD' | 'WALLET' | ''>('QR');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(
    user?.address ? `${user.address}, ${user.city || savedCity}` : ''
  );
  const [addressReference, setAddressReference] = useState(user?.addressReference || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [orderCreated, setOrderCreated] = useState<any>(null);

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');

  // Sync with user profile when logged in
  React.useEffect(() => {
    if (user) {
      if (user.name && !customerName) setCustomerName(user.name);
      if (user.phone && !customerPhone) setCustomerPhone(user.phone);
      if (user.address && !customerAddress) setCustomerAddress(`${user.address}, ${user.city || savedCity}`);
      if (user.addressReference && !addressReference) setAddressReference(user.addressReference);
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
    setShowQRModal(false);

    try {
      const order = await marketplaceApi.createOrder({
        userId: user?.id,
        customerEmail: user?.email || 'cliente@bolivia.bo',
        customerName: customerName || user?.name || 'Cliente Vitrina',
        customerPhone: customerPhone || user?.phone || '+591 77098765',
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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Save to localStorage for instant tracking resilience
      if (typeof window !== 'undefined') {
        localStorage.setItem('vitrina_last_order', JSON.stringify(order));
      }

      // Redirect to live DSP tracking after celebration
      setTimeout(() => {
        router.push(`/order/track/${order.orderNumber || order.id || 'CY-894120-412'}`);
      }, 1200);
    } catch {
      // Fallback demo order creation
      const mockOrderNumber = `CY-${Date.now().toString().slice(-6)}-412`;
      const fallbackOrder = {
        id: 'demo-order-id',
        orderNumber: mockOrderNumber,
        customerName: customerName || user?.name || 'Juan Pérez',
        customerPhone: customerPhone || user?.phone || '+591 77098765',
        customerAddress: customerAddress || 'Santa Cruz, Bolivia',
        totalAmount: currentTotal,
        paymentMethod: 'QR_SIMPLE',
        status: 'CONFIRMED',
        dspEstimatedMinutes: 18,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('vitrina_last_order', JSON.stringify(fallbackOrder));
      }

      setOrderCreated(fallbackOrder);
      clearCart();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => {
        router.push(`/order/track/${mockOrderNumber}`);
      }, 1200);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutAction = () => {
    // 1. Exigir autenticación obligatoria para comprar
    if (!isAuthenticated) {
      openAuthModal({
        onComplete: () => {
          setGeneralError('');
        },
      });
      return;
    }

    const newErrors: { [key: string]: string } = {};

    if (!customerName || !customerName.trim()) {
      newErrors.customerName = 'El nombre del cliente es obligatorio';
    }
    if (!customerPhone || !customerPhone.trim()) {
      newErrors.customerPhone = 'El número de teléfono o WhatsApp es obligatorio';
    }
    if (!customerAddress || !customerAddress.trim()) {
      newErrors.customerAddress = 'La dirección de entrega es obligatoria';
    }
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Debes seleccionar un método de pago antes de confirmar el pedido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGeneralError('Por favor completa todos los campos requeridos de entrega y método de pago.');
      return;
    }

    setErrors({});
    setGeneralError('');

    // Si el método es QR Simple, abrir el modal interactivo de pago QR antes de despachar
    if (paymentMethod === 'QR') {
      setShowQRModal(true);
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
              {/* QR Option */}
              <div
                data-testid="payment-method-qr"
                onClick={() => {
                  setPaymentMethod('QR');
                  if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: '' }));
                }}
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
                    <span className="text-xs font-bold text-gray-900">Pagar con QR Simple</span>
                    {paymentMethod === 'QR' && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Escanea y paga desde tu banco (BNB, BCP, Banco Unión, Ganadero, etc.)
                  </p>
                </div>
              </div>

              {/* Card Option */}
              <div
                data-testid="payment-method-card"
                onClick={() => {
                  setPaymentMethod('CARD');
                  if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: '' }));
                }}
                className={`flex items-start p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-black bg-amber-50/20 shadow-xs ring-2 ring-black/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mr-3">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Tarjeta de débito / crédito</span>
                    {paymentMethod === 'CARD' && <CheckCircle2 className="w-4 h-4 text-black" />}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Visa, Mastercard y tarjetas bolivianas</p>
                </div>
              </div>

              {/* Wallet Option */}
              <div
                data-testid="payment-method-wallet"
                onClick={() => {
                  setPaymentMethod('WALLET');
                  if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: '' }));
                }}
                className={`flex items-start p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'WALLET'
                    ? 'border-black bg-amber-50/20 shadow-xs ring-2 ring-black/5'
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
              </div>

              {/* Payment selection validation error */}
              {errors.paymentMethod && (
                <p role="alert" className="text-red-600 text-[11px] font-semibold mt-2 flex items-center space-x-1 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.paymentMethod}</span>
                </p>
              )}
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

        {/* Col 3: Dirección de entrega & Mapa Interactivo */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900">
                {t('checkout_delivery_step', '1. Dirección de Entrega')}
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                OpenDSP Express
              </span>
            </div>

            {/* Editable Delivery Information Form */}
            <div className="space-y-3">
              <div>
                <label htmlFor="customer-name" className="block text-xs font-bold text-gray-800 mb-1">
                  Nombre Completo / Customer Name *
                </label>
                <input
                  id="customer-name"
                  name="customerName"
                  data-testid="customer-name-input"
                  type="text"
                  placeholder="Ej: Alex Rivera o Maria Gomez"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors((prev) => ({ ...prev, customerName: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    errors.customerName ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                  } text-xs outline-hidden focus:border-emerald-500`}
                  aria-invalid={Boolean(errors.customerName)}
                />
                {errors.customerName && (
                  <p role="alert" className="text-red-600 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.customerName}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customer-phone" className="block text-xs font-bold text-gray-800 mb-1">
                  Teléfono / WhatsApp / Phone *
                </label>
                <input
                  id="customer-phone"
                  name="customerPhone"
                  data-testid="customer-phone-input"
                  type="tel"
                  placeholder="70000001"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.customerPhone) setErrors((prev) => ({ ...prev, customerPhone: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    errors.customerPhone ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                  } text-xs outline-hidden focus:border-emerald-500`}
                  aria-invalid={Boolean(errors.customerPhone)}
                />
                {errors.customerPhone && (
                  <p role="alert" className="text-red-600 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.customerPhone}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customer-address" className="block text-xs font-bold text-gray-800 mb-1">
                  Dirección de Entrega / Delivery Address *
                </label>
                <input
                  id="customer-address"
                  name="customerAddress"
                  data-testid="customer-address-input"
                  type="text"
                  placeholder="Zona Equipetrol, Santa Cruz"
                  value={customerAddress}
                  onChange={(e) => {
                    setCustomerAddress(e.target.value);
                    if (errors.customerAddress) setErrors((prev) => ({ ...prev, customerAddress: '' }));
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    errors.customerAddress ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                  } text-xs outline-hidden focus:border-emerald-500`}
                  aria-invalid={Boolean(errors.customerAddress)}
                />
                {errors.customerAddress && (
                  <p role="alert" className="text-red-600 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.customerAddress}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customer-reference" className="block text-xs font-bold text-gray-800 mb-1">
                  Punto de Referencia (Opcional)
                </label>
                <input
                  id="customer-reference"
                  name="addressReference"
                  data-testid="customer-reference-input"
                  type="text"
                  placeholder="Frente al restaurante La Casona"
                  value={addressReference}
                  onChange={(e) => setAddressReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Map Illustration with Pin */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-[#E8ECEF] aspect-[16/9] flex items-center justify-center shadow-inner mt-2">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 150">
                  <path d="M 30,120 Q 80,40 160,50" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="4,4" />
                </svg>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-200 animate-bounce">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[9px] font-bold bg-white text-gray-800 px-2 py-0.5 rounded-full shadow-xs mt-1">
                    Punto de Entrega
                  </span>
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
              <div data-testid="courier-card" className="bg-gray-50 rounded-2xl p-3 border border-gray-200/70 flex items-center justify-between">
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
                  data-testid="driver-phone-link"
                  aria-label="Llamar repartidor"
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
            {/* General Validation Error Alert */}
            {generalError && (
              <div
                role="alert"
                className="mb-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <button
              disabled={isProcessing}
              onClick={handleCheckoutAction}
              data-testid="confirm-order-button"
              aria-label="Confirmar y Pagar Pedido / Confirm order"
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

      {/* Modal de Pago Interactivo con QR Simple Bolivia */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                  QR
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Pago con QR Simple Bolivia
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Interoperable con todos los bancos del país
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Amount Display */}
            <div className="text-center py-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Monto Total a Pagar
              </span>
              <span className="text-3xl font-black text-slate-950 tracking-tight block mt-0.5">
                {formatBs(currentTotal)}
              </span>
            </div>

            {/* Generated QR Code Graphic */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="relative p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                {/* SVG QR representation */}
                <svg className="w-48 h-48 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Position detection patterns */}
                  <rect x="5" y="5" width="28" height="28" fill="currentColor" rx="4" />
                  <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="13" width="12" height="12" fill="currentColor" rx="2" />

                  <rect x="67" y="5" width="28" height="28" fill="currentColor" rx="4" />
                  <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="75" y="13" width="12" height="12" fill="currentColor" rx="2" />

                  <rect x="5" y="67" width="28" height="28" fill="currentColor" rx="4" />
                  <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="75" width="12" height="12" fill="currentColor" rx="2" />

                  {/* QR Matrix Elements */}
                  <rect x="38" y="10" width="6" height="6" />
                  <rect x="48" y="15" width="6" height="6" />
                  <rect x="58" y="10" width="6" height="6" />
                  <rect x="38" y="24" width="6" height="6" />
                  <rect x="48" y="28" width="6" height="6" />
                  <rect x="58" y="24" width="6" height="6" />

                  <rect x="10" y="38" width="6" height="6" />
                  <rect x="20" y="48" width="6" height="6" />
                  <rect x="10" y="58" width="6" height="6" />
                  <rect x="24" y="38" width="6" height="6" />
                  <rect x="28" y="48" width="6" height="6" />
                  <rect x="24" y="58" width="6" height="6" />

                  <rect x="40" y="40" width="20" height="20" fill="#00D1B2" rx="4" />
                  <circle cx="50" cy="50" r="6" fill="white" />

                  <rect x="67" y="38" width="6" height="6" />
                  <rect x="78" y="48" width="6" height="6" />
                  <rect x="88" y="38" width="6" height="6" />
                  <rect x="67" y="58" width="6" height="6" />
                  <rect x="78" y="68" width="6" height="6" />
                  <rect x="88" y="58" width="6" height="6" />

                  <rect x="38" y="67" width="6" height="6" />
                  <rect x="48" y="78" width="6" height="6" />
                  <rect x="58" y="67" width="6" height="6" />
                  <rect x="38" y="88" width="6" height="6" />
                  <rect x="48" y="88" width="6" height="6" />
                  <rect x="58" y="88" width="6" height="6" />

                  <rect x="70" y="80" width="8" height="8" />
                  <rect x="82" y="80" width="6" height="12" />
                </svg>
              </div>

              <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-semibold mt-3">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Expira en 04:59 minutos • QR Dinámico</span>
              </div>
            </div>

            {/* Instruction Steps */}
            <div className="bg-blue-50/80 rounded-2xl p-3 border border-blue-100 text-xs text-blue-900 space-y-1">
              <p className="font-bold">Instrucciones de Pago:</p>
              <p className="text-[11px] text-blue-800">1. Abre la app de tu banco móvil (BCP, BNB, Unión, etc.).</p>
              <p className="text-[11px] text-blue-800">2. Selecciona la opción <strong>Pago con QR</strong> y escanea el código.</p>
              <p className="text-[11px] text-blue-800">3. Confirma el monto y presiona el botón inferior para iniciar el despacho.</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmOrder}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-full flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Confirmando pago y notificando a OpenDSP...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Ya realicé el pago desde mi app bancaria</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="w-full py-2.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Volver y elegir otro método
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
