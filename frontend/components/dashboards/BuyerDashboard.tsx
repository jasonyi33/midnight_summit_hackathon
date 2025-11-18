'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import {
  ShoppingCart,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  Lock,
  Shield,
  Sparkles,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

  const totalValue = buyerOrders
    .filter(o => o.status !== 'pending_approval')
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ShoppingCart />}
          label="Total Orders"
          value={buyerOrders.length}
          change="+8%"
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={<Clock />}
          label="Pending Review"
          value={pendingOrders.length}
          gradient="from-yellow-500 to-orange-600"
        />
        <StatCard
          icon={<CheckCircle />}
          label="Approved"
          value={buyerOrders.filter(o => o.status !== 'pending_approval').length}
          gradient="from-emerald-500 to-green-600"
        />
        <StatCard
          icon={<DollarSign />}
          label="Total Spend"
          value={`$${totalValue.toLocaleString()}`}
          change="+15%"
          gradient="from-purple-500 to-purple-700"
          isRevenue
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approvals - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {pendingOrders.length > 0 ? (
            <>
              <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600">
                    <Eye size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Pending Approvals</h2>
                    <p className="text-sm text-[var(--text-tertiary)]">{pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} awaiting review</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {pendingOrders.map((order, index) => (
                    <PendingOrderCard
                      key={order.id}
                      order={order}
                      index={index}
                      onApprove={handleApprove}
                      generatingProof={generatingProof && selectedOrder?.id === order.id}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl p-12 border border-[var(--border-default)] text-center">
              <CheckCheck size={48} className="mx-auto text-[var(--accent-success)] mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">All Caught Up!</h3>
              <p className="text-[var(--text-tertiary)]">No pending orders to review</p>
            </div>
          )}
        </div>

        {/* ZK Proof Info Sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-[var(--accent-primary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Zero-Knowledge Proofs</h3>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mb-4">
              Approve orders without revealing sensitive pricing data. ZK proofs verify compliance while maintaining privacy.
            </p>
            <div className="space-y-2">
              <InfoItem label="Privacy" value="100%" color="success" />
              <InfoItem label="Security" value="Verified" color="primary" />
              <InfoItem label="Compliance" value="Active" color="purple" />
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Order Distribution</h3>
            <div className="space-y-3">
              <StatusItem label="Pending" count={pendingOrders.length} color="warning" />
              <StatusItem label="Approved" count={buyerOrders.filter(o => o.status === 'approved').length} color="primary" />
              <StatusItem label="In Transit" count={buyerOrders.filter(o => o.status === 'in_transit').length} color="primary" />
              <StatusItem label="Delivered" count={buyerOrders.filter(o => o.status === 'delivered').length} color="purple" />
              <StatusItem label="Completed" count={buyerOrders.filter(o => o.status === 'payment_released').length} color="success" />
            </div>
          </div>
        </div>
      </div>

      {/* ZK Proof Generator Animation */}
      <AnimatePresence>
        {generatingProof && selectedOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <ZKProofGenerator order={selectedOrder} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Orders */}
      <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">All Orders</h2>

        {buyerOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={48} className="mx-auto text-[var(--text-tertiary)] mb-3 opacity-50" />
            <p className="text-[var(--text-tertiary)]">No orders yet. Start by reviewing pending orders!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {buyerOrders.map((order, index) => (
              <BuyerOrderCard
                key={order.id}
                order={order}
                index={index}
                isExpanded={expandedOrderId === order.id}
                onToggle={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              />
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

function PendingOrderCard({ order, index, onApprove, generatingProof }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-strong rounded-xl p-5 border border-yellow-500/30 bg-yellow-500/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <AlertCircle size={20} className="text-yellow-400" />
          </div>
          <div>
            <span className="font-mono text-xs text-[var(--text-tertiary)] block">{order.id}</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="status-dot status-pending"></div>
              <span className="text-xs font-semibold text-yellow-400">Awaiting Approval</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {/* Quantity - Visible */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Quantity:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">{order.quantity} units</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
              <EyeOff size={10} className="text-blue-400" />
              <span className="text-xs text-blue-400">Visible</span>
            </div>
          </div>
        </div>

        {/* Price - Hidden with ZK */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Price:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-[var(--text-tertiary)]">••••••</span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Lock size={10} className="text-purple-400" />
              <span className="text-xs text-purple-400">ZK Protected</span>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="glass rounded-lg p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">Delivery Location</span>
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Approve Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onApprove(order)}
        disabled={generatingProof}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generatingProof ? (
          <>
            <div className="spinner w-4 h-4 border-2 border-white/30 border-t-white"></div>
            Generating ZK Proof...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Approve with ZK Proof
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

function BuyerOrderCard({ order, index, isExpanded, onToggle }: any) {
  const statusConfig = {
    pending_approval: { label: 'Pending Approval', color: 'yellow', class: 'status-pending' },
    approved: { label: 'Approved', color: 'blue', class: 'status-approved' },
    in_transit: { label: 'In Transit', color: 'blue', class: 'status-in-transit' },
    delivered: { label: 'Delivered', color: 'purple', class: 'status-delivered' },
    payment_released: { label: 'Completed', color: 'green', class: 'status-paid' }
  };

  const status = statusConfig[order.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-strong rounded-xl p-4 border border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-all group cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--text-tertiary)]">{order.id}</span>
          <div className="flex items-center gap-2">
            <div className={`status-dot ${status.class}`}></div>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">{status.label}</span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Eye size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--accent-primary)]" />
        </motion.div>
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
          <p className="text-sm font-mono text-[var(--text-tertiary)]">••••••</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Created</p>
          <p className="text-sm font-mono text-[var(--text-secondary)]">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">ZK Proof</p>
          {order.zkProof ? (
            <div className="flex items-center gap-1">
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Verified</span>
            </div>
          ) : (
            <span className="text-xs text-[var(--text-tertiary)]">N/A</span>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-3">
              <div className="glass rounded-lg p-3">
                <p className="text-xs text-[var(--text-tertiary)] mb-2">Delivery Location</p>
                <p className="font-mono text-sm text-[var(--text-secondary)]">
                  Lat: {order.deliveryLocation.lat.toFixed(6)}, Lng: {order.deliveryLocation.lng.toFixed(6)}
                </p>
              </div>
              {order.zkProof && (
                <div className="glass rounded-lg p-3">
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">Zero-Knowledge Proof Hash</p>
                  <p className="font-mono text-xs text-emerald-400 break-all">{order.zkProof}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

function InfoItem({ label, value, color }: any) {
  const colors = {
    success: 'text-emerald-400',
    primary: 'text-blue-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      <span className={`text-xs font-semibold ${colors[color]}`}>{value}</span>
    </div>
  );
}
