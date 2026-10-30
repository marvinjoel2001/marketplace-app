'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  productOfferId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  storeId: string;
  storeName: string;
  unitPrice: number;
  quantity: number;
  productImage: string;
  stock?: number;
  /** Chosen option (size, voltage, ...) when the product has options. */
  variant?: string;
}

/** One cart line per product and option. */
export function cartKey(item: Pick<CartItem, 'productOfferId' | 'variant'>) {
  return item.variant ? `${item.productOfferId}::${item.variant}` : item.productOfferId;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productOfferId: string) => void;
  updateQuantity: (productOfferId: string, qty: number) => void;
  clearStore: (storeId: string) => void;
  totalItems: number;
  subtotal: number;
  /** Bumps on every add so the cart icon can react. */
  lastAddedAt: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = 'vitrina_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [lastAddedAt, setLastAddedAt] = useState(0);

  // The saved cart is read after hydration so the server and first client render agree.
  useEffect(() => {
    let saved: CartItem[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      // Items saved by older versions may lack an offer id; they can't be ordered.
      if (Array.isArray(parsed)) saved = parsed.filter((it) => it && it.productOfferId && it.storeId);
    } catch {}
    Promise.resolve().then(() => {
      setCart(saved);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, loaded]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const key = cartKey(item);
      const existing = prev.find((it) => cartKey(it) === key);
      const cap = (qty: number) => Math.min(qty, item.stock ?? 99);
      if (existing) {
        return prev.map((it) =>
          cartKey(it) === key
            ? { ...it, unitPrice: item.unitPrice, quantity: cap(it.quantity + item.quantity) }
            : it,
        );
      }
      return [...prev, { ...item, quantity: cap(item.quantity) }];
    });
    setLastAddedAt(Date.now());
  };

  const removeFromCart = (key: string) => setCart((prev) => prev.filter((it) => cartKey(it) !== key));

  const updateQuantity = (key: string, qty: number) => {
    if (qty <= 0) return removeFromCart(key);
    setCart((prev) =>
      prev.map((it) => (cartKey(it) === key ? { ...it, quantity: Math.min(qty, it.stock ?? 99) } : it)),
    );
  };

  const clearStore = (storeId: string) => setCart((prev) => prev.filter((it) => it.storeId !== storeId));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearStore,
        totalItems: cart.reduce((sum, it) => sum + it.quantity, 0),
        subtotal: cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0),
        lastAddedAt,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

/** Cart items grouped by store, in the order they were added. */
export function groupByStore(cart: CartItem[]) {
  const groups = new Map<string, { storeId: string; storeName: string; items: CartItem[] }>();
  for (const item of cart) {
    const group = groups.get(item.storeId) ?? { storeId: item.storeId, storeName: item.storeName, items: [] };
    group.items.push(item);
    groups.set(item.storeId, group);
  }
  return [...groups.values()];
}
