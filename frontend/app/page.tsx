'use client';

import { useState } from 'react';
import { UserRole, Order } from '@/lib/types';
import { DEMO_USERS } from '@/lib/constants';
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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
                <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#5b8def" />
                    <stop offset="1" stopColor="#8b7ff5" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-xl font-semibold">ChainVault</span>
            </div>

            {/* Role Selector */}
            <div className="flex items-center gap-3">
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm font-medium cursor-pointer hover:border-[var(--accent-blue)] transition-colors"
              >
                <option value="supplier">Supplier</option>
                <option value="buyer">Buyer</option>
                <option value="logistics">Logistics</option>
                <option value="regulator">Regulator</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {renderDashboard()}
      </main>
    </div>
  );
}
