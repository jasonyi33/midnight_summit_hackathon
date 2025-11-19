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
          bgColor="bg-gradient-to-br from-blue-50 to-indigo-50"
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          icon={<Eye className="text-amber-600" />}
          label="Pending Review"
          value={pendingOrders.length}
          bgColor="bg-gradient-to-br from-amber-50 to-yellow-50"
          iconBg="bg-gradient-to-br from-amber-500 to-yellow-600"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" />}
          label="Approved"
          value={buyerOrders.filter(o => o.status !== 'pending_approval').length}
          bgColor="bg-gradient-to-br from-green-50 to-teal-50"
          iconBg="bg-gradient-to-br from-green-500 to-teal-600"
        />
        <StatCard
          icon={<CheckCircle className="text-emerald-600" />}
          label="Completed"
          value={buyerOrders.filter(o => o.status === 'payment_released').length}
          bgColor="bg-gradient-to-br from-emerald-50 to-cyan-50"
          iconBg="bg-gradient-to-br from-emerald-500 to-cyan-600"
        />
      </div>

      {/* Pending Approvals */}
      {pendingOrders.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/20 to-white rounded-2xl shadow-xl border-2 border-amber-300 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/10 via-yellow-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl blur-md opacity-50"></div>
                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl shadow-lg">
                  <Eye size={24} className="text-white" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-amber-700 via-orange-700 to-red-700 bg-clip-text text-transparent">
                Pending Approvals
              </span>
            </h2>

            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="relative overflow-hidden border-2 border-amber-300 rounded-2xl p-7 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-2xl group-hover:w-56 group-hover:h-56 transition-all duration-300"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="font-mono text-sm font-bold text-gray-700 bg-gradient-to-r from-white to-gray-50 px-4 py-2 rounded-lg shadow-sm border border-gray-200">{order.id}</span>
                        <span className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-2 border-amber-300 shadow-sm">
                          AWAITING APPROVAL
                        </span>
                      </div>

                      <div className="space-y-4 mb-7 bg-white/70 backdrop-blur-sm p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">Quantity:</span>
                          <span className="font-black text-gray-900 text-base">{order.quantity} units</span>
                          <PrivacyBadge isLocked={false} />
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">Price:</span>
                          <span className="font-black text-gray-400 text-base">████████</span>
                          <PrivacyBadge isLocked={true} />
                          <span className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold ml-2">
                            🔒 Protected by ZK-SNARK
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">Delivery Location:</span>
                          <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                            {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApprove(order)}
                        disabled={generatingProof && selectedOrder?.id === order.id}
                        className="relative w-full overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl blur-lg opacity-50 group-hover/btn:opacity-75 transition-all duration-300"></div>
                        <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-5 px-6 rounded-xl font-bold text-lg shadow-xl group-hover/btn:shadow-2xl transform group-hover/btn:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:transform-none">
                          {generatingProof && selectedOrder?.id === order.id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              Generating ZK Proof...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Approve Order with ZK Proof
                              <svg className="w-5 h-5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ZK Proof Generator Animation */}
      {generatingProof && selectedOrder && (
        <ZKProofGenerator order={selectedOrder} />
      )}

      {/* All Orders */}
      <div className="bg-gradient-to-br from-white via-indigo-50/20 to-white rounded-2xl shadow-xl border-2 border-indigo-200 p-8">
        <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 bg-clip-text text-transparent mb-6">All Orders</h2>

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

function StatCard({ icon, label, value, bgColor, iconBg }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  iconBg: string;
}) {
  return (
    <div className={`relative overflow-hidden ${bgColor} rounded-2xl p-6 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group cursor-pointer`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-300"></div>
      <div className="relative flex items-center gap-4">
        <div className={`${iconBg} p-4 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">{label}</p>
          <p className="text-4xl font-black text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BuyerOrderCard({ order }: { order: Order }) {
  const statusColors = {
    pending_approval: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300',
    approved: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300',
    in_transit: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300',
    delivered: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
    payment_released: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-300'
  };

  return (
    <div className="relative overflow-hidden border-2 border-indigo-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-400 transition-all duration-300 bg-gradient-to-br from-white via-indigo-50/20 to-white transform hover:-translate-y-1 group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl group-hover:w-48 group-hover:h-48 transition-all duration-300"></div>
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-lg shadow-sm">{order.id}</span>
            <span className={`px-4 py-2 rounded-xl text-xs font-black border-2 shadow-sm ${statusColors[order.status]}`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
            {order.zkProof && (
              <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ZK VERIFIED
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-bold">Quantity:</span>
              <span className="ml-2 font-black text-gray-900 text-base">{order.quantity} units</span>
              <PrivacyBadge isLocked={false} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-bold">Price:</span>
              <span className="ml-2 font-black text-gray-400 text-base">████████</span>
              <PrivacyBadge isLocked={true} />
            </div>
            <div>
              <span className="text-gray-600 font-bold">Status:</span>
              <span className="ml-2 font-black text-gray-900 text-base capitalize">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
