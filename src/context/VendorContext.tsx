'use client';

import { createContext, useContext } from 'react';
import type { Store } from '@/lib/api';

export interface VendorContextType {
  store: Store;
  setStore: (store: Store) => void;
  /** Sales that arrived while the panel was open and haven't been seen in Ventas yet. */
  unseenSales: number;
  markSalesSeen: () => void;
}

export const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) throw new Error('useVendor must be used inside the store panel');
  return context;
}
