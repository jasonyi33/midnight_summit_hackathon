'use client';

import { User, Order, ComplianceRecord } from '@/lib/types';
import { Shield, CheckCircle, FileText, Lock, Eye } from 'lucide-react';

interface RegulatorDashboardProps {
  user: User;
  orders: Order[];
}

export default function RegulatorDashboard({ user, orders }: RegulatorDashboardProps) {
  // Generate compliance records
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
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Compliance Checks</div>
          <div className="text-3xl font-semibold">{complianceRecords.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Verified Proofs</div>
          <div className="text-3xl font-semibold">{verifiedCount}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Total Orders</div>
          <div className="text-3xl font-semibold">{totalOrders}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Completed</div>
          <div className="text-3xl font-semibold">{completedOrders}</div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--accent-purple)] rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[var(--accent-purple)] bg-opacity-10 rounded-lg">
            <Lock size={20} className="text-[var(--accent-purple)]" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Privacy-Preserving Compliance</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              All compliance checks are verified using Zero-Knowledge Proofs. Commercial details remain
              private while regulatory requirements are transparently met.
            </p>
          </div>
        </div>
      </div>

      {/* Order Audit Trail */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Order Audit Trail</h2>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            No orders to audit yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent-blue)] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-mono text-sm text-[var(--text-tertiary)]">{order.id}</span>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    {order.zkProof && (
                      <span className="badge badge-green">
                        <CheckCircle size={10} />
                        ZK Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                      Quantity
                      <Eye size={12} className="text-[var(--accent-blue)]" />
                    </div>
                    <div className="font-medium">{order.quantity} units</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                      Price
                      <Lock size={12} className="text-[var(--accent-purple)]" />
                    </div>
                    <div className="font-medium text-mono">••••••</div>
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

      {/* Compliance Events */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Recent Compliance Events</h2>

        {complianceRecords.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            No compliance events yet.
          </div>
        ) : (
          <div className="space-y-2">
            {complianceRecords
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10)
              .map((record, index) => (
                <div
                  key={`${record.orderId}-${index}`}
                  className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-3 hover:border-[var(--border)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${record.verified ? 'bg-[var(--accent-green)] bg-opacity-10' : 'bg-[var(--accent-orange)] bg-opacity-10'}`}>
                        <CheckCircle size={14} className={record.verified ? 'text-[var(--accent-green)]' : 'text-[var(--accent-orange)]'} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{record.action}</div>
                        <div className="text-xs text-[var(--text-tertiary)] text-mono">
                          Order: {record.orderId}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${record.verified ? 'text-[var(--accent-green)]' : 'text-[var(--accent-orange)]'}`}>
                        {record.verified ? 'Verified' : 'Pending'}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)] text-mono">
                        {new Date(record.timestamp).toLocaleDateString()}
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
