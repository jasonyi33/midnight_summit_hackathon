'use client';

import { useState } from 'react';
import { UserRole, Order } from '@/lib/types';
import { DEMO_USERS } from '@/lib/constants';
import RoleSwitcher from '@/components/RoleSwitcher';
import SupplierDashboard from '@/components/dashboards/SupplierDashboard';
import BuyerDashboard from '@/components/dashboards/BuyerDashboard';
import LogisticsDashboard from '@/components/dashboards/LogisticsDashboard';
import RegulatorDashboard from '@/components/dashboards/RegulatorDashboard';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>('supplier');
  const [orders, setOrders] = useState<Order[]>([]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ChainVault</h1>
              <p className="text-sm text-gray-500">Privacy-Preserving Supply Chain</p>
            </div>
            <RoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} />
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
}
