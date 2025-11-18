'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import { Package, DollarSign, Lock } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateOrder({
      supplierId: user.id,
      buyerId: 'buyer',
      quantity: parseInt(quantity) || 0,
      price: parseInt(price) || 0,
      deliveryLocation: {
        lat: parseFloat(deliveryLat) || 0,
        lng: parseFloat(deliveryLng) || 0
      }
    });
    setQuantity('');
    setPrice('');
    setDeliveryLat('');
    setDeliveryLng('');
  };

  const supplierOrders = orders.filter(order => order.supplierId === user.id);
  const pendingOrders = supplierOrders.filter(o => o.status === 'pending_approval').length;
  const completedOrders = supplierOrders.filter(o => o.status === 'payment_released').length;
  const revenue = supplierOrders
    .filter(o => o.status === 'payment_released')
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Total Orders</div>
          <div className="text-3xl font-semibold">{supplierOrders.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Pending</div>
          <div className="text-3xl font-semibold">{pendingOrders}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Completed</div>
          <div className="text-3xl font-semibold">{completedOrders}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Total Revenue</div>
          <div className="text-3xl font-semibold">${revenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Create Order Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Create New Order</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Quantity
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 1000"
                  required
                  min="1"
                />
                <Package size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                <span className="flex items-center gap-2">
                  Price (USD)
                  <span className="badge badge-purple">
                    <Lock size={10} />
                    Encrypted
                  </span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="••••••"
                  required
                  min="1"
                  className="text-mono"
                />
                <DollarSign size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1.5">
                Only visible to you via zero-knowledge proof
              </p>
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Delivery Location
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                step="0.0001"
                value={deliveryLat}
                onChange={(e) => setDeliveryLat(e.target.value)}
                placeholder="Latitude"
                required
                className="text-mono"
              />
              <input
                type="number"
                step="0.0001"
                value={deliveryLng}
                onChange={(e) => setDeliveryLng(e.target.value)}
                placeholder="Longitude"
                required
                className="text-mono"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full md:w-auto">
            Create Order with ZK Proof
          </button>
        </form>
      </div>

      {/* Orders List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Your Orders</h2>

        {supplierOrders.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            No orders yet. Create your first order above!
          </div>
        ) : (
          <div className="space-y-3">
            {supplierOrders.map((order) => (
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
                    <div className="font-medium">${order.price.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Created</div>
                    <div className="font-medium text-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Location</div>
                    <div className="font-medium text-mono text-xs">
                      {order.deliveryLocation.lat.toFixed(2)}, {order.deliveryLocation.lng.toFixed(2)}
                    </div>
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
