import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ShopChrome } from '@/components/shop/ShopChrome';
import { LoginSheet } from '@/components/shop/LoginSheet';

export const metadata: Metadata = {
  title: 'Vitrina Market — Marketplace Bolivia & Live Shopping TikTok',
  description: 'Productos, ofertas y tiendas en vivo de Bolivia. Elige tu producto, la hora de entrega y paga al recibir.',
  icons: {
    icon: '/pulpo-icon.png',
    apple: '/pulpo-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5B4DF0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${jakarta.variable} min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-indigo-500 selection:text-white relative`}>

        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <div className="relative z-10 flex flex-col min-h-screen">
                <ShopChrome>{children}</ShopChrome>
              </div>
              <LoginSheet />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
