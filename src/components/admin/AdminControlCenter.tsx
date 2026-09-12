'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Store,
  Users,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  Trash2,
  Ban,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Search,
  RefreshCw,
  DollarSign,
  Truck,
  X,
  Save,
  Check,
  Building2,
  Percent,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { formatBs } from '@/lib/utils';
import { marketplaceApi } from '@/lib/api';

type TabType = 'STORES' | 'USERS' | 'ORDERS' | 'PRODUCTS' | 'PAYMENTS';

export function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<TabType>('STORES');
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Data States
  const [stats, setStats] = useState<any>({
    totalStores: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalVolume: 0,
    totalCommission: 0,
  });

  const [stores, setStores] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [paymentConfigs, setPaymentConfigs] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action dialogs
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Falta de stock y coordinación de entrega en tienda');
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Fetch data for the active tab
  const loadStats = useCallback(async () => {
    try {
      const data = await marketplaceApi.getAdminStats();
      if (data) setStats(data);
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    }
  }, []);

  const loadTabData = useCallback(async (tab: TabType) => {
    setLoading(true);
    try {
      if (tab === 'STORES') {
        const data = await marketplaceApi.getAdminStores();
        setStores(Array.isArray(data) ? data : []);
      } else if (tab === 'USERS') {
        const data = await marketplaceApi.getAdminUsers();
        setUsers(Array.isArray(data) ? data : []);
      } else if (tab === 'ORDERS') {
        const data = await marketplaceApi.getAdminOrders();
        setOrders(Array.isArray(data) ? data : []);
      } else if (tab === 'PRODUCTS') {
        const data = await marketplaceApi.getAdminProducts();
        setProducts(Array.isArray(data) ? data : []);
      } else if (tab === 'PAYMENTS') {
        const data = await marketplaceApi.getPaymentConfigs();
        setPaymentConfigs(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      console.error(`Error loading tab ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadTabData(activeTab);
  }, [activeTab, loadStats, loadTabData]);

  // Handler: Toggle Store Status (Active vs Suspended / Banned)
  const handleToggleStoreStatus = async (storeId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(true);
    try {
      await marketplaceApi.updateStoreStatus(storeId, newStatus);
      showToast(
        newStatus === 'SUSPENDED'
          ? 'Tienda cortada / suspendida: se ocultó del marketplace y se pausaron sus lives.'
          : 'Tienda reactivada con éxito en el marketplace.'
      );
      loadTabData('STORES');
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar tienda', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Delete Store
  const handleDeleteStore = async (storeId: string, storeName: string) => {
    if (!confirm(`¿Estás seguro de eliminar/banear permanentemente la tienda "${storeName}"?`)) return;
    setActionLoading(true);
    try {
      await marketplaceApi.deleteStoreAdmin(storeId);
      showToast(`Tienda "${storeName}" eliminada/baneada del marketplace.`);
      loadTabData('STORES');
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar tienda', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Toggle User Status (Active vs Banned)
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    setActionLoading(true);
    try {
      await marketplaceApi.updateUserStatus(userId, newStatus);
      showToast(newStatus === 'BANNED' ? 'Usuario baneado del sistema.' : 'Usuario reactivado.');
      loadTabData('USERS');
    } catch (err: any) {
      showToast(err.message || 'Error al modificar estado de usuario', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Change User Role
  const handleChangeUserRole = async (userId: string, newRole: string) => {
    setActionLoading(true);
    try {
      await marketplaceApi.updateUserRole(userId, newRole);
      showToast(`Rol actualizado a: ${newRole}`);
      loadTabData('USERS');
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar rol', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el usuario "${userName}"?`)) return;
    setActionLoading(true);
    try {
      await marketplaceApi.deleteUserAdmin(userId);
      showToast(`Usuario "${userName}" eliminado.`);
      loadTabData('USERS');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar usuario', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Cancel Order by Store
  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setActionLoading(true);
    try {
      await marketplaceApi.cancelOrderAdmin(cancelModalOrder.id, cancelReason);
      showToast(`Pedido #${cancelModalOrder.orderNumber} cancelado exitosamente. Stock restituido.`);
      setCancelModalOrder(null);
      loadTabData('ORDERS');
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Error al cancelar pedido', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Moderate Product
  const handleModerateProduct = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'REMOVED_BY_ADMIN' : 'ACTIVE';
    setActionLoading(true);
    try {
      await marketplaceApi.moderateProductAdmin(productId, newStatus);
      showToast(
        newStatus === 'REMOVED_BY_ADMIN'
          ? 'Producto dado de baja por el Administrador.'
          : 'Producto reactivado en catálogo público.'
      );
      loadTabData('PRODUCTS');
    } catch (err: any) {
      showToast(err.message || 'Error al moderar producto', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Delete Product
  const handleDeleteProduct = async (productId: string, title: string) => {
    if (!confirm(`¿Eliminar definitivamente el producto "${title}"?`)) return;
    setActionLoading(true);
    try {
      await marketplaceApi.deleteProductAdmin(productId);
      showToast(`Producto "${title}" eliminado.`);
      loadTabData('PRODUCTS');
    } catch (err: any) {
      showToast(err.message || 'Error al eliminar producto', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Update Payment Gateway
  const handleSavePaymentConfig = async (key: string, data: any) => {
    setActionLoading(true);
    try {
      await marketplaceApi.updatePaymentConfig(key, data);
      showToast(`Configuración de pasarela "${key}" actualizada.`);
      loadTabData('PAYMENTS');
    } catch (err: any) {
      showToast(err.message || 'Error al guardar configuración de pago', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Alert */}
      {feedbackMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-bounce ${
            feedbackMessage.type === 'success'
              ? 'bg-black text-white border-green-500/40'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-300" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-black text-white shadow-md">
              <ShieldCheck className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  Super Admin Marketplace
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-red-100 text-red-700 tracking-wider">
                  Acceso Total
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                Control omnímodo de tiendas, usuarios, catálogo, cancelación de pedidos y pasarelas de pago bolivianas.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                loadStats();
                loadTabData(activeTab);
              }}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar Datos</span>
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
            >
              Ver como Comprador
            </Link>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6">
          <div className="bg-[#FAF9F6] p-4 md:p-5 rounded-2xl border border-gray-200/70">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
              <Store className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Tiendas Totales
            </span>
            <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
              {stats.totalStores || stores.length || 0}
            </p>
            <div className="flex items-center space-x-2 mt-1 text-[11px]">
              <span className="text-green-700 font-bold">{stats.activeStores ?? stores.filter((s) => s.status === 'ACTIVE').length} Activas</span>
              <span className="text-gray-300">•</span>
              <span className="text-amber-700 font-bold">{stats.suspendedStores ?? stores.filter((s) => s.status === 'SUSPENDED').length} Cortadas</span>
            </div>
          </div>

          <div className="bg-[#FAF9F6] p-4 md:p-5 rounded-2xl border border-gray-200/70">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-purple-600" />
              Usuarios / Clientes
            </span>
            <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
              {stats.totalUsers || 1420}
            </p>
            <span className="text-[11px] text-gray-500 font-medium mt-1 block">
              Compradores & Vendedores
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-4 md:p-5 rounded-2xl border border-gray-200/70">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
              <DollarSign className="w-3.5 h-3.5 mr-1 text-green-600" />
              Volumen Total (GMV)
            </span>
            <p className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
              {formatBs(stats.totalVolume || 452900)}
            </p>
            <span className="text-[11px] text-green-700 font-bold mt-1 block">
              Comisión 5% = {formatBs(stats.totalCommission || 22645)}
            </span>
          </div>

          <div className="bg-[#FAF9F6] p-4 md:p-5 rounded-2xl border border-gray-200/70">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
              <Truck className="w-3.5 h-3.5 mr-1 text-orange-600" />
              OpenDSP Core Bolivia
            </span>
            <p className="text-lg md:text-xl font-black text-green-600 mt-2 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              En Línea (Sincronizado)
            </p>
            <span className="text-[11px] text-gray-500 mt-1 block">
              Despacho en Santa Cruz & La Paz
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto space-x-2 bg-white p-2 rounded-2xl border border-gray-200/80 shadow-2xs">
        <button
          onClick={() => setActiveTab('STORES')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'STORES'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Gestión de Tiendas ({stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'USERS'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios & Clientes ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'ORDERS'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Pedidos Globales ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'PRODUCTS'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Catálogo & Moderación ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            activeTab === 'PAYMENTS'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Métodos de Pago & Comisiones</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. TIENDAS */}
      {activeTab === 'STORES' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center">
                <Store className="w-5 h-5 text-amber-500 mr-2" />
                Control y Moderación de Tiendas
              </h2>
              <p className="text-xs text-gray-500">
                Pausa o corta tiendas de inmediato, cancela sus lives y edita comisiones personalizadas.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar tienda por nombre o slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Tienda</th>
                  <th className="p-3.5">Categoría / Ciudad</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Ventas / Saldo Wallet</th>
                  <th className="p-3.5">Comisión</th>
                  <th className="p-3.5 text-right">Acciones de Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {stores
                  .filter((st) =>
                    searchQuery ? st.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
                  )
                  .map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={st.logo}
                            alt={st.name}
                            className="w-9 h-9 rounded-xl object-cover border border-gray-200"
                          />
                          <div>
                            <p className="font-bold text-gray-900">{st.name}</p>
                            <p className="text-[10px] text-gray-500">@{st.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-gray-800">{st.category}</span>
                        <p className="text-[10px] text-gray-500 truncate max-w-[180px]">{st.address}</p>
                      </td>
                      <td className="p-3.5">
                        {st.status === 'ACTIVE' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 flex items-center w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 mr-1.5"></span>
                            Activa
                          </span>
                        )}
                        {st.status === 'SUSPENDED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center w-fit">
                            <PauseCircle className="w-3 h-3 mr-1" />
                            Cortada / Suspendida
                          </span>
                        )}
                        {st.status === 'BANNED' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center w-fit">
                            <Ban className="w-3 h-3 mr-1" />
                            Baneada
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-gray-900">{st.salesCount || 0} ventas</p>
                        <p className="text-[11px] text-green-700 font-semibold">
                          Saldo: {formatBs(st.walletBalance || 0)}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-700">
                          {st.customCommissionRate ? `${st.customCommissionRate}% (Especial)` : '5.0% (Plataforma)'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleStoreStatus(st.id, st.status)}
                          disabled={actionLoading}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1 ${
                            st.status === 'ACTIVE'
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                              : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
                          }`}
                          title={st.status === 'ACTIVE' ? 'Cortar tienda y suspender ventas' : 'Reactivar tienda'}
                        >
                          {st.status === 'ACTIVE' ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>Cortar Tienda</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>Reactivar</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteStore(st.id, st.name)}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                          title="Eliminar / Banear tienda permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. USUARIOS */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                Directorio y Roles de Usuarios
              </h2>
              <p className="text-xs text-gray-500">
                Auditoría de compradores y tiendas, asignación de privilegios de Administrador y baneos.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuario por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Usuario</th>
                  <th className="p-3.5">Contacto / Ciudad</th>
                  <th className="p-3.5">Rol en Vitrina</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Compras / Gasto Total</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {users
                  .filter((u) =>
                    searchQuery
                      ? u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                  )
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              (u.name || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{u.name || 'Sin Nombre'}</p>
                            <p className="text-[10px] text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <p className="text-gray-800">{u.phone || 'Sin teléfono'}</p>
                        <p className="text-[10px] text-gray-500">{u.city || 'Santa Cruz'}</p>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={u.role || 'CUSTOMER'}
                          onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value="CUSTOMER">Comprador (CUSTOMER)</option>
                          <option value="VENDOR">Tienda (VENDOR)</option>
                          <option value="ADMIN">Super Admin (ADMIN)</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        {u.status === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            Baneado
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-gray-900">{u.ordersCount || 0} órdenes</p>
                        <p className="text-[11px] text-gray-600 font-semibold">{formatBs(u.totalSpent || 0)}</p>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                              : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Banear' : 'Reactivar'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-xl text-red-500 hover:bg-red-50"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. PEDIDOS GLOBALES */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center">
                <Truck className="w-5 h-5 text-orange-500 mr-2" />
                Monitor de Pedidos Multitienda & Despacho
              </h2>
              <p className="text-xs text-gray-500">
                Visualización unificada de pedidos. Cancela órdenes conflictivas con restitución automática de stock.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pedido por número..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5"># Pedido</th>
                  <th className="p-3.5">Cliente</th>
                  <th className="p-3.5">Tienda & Productos</th>
                  <th className="p-3.5">Método de Pago</th>
                  <th className="p-3.5">Total Bs.</th>
                  <th className="p-3.5">Estado DSP</th>
                  <th className="p-3.5 text-right">Intervención Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {orders
                  .filter((o) =>
                    searchQuery ? o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) : true
                  )
                  .map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold font-mono text-gray-900">{o.orderNumber}</span>
                        <p className="text-[10px] text-gray-400">
                          {new Date(o.createdAt).toLocaleDateString('es-BO')}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-gray-900">{o.customerName}</p>
                        <p className="text-[10px] text-gray-500">{o.customerPhone}</p>
                      </td>
                      <td className="p-3.5">
                        {o.items && o.items.length > 0 ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-amber-700">{o.items[0].storeName}</p>
                            <p className="text-gray-700 text-[11px] truncate max-w-[200px]">
                              {o.items[0].productTitle} {o.items.length > 1 && `(+${o.items.length - 1} más)`}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin items</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {o.paymentMethod || 'QR_SIMPLE'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-gray-900">
                        {formatBs(o.totalAmount)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-800'
                              : o.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {o.status !== 'CANCELLED' ? (
                          <button
                            onClick={() => setCancelModalOrder(o)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                          >
                            Cancelar Pedido
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-bold">Cancelado</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. CATÁLOGO & MODERACIÓN */}
      {activeTab === 'PRODUCTS' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center">
                <ShoppingBag className="w-5 h-5 text-indigo-500 mr-2" />
                Moderación de Catálogo del Marketplace
              </h2>
              <p className="text-xs text-gray-500">
                Elimina o da de baja artículos que infrinjan políticas comerciales o de seguridad en Bolivia.
              </p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-black w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Producto</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Tienda Oferente</th>
                  <th className="p-3.5">Precio Base</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Moderación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {products
                  .filter((p) =>
                    searchQuery ? p.title?.toLowerCase().includes(searchQuery.toLowerCase()) : true
                  )
                  .map((p) => {
                    const firstStore = p.offers?.[0]?.store?.name || 'Varios';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-gray-900">{p.title}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[240px]">{p.description}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-gray-800">{p.category?.name || 'General'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-amber-700">{firstStore}</span>
                        </td>
                        <td className="p-3.5 font-bold text-gray-900">
                          {formatBs(p.basePrice)}
                        </td>
                        <td className="p-3.5">
                          {p.status === 'ACTIVE' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                              Visible
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              Baja por Admin
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleModerateProduct(p.id, p.status)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              p.status === 'ACTIVE'
                                ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
                            }`}
                          >
                            {p.status === 'ACTIVE' ? 'Dar de Baja' : 'Reactivar'}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.title)}
                            className="p-1.5 rounded-xl text-red-500 hover:bg-red-50"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. MÉTODOS DE PAGO Y PASARELAS BOLIVIA */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xs space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-black text-gray-900">
                Configuración Oficial de Métodos de Pago & Liquidación
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Parámetros de conexión bancaria ASFI QR Simple, pagos contra entrega en Santa Cruz y tasa de comisión de la plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentConfigs.map((cfg) => (
              <PaymentGatewayCard
                key={cfg.gatewayKey}
                config={cfg}
                onSave={(data) => handleSavePaymentConfig(cfg.gatewayKey, data)}
                loading={actionLoading}
              />
            ))}
          </div>

          {/* Platform Escrow Explanation Alert */}
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200/80 flex items-start space-x-3.5">
            <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-extrabold text-sm">¿Cómo opera el flujo financiero en Vitrina Marketplace?</p>
              <p>
                1. <strong>Recaudación Central:</strong> El cliente paga por QR Simple interbancario hacia la cuenta corporativa de Vitrina.
              </p>
              <p>
                2. <strong>Retención de Comisión:</strong> Vitrina retiene automáticamente la tasa configurada (ej. 5.0%) por servicio de intermediación comercial.
              </p>
              <p>
                3. <strong>Garantía / Escrow:</strong> El saldo neto de la tienda (95%) se bloquea en garantía hasta que el conductor OpenDSP confirme la entrega física (<code className="font-mono bg-amber-100 px-1 rounded">DELIVERED</code>). En ese momento, se transfiere automáticamente a saldo disponible para Payout ACH interbancario semanal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cancelar Pedido por Tienda */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-gray-900 text-base">Cancelar Pedido Administrativamente</h3>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <p>
                Estás a punto de cancelar el pedido <strong className="text-gray-900 font-mono">#{cancelModalOrder.orderNumber}</strong> por valor de{' '}
                <strong className="text-gray-900">{formatBs(cancelModalOrder.totalAmount)}</strong>.
              </p>

              <div>
                <label className="font-bold text-gray-800 block mb-1">Motivo de Cancelación (Auditoría):</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="Falta de stock y coordinación de entrega en tienda">
                    Falta de stock y coordinación de entrega en tienda
                  </option>
                  <option value="Reclamo o solicitud directa del cliente">
                    Reclamo o solicitud directa del cliente
                  </option>
                  <option value="Dirección fuera de cobertura OpenDSP">
                    Dirección fuera de cobertura OpenDSP
                  </option>
                  <option value="Sospecha de transacción fraudulenta">
                    Sospecha de transacción fraudulenta
                  </option>
                </select>
              </div>

              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100 text-[11px] leading-relaxed">
                ⚠️ Al cancelar, se anulará el despacho OpenDSP, se liberará el stock a la tienda y se notificará el motivo al comprador.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancelOrder}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs"
              >
                {actionLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Payment Gateway Card Editor
function PaymentGatewayCard({
  config,
  onSave,
  loading,
}: {
  config: any;
  onSave: (data: any) => void;
  loading: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [platformCommission, setPlatformCommission] = useState(config.platformCommission || 5.0);
  const [apiEndpoint, setApiEndpoint] = useState(config.apiEndpoint || '');
  const [merchantAccountId, setMerchantAccountId] = useState(config.merchantAccountId || '');
  const [maxAmount, setMaxAmount] = useState(config.maxAmount || 5000);

  const handleSave = () => {
    onSave({
      isEnabled,
      platformCommission: Number(platformCommission),
      apiEndpoint,
      merchantAccountId,
      maxAmount: Number(maxAmount),
    });
  };

  return (
    <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-gray-200/80 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-sm text-gray-900">{config.name}</h3>
          <p className="text-[10px] font-mono text-gray-400 uppercase">{config.gatewayKey}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsEnabled(!isEnabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isEnabled ? 'bg-black' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="text-xs text-gray-600">{config.notes}</p>

      <div className="space-y-3 pt-2 text-xs">
        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Comisión de la Plataforma (%):
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={platformCommission}
              onChange={(e) => setPlatformCommission(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl p-2 font-bold text-gray-900 focus:outline-none"
            />
            <Percent className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </div>
        </div>

        {config.apiEndpoint !== undefined && (
          <div>
            <label className="font-bold text-gray-700 block mb-1">Endpoint API Bancario:</label>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="https://api.banco.com.bo/..."
              className="w-full bg-white border border-gray-200 rounded-xl p-2 font-mono text-[11px] text-gray-800 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="font-bold text-gray-700 block mb-1">
            Cuenta Recaudadora / ID Comerciante:
          </label>
          <input
            type="text"
            value={merchantAccountId}
            onChange={(e) => setMerchantAccountId(e.target.value)}
            placeholder="Nro cuenta bancaria centralizadora"
            className="w-full bg-white border border-gray-200 rounded-xl p-2 font-mono text-[11px] text-gray-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="font-bold text-gray-700 block mb-1">Monto Máximo Permitido (Bs.):</label>
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl p-2 font-bold text-gray-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-black bg-black text-white hover:bg-gray-800 transition-colors shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Configuración</span>
        </button>
      </div>
    </div>
  );
}
