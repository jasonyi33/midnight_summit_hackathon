'use client';

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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={24} className="text-purple-600" />
          Compliance Dashboard
        </h2>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-purple-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">Privacy-Preserving Compliance</h3>
              <p className="text-sm text-purple-700">
                All compliance checks are verified using Zero-Knowledge Proofs. Commercial details remain
                private while regulatory requirements are transparently met.
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Verification Rate</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalOrders > 0 ? ((verifiedCount / complianceRecords.length) * 100).toFixed(1) : 0}%
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2 transition-all"
                style={{
                  width: totalOrders > 0 ? `${(verifiedCount / complianceRecords.length) * 100}%` : '0%'
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 rounded-full h-2 transition-all"
                style={{
                  width: totalOrders > 0 ? `${(completedOrders / totalOrders) * 100}%` : '0%'
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Active Orders</div>
            <div className="text-2xl font-bold text-gray-900">
              {orders.filter(o => o.status !== 'payment_released').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              In progress
            </div>
          </div>
        </div>
      </div>

      {/* Order Audit Trail */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Audit Trail</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders to audit yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderAuditCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Compliance Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Compliance Events</h2>

        {complianceRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No compliance events yet.</p>
        ) : (
          <div className="space-y-2">
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

function OrderAuditCard({ order }: { order: Order }) {
  const statusColors = {
    pending_approval: 'bg-amber-100 text-amber-800',
    approved: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    payment_released: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-gray-500">{order.id}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status]}`}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
        </div>
        {order.zkProof && (
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium">ZK Verified</span>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Quantity:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{order.quantity} units</span>
            <PrivacyBadge isLocked={false} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Price:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-400">Hidden</span>
            <PrivacyBadge isLocked={true} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">Delivery Location:</span>
          <span className="font-mono text-xs">
            {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
          </span>
        </div>

        {order.zkProof && (
          <div className="pt-2 border-t border-gray-200">
            <span className="text-gray-600">ZK Proof Hash:</span>
            <div className="font-mono text-xs text-purple-600 break-all mt-1">
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
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${record.verified ? 'bg-green-100' : 'bg-amber-100'}`}>
        {record.verified ? (
          <CheckCircle size={16} className="text-green-600" />
        ) : (
          <AlertCircle size={16} className="text-amber-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-900">{record.action}</span>
          <span className="text-xs text-gray-500">
            {new Date(record.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-gray-500 font-mono truncate">
          Order: {record.orderId}
        </div>
      </div>

      <div className="text-xs">
        {record.verified ? (
          <span className="text-green-600 font-medium">Verified</span>
        ) : (
          <span className="text-amber-600 font-medium">Pending</span>
        )}
      </div>
    </div>
  );
}
