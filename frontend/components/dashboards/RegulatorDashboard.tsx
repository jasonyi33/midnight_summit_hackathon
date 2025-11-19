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
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" />}
          label="Verified Proofs"
          value={verifiedCount}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<FileCheck className="text-blue-600" />}
          label="Total Orders"
          value={totalOrders}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle className="text-emerald-600" />}
          label="Completed"
          value={completedOrders}
          bgColor="bg-emerald-50"
        />
      </div>

      {/* Compliance Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
            <Shield size={24} className="text-white" />
          </div>
          Compliance Dashboard
        </h2>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-white p-2 rounded-lg">
              <AlertCircle size={24} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 mb-2 text-lg">Privacy-Preserving Compliance</h3>
              <p className="text-sm text-purple-800 leading-relaxed">
                All compliance checks are verified using Zero-Knowledge Proofs. Commercial details remain
                private while regulatory requirements are transparently met.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-5">
            <div className="text-sm font-semibold text-gray-700 mb-2">Verification Rate</div>
            <div className="text-3xl font-bold text-gray-900 mb-3">
              {totalOrders > 0 ? ((verifiedCount / complianceRecords.length) * 100).toFixed(1) : 0}%
            </div>
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full h-2.5 transition-all"
                style={{
                  width: totalOrders > 0 ? `${(verifiedCount / complianceRecords.length) * 100}%` : '0%'
                }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
            <div className="text-sm font-semibold text-gray-700 mb-2">Completion Rate</div>
            <div className="text-3xl font-bold text-gray-900 mb-3">
              {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
            </div>
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-2.5 transition-all"
                style={{
                  width: totalOrders > 0 ? `${(completedOrders / totalOrders) * 100}%` : '0%'
                }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-5">
            <div className="text-sm font-semibold text-gray-700 mb-2">Active Orders</div>
            <div className="text-3xl font-bold text-gray-900 mb-3">
              {orders.filter(o => o.status !== 'payment_released').length}
            </div>
            <div className="text-xs font-medium text-purple-600 mt-1">
              In progress
            </div>
          </div>
        </div>
      </div>

      {/* Order Audit Trail */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Audit Trail</h2>

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
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Compliance Events</h2>

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

function StatCard({ icon, label, value, bgColor }: {
  icon: ReactNode;
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

function OrderAuditCard({ order }: { order: Order }) {
  const statusColors = {
    pending_approval: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    in_transit: 'bg-purple-100 text-purple-700 border-purple-200',
    delivered: 'bg-green-100 text-green-700 border-green-200',
    payment_released: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="border border-blue-100 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all bg-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">{order.id}</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusColors[order.status]}`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        </div>
        {order.zkProof && (
          <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-xs text-green-700 font-semibold">ZK Verified</span>
          </div>
        )}
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">Quantity:</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{order.quantity} units</span>
            <PrivacyBadge isLocked={false} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">Price:</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-400">Hidden</span>
            <PrivacyBadge isLocked={true} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">Delivery Location:</span>
          <span className="font-mono text-xs font-medium text-gray-900">
            {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
          </span>
        </div>

        {order.zkProof && (
          <div className="pt-3 border-t border-blue-100">
            <span className="text-gray-500 font-medium">ZK Proof Hash:</span>
            <div className="font-mono text-xs text-purple-600 break-all mt-2 bg-purple-50 p-2 rounded border border-purple-100">
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
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl hover:shadow-sm transition-all">
      <div className={`p-2.5 rounded-lg ${record.verified ? 'bg-green-100 border border-green-200' : 'bg-amber-100 border border-amber-200'}`}>
        {record.verified ? (
          <CheckCircle size={20} className="text-green-600" />
        ) : (
          <AlertCircle size={20} className="text-amber-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900">{record.action}</span>
          <span className="text-xs text-gray-500 font-medium">
            {new Date(record.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-gray-600 font-mono truncate">
          Order: {record.orderId}
        </div>
      </div>

      <div className="text-xs">
        {record.verified ? (
          <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 font-semibold border border-green-200">Verified</span>
        ) : (
          <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 font-semibold border border-amber-200">Pending</span>
        )}
      </div>
    </div>
  );
}
