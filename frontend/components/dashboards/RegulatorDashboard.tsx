'use client';

import type { ReactNode } from 'react';
import { User, Order, ComplianceRecord } from '@/lib/types';
import { Shield, FileCheck, AlertCircle, CheckCircle } from 'lucide-react';
import PrivacyBadge from '@/components/PrivacyBadge';

interface RegulatorDashboardProps {
  user: User;
  orders: Order[];
}

export default function RegulatorDashboard({ user, orders }: RegulatorDashboardProps) {
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
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Shield className="text-purple-600" />}
          label="Total Compliance Checks"
          value={complianceRecords.length}
          bgColor="bg-gradient-to-br from-purple-50 to-fuchsia-50"
          iconBg="bg-gradient-to-br from-purple-500 to-fuchsia-600"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" />}
          label="Verified Proofs"
          value={verifiedCount}
          bgColor="bg-gradient-to-br from-green-50 to-teal-50"
          iconBg="bg-gradient-to-br from-green-500 to-teal-600"
        />
        <StatCard
          icon={<FileCheck className="text-blue-600" />}
          label="Total Orders"
          value={totalOrders}
          bgColor="bg-gradient-to-br from-blue-50 to-cyan-50"
          iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
        />
        <StatCard
          icon={<CheckCircle className="text-emerald-600" />}
          label="Completed"
          value={completedOrders}
          bgColor="bg-gradient-to-br from-emerald-50 to-green-50"
          iconBg="bg-gradient-to-br from-emerald-500 to-green-600"
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

      {/* Order Audit Trail */}
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-white rounded-2xl shadow-xl border-2 border-blue-200 p-8">
        <h2 className="text-3xl font-black bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-6">Order Audit Trail</h2>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="text-blue-600" size={32} />
            </div>
            <p className="text-gray-600 text-lg">No orders to audit yet</p>
            <p className="text-gray-500 text-sm mt-1">Orders will appear here for compliance review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderAuditCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Compliance Timeline */}
      <div className="bg-gradient-to-br from-white via-green-50/20 to-white rounded-2xl shadow-xl border-2 border-green-200 p-8">
        <h2 className="text-3xl font-black bg-gradient-to-r from-green-700 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-6">Recent Compliance Events</h2>

        {complianceRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="text-blue-600" size={32} />
            </div>
            <p className="text-gray-600 text-lg">No compliance events yet</p>
            <p className="text-gray-500 text-sm mt-1">Compliance activities will be logged here</p>
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

function StatCard({ icon, label, value, bgColor, iconBg }: {
  icon: ReactNode;
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

function OrderAuditCard({ order }: { order: Order }) {
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
      <div className="relative flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-lg shadow-sm">{order.id}</span>
            <span className={`px-4 py-2 rounded-xl text-xs font-black border-2 shadow-sm ${statusColors[order.status]}`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        </div>
        {order.zkProof && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-xl border-2 border-green-300 shadow-sm">
            <CheckCircle size={18} className="text-green-700" />
            <span className="text-xs text-green-800 font-black">ZK VERIFIED</span>
          </div>
        )}
      </div>

      <div className="relative space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-bold">Quantity:</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-900 text-base">{order.quantity} units</span>
            <PrivacyBadge isLocked={false} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-bold">Price:</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-400 text-base">████████</span>
            <PrivacyBadge isLocked={true} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-bold">Delivery Location:</span>
          <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-md">
            {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
          </span>
        </div>

        {order.zkProof && (
          <div className="pt-4 border-t-2 border-purple-200">
            <span className="text-gray-700 font-black text-xs uppercase tracking-wide">ZK Proof Hash:</span>
            <div className="font-mono text-xs text-purple-700 break-all mt-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 p-3 rounded-lg border-2 border-purple-200 shadow-sm">
              {order.zkProof}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComplianceEventCard({ record }: { record: ComplianceRecord }) {
  return (
    <div className="relative overflow-hidden flex items-center gap-4 p-5 bg-gradient-to-r from-green-50 via-emerald-50/50 to-white border-2 border-green-200 rounded-2xl hover:shadow-lg hover:border-green-300 transition-all duration-300 group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-full blur-xl group-hover:w-32 group-hover:h-32 transition-all"></div>
      <div className={`relative p-3 rounded-xl shadow-md ${record.verified ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300' : 'bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300'}`}>
        {record.verified ? (
          <CheckCircle size={22} className="text-green-700" />
        ) : (
          <AlertCircle size={22} className="text-amber-700" />
        )}
      </div>

      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-black text-sm text-gray-900">{record.action}</span>
          <span className="text-xs text-gray-600 font-bold bg-gray-100 px-2 py-1 rounded-md">
            {new Date(record.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-gray-700 font-mono font-bold truncate bg-gray-50 px-2 py-1 rounded inline-block">
          Order: {record.orderId}
        </div>
      </div>

      <div className="relative text-xs">
        {record.verified ? (
          <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-black border-2 border-green-300 shadow-sm">VERIFIED</span>
        ) : (
          <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 font-black border-2 border-amber-300 shadow-sm">PENDING</span>
        )}
      </div>
    </div>
  );
}
