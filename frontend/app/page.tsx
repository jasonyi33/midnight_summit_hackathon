'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">ChainVault</h1>
                <p className="text-sm text-gray-600">Privacy-Preserving Supply Chain</p>
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
          <div className="lg:col-span-1">
            <WalletConnect onWalletChange={setWalletAddress} />
            
            {walletAddress && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Wallet connected! You can now interact with on-chain contracts.
                </p>
              </div>
            )}

            {!walletAddress && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠ Demo mode: Connect wallet for on-chain interactions
                </p>
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
