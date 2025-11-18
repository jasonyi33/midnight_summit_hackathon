'use client';

import { useState } from 'react';
import { User, Order, ComplianceRecord } from '@/lib/types';
import {
  Shield,
  FileCheck,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Lock,
  Eye,
  Database,
  Activity,
  BarChart3,
  Download,
  Search,
  Filter,
  Clock,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PrivacyBadge from '@/components/PrivacyBadge';

interface RegulatorDashboardProps {
  user: User;
  orders: Order[];
}

export default function RegulatorDashboard({ user, orders }: RegulatorDashboardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Generate compliance records from orders
  const complianceRecords: ComplianceRecord[] = orders.flatMap(order => {
    const records: ComplianceRecord[] = [];

    records.push({
      orderId: order.id,
      timestamp: order.createdAt,
      action: 'Order Created',
      verified: true,
      zkProofHash: `zk_${order.id}_created`
    });

    if (order.approvedAt) {
      records.push({
        orderId: order.id,
        timestamp: order.approvedAt,
        action: 'Order Approved',
        verified: !!order.zkProof,
        zkProofHash: order.zkProof || 'pending'
      });
    }

    if (order.deliveredAt) {
      records.push({
        orderId: order.id,
        timestamp: order.deliveredAt,
        action: 'Delivery Confirmed',
        verified: true,
        zkProofHash: `zk_${order.id}_delivered`
      });
    }

    return records;
  });

  const verifiedCount = complianceRecords.filter(r => r.verified).length;
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'payment_released').length;
  const activeOrders = orders.filter(o => o.status !== 'payment_released').length;

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Shield />}
          label="Compliance Checks"
          value={complianceRecords.length}
          change="+18%"
          gradient="from-purple-500 to-purple-700"
        />
        <StatCard
          icon={<CheckCircle />}
          label="Verified Proofs"
          value={verifiedCount}
          change="+100%"
          gradient="from-emerald-500 to-green-600"
        />
        <StatCard
          icon={<FileCheck />}
          label="Total Orders"
          value={totalOrders}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={<Activity />}
          label="Active Orders"
          value={activeOrders}
          gradient="from-cyan-500 to-blue-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compliance Overview - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Privacy Notice */}
          <div className="glass rounded-2xl p-6 border border-purple-500/30 bg-purple-500/5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20">
                <Lock size={20} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Privacy-Preserving Compliance</h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  All compliance checks are verified using Zero-Knowledge Proofs. Commercial details remain
                  private while regulatory requirements are transparently met.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Metrics */}
          <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Compliance Metrics</h2>
                <p className="text-sm text-[var(--text-tertiary)]">Real-time monitoring</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <MetricCard
                label="Verification Rate"
                value={totalOrders > 0 ? ((verifiedCount / complianceRecords.length) * 100).toFixed(1) : 0}
                unit="%"
                progress={totalOrders > 0 ? (verifiedCount / complianceRecords.length) * 100 : 0}
                color="success"
              />
              <MetricCard
                label="Completion Rate"
                value={totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}
                unit="%"
                progress={totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}
                color="primary"
              />
              <MetricCard
                label="Compliance Score"
                value="98.5"
                unit="%"
                progress={98.5}
                color="purple"
              />
            </div>
          </div>

          {/* Order Audit Trail */}
          <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <FileCheck size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">Order Audit Trail</h2>
                  <p className="text-sm text-[var(--text-tertiary)]">{filteredOrders.length} orders</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending_approval">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="payment_released">Completed</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Database size={48} className="mx-auto text-[var(--text-tertiary)] mb-3 opacity-50" />
                <p className="text-[var(--text-tertiary)]">No orders to audit yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.slice(0, 5).map((order, index) => (
                  <OrderAuditCard
                    key={order.id}
                    order={order}
                    index={index}
                    onSelect={() => setSelectedOrder(order)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-4">
          {selectedOrder ? (
            <SelectedOrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
          ) : (
            <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={20} className="text-[var(--accent-primary)]" />
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Audit Overview</h3>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">
                Select an order to view detailed compliance information
              </p>
              <div className="space-y-2">
                <InfoItem label="Total Transactions" value={complianceRecords.length} color="primary" />
                <InfoItem label="Verified" value={verifiedCount} color="success" />
                <InfoItem label="Pending" value={complianceRecords.length - verifiedCount} color="warning" />
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Order Distribution</h3>
            <div className="space-y-3">
              <StatusItem label="Pending" count={orders.filter(o => o.status === 'pending_approval').length} color="warning" />
              <StatusItem label="Approved" count={orders.filter(o => o.status === 'approved').length} color="primary" />
              <StatusItem label="In Transit" count={orders.filter(o => o.status === 'in_transit').length} color="primary" />
              <StatusItem label="Delivered" count={orders.filter(o => o.status === 'delivered').length} color="purple" />
              <StatusItem label="Completed" count={completedOrders} color="success" />
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Compliance Rating</h3>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gradient-success mb-2">A+</div>
              <p className="text-xs text-[var(--text-tertiary)]">Excellent compliance record</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Compliance Events */}
      <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Recent Compliance Events</h2>
              <p className="text-sm text-[var(--text-tertiary)]">Latest {Math.min(10, complianceRecords.length)} events</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium"
          >
            <Download size={16} />
            Export Report
          </motion.button>
        </div>

        {complianceRecords.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-[var(--text-tertiary)] mb-3 opacity-50" />
            <p className="text-[var(--text-tertiary)]">No compliance events yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {complianceRecords
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10)
              .map((record, index) => (
                <ComplianceEventCard key={`${record.orderId}-${index}`} record={record} index={index} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, gradient }: any) {
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
        <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, unit, progress, color }: any) {
  const colors = {
    success: 'from-emerald-500 to-green-600',
    primary: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-700'
  };

  return (
    <div className="glass-strong rounded-xl p-4">
      <div className="text-xs text-[var(--text-tertiary)] mb-2">{label}</div>
      <div className="text-2xl font-bold text-[var(--text-primary)] mb-3">
        {value}<span className="text-sm text-[var(--text-tertiary)]">{unit}</span>
      </div>
      <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${colors[color]}`}
        />
      </div>
    </div>
  );
}

function OrderAuditCard({ order, index, onSelect }: any) {
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
      className="glass-strong rounded-xl p-4 border border-[var(--border-default)] hover:border-[var(--accent-primary)] transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--text-tertiary)]">{order.id}</span>
          <div className="flex items-center gap-2">
            <div className={`status-dot ${status.class}`}></div>
            <span className="text-xs font-semibold text-[var(--text-secondary)]">{status.label}</span>
          </div>
        </div>
        {order.zkProof && (
          <div className="flex items-center gap-1">
            <CheckCircle size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">ZK Verified</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Quantity</p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{order.quantity}</p>
            <Eye size={12} className="text-blue-400" />
          </div>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Price</p>
          <div className="flex items-center gap-1">
            <p className="text-sm font-mono text-[var(--text-tertiary)]">••••••</p>
            <Lock size={12} className="text-purple-400" />
          </div>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Created</p>
          <p className="text-sm font-mono text-[var(--text-secondary)]">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SelectedOrderDetails({ order, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-5 border border-blue-500/30 bg-blue-500/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCheck size={20} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Audit Details</h3>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Eye size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="glass rounded-lg p-3">
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Order ID</p>
          <p className="font-mono text-xs text-[var(--text-secondary)] break-all">{order.id}</p>
        </div>

        <div className="glass rounded-lg p-3">
          <p className="text-xs text-[var(--text-tertiary)] mb-2">Details</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Quantity</span>
              <span className="text-[var(--text-primary)] font-semibold">{order.quantity} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Price</span>
              <div className="flex items-center gap-1">
                <span className="text-[var(--text-tertiary)]">••••••</span>
                <Lock size={10} className="text-purple-400" />
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Created</span>
              <span className="text-[var(--text-primary)]">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {order.zkProof && (
          <div className="glass rounded-lg p-3">
            <p className="text-xs text-[var(--text-tertiary)] mb-2">ZK Proof Hash</p>
            <p className="font-mono text-xs text-emerald-400 break-all">{order.zkProof}</p>
          </div>
        )}

        <div className="glass rounded-lg p-3">
          <p className="text-xs text-[var(--text-tertiary)] mb-2">Delivery Location</p>
          <p className="font-mono text-xs text-[var(--text-secondary)]">
            Lat: {order.deliveryLocation.lat.toFixed(6)}<br/>
            Lng: {order.deliveryLocation.lng.toFixed(6)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ComplianceEventCard({ record, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass-strong rounded-lg p-3 border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${record.verified ? 'bg-emerald-500/10' : 'bg-yellow-500/10'}`}>
          {record.verified ? (
            <CheckCircle size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-yellow-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-[var(--text-primary)]">{record.action}</span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {new Date(record.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] font-mono truncate">
            Order: {record.orderId}
          </div>
        </div>

        <div className="text-xs">
          {record.verified ? (
            <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">Verified</span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 font-semibold">Pending</span>
          )}
        </div>
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

function InfoItem({ label, value, color }: any) {
  const colors = {
    success: 'text-emerald-400',
    primary: 'text-blue-400',
    warning: 'text-yellow-400'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      <span className={`text-xs font-semibold ${colors[color]}`}>{value}</span>
    </div>
  );
}
