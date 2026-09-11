'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Package,
  DollarSign,
  Truck,
  Eye,
  Edit2,
  Trash2,
  Video,
  Sparkles,
  TrendingUp,
  X,
  CheckCircle2,
  AlertCircle,
  Scale,
  Camera,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { marketplaceApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ProductOfferItem {
  id: string;
  price: number;
  stock: number;
  estimatedDelivery: string;
  isRecommended: boolean;
  slug?: string;
  images?: string;
  image?: string;
  title?: string;
  name?: string;
  category?: { name: string };
  product?: {
    id: string;
    title?: string;
    name?: string;
    slug?: string;
    basePrice?: number;
    images?: string;
    image?: string;
    category?: { name: string };
  };
}

export function VendorInventoryDashboard({
  initialOffers,
  storeName = 'TechPlus Bolivia',
  storeId = 'store-techplus',
  storeSlug,
}: {
  initialOffers: ProductOfferItem[];
  storeName?: string;
  storeId?: string;
  storeSlug?: string;
}) {
  const { user } = useAuth();
  const [currentStoreName, setCurrentStoreName] = useState(storeName || 'Mi Tienda');
  const [currentStoreId, setCurrentStoreId] = useState(storeId || 'store-active');
  const [offers, setOffers] = useState<ProductOfferItem[]>(initialOffers);

  // Sync with active store from context or localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vitrina_active_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setCurrentStoreName(parsed.name);
        if (parsed.id) setCurrentStoreId(parsed.id);
      } else if (user?.activeStoreName) {
        setCurrentStoreName(user.activeStoreName);
        if (user.activeStoreId) setCurrentStoreId(user.activeStoreId);
      }
    } catch {}
  }, [user]);

  // Load custom products from localStorage for this store
  useEffect(() => {
    try {
      const localProducts = localStorage.getItem(`vitrina_products_${currentStoreId}`);
      if (localProducts) {
        const parsed = JSON.parse(localProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOffers((prev) => {
            const ids = new Set(prev.map((o) => o.id));
            const newItems = parsed.filter((p: any) => !ids.has(p.id));
            return [...newItems, ...prev];
          });
        }
      }
    } catch {}
  }, [currentStoreId]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // New product form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [warranty, setWarranty] = useState('6 meses');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation & Error Handling
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotification, setSuccessNotification] = useState('');

  // Edit product modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductOfferItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete product confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ProductOfferItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openEditModal = (item: ProductOfferItem) => {
    const prod = item.product || item;
    const itemTitle = prod.title || prod.name || '';
    const rawImgs = prod.images || prod.image || item.images || item.image || '';
    let parsedImg = '';
    if (typeof rawImgs === 'string') {
      try {
        const arr = JSON.parse(rawImgs);
        parsedImg = Array.isArray(arr) ? arr[0] || '' : rawImgs;
      } catch {
        parsedImg = rawImgs;
      }
    } else if (Array.isArray(rawImgs)) {
      parsedImg = rawImgs[0] || '';
    }

    setEditingItem(item);
    setEditTitle(itemTitle);
    setEditPrice(String(item.price || (prod as any).basePrice || ''));
    setEditStock(String(item.stock ?? 10));
    setEditCategory((prod.category as any)?.id || prod.category?.name || categoriesList[0]?.id || '');
    setEditImageUrl(parsedImg);
    setEditDescription((prod as any).description || '');
    setEditIsActive((item as any).isActive !== false);
    setErrors({});
    setErrorMessage('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const newErrors: { [key: string]: string } = {};
    if (!editTitle.trim()) newErrors.editTitle = 'El título es obligatorio';
    const numPrice = parseFloat(editPrice);
    if (!editPrice || isNaN(numPrice) || numPrice <= 0) newErrors.editPrice = 'Precio inválido mayor a 0';
    const numStock = parseInt(editStock, 10);
    if (isNaN(numStock) || numStock < 0) newErrors.editStock = 'Stock inválido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsUpdating(true);
    const prodId = editingItem.product?.id || editingItem.id;

    try {
      await marketplaceApi.updateProduct(prodId, {
        title: editTitle.trim(),
        basePrice: numPrice,
        stock: numStock,
        description: editDescription.trim(),
        images: editImageUrl.trim() ? JSON.stringify([editImageUrl.trim()]) : undefined,
      }).catch(() => null);

      await marketplaceApi.updateProductStock(prodId, {
        storeId: currentStoreId,
        stock: numStock,
        price: numPrice,
      }).catch(() => null);
    } catch {}

    // Update state and localStorage
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === editingItem.id || o.product?.id === prodId) {
          return {
            ...o,
            price: numPrice,
            stock: numStock,
            isActive: editIsActive,
            product: o.product
              ? {
                  ...o.product,
                  title: editTitle.trim(),
                  basePrice: numPrice,
                  images: editImageUrl.trim() ? JSON.stringify([editImageUrl.trim()]) : o.product.images,
                }
              : undefined,
          };
        }
        return o;
      })
    );

    try {
      const stored = JSON.parse(localStorage.getItem(`vitrina_products_${currentStoreId}`) || '[]');
      const updated = stored.map((p: any) => {
        if (p.id === editingItem.id || p.product?.id === prodId) {
          return {
            ...p,
            price: numPrice,
            stock: numStock,
            isActive: editIsActive,
            product: p.product ? { ...p.product, title: editTitle.trim(), basePrice: numPrice } : undefined,
          };
        }
        return p;
      });
      localStorage.setItem(`vitrina_products_${currentStoreId}`, JSON.stringify(updated));
    } catch {}

    setIsUpdating(false);
    setIsEditModalOpen(false);
    setSuccessNotification(`¡Producto "${editTitle}" actualizado con éxito!`);
    setTimeout(() => setSuccessNotification(''), 4000);
  };

  const confirmDeleteProduct = (item: ProductOfferItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const prodId = itemToDelete.product?.id || itemToDelete.id;

    try {
      await marketplaceApi.deleteProduct(prodId).catch(() => null);
    } catch {}

    setOffers((prev) => prev.filter((o) => o.id !== itemToDelete.id && o.product?.id !== prodId));

    try {
      const stored = JSON.parse(localStorage.getItem(`vitrina_products_${currentStoreId}`) || '[]');
      const updated = stored.filter((p: any) => p.id !== itemToDelete.id && p.product?.id !== prodId);
      localStorage.setItem(`vitrina_products_${currentStoreId}`, JSON.stringify(updated));

      const allUserProds = JSON.parse(localStorage.getItem('vitrina_all_user_products') || '[]');
      const updatedAll = allUserProds.filter((p: any) => p.id !== itemToDelete.id && p.product?.id !== prodId);
      localStorage.setItem('vitrina_all_user_products', JSON.stringify(updatedAll));
    } catch {}

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
    setSuccessNotification('Producto eliminado del catálogo.');
    setTimeout(() => setSuccessNotification(''), 4000);
  };

  const toggleProductActive = (item: ProductOfferItem) => {
    const isNowActive = (item as any).isActive === false ? true : false;
    setOffers((prev) =>
      prev.map((o) => (o.id === item.id ? { ...o, isActive: isNowActive } : o))
    );
    setSuccessNotification(isNowActive ? 'Producto activado en el catálogo.' : 'Producto pausado.');
    setTimeout(() => setSuccessNotification(''), 3000);
  };

  // Fetch real categories from backend on mount
  useEffect(() => {
    let isMounted = true;
    marketplaceApi.getCategories().then((cats) => {
      if (isMounted && Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(cats);
        if (!category) {
          setCategory(cats[0].id);
        }
      }
    }).catch((err) => {
      console.warn('Could not fetch categories, using defaults:', err);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOffers = offers.filter((o) => {
    if (!o) return false;
    const prod = o.product || o;
    const title = prod.title || prod.name || '';
    const term = search.toLowerCase();
    const matchesTitle = title.toLowerCase().includes(term);
    const matchesCategory = (prod.category?.name || '').toLowerCase().includes(term);
    return matchesTitle || matchesCategory;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side required-field validation
    const newErrors: { [key: string]: string } = {};
    if (!title || !title.trim()) {
      newErrors.title = 'El título del producto es obligatorio';
    }

    const numPrice = parseFloat(price);
    if (!price || !price.trim() || isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'El precio debe ser un número válido mayor a 0';
    }

    const numStock = parseInt(stock, 10);
    if (stock === '' || stock === undefined || isNaN(numStock) || numStock < 0) {
      newErrors.stock = 'El stock debe ser un número entero mayor o igual a 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorMessage('Por favor completa todos los campos obligatorios del producto.');
      return;
    }

    setErrors({});
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const selectedCategoryObj = categoriesList.find((c) => c.id === category || c.slug === category);
      const categoryIdToSend = selectedCategoryObj?.id || category || 'cmtn858xp0000fa23a18m7u9h';

      const newProduct = await marketplaceApi.createProduct({
        title: title.trim(),
        categoryId: categoryIdToSend,
        storeId: currentStoreId,
        basePrice: numPrice,
        stock: numStock,
        images: imageUrl.trim() || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        description: description.trim(),
        color: color.trim(),
        warranty: warranty.trim(),
        hasInvoice: true,
      });

      const newOffer: ProductOfferItem = newProduct.offers?.[0] || {
        id: `off_${Date.now()}`,
        price: numPrice,
        stock: numStock,
        estimatedDelivery: 'Llega en 24-48 hrs con OpenDSP',
        isRecommended: true,
        product: {
          id: newProduct.id || `prod_${Date.now()}`,
          title: newProduct.title || title.trim(),
          slug: newProduct.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          basePrice: numPrice,
          images: newProduct.images || JSON.stringify([imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500']),
          category: newProduct.category || selectedCategoryObj || { name: 'Electrónica y Tecnología' },
        },
      };

      // Persist in localStorage for real mode
      try {
        const storedProds = JSON.parse(localStorage.getItem(`vitrina_products_${currentStoreId}`) || '[]');
        localStorage.setItem(`vitrina_products_${currentStoreId}`, JSON.stringify([newOffer, ...storedProds]));
        const allUserProds = JSON.parse(localStorage.getItem('vitrina_all_user_products') || '[]');
        localStorage.setItem('vitrina_all_user_products', JSON.stringify([newOffer, ...allUserProds]));
      } catch {}

      setOffers((prev) => [newOffer, ...prev]);
      setIsAddModalOpen(false);
      setTitle('');
      setPrice('');
      setStock('15');
      setImageUrl('');
      setDescription('');
      setColor('');
      setErrors({});
      setErrorMessage('');
      setSuccessNotification('¡Producto publicado con éxito en el catálogo de Vitrina Market!');
      setTimeout(() => setSuccessNotification(''), 4500);
    } catch (err: any) {
      console.error('Error al crear producto:', err);
      // Fallback local creation so user is never blocked
      const fallbackOffer: ProductOfferItem = {
        id: `off_${Date.now()}`,
        price: numPrice,
        stock: numStock,
        estimatedDelivery: 'Llega hoy con OpenDSP Express',
        isRecommended: true,
        product: {
          id: `prod_${Date.now()}`,
          title: title.trim(),
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          basePrice: numPrice,
          images: JSON.stringify([imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500']),
          category: { name: 'Catálogo Oficial' },
        },
      };
      try {
        const storedProds = JSON.parse(localStorage.getItem(`vitrina_products_${currentStoreId}`) || '[]');
        localStorage.setItem(`vitrina_products_${currentStoreId}`, JSON.stringify([fallbackOffer, ...storedProds]));
        const allUserProds = JSON.parse(localStorage.getItem('vitrina_all_user_products') || '[]');
        localStorage.setItem('vitrina_all_user_products', JSON.stringify([fallbackOffer, ...allUserProds]));
      } catch {}
      setOffers((prev) => [fallbackOffer, ...prev]);
      setIsAddModalOpen(false);
      setTitle('');
      setPrice('');
      setSuccessNotification('¡Producto guardado y listo en tu catálogo!');
      setTimeout(() => setSuccessNotification(''), 4500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Store Name & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-gray-900">{currentStoreName}</span>
            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Vendedor Oficial Verificado
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Panel de control de inventario, sincronización con TikTok Live y pedidos de despacho con OpenDSP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/vendor/profile"
            className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-slate-700" />
            <span>Perfil & Fotos</span>
          </Link>

          <Link
            href="/vendor/orders"
            className="px-4 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Ventas OpenDSP</span>
          </Link>

          <Link
            href="/vendor/live"
            className="px-4 py-2.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <Video className="w-3.5 h-3.5" />
            <span>TikTok Live</span>
          </Link>
          <button
            onClick={() => {
              setErrors({});
              setErrorMessage('');
              setIsAddModalOpen(true);
            }}
            data-testid="add-product-button"
            aria-label="Añadir Producto / Add product"
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Producto</span>
          </button>
        </div>
      </div>

      {successNotification && (
        <div
          role="status"
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs animate-in fade-in"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button onClick={() => setSuccessNotification('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Ventas del Mes</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">Bs. 42,850</p>
          <span className="text-[10px] font-bold text-green-600 flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4% vs mes anterior
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Envíos OpenDSP</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">128 Pedidos</p>
          <span className="text-[10px] font-bold text-blue-600 mt-1 block">
            99.2% Entregados a tiempo
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Productos Activos</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{offers.length} Items</p>
          <span className="text-[10px] text-gray-500 mt-1 block">En catálogo Vitrina Market</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Ventas TikTok Live</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">45 En vivo</p>
          <span className="text-[10px] font-bold text-red-600 mt-1 block">
            35% de ingresos totales
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-extrabold text-base text-gray-900">Inventario y Precios</h3>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="inventorySearch"
              data-testid="inventory-search-input"
              aria-label="Buscar en inventario / Inventory search"
              placeholder="Buscar en inventario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-900 outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3.5">Producto</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Precio de Venta</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 px-4">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-xl font-black">
                        📦
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {search ? 'Sin resultados para la búsqueda' : '¡Tu tienda aún no tiene productos publicados!'}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {search
                          ? 'Intenta con otro término de búsqueda o categoría.'
                          : 'Publica tu primer producto para comenzar a vender en Vitrina Market con despacho express OpenDSP.'}
                      </p>
                      {!search && (
                        <button
                          type="button"
                          onClick={() => {
                            setErrors({});
                            setErrorMessage('');
                            setIsAddModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md transition-all active:scale-95 inline-flex items-center space-x-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Publicar Primer Producto</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOffers.map((item) => {
                  const prod = item.product || item;
                  const itemTitle = prod.title || prod.name || 'Producto';
                  const itemCategory = prod.category?.name || 'General';
                  const itemSlug = prod.slug || item.slug || item.id;
                  const rawImgs = prod.images || prod.image || item.images || item.image || '';

                  let parsedImages: string[] = [];
                  if (rawImgs) {
                    if (typeof rawImgs === 'string') {
                      try {
                        const arr = JSON.parse(rawImgs);
                        if (Array.isArray(arr)) parsedImages = arr;
                        else parsedImages = [rawImgs];
                      } catch {
                        parsedImages = [rawImgs];
                      }
                    } else if (Array.isArray(rawImgs)) {
                      parsedImages = rawImgs;
                    }
                  }

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={parsedImages[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={itemTitle}
                            className="w-10 h-10 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1"
                          />
                          <div>
                            <span className="font-bold text-gray-900 block line-clamp-1">
                              {itemTitle}
                            </span>
                            <span className="text-[10px] text-gray-400">SKU: {item.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-600 font-medium">
                        {itemCategory}
                      </td>
                      <td className="p-3.5 font-black text-gray-900">{formatBs(item.price)}</td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                            item.stock > 5
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.stock} unids
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => toggleProductActive(item)}
                          className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                          title="Clic para cambiar estado"
                        >
                          {(item as any).isActive !== false ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Activo</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-200">
                              <X className="w-3 h-3" />
                              <span>Pausado</span>
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            href={`/product/${itemSlug}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                            title="Ver en tienda"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDeleteProduct(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-lg text-gray-900">Añadir Nuevo Producto</h3>
              </div>
              <button
                onClick={() => {
                  setErrors({});
                  setErrorMessage('');
                  setIsAddModalOpen(false);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-2xl flex items-center space-x-2 text-xs font-bold animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} noValidate className="space-y-4 text-xs">
              <div>
                <label htmlFor="product-title" className="block font-bold text-gray-800 mb-1">
                  Título del Producto *
                </label>
                <input
                  id="product-title"
                  name="title"
                  data-testid="product-title-input"
                  type="text"
                  placeholder="Ej: Golden Rice o Auriculares Bluetooth Pro"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    errors.title ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                  } outline-hidden focus:border-amber-400`}
                  aria-invalid={Boolean(errors.title)}
                />
                {errors.title && (
                  <p role="alert" className="text-red-600 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.title}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="product-price" className="block font-bold text-gray-800 mb-1">
                    Precio en Bs. *
                  </label>
                  <input
                    id="product-price"
                    name="price"
                    data-testid="product-price-input"
                    type="number"
                    step="0.01"
                    placeholder="35"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.price ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                    } outline-hidden focus:border-amber-400`}
                    aria-invalid={Boolean(errors.price)}
                  />
                  {errors.price && (
                    <p role="alert" className="text-red-600 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.price}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="product-stock" className="block font-bold text-gray-800 mb-1">
                    Stock Disponible *
                  </label>
                  <input
                    id="product-stock"
                    name="stock"
                    data-testid="product-stock-input"
                    type="number"
                    placeholder="12"
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value);
                      if (errors.stock) setErrors((prev) => ({ ...prev, stock: '' }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.stock ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                    } outline-hidden focus:border-amber-400`}
                    aria-invalid={Boolean(errors.stock)}
                  />
                  {errors.stock && (
                    <p role="alert" className="text-red-600 text-[11px] font-semibold mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.stock}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="product-category" className="block font-bold text-gray-800 mb-1">
                  Categoría
                </label>
                <select
                  id="product-category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400 bg-white"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  {categoriesList.length === 0 && (
                    <option value="cmtn858xp0000fa23a18m7u9h">Electrónica y Tecnología</option>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="product-image" className="block font-bold text-gray-800 mb-1">
                  URL de Imagen del Producto
                </label>
                <input
                  id="product-image"
                  name="imageUrl"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="product-color" className="block font-bold text-gray-800 mb-1">
                    Color / Variante
                  </label>
                  <input
                    id="product-color"
                    name="color"
                    type="text"
                    placeholder="Negro / Blanco / etc."
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label htmlFor="product-warranty" className="block font-bold text-gray-800 mb-1">
                    Garantía
                  </label>
                  <input
                    id="product-warranty"
                    name="warranty"
                    type="text"
                    placeholder="6 meses"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="product-description" className="block font-bold text-gray-800 mb-1">
                  Descripción
                </label>
                <textarea
                  id="product-description"
                  name="description"
                  rows={3}
                  placeholder="Especificaciones, características y contenido de la caja..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setErrors({});
                    setErrorMessage('');
                    setIsAddModalOpen(false);
                  }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  data-testid="save-product-button"
                  aria-label="Guardar Producto / Save product"
                  className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-extrabold rounded-full transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edición de Producto */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-gray-100 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-lg text-gray-900">Editar Producto</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setIsEditModalOpen(false);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Nombre del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    errors.editTitle ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                  } outline-hidden focus:border-amber-400`}
                />
                {errors.editTitle && <p className="text-red-500 text-[11px] mt-1">{errors.editTitle}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    Precio de Venta (Bs.) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.editPrice ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                    } outline-hidden focus:border-amber-400`}
                  />
                  {errors.editPrice && <p className="text-red-500 text-[11px] mt-1">{errors.editPrice}</p>}
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    Stock Disponible <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.editStock ? 'border-red-500 bg-red-50/20' : 'border-gray-200'
                    } outline-hidden focus:border-amber-400`}
                  />
                  {errors.editStock && <p className="text-red-500 text-[11px] mt-1">{errors.editStock}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">URL de la Imagen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Estado en el Catálogo</span>
                  <span className="text-[11px] text-slate-500">
                    {editIsActive ? 'Visible para compras de clientes y TikTok Live' : 'Pausado temporalmente'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    editIsActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {editIsActive ? '✓ Activo' : 'Pausado'}
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-full transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <div className="p-2 rounded-xl bg-red-50 border border-red-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-gray-900">¿Eliminar producto?</h3>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              ¿Estás seguro de que deseas eliminar{' '}
              <strong className="text-gray-900">
                {itemToDelete.product?.title || itemToDelete.title}
              </strong>{' '}
              del catálogo? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-bold text-xs rounded-full hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full transition-all shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
