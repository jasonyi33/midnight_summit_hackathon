'use client';

import { useState, useEffect } from 'react';
import { UserRole, Order, SupplyChainCondition, ConditionPhase } from '@/lib/types';
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
  const [networkLatency, setNetworkLatency] = useState(42);

  const ROLE_CONTEXT = {
    supplier: {
      label: 'Supplier Workspace',
      description: 'Plan production, submit orders, and share encrypted commercial terms.',
      focus: 'Operational Readiness'
    },
    buyer: {
      label: 'Buyer Assurance',
      description: 'Approve volumes, inspect proofs, and release payment milestones.',
      focus: 'Procurement Controls'
    },
    logistics: {
      label: 'Logistics Command',
      description: 'Track live GPS beacons, confirm custody transfers, and verify arrivals.',
      focus: 'Live Execution'
    },
    regulator: {
      label: 'Regulator Oversight',
      description: 'Audit trails, proof hashes, and exception workflows stay policy-ready.',
      focus: 'Audit Confidence'
    }
  } satisfies Record<UserRole, { label: string; description: string; focus: string }>;

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
        zkProof: 'zk_proof_demo_abc123',
        conditions: [
          {
            id: 'condition-1',
            role: 'supplier',
            phase: 'planning',
            description: 'MegaRetail may request cold-chain validation on arrival',
            createdAt: new Date(Date.now() - 3500000)
          },
          {
            id: 'condition-2',
            role: 'buyer',
            phase: 'approval',
            description: 'Payment release gated on third-party lab certificate',
            createdAt: new Date(Date.now() - 2000000)
          }
        ]
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
        zkProof: 'zk_proof_demo_def456',
        conditions: [
          {
            id: 'condition-3',
            role: 'logistics',
            phase: 'logistics',
            description: 'Driver must capture custody attestation at the Nevada checkpoint',
            createdAt: new Date(Date.now() - 4000000)
          }
        ]
      }
    ];
    setOrders(sampleOrders);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkLatency(prev => {
        const delta = Math.random() * 10 - 5;
        const next = Math.max(32, Math.min(68, prev + delta));
        return Math.round(next);
      });
    }, 5000);

    return () => clearInterval(interval);
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

  const handleAddCondition = (orderId: string, condition: { description: string; role: UserRole; phase: ConditionPhase }) => {
    if (!condition.description.trim()) return;
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              conditions: [
                ...(order.conditions || []),
                {
                  id: `condition-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  role: condition.role,
                  phase: condition.phase,
                  description: condition.description.trim(),
                  createdAt: new Date()
                }
              ]
            }
          : order
      )
    );
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
            onAddCondition={handleAddCondition}
          />
        );
      case 'buyer':
        return (
          <BuyerDashboard
            user={user}
            orders={orders}
            onApproveOrder={handleApproveOrder}
            onAddCondition={handleAddCondition}
          />
        );
      case 'logistics':
        return (
          <LogisticsDashboard
            user={user}
            orders={orders}
            onDelivery={handleDelivery}
            onAddCondition={handleAddCondition}
          />
        );
      case 'regulator':
        return (
          <RegulatorDashboard
            user={user}
            orders={orders}
            onAddCondition={handleAddCondition}
          />
        );
    }
  };

  return (
    <div className="app-shell">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-semibold tracking-tight">
              CV
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-slate-500 tracking-[0.2em]">ChainVault</p>
              <h1 className="text-2xl font-semibold text-slate-900">Operational Control Center</h1>
              <p className="text-sm text-slate-500">Switch between live stakeholder workspaces without changing environments.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-start lg:items-end">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Persona View</span>
            <RoleSwitcher currentRole={currentRole} onRoleChange={setCurrentRole} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Current Perspective</p>
            <h2 className="text-lg font-semibold text-slate-900">
              {ROLE_CONTEXT[currentRole].label}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {ROLE_CONTEXT[currentRole].description}
            </p>
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Focus: {ROLE_CONTEXT[currentRole].focus}
            </div>
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Network Health</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-slate-900">{networkLatency}</span>
              <span className="text-sm text-slate-600">ms latency</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">Midnight testnet RPC · smart contract channel live</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Proof relay synchronized
            </div>
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Workspace Switching</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center justify-between">
                Supplier
                <span className={`text-xs font-semibold ${currentRole === 'supplier' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {currentRole === 'supplier' ? 'Active' : 'Available'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                Buyer
                <span className={`text-xs font-semibold ${currentRole === 'buyer' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {currentRole === 'buyer' ? 'Active' : 'Available'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                Logistics
                <span className={`text-xs font-semibold ${currentRole === 'logistics' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {currentRole === 'logistics' ? 'Active' : 'Available'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                Regulator
                <span className={`text-xs font-semibold ${currentRole === 'regulator' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {currentRole === 'regulator' ? 'Active' : 'Available'}
                </span>
              </li>
            </ul>
            <p className="text-xs text-slate-500 mt-3">Switching preserves each stakeholder’s permissions and data scope.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <WalletConnect onWalletChange={setWalletAddress} />

            <div className="card p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Session Notes</p>
              <p className="text-sm text-slate-600">
                Rotate through personas to validate the end-to-end proof workflow that customers will run in production.
              </p>
              <p className="text-xs text-slate-500 mt-3">
                Data you enter as one role becomes live context for the others.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            {renderDashboard()}
          </div>
        </div>
      </main>
    </div>
  );
}
