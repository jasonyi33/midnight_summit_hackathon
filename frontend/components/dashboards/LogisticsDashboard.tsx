'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import { Truck, MapPin, CheckCircle, Loader2 } from 'lucide-react';

interface LogisticsDashboardProps {
  user: User;
  orders: Order[];
  onDelivery: (orderId: string, location: { lat: number; lng: number }) => void;
}

export default function LogisticsDashboard({ user, orders, onDelivery }: LogisticsDashboardProps) {
  const [confirmingDelivery, setConfirmingDelivery] = useState<string | null>(null);

  const activeOrders = orders.filter(
    order => order.status === 'approved' || order.status === 'in_transit'
  );
  const deliveredOrders = orders.filter(order => order.status === 'delivered' || order.status === 'payment_released');
  const inTransit = orders.filter(o => o.status === 'in_transit');

  const handleConfirmDelivery = async (order: Order) => {
    setConfirmingDelivery(order.id);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onDelivery(order.id, order.deliveryLocation);
    setConfirmingDelivery(null);
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Active Deliveries</div>
          <div className="text-3xl font-semibold">{activeOrders.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">In Transit</div>
          <div className="text-3xl font-semibold">{inTransit.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Delivered</div>
          <div className="text-3xl font-semibold">{deliveredOrders.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-[var(--text-secondary)] mb-1">Total Routes</div>
          <div className="text-3xl font-semibold">{orders.length}</div>
        </div>
      </div>

      {/* Active Deliveries */}
      {activeOrders.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Active Deliveries</h2>

          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-mono text-sm text-[var(--text-tertiary)]">{order.id}</span>
                  <span className={`badge ${order.status === 'in_transit' ? 'badge-blue' : 'badge-orange'}`}>
                    {order.status === 'approved' ? 'Awaiting Pickup' : 'In Transit'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Quantity</div>
                    <div className="font-medium">{order.quantity} units</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Destination</div>
                    <div className="font-medium text-mono text-xs">
                      {order.deliveryLocation.lat.toFixed(2)}, {order.deliveryLocation.lng.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Created</div>
                    <div className="font-medium text-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleConfirmDelivery(order)}
                  disabled={confirmingDelivery === order.id}
                  className="btn btn-primary w-full md:w-auto"
                >
                  {confirmingDelivery === order.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <MapPin size={16} />
                      Confirm Delivery
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery History */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Delivery History</h2>

        {deliveredOrders.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-tertiary)]">
            No completed deliveries yet.
          </div>
        ) : (
          <div className="space-y-3">
            {deliveredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent-green)] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-mono text-sm text-[var(--text-tertiary)]">{order.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-purple">Delivered</span>
                    {order.status === 'payment_released' && (
                      <span className="badge badge-green">Paid</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Quantity</div>
                    <div className="font-medium">{order.quantity} units</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Delivered</div>
                    <div className="font-medium text-mono">
                      {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Location</div>
                    <div className="font-medium text-mono text-xs">
                      {order.deliveryLocation.lat.toFixed(2)}, {order.deliveryLocation.lng.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-tertiary)] mb-1">Status</div>
                    <div className="flex items-center gap-1 text-[var(--accent-green)]">
                      <CheckCircle size={14} />
                      <span className="text-xs font-medium">Complete</span>
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
