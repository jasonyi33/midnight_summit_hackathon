'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import PrivacyBadge from '@/components/PrivacyBadge';

interface SupplierDashboardProps {
  user: User;
  orders: Order[];
  onCreateOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
}

export default function SupplierDashboard({ user, orders, onCreateOrder }: SupplierDashboardProps) {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [deliveryLat, setDeliveryLat] = useState('');
  const [deliveryLng, setDeliveryLng] = useState('');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateOrder({
      supplierId: user.id,
      buyerId: 'buyer-1',
      quantity: parseInt(quantity) || 0,
      price: parseInt(price) || 0,
      deliveryLocation: {
        lat: parseFloat(deliveryLat) || 0,
        lng: parseFloat(deliveryLng) || 0
      }
    });
    // Reset form
    setQuantity('');
    setPrice('');
    setDeliveryLat('');
    setDeliveryLng('');
  };

  const supplierOrders = orders.filter(order => order.supplierId === user.id);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="text-emerald-600" />}
          label="Total Orders"
          value={supplierOrders.length}
          bgColor="bg-gradient-to-br from-emerald-50 to-teal-50"
          iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={<Clock className="text-amber-600" />}
          label="Pending"
          value={supplierOrders.filter(o => o.status === 'pending_approval').length}
          bgColor="bg-gradient-to-br from-amber-50 to-orange-50"
          iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          icon={<CheckCircle className="text-blue-600" />}
          label="Delivered"
          value={supplierOrders.filter(o => o.status === 'delivered').length}
          bgColor="bg-gradient-to-br from-blue-50 to-indigo-50"
          iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <StatCard
          icon={<DollarSign className="text-green-600" />}
          label="Revenue"
          value={`$${supplierOrders
            .filter(o => o.status === 'payment_released')
            .reduce((sum, o) => sum + o.price, 0)
            .toLocaleString()}`}
          bgColor="bg-gradient-to-br from-green-50 to-emerald-50"
          iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
        />
      </div>

      {/* Create Order Form */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl shadow-xl border-2 border-blue-200 p-8 hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur-md opacity-50"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
                <Package size={24} className="text-white" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
              Create New Order
            </span>
          </h2>

        <form onSubmit={handleCreateOrder} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity (Units)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                Price (USD)
                <PrivacyBadge isLocked={true} />
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 10000"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all"
                min="1"
                required
              />
              <p className="text-xs text-blue-600 mt-2 font-medium">Only visible to you via ZK proof</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Delivery Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={deliveryLat}
                onChange={(e) => setDeliveryLat(e.target.value)}
                placeholder="e.g., 37.7749"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Delivery Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={deliveryLng}
                onChange={(e) => setDeliveryLng(e.target.value)}
                placeholder="e.g., -122.4194"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="relative w-full overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-300"></div>
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-5 px-6 rounded-xl font-bold text-lg shadow-xl group-hover:shadow-2xl transform group-hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
              <Package size={20} />
              Create Order with ZK Proof
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </form>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-gradient-to-br from-white via-purple-50/20 to-white rounded-2xl shadow-xl border-2 border-purple-200 p-8">
        <h2 className="text-3xl font-black bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 bg-clip-text text-transparent mb-6">Your Orders</h2>

        {supplierOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="text-blue-600" size={32} />
            </div>
            <p className="text-gray-600 text-lg">No orders yet</p>
            <p className="text-gray-500 text-sm mt-1">Create your first order above to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {supplierOrders.map((order) => (
              <OrderCard key={order.id} order={order} showPrice={true} />
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

function OrderCard({ order, showPrice }: { order: Order; showPrice: boolean }) {
  const statusColors = {
    pending_approval: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300',
    approved: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300',
    in_transit: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300',
    delivered: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
    payment_released: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-300'
  };

  return (
    <div className="relative overflow-hidden border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-white via-blue-50/20 to-white transform hover:-translate-y-1 group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl group-hover:w-48 group-hover:h-48 transition-all duration-300"></div>
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-lg shadow-sm">{order.id}</span>
            <span className={`px-4 py-2 rounded-xl text-xs font-black border-2 shadow-sm ${statusColors[order.status]}`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <span className="text-gray-600 font-bold">Quantity:</span>
              <span className="ml-2 font-black text-gray-900 text-base">{order.quantity} units</span>
            </div>
            {showPrice && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-bold">Price:</span>
                <span className="ml-2 font-black text-gray-900 text-base">${order.price.toLocaleString()}</span>
                <PrivacyBadge isLocked={true} />
              </div>
            )}
            <div>
              <span className="text-gray-600 font-bold">Created:</span>
              <span className="ml-2 font-black text-gray-900 text-base">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
