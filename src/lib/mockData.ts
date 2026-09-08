// Mock Data for CompraYa Bolivia / NovaTech Marketplace
// Provides high-fidelity offline/fallback data for TikTok Live Shopping, Product Comparisons, and Storefront

export interface MockStore {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  isOfficial: boolean;
  address: string;
  tiktokUsername: string;
  tiktokLiveUrl: string;
  isLive: boolean;
  viewers: string;
  streamerName: string;
  liveTitle: string;
  category: string;
  offers?: any[];
  liveStreams?: any[];
}

export interface MockProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string; // JSON stringified array of images
  rating: number;
  reviewCount: number;
  isFlashSale?: boolean;
  color?: string | null;
  material?: string | null;
  warranty?: string | null;
  hasInvoice?: boolean;
  specifications?: string | null;
  category: { slug: string; name: string };
  offers: Array<{
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
  }>;
}

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Tecnología & Celulares', slug: 'tecnologia-y-celulares', icon: 'Smartphone' },
  { id: 'cat-2', name: 'Audio & Auriculares', slug: 'audio-y-auriculares', icon: 'Headphones' },
  { id: 'cat-3', name: 'Gaming & Computación', slug: 'gaming-y-computacion', icon: 'Gamepad2' },
  { id: 'cat-4', name: 'Moda & Ropa', slug: 'moda-y-ropa', icon: 'Shirt' },
  { id: 'cat-5', name: 'Hogar & Confort', slug: 'hogar-y-confort', icon: 'Home' },
  { id: 'cat-6', name: 'Belleza & Cuidado', slug: 'belleza-y-cuidado', icon: 'Sparkles' },
  { id: 'cat-7', name: 'Supermercado & Abarrotes', slug: 'supermercado-y-abarrotes', icon: 'ShoppingBag' },
];

