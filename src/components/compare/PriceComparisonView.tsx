'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Truck,
  Check,
  ChevronRight,
  Award,
  CheckCircle2,
  Clock,
  FileCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { usePersonalization } from '@/hooks/usePersonalization';
import { AddToCartButton } from '@/components/common/AddToCartButton';

interface VendorOffer {
  id: string;
  price: number;
  stock: number;
  shippingCost: number;
  estimatedDelivery: string;
  isRecommended: boolean;
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string;
    rating: number;
    reviewCount: number;
    salesCount: number;
    isOfficial: boolean;
    address: string;
  };
}

interface PriceComparisonViewProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    basePrice: number;
    images: string;
    color?: string | null;
    material?: string | null;
    warranty?: string | null;
    hasInvoice?: boolean;
    specifications?: string | null;
    category?: { slug: string; name: string };
    offers: VendorOffer[];
  };
}

export function PriceComparisonView({ product }: PriceComparisonViewProps) {
  const { addToCart } = useCart();
  const { trackProductView, trackCompareQuery } = usePersonalization();

  let parsedImages: string[] = [];
  try {
    parsedImages = JSON.parse(product.images);
  } catch {
    parsedImages = [product.images];
  }

  // Variant color to image map for smooth transition
  const colorImages: Record<string, string> = {
    'Beige': parsedImages[0] || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
    'Negro': parsedImages[1] || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    'Gris': parsedImages[2] || 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800',
  };

  const [selectedColor, setSelectedColor] = useState('Beige');
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>(
    product.offers.find((o) => o.isRecommended)?.id || product.offers[0]?.id || ''
  );

  const currentMainImage = colorImages[selectedColor] || parsedImages[activeImageIndex] || parsedImages[0];

  // Track product view and comparison query for personalization
  React.useEffect(() => {
    if (product?.id) {
      const catSlug = product.category?.slug || 'moda-y-accesorios';
      const catName = product.category?.name || 'Moda y Ropa';
      const storeName = product.offers?.[0]?.store?.name || 'Tienda Oficial';

      trackProductView({
        id: product.id,
        title: product.title,
        slug: product.slug,
        categorySlug: catSlug,
        categoryName: catName,
        basePrice: product.basePrice,
        image: currentMainImage,
        storeName,
      });

      trackCompareQuery(product.slug, catSlug);
    }
  }, [product?.id]);

  const handleColorChange = (color: string) => {
    setIsImageFading(true);
    setSelectedColor(color);
    setTimeout(() => {
      setIsImageFading(false);
    }, 200);
  };

  const handleSelectOffer = (offer: VendorOffer) => {
    setSelectedOfferId(offer.id);
    addToCart({
      productOfferId: offer.id,
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      storeId: offer.store.id,
      storeName: offer.store.name,
      storeSlug: offer.store.slug,
      storeAddress: offer.store.address,
      unitPrice: offer.price,
      quantity: 1,
      productImage: currentMainImage,
      shippingCost: offer.shippingCost,
      estimatedDelivery: offer.estimatedDelivery,
      hasInvoice: product.hasInvoice,
    });
  };

  const primaryOffer = product.offers.find((o) => o.id === selectedOfferId) || product.offers[0];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Ruta de navegación" className="flex items-center space-x-2 text-xs font-medium text-gray-600">
        <Link href="/" className="hover:text-black">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        <Link href="/?category=moda-y-accesorios" className="hover:text-black">Moda y Ropa</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-gray-950 font-bold">{product.title}</span>
      </nav>

      {/* Main PDP & Variant Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Product Image Gallery with Smooth Transition */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-[#FAF9F6] border border-gray-200 overflow-hidden p-4 flex items-center justify-center relative">
              <img
                src={currentMainImage}
                alt={`${product.title} - ${selectedColor}`}
                className={`w-full h-full object-contain transition-opacity duration-200 ease-out ${
                  isImageFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              />
              <span className="absolute top-3 left-3 bg-black/80 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs">
                Color: {selectedColor}
              </span>
            </div>

            {/* Thumbnails */}
            <div className="flex items-center space-x-3">
              {parsedImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsImageFading(true);
                    setActiveImageIndex(idx);
                    setTimeout(() => setIsImageFading(false), 200);
                  }}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-white overflow-hidden transition-all ${
                    activeImageIndex === idx
                      ? 'border-amber-500 shadow-sm scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Variants, Buy Box Summary & Dispatch details */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-amber-100 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Comparador Multi-Tienda
                </span>
                <span className="text-xs text-gray-600 font-bold">
                  {product.offers.length} ofertas en Bolivia
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 leading-tight mb-2">
                {product.title}
              </h1>

              <div className="flex items-center space-x-3 text-xs mb-4">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-extrabold text-gray-900 ml-1">4.8</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-700 font-bold">230 compradores verificados</span>
                <span className="text-gray-400">•</span>
                <span className="text-emerald-800 font-bold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Garantía de 7 días
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Color Selector Pills */}
              <div className="space-y-2 mb-4">
                <span className="text-xs font-extrabold text-gray-900 block">
                  Color seleccionado: <span className="text-amber-700 font-bold">{selectedColor}</span>
                </span>
                <div className="flex items-center space-x-2">
                  {['Beige', 'Negro', 'Gris'].map((c) => (
                    <button
                      key={c}
                      data-testid="variant-color-option"
                      aria-label={`Color ${c}`}
                      onClick={() => handleColorChange(c)}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 ${
                        selectedColor === c
                          ? 'bg-[#111111] text-white shadow-sm ring-2 ring-amber-400/50 scale-105'
                          : 'bg-white border border-[#EAEAEA] text-[#111111] hover:border-black'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector Pills */}
              <div className="space-y-2 mb-6">
                <span className="text-xs font-extrabold text-gray-900 block">
                  Talla: <span className="text-amber-700 font-bold">{selectedSize}</span>
                </span>
                <div className="flex items-center space-x-2">
                  {['S', 'M', 'L', 'XL'].map((s) => (
                    <button
                      key={s}
                      data-testid="variant-size-option"
                      aria-label={`Talla ${s}`}
                      onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center ${
                        selectedSize === s
                          ? 'bg-[#111111] text-white shadow-sm ring-2 ring-amber-400/50 scale-105'
                          : 'bg-white border border-[#EAEAEA] text-[#111111] hover:border-black'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Summary Buy Box Banner */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-gray-600 block">Mejor precio disponible:</span>
                <div className="text-2xl sm:text-3xl font-black text-gray-950">
                  {formatBs(primaryOffer?.price || product.basePrice)}
                </div>
                <span className="text-xs text-emerald-800 font-bold flex items-center mt-0.5">
                  <Truck className="w-3.5 h-3.5 mr-1" />
                  {primaryOffer?.shippingCost === 0 ? 'Envío gratis con OpenDSP' : `Envío: Bs. ${primaryOffer?.shippingCost}`}
                </span>
              </div>

              <div className="w-full sm:w-56">
                <AddToCartButton
                  item={{
                    productOfferId: primaryOffer?.id,
                    productId: product.id,
                    productTitle: `${product.title} (${selectedColor} - Talla ${selectedSize})`,
                    productSlug: product.slug,
                    storeId: primaryOffer?.store?.id || 'store-1',
                    storeName: primaryOffer?.store?.name || 'Tienda Oficial',
                    unitPrice: primaryOffer?.price || product.basePrice,
                    quantity: 1,
                    productImage: currentMainImage,
                    shippingCost: primaryOffer?.shippingCost || 0,
                    estimatedDelivery: primaryOffer?.estimatedDelivery || 'Llega mañana con OpenDSP',
                  }}
                  text="Añadir al Carrito"
                  size="lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Multi-Vendor Comparison Cards (Buy Box) */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-gray-950 flex items-center">
                <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
                Matriz de Precios por Tienda Boliviana
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">
                Compara y selecciona la oferta con el mejor precio o el tiempo de entrega más rápido.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {product.offers.map((offer) => {
              const isSelected = selectedOfferId === offer.id;

              return (
                <div
                  key={offer.id}
                  className={`relative bg-white rounded-2xl p-5 border-2 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
                    offer.isRecommended
                      ? 'border-amber-400 bg-amber-50/20 shadow-md ring-2 ring-amber-400/20'
                      : isSelected
                      ? 'border-black shadow-lg ring-2 ring-black/10'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {/* Top Badge (Recomendado) */}
                  {offer.isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-extrabold text-[10px] px-3 py-0.5 rounded-full shadow-xs flex items-center space-x-1 uppercase tracking-wider">
                      <Award className="w-3 h-3 text-black" />
                      <span>Recomendado</span>
                    </div>
                  )}

                  <div>
                    {/* Product thumbnail */}
                    <div className="w-full aspect-square bg-gray-50 rounded-xl mb-4 p-3 flex items-center justify-center border border-gray-100">
                      <img
                        src={currentMainImage}
                        alt={product.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Store Name & Official tag */}
                    <div className="mb-2">
                      <h3 className="font-extrabold text-base text-gray-950">{offer.store.name}</h3>
                      {offer.store.isOfficial ? (
                        <span className="text-[10px] font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          Tienda oficial
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-600 font-semibold block mt-0.5">
                          Vendedor calificado
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-3 mb-2">
                      <span className="text-2xl font-black text-gray-950">{formatBs(offer.price)}</span>
                      <div className="text-xs text-emerald-800 font-bold mt-0.5 flex items-center">
                        <Truck className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        {offer.shippingCost === 0 ? 'Envío gratis' : `+ ${formatBs(offer.shippingCost)} de envío`}
                      </div>
                    </div>

                    {/* Delivery & City */}
                    <div className="space-y-1 text-xs text-gray-700 border-t border-gray-100 pt-2 mb-3">
                      <p className="font-bold text-gray-900 flex items-center">
                        <Clock className="w-3.5 h-3.5 text-gray-500 mr-1" />
                        {offer.estimatedDelivery}
                      </p>
                      <p className="text-gray-600 font-medium text-[11px]">{offer.store.address.split(',')[0]}</p>
                    </div>

                    {/* Store Rating & Sales */}
                    <div className="flex items-center space-x-1.5 text-xs mb-4">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-extrabold text-gray-900">{offer.store.rating}</span>
                      <span className="text-gray-600 font-medium text-[10px]">
                        ({(offer.store.salesCount / 1000).toFixed(1)}k ventas)
                      </span>
                    </div>
                  </div>

                  {/* Select Button ("Elegir este") */}
                  <button
                    onClick={() => handleSelectOffer(offer)}
                    className={`w-full py-3 rounded-full font-black text-xs transition-all shadow-xs active:scale-95 flex items-center justify-center space-x-1.5 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-md'
                        : offer.isRecommended
                        ? 'bg-amber-400 hover:bg-amber-500 text-black shadow-md'
                        : 'bg-gray-100 hover:bg-black hover:text-white text-gray-900 border border-gray-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSelected ? '✓ Oferta seleccionada' : 'Elegir esta oferta'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <h3 className="text-base font-extrabold text-gray-950 mb-4 flex items-center">
            <FileCheck className="w-4 h-4 text-amber-600 mr-2" />
            Detalles y Comparativa Técnica del Producto
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-800 font-extrabold border-b border-gray-200">
                <tr>
                  <th className="p-3.5 w-1/5">Característica</th>
                  {product.offers.map((offer) => (
                    <th key={offer.id} className="p-3.5 font-black text-gray-950">
                      {offer.store.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                <tr>
                  <td className="p-3.5 font-bold text-gray-950 bg-gray-50/50">Color</td>
                  {product.offers.map((offer) => (
                    <td key={offer.id} className="p-3.5">{selectedColor}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-950 bg-gray-50/50">Tallas disponibles</td>
                  {product.offers.map((offer, idx) => (
                    <td key={offer.id} className="p-3.5">
                      {idx === 0 ? 'S, M, L, XL' : idx === 1 ? 'S, M, L, XL' : 'S, M, L'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-950 bg-gray-50/50">Material</td>
                  {product.offers.map((offer) => (
                    <td key={offer.id} className="p-3.5">{product.material || 'Algodón y poliéster'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-950 bg-gray-50/50">Garantía</td>
                  {product.offers.map((offer) => (
                    <td key={offer.id} className="p-3.5 font-semibold text-gray-900">{product.warranty || '7 días'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-gray-950 bg-gray-50/50">Facturación con NIT</td>
                  {product.offers.map((offer) => (
                    <td key={offer.id} className="p-3.5">
                      <span className="flex items-center text-emerald-800 font-extrabold">
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Sí, emite factura
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
