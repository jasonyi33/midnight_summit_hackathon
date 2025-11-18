'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Lock,
  MapPin,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [showPrice, setShowPrice] = useState(false);

  const handleCreateOrder = (e: React.FormEvent) => {
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
  const revenue = supplierOrders
    .filter(o => o.status === 'payment_released')
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Package />}
          label="Total Orders"
          value={supplierOrders.length}
          change="+12%"
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={<Clock />}
          label="Pending Approval"
          value={supplierOrders.filter(o => o.status === 'pending_approval').length}
          gradient="from-yellow-500 to-orange-600"
        />
        <StatCard
          icon={<CheckCircle />}
          label="Completed"
          value={supplierOrders.filter(o => o.status === 'payment_released').length}
          gradient="from-emerald-500 to-green-600"
        />
        <StatCard
          icon={<DollarSign />}
          label="Total Revenue"
          value={`$${revenue.toLocaleString()}`}
          change="+23%"
          gradient="from-purple-500 to-purple-700"
          isRevenue
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create Order Form - 2 columns */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
                <Package size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Create New Order</h2>
                <p className="text-sm text-[var(--text-tertiary)]">Encrypted pricing with ZK proofs</p>
              </div>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Quantity (Units)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g., 1000"
                      className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
                      min="1"
                      required
                    />
                    <Package size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                    Price (USD)
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30">
                      <Lock size={12} className="text-purple-400" />
                      <span className="text-xs text-purple-400">Encrypted</span>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPrice ? "number" : "password"}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                      min="1"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPrice(!showPrice)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showPrice ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1">
                    <Lock size={10} />
                    Only you can see this via zero-knowledge proof
                  </p>
                </div>
              </div>

              {/* Delivery Location */}
              <div className="glass-strong rounded-xl p-4 border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-[var(--accent-primary)]" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Delivery Location</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="0.0001"
                    value={deliveryLat}
                    onChange={(e) => setDeliveryLat(e.target.value)}
                    placeholder="Latitude (e.g., 37.7749)"
                    className="px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm focus:border-[var(--accent-primary)] focus:outline-none transition-all font-mono"
                    required
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={deliveryLng}
                    onChange={(e) => setDeliveryLng(e.target.value)}
                    placeholder="Longitude (e.g., -122.4194)"
                    className="px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm focus:border-[var(--accent-primary)] focus:outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Create Order with ZK Proof
              </motion.button>
            </form>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-4">Order Status</h3>
            <div className="space-y-3">
              <StatusItem label="Pending" count={supplierOrders.filter(o => o.status === 'pending_approval').length} color="warning" />
              <StatusItem label="Approved" count={supplierOrders.filter(o => o.status === 'approved').length} color="primary" />
              <StatusItem label="In Transit" count={supplierOrders.filter(o => o.status === 'in_transit').length} color="primary" />
              <StatusItem label="Delivered" count={supplierOrders.filter(o => o.status === 'delivered').length} color="purple" />
              <StatusItem label="Paid" count={supplierOrders.filter(o => o.status === 'payment_released').length} color="success" />
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Revenue Trend</h3>
            <div className="h-32 flex items-end gap-2">
              {[40, 65, 45, 80, 60, 95, 70].map((height, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500/80 to-emerald-400 rounded-t" style={{ height: `${height}%` }}></div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span>Last 7 days</span>
              <span className="text-emerald-400">+23%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Your Orders</h2>

        {supplierOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-[var(--text-tertiary)] mb-3 opacity-50" />
            <p className="text-[var(--text-tertiary)]">No orders yet. Create your first order above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {supplierOrders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, gradient, isRevenue }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-[var(--border-default)] card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
        {change && (
          <div className="flex items-center gap-1 text-emerald-400 text-sm font-mono">
            <TrendingUp size={14} />
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-[var(--text-tertiary)] mb-1">{label}</p>
        <p className={`text-3xl font-bold ${isRevenue ? 'text-gradient-success' : 'text-[var(--text-primary)]'}`}>
          {value}
        </p>
      </div>
    </motion.div>
  );
}

function StatusItem({ label, count, color }: any) {
  const colors = {
    warning: 'bg-yellow-500',
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[color]}`}></div>
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">{count}</span>
    </div>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const statusConfig = {
    pending_approval: { label: 'Pending Approval', color: 'yellow', class: 'status-pending' },
    approved: { label: 'Approved', color: 'blue', class: 'status-approved' },
    in_transit: { label: 'In Transit', color: 'blue', class: 'status-in-transit' },
    delivered: { label: 'Delivered', color: 'purple', class: 'status-delivered' },
    payment_released: { label: 'Paid', color: 'green', class: 'status-paid' }
  };

  const status = statusConfig[order.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-strong rounded-xl p-4 border border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs text-[var(--text-tertiary)]">{order.id}</span>
        <div className="flex items-center gap-2">
          <div className={`status-dot ${status.class}`}></div>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{status.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Quantity</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{order.quantity} units</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
            Price <Lock size={10} />
          </p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">${order.price.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Created</p>
          <p className="text-sm font-mono text-[var(--text-secondary)]">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Location</p>
          <p className="text-sm font-mono text-[var(--text-secondary)]">
            {order.deliveryLocation.lat.toFixed(2)}, {order.deliveryLocation.lng.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
