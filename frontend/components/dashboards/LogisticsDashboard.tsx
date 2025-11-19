'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import { Truck, MapPin, Navigation, Package } from 'lucide-react';
import DeliveryMap from '@/components/DeliveryMap';
import ConditionComposer from '@/components/ConditionComposer';

interface LogisticsDashboardProps {
  user: User;
  orders: Order[];
  onDelivery: (orderId: string, location: { lat: number; lng: number }) => void;
  onAddCondition: (orderId: string, payload: { description: string; role: User['role']; phase: 'logistics' }) => void;
}

export default function LogisticsDashboard({ user, orders, onDelivery, onAddCondition }: LogisticsDashboardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const activeOrders = orders.filter(
    order => order.status === 'approved' || order.status === 'in_transit'
  );
  const deliveredOrders = orders.filter(order => order.status === 'delivered' || order.status === 'payment_released');

  const handleSimulateDelivery = (order: Order) => {
    // Simulate reaching delivery location
    onDelivery(order.id, order.deliveryLocation);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Truck className="text-amber-600" />}
          label="Active Deliveries"
          value={activeOrders.length}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          icon={<Navigation className="text-blue-600" />}
          label="In Transit"
          value={orders.filter(o => o.status === 'in_transit').length}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={<Package className="text-green-600" />}
          label="Delivered"
          value={deliveredOrders.length}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={<MapPin className="text-purple-600" />}
          label="Total Orders"
          value={orders.length}
          accent="bg-slate-100 text-slate-700"
        />
      </div>

      <div className="card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Field Ops View</p>
            <h2 className="text-2xl font-semibold text-slate-900">GPS Delivery Tracker</h2>
            <p className="text-sm text-slate-500 mt-1">Monitor every approved route and confirm custody handoffs in one screen.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live telemetry
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Approvals will populate GPS traces in real time.
          </div>
        ) : (
          <DeliveryMap
            orders={activeOrders}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
          />
        )}
      </div>

      {activeOrders.length > 0 && (
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Live Routes</p>
              <h2 className="text-2xl font-semibold text-slate-900">Active Deliveries</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">{activeOrders.length} in motion</span>
          </div>

          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className={`border rounded-2xl p-6 transition-all cursor-pointer ${
                  selectedOrder?.id === order.id
                    ? 'border-amber-300 bg-amber-50/40 shadow-sm'
                    : 'border-slate-200 hover:border-amber-200 bg-white'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">{order.id}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        order.status === 'approved'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-purple-100 text-purple-700 border-purple-200'
                      }`}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-5 text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Quantity</span>
                        <span className="text-slate-900 font-semibold">{order.quantity} units</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Destination</span>
                        <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateDelivery(order);
                      }}
                      className="w-full bg-slate-900 text-white py-4 px-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin size={18} />
                      Confirm Delivery (Simulate GPS Arrival)
                    </button>

                    <div className="mt-4 space-y-2">
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
                        role="logistics"
                        phase="logistics"
                        onAddCondition={onAddCondition}
                        placeholder="Add logistics condition (e.g., chain-of-custody photo, temperature check)"
                        buttonLabel="Add logistics condition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Archive</p>
            <h2 className="text-2xl font-semibold text-slate-900">Delivery History</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">{deliveredOrders.length} completed</span>
        </div>

        {deliveredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Completed deliveries will surface here with timestamps and GPS confirmation.
          </div>
        ) : (
          <div className="space-y-4">
            {deliveredOrders.map((order) => (
              <div key={order.id} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">{order.id}</span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Delivered
                  </span>
                  {order.status === 'payment_released' && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-teal-50 text-teal-700 border-teal-200">
                      Paid
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700 block">Quantity</span>
                    <span className="text-slate-900 font-semibold">{order.quantity} units</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Delivered</span>
                    <span className="text-slate-900 font-semibold">
                      {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Location</span>
                    <span className="font-mono text-xs font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
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
                    role="logistics"
                    phase="logistics"
                    onAddCondition={onAddCondition}
                    placeholder="Note a retrospective logistics condition (e.g., route deviation explanation)"
                    buttonLabel="Add note"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode;
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