export const MOCK_STORES: MockStore[] = [
  {
    id: 'store-techplus',
    name: 'TechPlus Bolivia',
    slug: 'techplus-bolivia',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    banner: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200',
    description: 'Distribuidor oficial de tecnología, smartphones premium, periféricos y accesorios con garantía real en Bolivia.',
    rating: 4.9,
    reviewCount: 3412,
    salesCount: 8920,
    isOfficial: true,
    address: 'Av. San Martín #450, Equipetrol, Santa Cruz',
    tiktokUsername: '@techplus_bolivia',
    tiktokLiveUrl: 'https://www.tiktok.com/@techplus_bolivia/live',
    isLive: true,
    viewers: '1.4K',
    streamerName: 'Andrea Tech & Carlos',
    liveTitle: '🔥 Gran Venta Nocturna: Audífonos Roco Wireless & Descuentos en Smartphones',
    category: 'Tecnología',
  },
  {
    id: 'store-outfit',
    name: 'Moda Trendy Bolivia',
    slug: 'outfit-bolivia',
    logo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    banner: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
    description: 'Tendencias urbanas, chompas oversize, casacas térmicas y calzado con envíos en el día por OpenDSP.',
    rating: 4.8,
    reviewCount: 1890,
    salesCount: 5410,
    isOfficial: true,
    address: 'Calle 21 de Calacoto, San Miguel, La Paz',
    tiktokUsername: '@outfitbolivia',
    tiktokLiveUrl: 'https://www.tiktok.com/@outfitbolivia/live',
    isLive: true,
    viewers: '1.2K',
    streamerName: 'Valeria Styles',
    liveTitle: '✨ Probándome la Nueva Colección Otoño/Invierno: Chompas Oversize y Cupones',
    category: 'Moda',
  },
  {
    id: 'store-tecnoshop',
    name: 'TecnoShop Bolivia',
    slug: 'tecnoshop',
    logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    banner: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200',
    description: 'Especialistas en componentes de PC, teclados mecánicos, webcams para streaming y gadgets.',
    rating: 4.8,
    reviewCount: 1420,
    salesCount: 4120,
    isOfficial: false,
    address: 'Av. Heroínas #820, Cochabamba',
    tiktokUsername: '@tecnoshop_bo',
    tiktokLiveUrl: 'https://www.tiktok.com/@tecnoshop_bo/live',
    isLive: true,
    viewers: '1.5K',
    streamerName: 'Gabo Gamer',
    liveTitle: '⚡ Testeando Teclados Mecánicos RGB y Mouses en Vivo con Despacho Inmediato',
    category: 'Gaming',
  },
  {
    id: 'store-hogar',
    name: 'Hogar Feliz',
    slug: 'hogar-feliz',
    logo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    banner: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200',
    description: 'Artículos inteligentes para el hogar, iluminación LED, aspiradoras robot y organizadores modernos.',
    rating: 4.7,
    reviewCount: 940,
    salesCount: 2850,
    isOfficial: true,
    address: 'Av. Cristo Redentor 4to Anillo, Santa Cruz',
    tiktokUsername: '@hogarfeliz_bo',
    tiktokLiveUrl: 'https://www.tiktok.com/@hogarfeliz_bo/live',
    isLive: true,
    viewers: '842',
    streamerName: 'Claudia Home',
    liveTitle: '🏡 Demostración en Vivo: Iluminación Inteligente y Gadgets para tu Sala',
    category: 'Hogar',
  },
  {
    id: 'store-abarrotes',
    name: 'Abarrotes del Día',
    slug: 'abarrotes-del-dia',
    logo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
    description: 'Canasta familiar a precio de costo, despensa y delivery ultra rápido en 45 minutos con OpenDSP.',
    rating: 4.9,
    reviewCount: 2150,
    salesCount: 9200,
    isOfficial: true,
    address: 'Mercado Abasto Mayorista, Santa Cruz',
    tiktokUsername: '@abarrotes_dia',
    tiktokLiveUrl: 'https://www.tiktok.com/@abarrotes_dia/live',
    isLive: true,
    viewers: '932',
    streamerName: 'Don Mario',
    liveTitle: '🛒 Canastas de Despensa Familiar y Combos de Descuento con Entrega Hoy',
    category: 'Supermercado',
  },
  {
    id: 'store-belleza',
    name: 'Belleza Natural',
    slug: 'belleza-natural',
    logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    banner: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200',
    description: 'Skincare coreano, maquillaje profesional y productos orgánicos certificados.',
    rating: 4.8,
    reviewCount: 1680,
    salesCount: 4620,
    isOfficial: true,
    address: 'Calle Claudio Peñaranda, La Paz',
    tiktokUsername: '@bellezanatural_bo',
    tiktokLiveUrl: 'https://www.tiktok.com/@bellezanatural_bo/live',
    isLive: true,
    viewers: '1.1K',
    streamerName: 'Camila Beauty',
    liveTitle: '💄 Rutina de Skincare en Vivo + Regalos por Compras en la Transmisión',
    category: 'Belleza',
  },
  {
    id: 'store-novagaming',
    name: 'NovaGaming Bolivia',
    slug: 'novagaming',
    logo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
    description: 'Todo en hardware para gaming, mandos inalámbricos, audio espacial y sillas ergonómicas.',
    rating: 4.9,
    reviewCount: 3100,
    salesCount: 7800,
    isOfficial: true,
    address: 'Comercial Cañoto Local 42, Santa Cruz',
    tiktokUsername: '@novagaming_bo',
    tiktokLiveUrl: 'https://www.tiktok.com/@novagaming_bo/live',
    isLive: true,
    viewers: '1.8K',
    streamerName: 'Franco Streamer',
    liveTitle: '🎮 Gameplays y Sorteos en Vivo: Probando el Game Controller Inalámbrico Pro',
    category: 'Gaming',
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'p-1',
    title: 'Chompa Oversize Beige - Talla M',
    slug: 'chompa-oversize-beige-talla-m',
    description: 'Chompa tejido suave estilo oversize con cuello redondo, confeccionada con hilo antialérgico de máxima comodidad. Ideal para el clima de otoño e invierno.',
    basePrice: 189,
    rating: 4.9,
    reviewCount: 142,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
    ]),
    color: 'Beige Cálido',
    material: 'Lana Hipoalergénica y Algodón Premium',
    warranty: '30 días por defectos de costura',
    hasInvoice: true,
    specifications: 'Talla: M | Corte: Relaxed Oversize | Lavado: A mano o máquina suave',
    category: { slug: 'moda-y-ropa', name: 'Moda & Ropa' },
    offers: [
      {
        id: 'off-chompa-1',
        price: 189,
        stock: 14,
        shippingCost: 0,
        estimatedDelivery: 'Llega hoy con OpenDSP Express (18 min)',
        isRecommended: true,
        store: {
          id: 'store-outfit',
          name: 'Moda Trendy Bolivia',
          slug: 'outfit-bolivia',
          logo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
          rating: 4.8,
          reviewCount: 1890,
          salesCount: 5410,
          isOfficial: true,
          address: 'San Miguel, La Paz',
        },
      },
      {
        id: 'off-chompa-2',
        price: 199,
        stock: 8,
        shippingCost: 15,
        estimatedDelivery: 'Llega mañana',
        isRecommended: false,
        store: {
          id: 'store-urbana',
          name: 'Boutique Urbana',
          slug: 'boutique-urbana',
          logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rating: 4.6,
          reviewCount: 420,
          salesCount: 1100,
          isOfficial: false,
          address: 'Equipetrol, Santa Cruz',
        },
      },
      {
        id: 'off-chompa-3',
        price: 215,
        stock: 5,
        shippingCost: 20,
        estimatedDelivery: '2 a 3 días hábiles',
        isRecommended: false,
        store: {
          id: 'store-moda-express',
          name: 'Moda Express Bo',
          slug: 'moda-express',
          logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          rating: 4.5,
          reviewCount: 310,
          salesCount: 780,
          isOfficial: false,
          address: 'Cochabamba Centro',
        },
      },
    ],
  },
  {
    id: 'p-2',
    title: 'Wireless Game Controller Pro',
    slug: 'wireless-game-controller',
    description: 'Control ergonómico de doble vibración háptica con gatillos analógicos Hall Effect, compatible con PC, Android, iOS y consolas. Batería de 18 horas de duración.',
    basePrice: 189,
    rating: 5.0,
    reviewCount: 128,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600',
      'https://images.unsplash.com/photo-1526509867162-5b0c0d1b4b33?w=600',
    ]),
    color: 'Negro Mate & Cian',
    material: 'Polímero ABS reforzado con agarre antideslizante',
    warranty: '6 meses de garantía oficial',
    hasInvoice: true,
    specifications: 'Conectividad: Bluetooth 5.3 / 2.4GHz Dongle / USB-C | Batería: 1000mAh',
    category: { slug: 'gaming-y-computacion', name: 'Gaming & Computación' },
    offers: [
      {
        id: 'off-pad-1',
        price: 189,
        stock: 22,
        shippingCost: 0,
        estimatedDelivery: 'OpenDSP Hoy Mismo',
        isRecommended: true,
        store: {
          id: 'store-novagaming',
          name: 'NovaGaming Bolivia',
          slug: 'novagaming',
          logo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
          rating: 4.9,
          reviewCount: 3100,
          salesCount: 7800,
          isOfficial: true,
          address: 'Santa Cruz, Bolivia',
        },
      },
      {
        id: 'off-pad-2',
        price: 199,
        stock: 10,
        shippingCost: 15,
        estimatedDelivery: 'Llega mañana con OpenDSP',
        isRecommended: false,
        store: {
          id: 'store-tecnoshop',
          name: 'TecnoShop Bolivia',
          slug: 'tecnoshop',
          logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          rating: 4.8,
          reviewCount: 1420,
          salesCount: 4120,
          isOfficial: false,
          address: 'Cochabamba',
        },
      },
    ],
  },
  {
    id: 'p-3',
    title: 'RGB Mechanical Keyboard Tenkeyless',
    slug: 'rgb-mechanical-keyboard',
    description: 'Teclado mecánico con switches hot-swappable lineales ultra suaves, chasis de aluminio pulido y retroiluminación RGB por tecla configurable.',
    basePrice: 209,
    rating: 4.8,
    reviewCount: 95,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600',
    ]),
    color: 'Gris Espacial',
    material: 'Aluminio y teclas PBT de doble inyección',
    warranty: '1 año de garantía',
    hasInvoice: true,
    specifications: 'Formato: TKL 87 teclas | Switch: Red Linear Hot-swap | Cable: Trenzado removible',
    category: { slug: 'gaming-y-computacion', name: 'Gaming & Computación' },
    offers: [
      {
        id: 'off-kb-1',
        price: 209,
        stock: 15,
        shippingCost: 0,
        estimatedDelivery: 'OpenDSP Hoy',
        isRecommended: true,
        store: {
          id: 'store-tecnoshop',
          name: 'TecnoShop Bolivia',
          slug: 'tecnoshop',
          logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          rating: 4.8,
          reviewCount: 1420,
          salesCount: 4120,
          isOfficial: false,
          address: 'Cochabamba',
        },
      },
    ],
  },
  {
    id: 'p-4',
    title: 'HD Webcam 1080P Pro Streaming',
    slug: 'hd-webcam-1080p',
    description: 'Cámara web Full HD 60fps con enfoque automático inteligente por IA, doble micrófono con cancelación de eco y tapa de privacidad integrada.',
    basePrice: 349,
    rating: 4.9,
    reviewCount: 76,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600',
    ]),
    color: 'Negro Ébano',
    material: 'Óptica de cristal de 5 capas',
    warranty: '12 meses oficial',
    hasInvoice: true,
    specifications: 'Resolución: 1080p@60fps / 720p@90fps | Ángulo: 90° FOV regulable',
    category: { slug: 'tecnologia-y-celulares', name: 'Tecnología & Celulares' },
    offers: [
      {
        id: 'off-cam-1',
        price: 349,
        stock: 9,
        shippingCost: 0,
        estimatedDelivery: 'OpenDSP Express Hoy',
        isRecommended: true,
        store: {
          id: 'store-techplus',
          name: 'TechPlus Bolivia',
          slug: 'techplus-bolivia',
          logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rating: 4.9,
          reviewCount: 3412,
          salesCount: 8920,
          isOfficial: true,
          address: 'Santa Cruz, Bolivia',
        },
      },
    ],
  },
  {
    id: 'p-5',
    title: 'Smart Fitness Band AMOLED',
    slug: 'smart-fitness-band',
    description: 'Pulsera inteligente con pantalla AMOLED de 1.62", monitoreo continuo de SpO2, ritmo cardíaco, más de 120 modos deportivos y batería para 14 días.',
    basePrice: 199,
    rating: 4.7,
    reviewCount: 160,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600',
    ]),
    color: 'Negro Grafito',
    material: 'Correa TPU hipoalergénica, resistencia al agua 5 ATM',
    warranty: '6 meses',
    hasInvoice: true,
    specifications: 'Pantalla: AMOLED 1.62 pulgadas | Batería: 180mAh (hasta 14 días)',
    category: { slug: 'tecnologia-y-celulares', name: 'Tecnología & Celulares' },
    offers: [
      {
        id: 'off-band-1',
        price: 199,
        stock: 30,
        shippingCost: 0,
        estimatedDelivery: 'Llega en 40 min con OpenDSP',
        isRecommended: true,
        store: {
          id: 'store-techplus',
          name: 'TechPlus Bolivia',
          slug: 'techplus-bolivia',
          logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rating: 4.9,
          reviewCount: 3412,
          salesCount: 8920,
          isOfficial: true,
          address: 'Santa Cruz, Bolivia',
        },
      },
    ],
  },
  {
    id: 'p-6',
    title: 'Wireless Earbuds Noise Cancelling Pro',
    slug: 'wireless-earbuds-pro',
    description: 'Auriculares inalámbricos TWS con cancelación activa de ruido (ANC) de 42dB, modo transparencia, drivers de titanio de 11mm y estuche con carga inalámbrica.',
    basePrice: 209,
    rating: 5.0,
    reviewCount: 88,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    ]),
    color: 'Blanco Perla',
    material: 'Acabado cerámico brillante resistente al sudor IPX5',
    warranty: '1 año',
    hasInvoice: true,
    specifications: 'Bluetooth 5.3 | ANC -42dB | Autonomía total: 32 horas con estuche',
    category: { slug: 'audio-y-auriculares', name: 'Audio & Auriculares' },
    offers: [
      {
        id: 'off-buds-1',
        price: 209,
        stock: 18,
        shippingCost: 0,
        estimatedDelivery: 'OpenDSP Hoy',
        isRecommended: true,
        store: {
          id: 'store-techplus',
          name: 'TechPlus Bolivia',
          slug: 'techplus-bolivia',
          logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rating: 4.9,
          reviewCount: 3412,
          salesCount: 8920,
          isOfficial: true,
          address: 'Santa Cruz, Bolivia',
        },
      },
    ],
  },
  {
    id: 'p-7',
    title: 'Ergonomic Vertical Mouse Wireless',
    slug: 'ergonomic-mouse',
    description: 'Ratón vertical inalámbrico diseñado ergonómicamente a 57 grados para reducir la tensión muscular en el antebrazo y muñeca durante largas jornadas laborales.',
    basePrice: 139,
    rating: 4.8,
    reviewCount: 110,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600',
    ]),
    color: 'Gris Antracita',
    material: 'Goma suave texturizada de agarre natural',
    warranty: '6 meses',
    hasInvoice: true,
    specifications: 'DPI: 800 - 1200 - 1600 - 2400 | Clics silenciosos | Conexión Dual 2.4G + BT',
    category: { slug: 'gaming-y-computacion', name: 'Gaming & Computación' },
    offers: [
      {
        id: 'off-mouse-1',
        price: 139,
        stock: 12,
        shippingCost: 0,
        estimatedDelivery: 'OpenDSP Hoy',
        isRecommended: true,
        store: {
          id: 'store-tecnoshop',
          name: 'TecnoShop Bolivia',
          slug: 'tecnoshop',
          logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          rating: 4.8,
          reviewCount: 1420,
          salesCount: 4120,
          isOfficial: false,
          address: 'Cochabamba',
        },
      },
    ],
  },
  {
    id: 'p-8',
    title: 'Gaming Headset Surround 7.1',
    slug: 'gaming-headset',
    description: 'Auriculares gamers de diadema acolchada con transductores de 50mm, sonido envolvente 7.1 virtual, micrófono retráctil con supresión de ruido y luces RGB.',
    basePrice: 310,
    rating: 4.9,
    reviewCount: 94,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
    ]),
    color: 'Negro con detalles LED',
    material: 'Almohadillas viscoelásticas con gel refrigerante',
    warranty: '1 año',
    hasInvoice: true,
    specifications: 'Audio 7.1 Virtual | Driver 50mm Neodimio | Conector USB chapado en oro',
    category: { slug: 'audio-y-auriculares', name: 'Audio & Auriculares' },
    offers: [
      {
        id: 'off-hs-1',
        price: 310,
        stock: 14,
        shippingCost: 0,
        estimatedDelivery: 'OpenDSP Hoy',
        isRecommended: true,
        store: {
          id: 'store-novagaming',
          name: 'NovaGaming Bolivia',
          slug: 'novagaming',
          logo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
          rating: 4.9,
          reviewCount: 3100,
          salesCount: 7800,
          isOfficial: true,
          address: 'Santa Cruz, Bolivia',
        },
      },
    ],
  },
  {
    id: 'p-9',
    title: 'Roco Wireless Headphones Bass Boost',
    slug: 'roco-wireless-headphones',
    description: 'Los audífonos emblemáticos con ecualización de graves profundos, batería de hasta 40 horas continuas de música y cancelación pasiva de ruido.',
    basePrice: 249,
    rating: 4.9,
    reviewCount: 220,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
    ]),
    color: 'Negro Mate & Dorado',
    material: 'Cuero sintético premium y aleación ligera',
    warranty: '1 año de garantía oficial',
    hasInvoice: true,
    specifications: 'Autonomía: 40 horas | Carga rápida: 10 min = 4 horas | Bluetooth 5.3',
    category: { slug: 'audio-y-auriculares', name: 'Audio & Auriculares' },
    offers: [
      {
        id: 'off-roco-1',
        price: 249,
        stock: 25,
        shippingCost: 0,
        estimatedDelivery: 'OpenDSP Hoy (Express)',
        isRecommended: true,
        store: {
          id: 'store-techplus',
          name: 'TechPlus Bolivia',
          slug: 'techplus-bolivia',
          logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rating: 4.9,
          reviewCount: 3412,
          salesCount: 8920,
          isOfficial: true,
          address: 'Santa Cruz, Bolivia',
        },
      },
    ],
  },
];

