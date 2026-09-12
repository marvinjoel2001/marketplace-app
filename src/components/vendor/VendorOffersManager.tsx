'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  Zap,
  Tag,
  Clock,
  Plus,
  Percent,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Power,
  Calendar,
  Ticket,
  Store,
  ArrowRight,
  Package,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { marketplaceApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function VendorOffersManager() {
  const { user } = useAuth();
  const [activeStoreId, setActiveStoreId] = useState<string>('store-techplus');
  const [activeStoreName, setActiveStoreName] = useState<string>('TechPlus Bolivia');

  const [activeTab, setActiveTab] = useState<'FLASH_OFFERS' | 'COUPONS'>('FLASH_OFFERS');
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);

  // Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State: Flash Offer
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(24);
  const [promoBadge, setPromoBadge] = useState<string>('OFERTA_FLASH');
  const [promoStock, setPromoStock] = useState<number>(10);

  // Form State: Coupon
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED_AMOUNT'>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(100);
  const [validDays, setValidDays] = useState<number>(15);

  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Sync active store
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vitrina_active_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id) setActiveStoreId(parsed.id);
        if (parsed.name) setActiveStoreName(parsed.name);
      } else if (user?.activeStoreId) {
        setActiveStoreId(user.activeStoreId);
        if (user.activeStoreName) setActiveStoreName(user.activeStoreName);
      }
    } catch {}
  }, [user]);

  // Load Offers & Coupons
  const loadData = async () => {
    setLoading(true);
    try {
      const [offersData, couponsData] = await Promise.all([
        marketplaceApi.getStoreOffers(activeStoreId),
        marketplaceApi.getStoreCoupons(activeStoreId),
      ]);
      setOffers(Array.isArray(offersData) ? offersData : []);
      setCoupons(Array.isArray(couponsData) ? couponsData : []);
    } catch (e) {
      console.error('Error loading store offers/coupons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeStoreId) {
      loadData();
    }
  }, [activeStoreId]);

  // Selected offer object
  const selectedOffer = useMemo(() => {
    return offers.find((o) => o.id === selectedOfferId) || offers[0];
  }, [offers, selectedOfferId]);

  // Handle Create Flash Offer
  const handleCreateFlashOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) {
      showToast('Selecciona un producto primero', 'error');
      return;
    }

    try {
      await marketplaceApi.createFlashOffer(activeStoreId, {
        offerId: selectedOffer.id,
        salePrice: Number(salePrice),
        durationHours: Number(durationHours),
        promoBadge,
        promoStock: Number(promoStock),
      });

      showToast(`¡Oferta Flash activada exitosamente para ${selectedOffer.product?.title}!`);
      setIsOfferModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al activar oferta', 'error');
    }
  };

  // Handle Toggle Offer
  const handleToggleOffer = async (offerId: string) => {
    try {
      await marketplaceApi.toggleOfferPromo(activeStoreId, offerId);
      showToast('Estado de la promoción actualizado');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al cambiar estado', 'error');
    }
  };

  // Handle Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Ingresa un código de cupón', 'error');
      return;
    }

    try {
      await marketplaceApi.createStoreCoupon(activeStoreId, {
        code: couponCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        validDays: Number(validDays),
      });

      showToast(`¡Cupón "${couponCode.toUpperCase()}" creado exitosamente!`);
      setCouponCode('');
      setIsCouponModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al crear cupón', 'error');
    }
  };

  // Handle Delete Coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('¿Eliminar este cupón de descuento?')) return;
    try {
      await marketplaceApi.deleteStoreCoupon(activeStoreId, couponId);
      showToast('Cupón eliminado');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-black text-white border-emerald-500/40'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-300" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black">
              <Flame className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
              <span>CENTRO DE OFERTAS & PROMOCIONES</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Ofertas Flash, Liquidaciones & Cupones
            </h1>
            <p className="text-xs md:text-sm text-white/90 max-w-2xl leading-relaxed">
              Crea promociones con tiempo limitado para que tus productos aparezcan destacados con insignia de fuego en la portada de Vitrina Bolivia.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (offers.length > 0) {
                  setSelectedOfferId(offers[0].id);
                  setSalePrice(Math.round((offers[0].price || 100) * 0.8));
                }
                setIsOfferModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-black hover:bg-gray-900 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>+ Nueva Oferta Flash</span>
            </button>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 font-black text-xs shadow-md transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-orange-600" />
              <span>+ Crear Cupón</span>
            </button>
          </div>
        </div>

        {/* Floating Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-white/80 block uppercase">Ofertas Activas</span>
            <span className="text-2xl font-black">{offers.filter((o) => o.isFlashSale).length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-white/80 block uppercase">Cupones Vigentes</span>
            <span className="text-2xl font-black">{coupons.filter((c) => c.isActive).length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-white/80 block uppercase">Tienda Conectada</span>
            <span className="text-xs font-bold truncate block">{activeStoreName}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold text-white/80 block uppercase">Destacado Portada</span>
            <span className="text-xs font-bold text-amber-200 block">🔥 Santa Cruz Feed</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex space-x-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setActiveTab('FLASH_OFFERS')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'FLASH_OFFERS'
              ? 'bg-black text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Ofertas Flash de Productos ({offers.filter((o) => o.isFlashSale).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COUPONS')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'COUPONS'
              ? 'bg-black text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-4 h-4 text-orange-500" />
          <span>Cupones de Descuento de Tienda ({coupons.length})</span>
        </button>
      </div>

      {/* TAB 1: OFERTAS FLASH */}
      {activeTab === 'FLASH_OFFERS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center">
                <Flame className="w-5 h-5 text-amber-500 mr-2" />
                Catálogo de Ofertas y Rebajas Activas
              </h2>
              <p className="text-xs text-slate-500">
                Los productos con oferta flash aparecen con reloj de cuenta regresiva e insignia en Vitrina.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Producto</th>
                  <th className="p-3.5">Insignia / Badge</th>
                  <th className="p-3.5">Precio Normal</th>
                  <th className="p-3.5">Precio Oferta (Bs.)</th>
                  <th className="p-3.5">Descuento</th>
                  <th className="p-3.5">Vigencia / Reloj</th>
                  <th className="p-3.5 text-right">Estado / Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {offers.map((off) => {
                  const hasFlash = off.isFlashSale;
                  const price = off.price || off.product?.basePrice || 0;
                  const sale = off.salePrice || price;
                  const discount = off.discountPercent || Math.round(((price - sale) / price) * 100);

                  return (
                    <tr key={off.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              off.product?.images
                                ? typeof off.product.images === 'string'
                                  ? JSON.parse(off.product.images)?.[0]
                                  : off.product.images[0]
                                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150'
                            }
                            alt={off.product?.title || 'Producto'}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{off.product?.title || 'Producto'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Stock total: {off.stock} uds.</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {hasFlash ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 flex items-center w-fit space-x-1">
                            <Flame className="w-3 h-3 text-red-600" />
                            <span>{off.promoBadge || 'OFERTA_FLASH'}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-[11px]">Sin promoción</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-500 line-through">
                        {formatBs(price)}
                      </td>
                      <td className="p-3.5 font-black text-slate-900 text-sm">
                        {hasFlash ? (
                          <span className="text-red-600 font-black">{formatBs(sale)}</span>
                        ) : (
                          <span>{formatBs(price)}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {hasFlash && discount > 0 ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-100 text-amber-900">
                            -{discount}% OFF
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {hasFlash && off.flashSaleEnd ? (
                          <div className="flex items-center space-x-1 text-slate-700 font-mono text-[11px]">
                            <Clock className="w-3 h-3 text-red-500" />
                            <span>
                              {new Date(off.flashSaleEnd).toLocaleDateString('es-BO', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Indefinido</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {hasFlash ? (
                          <button
                            onClick={() => handleToggleOffer(off.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                          >
                            Pausar Oferta
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedOfferId(off.id);
                              setSalePrice(Math.round(price * 0.8));
                              setIsOfferModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-black hover:bg-slate-800 transition-colors"
                          >
                            Activar Oferta
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUPONES DE DESCUENTO */}
      {activeTab === 'COUPONS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center">
                <Ticket className="w-5 h-5 text-orange-500 mr-2" />
                Cupones de Descuento de tu Tienda
              </h2>
              <p className="text-xs text-slate-500">
                Comparte estos códigos en tus historias de WhatsApp, TikTok o Instagram para que tus clientes reciban rebajas al pagar.
              </p>
            </div>
            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Cupón</span>
            </button>
          </div>

          {coupons.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-[#FAF9F6] rounded-2xl border border-slate-100">
              <Ticket className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="font-black text-sm text-slate-800">Aún no has creado cupones de descuento</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Crea un cupón promocional (ej. <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold">TECH10</code>) para incentivar compras en tu tienda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#FAF9F6] rounded-2xl p-5 border border-slate-200/70 shadow-2xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-lg bg-black text-white font-mono font-black text-xs tracking-wider">
                        {c.code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(c.code)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                        title="Copiar código"
                      >
                        {copiedCode === c.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <p className="text-xl font-black text-slate-900">
                      {c.discountType === 'PERCENT' ? `${c.discountValue}% OFF` : `Bs. ${c.discountValue} OFF`}
                    </p>
                    <p className="text-xs text-slate-500">
                      Monto mínimo de compra: <strong>Bs. {c.minOrderAmount || 0}</strong>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Usado: <strong>{c.usedCount || 0}</strong> / {c.usageLimit || 100}
                    </span>
                    <span>
                      Válido hasta: {new Date(c.validUntil).toLocaleDateString('es-BO')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Crear Oferta Flash */}
      {isOfferModalOpen && selectedOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 text-base">Activar Oferta Flash en Producto</h3>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFlashOffer} className="space-y-4 text-xs">
              {/* Selector de Producto */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Producto a Promocionar:</label>
                <select
                  value={selectedOffer.id}
                  onChange={(e) => {
                    const found = offers.find((o) => o.id === e.target.value);
                    if (found) {
                      setSelectedOfferId(found.id);
                      setSalePrice(Math.round((found.price || 100) * 0.8));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {offers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.product?.title} (Precio Normal: {formatBs(o.price || 0)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Comparativa de Precios */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Precio Normal:</span>
                  <p className="text-sm font-black text-slate-600 line-through">
                    {formatBs(selectedOffer.price || 0)}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-800 block">
                    Precio de Oferta Flash (Bs.):
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2 font-black text-sm text-red-600 focus:outline-none"
                    min="1"
                    max={selectedOffer.price || 10000}
                    required
                  />
                </div>
              </div>

              {/* Insignia / Promo Badge */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Insignia / Etiqueta Visual:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'OFERTA_FLASH', label: '🔥 Oferta Flash' },
                    { id: 'LIQUIDACION', label: '⚡ Liquidación Total' },
                    { id: 'COMBO', label: '🎁 Combo Especial' },
                    { id: 'DOS_POR_UNO', label: '⭐ Promoción 2x1' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setPromoBadge(b.id)}
                      className={`p-2 rounded-xl text-left font-bold border transition-all text-xs ${
                        promoBadge === b.id
                          ? 'bg-black text-white border-black'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duración */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Duración de la Oferta:</label>
                <div className="flex space-x-2">
                  {[
                    { hours: 2, label: '2 Horas' },
                    { hours: 6, label: '6 Horas' },
                    { hours: 24, label: '24 Horas' },
                    { hours: 72, label: '3 Días' },
                  ].map((d) => (
                    <button
                      key={d.hours}
                      type="button"
                      onClick={() => setDurationHours(d.hours)}
                      className={`flex-1 py-2 rounded-xl font-bold text-center border text-xs ${
                        durationHours === d.hours
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Promocional */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Unidades Destinadas a la Oferta:
                </label>
                <input
                  type="number"
                  value={promoStock}
                  onChange={(e) => setPromoStock(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none"
                  min="1"
                  max={selectedOffer.stock || 50}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Al venderse esta cantidad, el producto volverá a su precio normal.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-black text-white bg-black hover:bg-slate-800 rounded-xl transition-all shadow-xs"
                >
                  Publicar Oferta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Crear Cupón */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-slate-900 text-base">Crear Cupón de Descuento</h3>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Código del Cupón:</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="EJ: TECHPLUS15"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-black text-slate-900 uppercase focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tipo de Descuento:</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="PERCENT">% Porcentual</option>
                    <option value="FIXED_AMOUNT">Bs. Monto Fijo</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Valor del Descuento:</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Compra Mínima (Bs.):</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    min="0"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Vigencia (Días):</label>
                  <input
                    type="number"
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-black text-white bg-black hover:bg-slate-800 rounded-xl transition-all"
                >
                  Crear Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
