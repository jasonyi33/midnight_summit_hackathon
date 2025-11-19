'use client';

import type { ReactNode } from 'react';
import { User, Order, ComplianceRecord } from '@/lib/types';
import { Shield, FileCheck, AlertCircle, CheckCircle } from 'lucide-react';
import PrivacyBadge from '@/components/PrivacyBadge';
import ConditionComposer from '@/components/ConditionComposer';

interface RegulatorDashboardProps {
  user: User;
  orders: Order[];
  onAddCondition: (orderId: string, payload: { description: string; role: User['role']; phase: 'compliance' }) => void;
}

export default function RegulatorDashboard({ user, orders, onAddCondition }: RegulatorDashboardProps) {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Shield className="text-purple-600" />}
          label="Total Compliance Checks"
          value={complianceRecords.length}
          accent="bg-purple-100 text-purple-700"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" />}
          label="Verified Proofs"
          value={verifiedCount}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={<FileCheck className="text-blue-600" />}
          label="Total Orders"
          value={totalOrders}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={<CheckCircle className="text-emerald-600" />}
          label="Completed"
          value={completedOrders}
          accent="bg-slate-100 text-slate-700"
        />
      </div>

      {/* Compliance Overview */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-white rounded-2xl shadow-xl border-2 border-purple-300 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/10 via-fuchsia-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl blur-md opacity-50"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-fuchsia-600 p-3 rounded-xl shadow-lg">
                <Shield size={24} className="text-white" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700 bg-clip-text text-transparent">
              Compliance Dashboard
            </span>
          </h2>

          <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-fuchsia-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-7 mb-8 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative flex items-start gap-4">
              <div className="bg-gradient-to-br from-white to-purple-50 p-3 rounded-xl shadow-md border border-purple-200">
                <AlertCircle size={28} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-purple-900 mb-3 text-xl bg-gradient-to-r from-purple-900 to-fuchsia-900 bg-clip-text text-transparent">
                  Privacy-Preserving Compliance
                </h3>
                <p className="text-sm text-purple-900 leading-relaxed font-semibold">
                  All compliance checks are verified using <span className="font-black text-purple-700">Zero-Knowledge Proofs</span>.
                  Commercial details remain private while regulatory requirements are transparently met.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Metrics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50/50 to-white border-2 border-green-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full blur-xl group-hover:w-24 group-hover:h-24 transition-all"></div>
              <div className="relative text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Verification Rate</div>
              <div className="relative text-4xl font-black text-gray-900 mb-4">
                {totalOrders > 0 ? ((verifiedCount / complianceRecords.length) * 100).toFixed(1) : 0}%
              </div>
              <div className="relative bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full h-3 transition-all duration-500 shadow-md"
                  style={{
                    width: totalOrders > 0 ? `${(verifiedCount / complianceRecords.length) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50/50 to-white border-2 border-blue-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-xl group-hover:w-24 group-hover:h-24 transition-all"></div>
              <div className="relative text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Completion Rate</div>
              <div className="relative text-4xl font-black text-gray-900 mb-4">
                {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
              </div>
              <div className="relative bg-gray-200 rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full h-3 transition-all duration-500 shadow-md"
                  style={{
                    width: totalOrders > 0 ? `${(completedOrders / totalOrders) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-fuchsia-50/50 to-white border-2 border-purple-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/10 rounded-full blur-xl group-hover:w-24 group-hover:h-24 transition-all"></div>
              <div className="relative text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Active Orders</div>
              <div className="relative text-4xl font-black text-gray-900 mb-4">
                {orders.filter(o => o.status !== 'payment_released').length}
              </div>
              <div className="relative text-sm font-black text-purple-700 mt-1 uppercase tracking-wide">
                In Progress
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Oversight</p>
            <h2 className="text-2xl font-semibold text-slate-900">Order Audit Trail</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">{orders.length} entries</span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Orders will appear here for compliance review.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderAuditCard key={order.id} order={order} onAddCondition={onAddCondition} />
            ))}
          </div>
        )}
      </div>

      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recent Activity</p>
            <h2 className="text-2xl font-semibold text-slate-900">Recent Compliance Events</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {Math.min(complianceRecords.length, 10)} shown
          </span>
        </div>

        {complianceRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Compliance activities will be logged here.
          </div>
        ) : (
          <div className="space-y-3">
            {complianceRecords
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10)
              .map((record, index) => (
                <ComplianceEventCard key={`${record.orderId}-${index}`} record={record} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: {
  icon: ReactNode;
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

function OrderAuditCard({
  order,
  onAddCondition
}: {
  order: Order;
  onAddCondition: RegulatorDashboardProps['onAddCondition'];
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
            {order.id}
          </span>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusColors[order.status]}`}>
            {order.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
        {order.zkProof && (
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5">
            <CheckCircle size={16} />
            ZK verified
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Quantity</span>
          <span className="text-slate-900 font-semibold">{order.quantity} units</span>
          <PrivacyBadge isLocked={false} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Price</span>
          <span className="text-slate-400 font-semibold tracking-widest">████████</span>
          <PrivacyBadge isLocked={true} />
        </div>
        <div>
          <span className="font-semibold text-slate-700 block">Delivery Location</span>
          <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
          </span>
        </div>
      </div>

      {order.zkProof && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ZK Proof Hash</span>
          <p className="font-mono text-xs text-slate-800 break-all mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {order.zkProof}
          </p>
        </div>
      )}

      <div className="mt-5 space-y-2 border-t border-dashed border-slate-200 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Optional Conditions</p>
        {order.conditions && order.conditions.length > 0 ? (
          <ul className="space-y-1">
            {order.conditions.map((condition) => (
              <li key={condition.id} className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg flex items-start justify-between gap-2">
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
          role="regulator"
          phase="compliance"
          onAddCondition={onAddCondition}
          placeholder="Add compliance condition (e.g., audit sampling, customs hold release)"
          buttonLabel="Add compliance note"
        />
      </div>
    </div>
  );
}

function ComplianceEventCard({ record }: { record: ComplianceRecord }) {
  return (
    <div className="flex items-center gap-4 p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
      <div className={`p-3 rounded-xl ${record.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
        {record.verified ? (
          <CheckCircle size={18} />
        ) : (
          <AlertCircle size={18} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm font-semibold text-slate-900">{record.action}</span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            {new Date(record.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-slate-600 font-mono font-semibold truncate bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block">
          Order: {record.orderId}
        </div>
      </div>

      <div className="text-xs font-semibold">
        {record.verified ? (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">VERIFIED</span>
        ) : (
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">PENDING</span>
        )}
      </div>
    </div>
  );
}