// Helper to retrieve store by ID or slug with live stream information
export function getMockStore(idOrSlug: string): MockStore {
  const normalized = (idOrSlug || '').toLowerCase().trim();
  const found = MOCK_STORES.find(
    (s) => s.slug.toLowerCase() === normalized || s.id.toLowerCase() === normalized
  );

  if (found) {
    return {
      ...found,
      liveStreams: [
        {
          id: `ls-${found.id}`,
          title: found.liveTitle,
          streamerName: found.streamerName,
          viewerCount: parseInt(found.viewers.replace(/[^\d.]/g, '')) * (found.viewers.includes('K') ? 1000 : 1) || 1200,
          likeCount: 4820,
          status: 'LIVE',
        },
      ],
      offers: MOCK_PRODUCTS.flatMap((p) =>
        p.offers
          .filter((o) => o.store.slug === found.slug || o.store.id === found.id)
          .map((o) => ({
            id: o.id,
            price: o.price,
            product: {
              id: p.id,
              title: p.title,
              slug: p.slug,
              images: p.images,
              rating: p.rating,
            },
          }))
      ),
    };
  }

  // Fallback generator for unknown slugs so that NO store slug ever throws 404
  const cleanName = idOrSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: `store-${idOrSlug}`,
    name: cleanName || 'Tienda Oficial Vitrina Market',
    slug: idOrSlug,
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    banner: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200',
    description: `Tienda certificada en Vitrina Market Bolivia. Transmitiendo en TikTok Live Shopping con entrega garantizada vía OpenDSP.`,
    rating: 4.8,
    reviewCount: 450,
    salesCount: 1240,
    isOfficial: true,
    address: 'Av. Principal, Santa Cruz, Bolivia',
    tiktokUsername: `@${idOrSlug.replace(/-/g, '_')}`,
    tiktokLiveUrl: `https://www.tiktok.com/@${idOrSlug.replace(/-/g, '_')}/live`,
    isLive: true,
    viewers: '1.2K',
    streamerName: 'Anfitrión en Vivo',
    liveTitle: `🔴 Transmisión en Vivo: Descuentos y ofertas de ${cleanName}`,
    category: 'Comercio',
    liveStreams: [
      {
        id: `ls-${idOrSlug}`,
        title: `🔴 Transmisión en Vivo de ${cleanName}`,
        streamerName: 'Anfitrión Oficial',
        viewerCount: 1240,
        likeCount: 3890,
        status: 'LIVE',
      },
    ],
    offers: MOCK_PRODUCTS.slice(0, 4).map((p, idx) => ({
      id: `off-dyn-${idx}`,
      price: p.basePrice,
      product: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        images: p.images,
        rating: p.rating,
      },
    })),
  };
}

