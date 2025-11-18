'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import { ShoppingCart, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface BuyerDashboardProps {
  user: User;
  orders: Order[];
  onApproveOrder: (orderId: string, zkProof: string) => void;
}

export default function BuyerDashboard({ user, orders, onApproveOrder }: BuyerDashboardProps) {
  const [generatingProof, setGeneratingProof] = useState<string | null>(null);

  const buyerOrders = orders.filter(order => order.buyerId === user.id);
  const pendingOrders = buyerOrders.filter(order => order.status === 'pending_approval');
  const approvedOrders = buyerOrders.filter(order => order.status !== 'pending_approval');
  const totalSpend = buyerOrders
    .filter(o => o.status !== 'pending_approval')
    .reduce((sum, o) => sum + o.price, 0);

  const handleApprove = async (order: Order) => {
    setGeneratingProof(order.id);

    // Simulate ZK proof generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const zkProof = `zk_proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    onApproveOrder(order.id, zkProof);
    setGeneratingProof(null);
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Total Orders</div>
          <div className="text-3xl font-semibold">{buyerOrders.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Pending Review</div>
          <div className="text-3xl font-semibold">{pendingOrders.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Approved</div>
          <div className="text-3xl font-semibold">{approvedOrders.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Total Spend</div>
          <div className="text-3xl font-semibold">${totalSpend.toLocaleString()}</div>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingOrders.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Pending Approvals</h2>

          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-mono text-sm text-[var(--text-tertiary)]">{order.id}</span>
                  <span className="badge badge-orange">Pending Approval</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Quantity</div>
                    <div className="font-medium">{order.quantity} units</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                      Price
                      <Lock size={12} className="text-[var(--accent-purple)]" />
                    </div>
                    <div className="font-medium text-mono">••••••</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-1">
                      Protected by ZK Proof
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Location</div>
                    <div className="font-medium text-mono text-xs">
                      {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleApprove(order)}
                  disabled={generatingProof === order.id}
                  className="btn btn-primary w-full md:w-auto"
                >
                  {generatingProof === order.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating ZK Proof...
                    </>
                  ) : (
                    'Approve with ZK Proof'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Orders */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">All Orders</h2>

        {buyerOrders.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-3">
            {buyerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent-blue)] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-mono text-sm text-[var(--text-tertiary)]">{order.id}</span>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Quantity</div>
                    <div className="font-medium">{order.quantity} units</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Price</div>
                    <div className="font-medium text-mono">••••••</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Created</div>
                    <div className="font-medium text-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">ZK Proof</div>
                    {order.zkProof ? (
                      <div className="flex items-center gap-1 text-[var(--accent-green)]">
                        <CheckCircle size={14} />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--text-tertiary)]">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending_approval':
      return 'badge-orange';
    case 'approved':
    case 'in_transit':
      return 'badge-blue';
    case 'delivered':
      return 'badge-purple';
    case 'payment_released':
      return 'badge-green';
    default:
      return 'badge-blue';
  }
}
