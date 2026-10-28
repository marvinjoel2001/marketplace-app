'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { marketplaceApi, type Category, type Offer, type Product } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { ImagePicker } from './ImagePicker';

type StoreOffer = Offer & { product: Product };

function storedImages(product?: Product): string[] {
  try {
    const list = JSON.parse(product?.images || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Create a product (photo, name, price, stock) or edit one the store already sells. */
export function ProductForm({
  storeId,
  editing,
  onSaved,
}: {
  storeId: string;
  editing?: StoreOffer | null;
  onSaved: (productId: string) => void;
}) {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>(storedImages(editing?.product));
  const [title, setTitle] = useState(editing?.product.title ?? '');
  const [price, setPrice] = useState(editing ? String(editing.price) : '');
  const [stock, setStock] = useState(editing ? String(editing.stock) : '1');
  const [categoryId, setCategoryId] = useState(editing?.product.category?.id ?? '');
  const [description, setDescription] = useState(editing?.product.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    marketplaceApi.getCategories().then((list) => {
      if (!active) return;
      setCategories(list);
      setCategoryId((current) => current || list[0]?.id || '');
    });
    return () => {
      active = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price.replace(',', '.'));
    const numericStock = Number(stock);
    if (images.length === 0) return setError('Agrega al menos una foto.');
    if (!(numericPrice > 0)) return setError('Escribe un precio mayor a 0.');
    if (!Number.isInteger(numericStock) || numericStock < 0) return setError('La cantidad debe ser un número entero.');
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await marketplaceApi.updateProduct(editing.productId, { title: title.trim(), description, images, categoryId });
        await marketplaceApi.updateOffer(storeId, editing.id, { price: numericPrice, stock: numericStock });
        toast('Producto guardado');
        onSaved(editing.productId);
      } else {
        const product = await marketplaceApi.createProduct({
          title: title.trim(),
          description,
          basePrice: numericPrice,
          stock: numericStock,
          categoryId,
          storeId,
          images,
        });
        toast('Producto publicado');
        onSaved(product.id);
      }
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <ImagePicker value={images} onChange={setImages} />
      <div>
        <label htmlFor="p-title" className="field-label">
          Nombre del producto
        </label>
        <input id="p-title" className="field" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Polera oversize negra talla M" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="p-price" className="field-label">
            Precio (Bs)
          </label>
          <input id="p-price" className="field" required inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="0" />
        </div>
        <div>
          <label htmlFor="p-stock" className="field-label">
            Cantidad disponible
          </label>
          <input id="p-stock" className="field" required inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ''))} />
        </div>
      </div>
      {categories.length > 0 && (
        <div>
          <label htmlFor="p-cat" className="field-label">
            Categoría
          </label>
          <select id="p-cat" className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="p-desc" className="field-label">
          Descripción (opcional)
        </label>
        <textarea id="p-desc" className="field min-h-[88px]" maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tallas, colores, material…" />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={saving}>
        {saving && <Loader2 className="h-5 w-5 animate-spin" />}
        {editing ? 'Guardar cambios' : 'Publicar producto'}
      </button>
    </form>
  );
}
