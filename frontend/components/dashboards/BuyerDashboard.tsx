'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import { ShoppingCart, Eye, CheckCircle } from 'lucide-react';
import PrivacyBadge from '@/components/PrivacyBadge';
import ZKProofGenerator from '@/components/ZKProofGenerator';
import ConditionComposer from '@/components/ConditionComposer';

interface BuyerDashboardProps {
  user: User;
  orders: Order[];
  onApproveOrder: (orderId: string, zkProof: string) => void;
  onAddCondition: (orderId: string, payload: { description: string; role: User['role']; phase: 'approval' }) => void;
  onSpendBalance?: (amount: number) => void;
}

export default function BuyerDashboard({ user, orders, onApproveOrder, onAddCondition, onSpendBalance }: BuyerDashboardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [generatingProof, setGeneratingProof] = useState(false);

  const buyerOrders = orders.filter(order => order.buyerId === user.id);
  const pendingOrders = buyerOrders.filter(order => order.status === 'pending_approval');

  const handleApprove = async (order: Order) => {
    setSelectedOrder(order);
    setGeneratingProof(true);

    // Simulate ZK proof generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const zkProof = `zk_proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    onApproveOrder(order.id, zkProof);
    const fee = Math.max(5, Math.min(50, Math.round(order.price * 0.0001)));
    onSpendBalance?.(fee);

    setGeneratingProof(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingCart className="text-blue-600" />}
          label="Total Orders"
          value={buyerOrders.length}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={<Eye className="text-amber-600" />}
          label="Pending Review"
          value={pendingOrders.length}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" />}
          label="Approved"
          value={buyerOrders.filter(o => o.status !== 'pending_approval').length}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={<CheckCircle className="text-emerald-600" />}
          label="Completed"
          value={buyerOrders.filter(o => o.status === 'payment_released').length}
          accent="bg-slate-100 text-slate-700"
        />
      </div>

      {pendingOrders.length > 0 && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Decision Queue</p>
              <h2 className="text-2xl font-semibold text-slate-900 mt-1">Pending Approvals</h2>
            </div>
            <span className="text-xs font-semibold text-amber-600">{pendingOrders.length} awaiting action</span>
          </div>

          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="border border-amber-200 rounded-2xl p-6 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">{order.id}</span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                    Awaiting Approval
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Quantity</span>
                    <span className="text-slate-900 font-semibold">{order.quantity} units</span>
                    <PrivacyBadge isLocked={false} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Price</span>
                    <span className="text-slate-400 font-semibold tracking-widest">████████</span>
                    <PrivacyBadge isLocked={true} />
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">ZK protected</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Delivery Location</span>
                    <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                      {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Optional Conditions</p>
                  {order.conditions && order.conditions.length > 0 ? (
                    <ul className="space-y-1">
                      {order.conditions.map((condition) => (
                        <li key={condition.id} className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-slate-800 capitalize">{condition.phase}</span>
                            <span className="mx-1 text-slate-400">•</span>
                            <span>{condition.description}</span>
                          </div>
                          <span className="text-[10px] uppercase text-slate-400">{condition.role}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No optional conditions logged yet.</p>
                  )}
                  <ConditionComposer
                    orderId={order.id}
                    role="buyer"
                    phase="approval"
                    onAddCondition={onAddCondition}
                    placeholder="Add optional approval condition (e.g., sustainability audit, packaging photo)"
                    buttonLabel="Add approval condition"
                  />
                </div>

                <button
                  onClick={() => handleApprove(order)}
                  disabled={generatingProof && selectedOrder?.id === order.id}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {generatingProof && selectedOrder?.id === order.id ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Generating ZK Proof
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Approve with ZK proof
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZK Proof Generator Animation */}
      {generatingProof && selectedOrder && (
        <ZKProofGenerator order={selectedOrder} />
      )}

      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Portfolio</p>
            <h2 className="text-2xl font-semibold text-slate-900">All Orders</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">{buyerOrders.length} entries</span>
        </div>

        {buyerOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {buyerOrders.map((order) => (
              <BuyerOrderCard key={order.id} order={order} onAddCondition={onAddCondition} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${accent}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BuyerOrderCard({
  order,
  onAddCondition
}: {
  order: Order;
  onAddCondition?: BuyerDashboardProps['onAddCondition'];
}) {
  const statusColors = {
    pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    in_transit: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    payment_released: 'bg-teal-50 text-teal-700 border-teal-200'
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">{order.id}</span>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusColors[order.status]}`}>
          {order.status.replace(/_/g, ' ').toUpperCase()}
        </span>
        {order.zkProof && (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            ZK verified
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Quantity</span>
          <span className="text-slate-900 font-semibold">{order.quantity} units</span>
          <PrivacyBadge isLocked={false} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Price</span>
          <span className="text-slate-400 font-semibold tracking-widest">████████</span>
          <PrivacyBadge isLocked={true} />
        </div>
        <div>
          <span className="font-semibold text-slate-700 block mb-1">Status</span>
          <span className="text-slate-900 font-semibold capitalize">
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Optional Conditions</p>
        {order.conditions && order.conditions.length > 0 ? (
          <ul className="space-y-1">
            {order.conditions.map((condition) => (
              <li key={condition.id} className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-800 capitalize">{condition.phase}</span>
                  <span className="mx-1 text-slate-400">•</span>
                  <span>{condition.description}</span>
                </div>
                <span className="text-[10px] uppercase text-slate-400">{condition.role}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400">No optional conditions logged yet.</p>
        )}

        {onAddCondition && (
          <ConditionComposer
            orderId={order.id}
            role="buyer"
            phase="approval"
            onAddCondition={onAddCondition}
            placeholder="Record an optional condition for this order (e.g., final QC photo)"
            buttonLabel="Add buyer condition"
          />
        )}
      </div>
    </div>
  );
}
