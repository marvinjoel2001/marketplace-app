import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { DataModeProvider } from '@/context/DataModeContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { AuthModal } from '@/components/auth/AuthModal';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Vitrina Market — Marketplace Bolivia & Live Shopping TikTok',
  description: 'Todo lo que necesitas, en Bolivia. Vitrina Market: compara precios entre tiendas, compra en transmisiones en vivo de TikTok y recibe tus pedidos con OpenDSP Express.',
  icons: {
    icon: '/pulpo-icon.png',
    apple: '/pulpo-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col text-slate-900 antialiased selection:bg-indigo-500 selection:text-white bg-[url('/background.jpg')] bg-cover bg-center bg-fixed bg-no-repeat relative">
        {/* Subtle overlay for consistent light tone and optimal text contrast */}
        <div className="fixed inset-0 bg-white/20 pointer-events-none z-0"></div>

        <LanguageProvider>
          <DataModeProvider>
            <AuthProvider>
              <CartProvider>
                <div className="relative z-10 flex flex-col min-h-screen">
                  <Navbar />
                  <CartDrawer />
                  <AuthModal />
                  <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                  </main>
                  <Footer />
                </div>
              </CartProvider>
            </AuthProvider>
          </DataModeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
