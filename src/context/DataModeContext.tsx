'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type DataMode = 'demo' | 'real';

interface DataModeContextType {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  toggleDataMode: () => void;
  isRealMode: boolean;
  isDemoMode: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

const STORAGE_KEY = 'vitrina_data_mode';

export function DataModeProvider({ children }: { children: React.ReactNode }) {
  const [dataMode, setDataModeState] = useState<DataMode>('demo');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'real' || saved === 'demo') {
        setDataModeState(saved);
      }
    } catch {
      // Ignorar errores de almacenamiento local
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setDataMode = (mode: DataMode) => {
    setDataModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  };

  const toggleDataMode = () => {
    const nextMode = dataMode === 'demo' ? 'real' : 'demo';
    setDataMode(nextMode);
  };

  return (
    <DataModeContext.Provider
      value={{
        dataMode,
        setDataMode,
        toggleDataMode,
        isRealMode: dataMode === 'real',
        isDemoMode: dataMode === 'demo',
      }}
    >
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error('useDataMode debe usarse dentro de un DataModeProvider');
  }
  return context;
}
