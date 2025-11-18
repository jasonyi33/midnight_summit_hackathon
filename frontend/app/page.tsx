'use client';

import { useState, useEffect } from 'react';
import { UserRole, Order } from '@/lib/types';
import { DEMO_USERS } from '@/lib/constants';
import RoleSwitcher from '@/components/RoleSwitcher';
import SupplierDashboard from '@/components/dashboards/SupplierDashboard';
import BuyerDashboard from '@/components/dashboards/BuyerDashboard';
import LogisticsDashboard from '@/components/dashboards/LogisticsDashboard';
import RegulatorDashboard from '@/components/dashboards/RegulatorDashboard';
import {
  Shield,
  Activity,
  Lock,
  Zap,
  TrendingUp,
  Network
} from 'lucide-react';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>('supplier');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeContracts, setActiveContracts] = useState(0);
  const [zkProofsGenerated, setZkProofsGenerated] = useState(0);

  useEffect(() => {
    // Simulate loading and fetch initial data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Calculate stats
    setActiveContracts(orders.filter(o => o.status !== 'payment_released').length);
    setZkProofsGenerated(orders.filter(o => o.zkProof).length);
  }, [orders]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="spinner mx-auto"></div>
          <p className="text-[var(--text-secondary)] text-lg">Initializing ChainVault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] cyber-grid">
      {/* Modern Header with Glass Morphism */}
      <header className="glass-strong border-b border-[var(--border-default)] sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-primary blur-lg opacity-50 animate-pulse"></div>
                  <Shield className="relative w-10 h-10 text-[var(--accent-primary)] animate-float" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">ChainVault</h1>
                  <p className="text-xs text-[var(--text-tertiary)] font-mono">
                    Privacy-Preserving Supply Chain
                  </p>
                </div>
              </div>

              {/* Real-time Stats */}
              <div className="hidden lg:flex items-center gap-6 ml-8">
                <StatBadge
                  icon={<Activity size={16} />}
                  label="Active"
                  value={activeContracts}
                  color="primary"
                />
                <StatBadge
                  icon={<Lock size={16} />}
                  label="ZK Proofs"
                  value={zkProofsGenerated}
                  color="success"
                />
                <StatBadge
                  icon={<Network size={16} />}
                  label="On-Chain"
                  value={orders.length}
                  color="purple"
                />
              </div>
            </div>

            {/* Role Switcher & Network Status */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 glass rounded-lg">
                <div className="status-dot status-approved"></div>
                <span className="text-xs text-[var(--text-secondary)] font-mono">
                  Backend Online
                </span>
              </div>
              <RoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-12 py-8">
        {/* Dashboard Banner */}
        <div className="mb-8 animate-slideDown">
          <DashboardBanner role={currentRole} />
        </div>

        {/* Dashboard Content */}
        <div className="animate-slideUp">
          {renderDashboard()}
        </div>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-[var(--border-default)] mt-16">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-sm">
              <Shield size={16} />
              <span>Powered by</span>
              <span className="text-gradient-purple font-semibold">Midnight Network</span>
            </div>
            <div className="flex items-center gap-4 text-[var(--text-tertiary)] text-sm">
              <span className="flex items-center gap-1">
                <Zap size={14} className="text-[var(--accent-success)]" />
                Zero-Knowledge Proofs
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp size={14} className="text-[var(--accent-primary)]" />
                Real-time Tracking
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Stat Badge Component
function StatBadge({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'primary' | 'success' | 'purple'
}) {
  const colorClasses = {
    primary: 'text-[var(--accent-primary)] bg-blue-500/10 border-blue-500/30',
    success: 'text-[var(--accent-success)] bg-emerald-500/10 border-emerald-500/30',
    purple: 'text-[var(--accent-purple)] bg-purple-500/10 border-purple-500/30'
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClasses[color]} transition-all hover:scale-105`}>
      {icon}
      <span className="text-xs font-mono">
        <span className="text-[var(--text-tertiary)]">{label}:</span>
        <span className="ml-1 font-bold">{value}</span>
      </span>
    </div>
  );
}

// Dashboard Banner Component
function DashboardBanner({ role }: { role: UserRole }) {
  const banners = {
    supplier: {
      title: 'Supplier Dashboard',
      description: 'Create and manage orders with encrypted pricing',
      gradient: 'bg-gradient-success',
      icon: <TrendingUp size={24} />
    },
    buyer: {
      title: 'Buyer Dashboard',
      description: 'Approve orders using zero-knowledge proofs',
      gradient: 'bg-gradient-primary',
      icon: <Shield size={24} />
    },
    logistics: {
      title: 'Logistics Dashboard',
      description: 'Track shipments and confirm deliveries',
      gradient: 'bg-gradient-cyber',
      icon: <Activity size={24} />
    },
    regulator: {
      title: 'Regulator Dashboard',
      description: 'Monitor compliance and verify transactions',
      gradient: 'bg-gradient-purple',
      icon: <Lock size={24} />
    }
  };

  const banner = banners[role];

  return (
    <div className={`${banner.gradient} rounded-2xl p-6 relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-10">
        <div className="cyber-grid h-full"></div>
      </div>
      <div className="relative flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-float">
          {banner.icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{banner.title}</h2>
          <p className="text-white/80 text-sm mt-1">{banner.description}</p>
        </div>
      </div>
    </div>
  );
}
