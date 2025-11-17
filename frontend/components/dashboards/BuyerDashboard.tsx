'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import { ShoppingCart, Eye, CheckCircle, XCircle } from 'lucide-react';
import PrivacyBadge from '@/components/PrivacyBadge';
import ZKProofGenerator from '@/components/ZKProofGenerator';

interface BuyerDashboardProps {
  user: User;
  orders: Order[];
  onApproveOrder: (orderId: string, zkProof: string) => void;
}

export default function BuyerDashboard({ user, orders, onApproveOrder }: BuyerDashboardProps) {
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

    setGeneratingProof(false);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingCart className="text-blue-600" />}
          label="Total Orders"
          value={buyerOrders.length}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Eye className="text-amber-600" />}
          label="Pending Review"
          value={pendingOrders.length}
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" />}
          label="Approved"
          value={buyerOrders.filter(o => o.status !== 'pending_approval').length}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<CheckCircle className="text-emerald-600" />}
          label="Completed"
          value={buyerOrders.filter(o => o.status === 'payment_released').length}
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Pending Approvals */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye size={24} className="text-blue-600" />
            Pending Approvals
          </h2>

          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-sm text-gray-600">{order.id}</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <span className="font-medium">{order.quantity} units</span>
                        <PrivacyBadge isLocked={false} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Price:</span>
                        <span className="font-medium text-gray-400">Hidden</span>
                        <PrivacyBadge isLocked={true} />
                        <span className="text-xs text-gray-500 ml-2">
                          Protected by Zero-Knowledge Proof
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Delivery Location:</span>
                        <span className="font-mono text-sm">
                          {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApprove(order)}
                      disabled={generatingProof && selectedOrder?.id === order.id}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingProof && selectedOrder?.id === order.id
                        ? 'Generating ZK Proof...'
                        : 'Approve Order'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZK Proof Generator Animation */}
      {generatingProof && selectedOrder && (
        <ZKProofGenerator order={selectedOrder} />
      )}

      {/* All Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Orders</h2>

        {buyerOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {buyerOrders.map((order) => (
              <BuyerOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-4 border border-gray-100`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-md">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BuyerOrderCard({ order }: { order: Order }) {
  const statusColors = {
    pending_approval: 'bg-amber-100 text-amber-800',
    approved: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    payment_released: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-gray-500">{order.id}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Quantity:</span>
              <span className="ml-2 font-medium">{order.quantity} units</span>
              <PrivacyBadge isLocked={false} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Price:</span>
              <span className="ml-2 font-medium text-gray-400">Hidden</span>
              <PrivacyBadge isLocked={true} />
            </div>
            {order.zkProof && (
              <div className="col-span-1">
                <span className="text-gray-600">ZK Proof:</span>
                <span className="ml-2 font-mono text-xs text-green-600">Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