// Helper to retrieve product by ID or slug with price comparison vendor offers
export function getMockProduct(idOrSlug: string): MockProduct {
  const normalized = (idOrSlug || '').toLowerCase().trim();
  const found = MOCK_PRODUCTS.find(
    (p) => p.slug.toLowerCase() === normalized || p.id.toLowerCase() === normalized
  );

  if (found) return found;

  // Fallback generator for unknown product slugs so that NO product page ever throws 404
  const cleanTitle = idOrSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: `prod-${idOrSlug}`,
    title: cleanTitle || 'Producto Destacado NovaTech',
    slug: idOrSlug,
    description: `${cleanTitle} con garantía de entrega rápida mediante la red de conductores OpenDSP. Consulta ofertas de múltiples tiendas asociadas para obtener el mejor precio garantizado.`,
    basePrice: 199,
    rating: 4.9,
    reviewCount: 82,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600',
    ]),
    color: 'Estándar',
    material: 'Material de alta durabilidad',
    warranty: 'Garantía de satisfacción de 30 días',
    hasInvoice: true,
    specifications: 'Disponible para despacho hoy mismo en Santa Cruz, La Paz y Cochabamba',
    category: { slug: 'tecnologia-y-celulares', name: 'Tecnología & Celulares' },
    offers: [
      {
        id: `off-${idOrSlug}-1`,
        price: 199,
        stock: 12,
        shippingCost: 0,
        estimatedDelivery: 'Llega hoy con OpenDSP Express',
        isRecommended: true,
        store: {
          id: 'store-techplus',
          name: 'TechPlus Bolivia',
          slug: 'techplus-bolivia',
          logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          rating: 4.9,
          reviewCount: 3412,
          salesCount: 8920,
          isOfficial: true,
          address: 'Equipetrol, Santa Cruz',
        },
      },
      {
        id: `off-${idOrSlug}-2`,
        price: 215,
        stock: 6,
        shippingCost: 10,
        estimatedDelivery: 'Llega mañana',
        isRecommended: false,
        store: {
          id: 'store-tecnoshop',
          name: 'TecnoShop Bolivia',
          slug: 'tecnoshop',
          logo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          rating: 4.8,
          reviewCount: 1420,
          salesCount: 4120,
          isOfficial: false,
          address: 'Cochabamba Centro',
        },
      },
    ],
  };
}

// Filtered products generator for search, categories, and flash sales
export function getMockProducts(params: { category?: string; flashSale?: boolean; q?: string } = {}): MockProduct[] {
  let list = [...MOCK_PRODUCTS];

  if (params.category) {
    const cat = params.category.toLowerCase();
    list = list.filter((p) => p.category.slug.toLowerCase().includes(cat) || cat.includes(p.category.slug.toLowerCase()));
  }

  if (params.q) {
    const q = params.q.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q)
    );
  }

  if (params.flashSale) {
    list = list.map((p) => ({
      ...p,
      isFlashSale: true,
      basePrice: Math.round(p.basePrice * 0.85),
    }));
  }

  return list.length > 0 ? list : MOCK_PRODUCTS;
}
