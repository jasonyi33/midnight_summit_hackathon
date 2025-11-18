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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={24} className="text-emerald-600" />
          Create New Order
        </h2>

        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Units)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                Price (USD)
                <PrivacyBadge isLocked={true} />
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Only visible to you via ZK proof</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={deliveryLat}
                onChange={(e) => setDeliveryLat(e.target.value)}
                placeholder="e.g., 37.7749"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={deliveryLng}
                onChange={(e) => setDeliveryLng(e.target.value)}
                placeholder="e.g., -122.4194"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-md font-medium hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Create Order with ZK Proof
          </button>
        </form>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Orders</h2>

        {supplierOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet. Create your first order above!</p>
        ) : (
          <div className="space-y-3">
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

function OrderCard({ order, showPrice }: { order: Order; showPrice: boolean }) {
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
            <div>
              <span className="text-gray-600">Quantity:</span>
              <span className="ml-2 font-semibold text-gray-900">{order.quantity} units</span>
            </div>
            {showPrice && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Price:</span>
                <span className="ml-2 font-semibold text-gray-900">${order.price.toLocaleString()}</span>
                <PrivacyBadge isLocked={true} />
              </div>
            )}
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
