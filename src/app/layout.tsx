import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ShopChrome } from '@/components/shop/ShopChrome';
import { LoginSheet } from '@/components/shop/LoginSheet';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vitrina — Compra a tiendas de Santa Cruz',
  description: 'Productos, ofertas y lives de tiendas de Bolivia. Elige, paga al recibir y escoge la hora de entrega.',
  icons: {
    icon: '/pulpo-icon.png',
    apple: '/pulpo-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d7a4c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={archivo.variable}>
      <body className="flex min-h-dvh flex-col">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ShopChrome>{children}</ShopChrome>
              <LoginSheet />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
