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
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon={<Clock className="text-amber-600" />}
          label="Pending"
          value={supplierOrders.filter(o => o.status === 'pending_approval').length}
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle className="text-blue-600" />}
          label="Delivered"
          value={supplierOrders.filter(o => o.status === 'delivered').length}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<DollarSign className="text-green-600" />}
          label="Revenue"
          value={`$${supplierOrders
            .filter(o => o.status === 'payment_released')
            .reduce((sum, o) => sum + o.price, 0)
            .toLocaleString()}`}
          bgColor="bg-green-50"
        />
      </div>

      {/* Create Order Form */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8 hover:shadow-md transition-shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
            <Package size={24} className="text-white" />
          </div>
          Create New Order
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
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            Create Order with ZK Proof
          </button>
        </form>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h2>

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

function OrderCard({ order, showPrice }: { order: Order; showPrice: boolean }) {
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
            <div>
              <span className="text-gray-500 font-medium">Quantity:</span>
              <span className="ml-2 font-bold text-gray-900">{order.quantity} units</span>
            </div>
            {showPrice && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">Price:</span>
                <span className="ml-2 font-bold text-gray-900">${order.price.toLocaleString()}</span>
                <PrivacyBadge isLocked={true} />
              </div>
            )}
            <div>
              <span className="text-gray-500 font-medium">Created:</span>
              <span className="ml-2 font-bold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
