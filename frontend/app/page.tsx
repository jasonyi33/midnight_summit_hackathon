'use client';

import { useState, useEffect } from 'react';
import { UserRole, Order } from '@/lib/types';
import { DEMO_USERS } from '@/lib/constants';
import RoleSwitcher from '@/components/RoleSwitcher';
import WalletConnect from '@/components/WalletConnect';
import SupplierDashboard from '@/components/dashboards/SupplierDashboard';
import BuyerDashboard from '@/components/dashboards/BuyerDashboard';
import LogisticsDashboard from '@/components/dashboards/LogisticsDashboard';
import RegulatorDashboard from '@/components/dashboards/RegulatorDashboard';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>('supplier');
  const [orders, setOrders] = useState<Order[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Auto-create sample orders for GPS demo on mount
  useEffect(() => {
    const sampleOrders: Order[] = [
      {
        id: 'demo-order-1',
        supplierId: 'supplier-1',
        buyerId: 'buyer-1',
        quantity: 5000,
        price: 125000,
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        approvedAt: new Date(Date.now() - 1800000), // 30 min ago
        deliveryLocation: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        currentLocation: { lat: 37.6749, lng: -122.5194 },
        zkProof: 'zk_proof_demo_abc123'
      },
      {
        id: 'demo-order-2',
        supplierId: 'supplier-1',
        buyerId: 'buyer-2',
        quantity: 3000,
        price: 90000,
        status: 'in_transit',
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        approvedAt: new Date(Date.now() - 5400000), // 1.5 hours ago
        deliveryLocation: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
        currentLocation: { lat: 34.2522, lng: -118.4437 },
        zkProof: 'zk_proof_demo_def456'
      }
    ];
    setOrders(sampleOrders);
  }, []);

  const handleCreateOrder = (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      status: 'pending_approval',
      createdAt: new Date()
    };
    setOrders([...orders, newOrder]);
  };

  const handleApproveOrder = (orderId: string, zkProof: string) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'approved', approvedAt: new Date(), zkProof }
        : order
    ));
  };

  const handleDelivery = (orderId: string, location: { lat: number; lng: number }) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'delivered', deliveredAt: new Date(), currentLocation: location }
        : order
    ));
  };

  const handlePaymentRelease = (orderId: string) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'payment_released' }
        : order
    ));
  };

  const renderDashboard = () => {
    const user = DEMO_USERS[currentRole];

    switch (currentRole) {
      case 'supplier':
        return (
          <SupplierDashboard
            user={user}
            orders={orders}
            onCreateOrder={handleCreateOrder}
          />
        );
      case 'buyer':
        return (
          <BuyerDashboard
            user={user}
            orders={orders}
            onApproveOrder={handleApproveOrder}
          />
        );
      case 'logistics':
        return (
          <LogisticsDashboard
            user={user}
            orders={orders}
            onDelivery={handleDelivery}
          />
        );
      case 'regulator':
        return (
          <RegulatorDashboard
            user={user}
            orders={orders}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-blue-50/50 to-white border-b-2 border-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 shadow-lg sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-3 rounded-xl shadow-xl transform group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-tight group-hover:from-blue-700 group-hover:via-indigo-800 group-hover:to-purple-800 transition-all duration-300">
                  ChainVault
                </h1>
                <p className="text-sm font-semibold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  Privacy-Preserving Supply Chain
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <RoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Wallet */}
          <div className="lg:col-span-1 space-y-4">
            <WalletConnect onWalletChange={setWalletAddress} />

            {walletAddress && (
              <div className="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-start gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2 rounded-lg shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900 mb-1">Wallet Connected</p>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      Ready for on-chain transactions
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!walletAddress && (
              <div className="relative overflow-hidden p-5 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative flex items-start gap-3">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 mb-1">Demo Mode</p>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      Connect wallet for blockchain features
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dashboard Content */}
          <div className="lg:col-span-3">
            {renderDashboard()}
          </div>
        </div>
      </div>
    </div>
  );
}
