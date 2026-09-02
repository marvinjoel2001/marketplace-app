import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CompraYa — Marketplace Multi-tiendas Bolivia & Live Shopping TikTok',
  description: 'Todo lo que necesitas, en Bolivia. Compara precios entre tiendas, compra en transmisiones en vivo de TikTok y recibe tus pedidos con OpenDSP Express.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-[#FAFAFC] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <AuthModal />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
