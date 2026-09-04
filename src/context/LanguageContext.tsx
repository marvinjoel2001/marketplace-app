'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Top Bar & Navbar
    free_shipping_notice: 'Envíos Gratis en compras mayores a Bs. 150 con OpenDSP Express',
    nav_home: 'Inicio',
    nav_shop: 'Tiendas',
    nav_categories: 'Categorías',
    nav_deals: 'Ofertas',
    nav_live: 'TikTok Live',
    nav_compare: 'Comparador',
    nav_help: 'Ayuda',
    nav_search_placeholder: 'Buscar productos, marcas y tiendas...',
    nav_login: 'Iniciar Sesión',
    nav_my_account: 'Mi Cuenta',
    nav_my_orders: 'Mis Pedidos',
    nav_vendor_panel: 'Panel Vendedor',
    nav_logout: 'Cerrar Sesión',

    // TikTok Live Section
    live_badge: 'EN VIVO',
    live_title_prefix: 'Tiendas en',
    live_subtitle_pill: 'Compras en tiempo real',
    live_description: 'Demostraciones en vivo, cupones exclusivos y envío express con OpenDSP',
    live_view_all: 'Ver todas las transmisiones',
    live_viewers: 'viendo',
    live_enter_stream: 'Ver Transmisión en Vivo',

    // Hero Banner
    hero_badge: 'Nuevo producto',
    hero_title: 'Roco Wireless Headphones',
    hero_desc: 'Sonido premium con bajos profundos y comodidad todo el día. Disponible con entrega express OpenDSP en toda Bolivia.',
    hero_shop_now: 'Comprar ahora',
    hero_happy_customers: 'Clientes felices',
    hero_only_price: 'SOLO',

    // Promo & Special Offer Banner
    special_offer: 'Oferta Especial',
    special_offer_title: 'Mejora Tu Experiencia Musical',
    check_it_out: 'Aprovechar Oferta',
    countdown_days: 'Días',
    countdown_hours: 'Horas',
    countdown_mins: 'Min',
    countdown_secs: 'Seg',

    // Categories
    shop_by_category: 'Comprar por Categoría',
    browse_by_category: 'Explora Nuestras Categorías',
    cat_phones: 'Celulares y Teléfonos',
    cat_computers: 'Computadoras',
    cat_accessories: 'Accesorios',
    cat_laptops: 'Laptops',
    cat_gaming: 'Videojuegos y Consolas',
    cat_audio: 'Audio y Auriculares',
    cat_items_suffix: 'productos',

    // Feed / Catalog
    feed_title: 'Catálogo de Productos y Ofertas',
    feed_subtitle: 'Los mejores precios garantizados y entrega express con OpenDSP',
    filter_all: 'Todos',
    filter_trending: 'Más Vendidos',
    filter_deals: 'Ofertas Relámpago',
    filter_live_products: 'Productos de TikTok Live',
    add_to_cart: 'Añadir al carrito',
    view_details: 'Ver detalles',
    compare_prices: 'Comparar precios',
    in_stock: 'En stock',
    free_delivery_badge: 'Envío Gratis',

    // Cart Drawer
    cart_drawer_title: 'Tu Carrito de Compras',
    cart_empty_title: 'Tu carrito está vacío',
    cart_empty_desc: 'Explora nuestro catálogo o transmisiones de TikTok Live para agregar productos.',
    cart_start_shopping: 'Empezar a comprar',
    cart_subtotal: 'Subtotal',
    cart_shipping: 'Envío OpenDSP Express',
    cart_free_shipping: '¡Gratis!',
    cart_total: 'Total a pagar',
    cart_proceed_checkout: 'Proceder al Checkout Seguro',
    cart_secure_note: 'Pago 100% seguro con QR Simple, Tarjeta o Billetera Móvil',

    // Checkout Flow
    checkout_page_title: 'Finalizar Compra Segura',
    checkout_secure_badge: 'Despacho Express OpenDSP',
    checkout_delivery_step: '1. Dirección de Entrega',
    checkout_customer_name: 'Nombre Completo',
    checkout_customer_phone: 'Teléfono / WhatsApp',
    checkout_address: 'Dirección Exacta (Calle, Número, Zona)',
    checkout_address_ref: 'Punto de Referencia',
    checkout_city: 'Ciudad de Entrega',
    checkout_payment_step: '2. Método de Pago',
    checkout_pay_qr: 'QR Simple (Cualquier Banco)',
    checkout_pay_qr_desc: 'Banco Unión, BCP, BNB, Banco Sol, Mercantil Santa Cruz, FIE',
    checkout_pay_card: 'Tarjeta de Débito / Crédito',
    checkout_pay_card_desc: 'Visa, Mastercard, Tarjetas Nacionales e Internacionales',
    checkout_pay_wallet: 'Billetera Móvil',
    checkout_pay_wallet_desc: 'Tigo Money, Billetera BNB',
    checkout_summary_title: 'Resumen del Pedido',
    checkout_items_count: 'productos',
    checkout_subtotal_label: 'Subtotal',
    checkout_shipping_label: 'Costo de Envío OpenDSP',
    checkout_total_label: 'Total a Pagar',
    checkout_confirm_btn: 'Confirmar y Pagar Pedido',
    checkout_processing: 'Procesando despacho OpenDSP...',
    checkout_success_title: '¡Pedido Confirmado con Éxito!',
    checkout_success_desc: 'Un repartidor de OpenDSP Express ha sido asignado a tu orden.',
    checkout_track_btn: 'Rastrear mi pedido en tiempo real',

    // Trust Badges
    trust_delivery_title: 'Envíos a todo el país',
    trust_delivery_desc: 'Rastreo satelital GPS con OpenDSP',
    trust_returns_title: 'Devoluciones fáciles',
    trust_returns_desc: 'Tienes hasta 7 días de garantía',
    trust_secure_title: 'Compra protegida',
    trust_secure_desc: 'Tus datos y dinero 100% seguros',
    trust_support_title: 'Atención al cliente',
    trust_support_desc: '24/7 para ayudarte en tus compras',

    // Footer
    footer_desc: 'El primer marketplace en Bolivia con Live Shopping en vivo de TikTok, comparador inteligente de precios entre tiendas y entregas express de última milla con OpenDSP.',
    footer_accepted_methods: 'Métodos aceptados:',
    footer_col_shop: 'Comprar',
    footer_col_sell: 'Vender',
    footer_col_support: 'Soporte',
    footer_flash_deals: 'Ofertas Relámpago',
    footer_live_shopping: 'TikTok Live Shopping',
    footer_price_compare: 'Comparar Precios',
    footer_official_stores: 'Tiendas Oficiales',
    footer_order_tracking: 'Rastreo de Envíos',
    footer_register_store: 'Registrar mi Tienda',
    footer_vendor_dashboard: 'Panel del Vendedor',
    footer_broadcast_live: 'Transmitir en TikTok Live',
    footer_dsp_orders: 'Gestión de Pedidos DSP',
    footer_help_center: 'Centro de Ayuda y FAQ',
    footer_admin_portal: 'Portal Administrativo',
    footer_copyright: '© 2026 Chiringuito Bolivia S.R.L. Todos los derechos reservados. Desarrollado para OpenDSP Delivery Ecosystem.',
    footer_terms: 'Términos y Condiciones',
    footer_privacy: 'Privacidad',
    footer_billing: 'Facturación',

    // Help & FAQ
    help_page_title: 'Centro de Ayuda y Preguntas Frecuentes',
    help_page_subtitle: 'Todo lo que necesitas saber sobre compras, envíos OpenDSP, pagos con QR Simple y transmisiones de TikTok Live.',
    help_search_placeholder: 'Escribe tu pregunta o palabra clave (ej. envíos, QR, devolución)...',
    help_contact_title: '¿Necesitas ayuda personalizada?',
    help_contact_desc: 'Nuestro equipo de atención al cliente está listo para ayudarte todos los días.',
    help_whatsapp: 'Contactar por WhatsApp',
    help_call: 'Llamar a Soporte',
  },
  en: {
    // Top Bar & Navbar
    free_shipping_notice: 'Free Shipping on orders over Bs. 150 with OpenDSP Express',
    nav_home: 'Home',
    nav_shop: 'Stores',
    nav_categories: 'Categories',
    nav_deals: 'Deals',
    nav_live: 'TikTok Live',
    nav_compare: 'Compare',
    nav_help: 'Help',
    nav_search_placeholder: 'Search products, brands and stores...',
    nav_login: 'Sign In',
    nav_my_account: 'My Account',
    nav_my_orders: 'My Orders',
    nav_vendor_panel: 'Vendor Dashboard',
    nav_logout: 'Log Out',

    // TikTok Live Section
    live_badge: 'LIVE',
    live_title_prefix: 'Stores on',
    live_subtitle_pill: 'Real-time Live Shopping',
    live_description: 'Live demonstrations, exclusive coupons and express delivery with OpenDSP',
    live_view_all: 'View all live streams',
    live_viewers: 'watching',
    live_enter_stream: 'Watch Live Stream',

    // Hero Banner
    hero_badge: 'New product',
    hero_title: 'Roco Wireless Headphones',
    hero_desc: 'Premium sound with deep bass and all-day comfort. Available with OpenDSP express delivery across Bolivia.',
    hero_shop_now: 'Shop now',
    hero_happy_customers: 'Happy customers',
    hero_only_price: 'ONLY',

    // Promo & Special Offer Banner
    special_offer: 'Special Offer',
    special_offer_title: 'Enhance Your Music Experience',
    check_it_out: 'Check it Out',
    countdown_days: 'Days',
    countdown_hours: 'Hours',
    countdown_mins: 'Mins',
    countdown_secs: 'Secs',

    // Categories
    shop_by_category: 'Shop by Category',
    browse_by_category: 'Browse Our Categories',
    cat_phones: 'Phones & Mobiles',
    cat_computers: 'Computers',
    cat_accessories: 'Accessories',
    cat_laptops: 'Laptops',
    cat_gaming: 'Gaming & Consoles',
    cat_audio: 'Audio & Headphones',
    cat_items_suffix: 'items',

    // Feed / Catalog
    feed_title: 'Product Catalog & Deals',
    feed_subtitle: 'Best guaranteed prices and express delivery with OpenDSP',
    filter_all: 'All',
    filter_trending: 'Best Sellers',
    filter_deals: 'Flash Deals',
    filter_live_products: 'TikTok Live Products',
    add_to_cart: 'Add to cart',
    view_details: 'View details',
    compare_prices: 'Compare prices',
    in_stock: 'In stock',
    free_delivery_badge: 'Free Delivery',

    // Cart Drawer
    cart_drawer_title: 'Your Shopping Cart',
    cart_empty_title: 'Your cart is empty',
    cart_empty_desc: 'Browse our catalog or TikTok Live streams to add products.',
    cart_start_shopping: 'Start shopping',
    cart_subtotal: 'Subtotal',
    cart_shipping: 'OpenDSP Express Shipping',
    cart_free_shipping: 'Free!',
    cart_total: 'Total amount',
    cart_proceed_checkout: 'Proceed to Secure Checkout',
    cart_secure_note: '100% Secure Payment with QR Simple, Card or Mobile Wallet',

    // Checkout Flow
    checkout_page_title: 'Secure Checkout',
    checkout_secure_badge: 'OpenDSP Express Delivery',
    checkout_delivery_step: '1. Delivery Address',
    checkout_customer_name: 'Full Name',
    checkout_customer_phone: 'Phone / WhatsApp',
    checkout_address: 'Exact Address (Street, Number, Zone)',
    checkout_address_ref: 'Address Reference / Landmark',
    checkout_city: 'Delivery City',
    checkout_payment_step: '2. Payment Method',
    checkout_pay_qr: 'QR Simple (Any Bolivian Bank)',
    checkout_pay_qr_desc: 'Banco Union, BCP, BNB, Banco Sol, Mercantil Santa Cruz, FIE',
    checkout_pay_card: 'Debit / Credit Card',
    checkout_pay_card_desc: 'Visa, Mastercard, National & International Cards',
    checkout_pay_wallet: 'Mobile Wallet',
    checkout_pay_wallet_desc: 'Tigo Money, BNB Wallet',
    checkout_summary_title: 'Order Summary',
    checkout_items_count: 'items',
    checkout_subtotal_label: 'Subtotal',
    checkout_shipping_label: 'OpenDSP Shipping Fee',
    checkout_total_label: 'Total to Pay',
    checkout_confirm_btn: 'Confirm & Pay Order',
    checkout_processing: 'Dispatching with OpenDSP...',
    checkout_success_title: 'Order Successfully Confirmed!',
    checkout_success_desc: 'An OpenDSP Express courier has been dispatched to your order.',
    checkout_track_btn: 'Track my order in real time',

    // Trust Badges
    trust_delivery_title: 'Nationwide Delivery',
    trust_delivery_desc: 'GPS satellite tracking with OpenDSP',
    trust_returns_title: 'Easy Returns',
    trust_returns_desc: 'Up to 7 days satisfaction warranty',
    trust_secure_title: '100% Secure Payment',
    trust_secure_desc: 'Your data and funds 100% protected',
    trust_support_title: '24/7 Support',
    trust_support_desc: 'Dedicated assistance across Bolivia',

    // Footer
    footer_desc: 'The premier marketplace in Bolivia featuring TikTok Live Shopping, smart multi-store price comparisons and last-mile express deliveries with OpenDSP.',
    footer_accepted_methods: 'Accepted methods:',
    footer_col_shop: 'Shop',
    footer_col_sell: 'Sell',
    footer_col_support: 'Support',
    footer_flash_deals: 'Flash Deals',
    footer_live_shopping: 'TikTok Live Shopping',
    footer_price_compare: 'Price Comparison',
    footer_official_stores: 'Official Stores',
    footer_order_tracking: 'Order Tracking',
    footer_register_store: 'Register My Store',
    footer_vendor_dashboard: 'Vendor Dashboard',
    footer_broadcast_live: 'Broadcast on TikTok Live',
    footer_dsp_orders: 'DSP Order Management',
    footer_help_center: 'Help Center & FAQ',
    footer_admin_portal: 'Admin Portal',
    footer_copyright: '© 2026 Chiringuito Bolivia S.R.L. All rights reserved. Powered by OpenDSP Delivery Ecosystem.',
    footer_terms: 'Terms & Conditions',
    footer_privacy: 'Privacy',
    footer_billing: 'Billing',

    // Help & FAQ
    help_page_title: 'Help Center & Frequently Asked Questions',
    help_page_subtitle: 'Everything you need to know about shopping, OpenDSP express shipping, QR Simple payments and TikTok Live Shopping.',
    help_search_placeholder: 'Search questions or keywords (e.g. shipping, QR, returns)...',
    help_contact_title: 'Need personal assistance?',
    help_contact_desc: 'Our customer support team is available every day to assist you.',
    help_whatsapp: 'Contact on WhatsApp',
    help_call: 'Call Support',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultText?: string) => defaultText || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chiringuito_language') as Language;
      if (saved === 'es' || saved === 'en') {
        setLanguageState(saved);
      } else {
        // Explicitly set 'es' as default in localStorage
        localStorage.setItem('chiringuito_language', 'es');
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('chiringuito_language', lang);
    } catch {}
  };

  const toggleLanguage = () => {
    const nextLang = language === 'es' ? 'en' : 'es';
    setLanguage(nextLang);
  };

  const t = (key: string, defaultText?: string): string => {
    return translations[language]?.[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
