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
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
              <Eye size={24} className="text-white" />
            </div>
            Pending Approvals
          </h2>

          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div key={order.id} className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-sm text-gray-600 bg-white px-3 py-1.5 rounded-md shadow-sm">{order.id}</span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                        <span className="font-bold text-gray-900">{order.quantity} units</span>
                        <PrivacyBadge isLocked={false} />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Price:</span>
                        <span className="font-bold text-gray-400">Hidden</span>
                        <PrivacyBadge isLocked={true} />
                        <span className="text-xs text-blue-600 ml-2 font-medium">
                          Protected by Zero-Knowledge Proof
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Delivery Location:</span>
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApprove(order)}
                      disabled={generatingProof && selectedOrder?.id === order.id}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h2>

        {buyerOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-blue-600" size={32} />
            </div>
            <p className="text-gray-600 text-lg">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
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
    <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BuyerOrderCard({ order }: { order: Order }) {
  const statusColors = {
    pending_approval: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    in_transit: 'bg-purple-100 text-purple-700 border-purple-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    payment_released: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="border border-blue-100 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">{order.id}</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusColors[order.status]}`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Quantity:</span>
              <span className="ml-2 font-bold text-gray-900">{order.quantity} units</span>
              <PrivacyBadge isLocked={false} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Price:</span>
              <span className="ml-2 font-bold text-gray-400">Hidden</span>
              <PrivacyBadge isLocked={true} />
            </div>
            {order.zkProof && (
              <div className="col-span-1">
                <span className="text-gray-500 font-medium">ZK Proof:</span>
                <span className="ml-2 font-mono text-xs font-bold text-green-600">Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
