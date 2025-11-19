'use client';

import { useState } from 'react';
import { User, Order, SupplyChainCondition } from '@/lib/types';
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import PrivacyBadge from '@/components/PrivacyBadge';
import ConditionComposer from '@/components/ConditionComposer';

interface SupplierDashboardProps {
  user: User;
  orders: Order[];
  onCreateOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  onAddCondition: (orderId: string, payload: { description: string; role: User['role']; phase: 'planning' }) => void;
}

export default function SupplierDashboard({ user, orders, onCreateOrder, onAddCondition }: SupplierDashboardProps) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="text-emerald-600" />}
          label="Total Orders"
          value={supplierOrders.length}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={<Clock className="text-amber-600" />}
          label="Pending"
          value={supplierOrders.filter(o => o.status === 'pending_approval').length}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          icon={<CheckCircle className="text-blue-600" />}
          label="Delivered"
          value={supplierOrders.filter(o => o.status === 'delivered').length}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={<DollarSign className="text-green-600" />}
          label="Revenue"
          value={`$${supplierOrders
            .filter(o => o.status === 'payment_released')
            .reduce((sum, o) => sum + o.price, 0)
            .toLocaleString()}`}
          accent="bg-slate-100 text-slate-700"
        />
      </div>

      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Supplier Actions</p>
            <h2 className="text-2xl font-semibold text-slate-900 mt-1">Create New Order</h2>
            <p className="text-sm text-slate-500 mt-1">Commercial terms remain private; proofs summarize status to other teams.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Ready to submit
          </div>
        </div>

        <form onSubmit={handleCreateOrder} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Quantity (Units)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 5,000"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition-all"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                Price (USD)
                <PrivacyBadge isLocked={true} />
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 125,000"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition-all"
                min="1"
                required
              />
              <p className="text-xs text-slate-500 mt-2 font-medium">Only visible to you. Shared downstream as a proof hash.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Delivery Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={deliveryLat}
                onChange={(e) => setDeliveryLat(e.target.value)}
                placeholder="e.g., 37.7749"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Delivery Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={deliveryLng}
                onChange={(e) => setDeliveryLng(e.target.value)}
                placeholder="e.g., -122.4194"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder:text-slate-400 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Package size={20} />
            Create order (proof-ready)
          </button>
        </form>
      </div>

      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Work Queue</p>
            <h2 className="text-2xl font-semibold text-slate-900">Your Orders</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {supplierOrders.length} records synced
          </span>
        </div>

        {supplierOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Your orders will appear here once submitted.
          </div>
        ) : (
          <div className="space-y-4">
            {supplierOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                showPrice={true}
                onAddCondition={onAddCondition}
              />
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

function OrderCard({
  order,
  showPrice,
  onAddCondition
}: {
  order: Order;
  showPrice: boolean;
  onAddCondition: SupplierDashboardProps['onAddCondition'];
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
        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded">{order.id}</span>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusColors[order.status]}`}>
          {order.status.replace(/_/g, ' ').toUpperCase()}
        </span>
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
        <div>
          <dt className="font-semibold">Quantity</dt>
          <dd className="text-slate-900 font-semibold">{order.quantity} units</dd>
        </div>
        {showPrice && (
          <div className="flex items-center gap-2">
            <div>
              <dt className="font-semibold">Price</dt>
              <dd className="text-slate-900 font-semibold">${order.price.toLocaleString()}</dd>
            </div>
            <PrivacyBadge isLocked={true} />
          </div>
        )}
        <div>
          <dt className="font-semibold">Created</dt>
          <dd className="text-slate-900 font-semibold">
            {new Date(order.createdAt).toLocaleDateString()}
          </dd>
        </div>
      </dl>
      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Optional Conditions</p>
        {order.conditions && order.conditions.length > 0 ? (
          <ul className="space-y-1">
            {order.conditions.map((condition) => (
              <li
                key={condition.id}
                className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex items-start justify-between gap-2"
              >
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
          role="supplier"
          phase="planning"
          onAddCondition={onAddCondition}
          placeholder="Add planning note or optional condition (e.g., staggered pickup windows)"
          buttonLabel="Add planning condition"
        />
      </div>
    </div>
  );
}
