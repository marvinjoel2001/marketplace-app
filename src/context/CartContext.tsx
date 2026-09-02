'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productOfferId?: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  storeId: string;
  storeName: string;
  storeSlug?: string;
  storeAddress?: string;
  storeLat?: number;
  storeLng?: number;
  unitPrice: number;
  quantity: number;
  productImage: string;
  shippingCost: number;
  estimatedDelivery?: string;
  hasInvoice?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productOfferIdOrId: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  savedCity: string;
  setSavedCity: (city: string) => void;
  cartAnimationTrigger: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [savedCity, setSavedCity] = useState('Santa Cruz de la Sierra');
  const [cartAnimationTrigger, setCartAnimationTrigger] = useState(0);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('compraya_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('compraya_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (it) =>
          (newItem.productOfferId && it.productOfferId === newItem.productOfferId) ||
          (it.productId === newItem.productId && it.storeId === newItem.storeId)
      );

      if (index > -1) {
        const updated = [...prev];
        updated[index].quantity += newItem.quantity;
        return updated;
      } else {
        return [...prev, newItem];
      }
    });
    setIsCartDrawerOpen(true);
    setCartAnimationTrigger(Date.now());
  };

  const removeFromCart = (id: string) => {
    setCart((prev) =>
      prev.filter((it) => it.productOfferId !== id && it.productId !== id)
    );
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((it) => {
        if (it.productOfferId === id || it.productId === id) {
          return { ...it, quantity: qty };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = cart.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  const shippingFee = cart.some((it) => it.shippingCost > 0)
    ? Math.max(...cart.map((it) => it.shippingCost))
    : 0;
  const totalAmount = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingFee,
        totalAmount,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        savedCity,
        setSavedCity,
        cartAnimationTrigger,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
