'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import { Truck, MapPin, Navigation, Package } from 'lucide-react';
import DeliveryMap from '@/components/DeliveryMap';

interface LogisticsDashboardProps {
  user: User;
  orders: Order[];
  onDelivery: (orderId: string, location: { lat: number; lng: number }) => void;
}

export default function LogisticsDashboard({ user, orders, onDelivery }: LogisticsDashboardProps) {
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
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Truck className="text-amber-600" />}
          label="Active Deliveries"
          value={activeOrders.length}
          bgColor="bg-amber-50"
        />
        <StatCard
          icon={<Navigation className="text-blue-600" />}
          label="In Transit"
          value={orders.filter(o => o.status === 'in_transit').length}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<Package className="text-green-600" />}
          label="Delivered"
          value={deliveredOrders.length}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<MapPin className="text-purple-600" />}
          label="Total Orders"
          value={orders.length}
          bgColor="bg-purple-50"
        />
      </div>

      {/* Map View */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg">
            <MapPin size={24} className="text-white" />
          </div>
          GPS Delivery Tracker
        </h2>

        {activeOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Truck size={40} className="text-blue-600" />
            </div>
            <p className="text-gray-600 text-lg font-medium">No active deliveries</p>
            <p className="text-gray-500 text-sm mt-1">Deliveries will appear here when orders are approved</p>
          </div>
        ) : (
          <DeliveryMap
            orders={activeOrders}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
          />
        )}
      </div>

      {/* Active Deliveries */}
      {activeOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Deliveries</h2>

          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className={`border-2 rounded-xl p-6 transition-all cursor-pointer ${
                  selectedOrder?.id === order.id
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-white shadow-md'
                    : 'border-blue-100 hover:border-amber-200 hover:shadow-md bg-white'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md">{order.id}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        order.status === 'approved'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-purple-100 text-purple-700 border-purple-200'
                      }`}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-sm mb-5">
                      <div>
                        <span className="text-gray-500 font-medium">Quantity:</span>
                        <span className="ml-2 font-bold text-gray-900">{order.quantity} units</span>
                      </div>
                      <div>
                        <span className="text-gray-500 font-medium">Destination:</span>
                        <span className="ml-2 font-mono text-xs font-medium text-gray-900">
                          {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateDelivery(order);
                      }}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 px-4 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                      <MapPin size={18} />
                      Confirm Delivery (Simulate GPS Arrival)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery History */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery History</h2>

        {deliveredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="text-blue-600" size={32} />
            </div>
            <p className="text-gray-600 text-lg">No completed deliveries yet</p>
            <p className="text-gray-500 text-sm mt-1">Completed deliveries will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveredOrders.map((order) => (
              <div key={order.id} className="border border-blue-100 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-md">{order.id}</span>
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                    DELIVERED
                  </span>
                  {order.status === 'payment_released' && (
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200">
                      PAID
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 font-medium">Quantity:</span>
                    <span className="ml-2 font-bold text-gray-900">{order.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Delivered:</span>
                    <span className="ml-2 font-bold text-gray-900">
                      {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Location:</span>
                    <span className="ml-2 font-mono text-xs font-medium text-gray-900">
                      {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                    </span>
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

function StatCard({ icon, label, value, bgColor }: {
  icon: React.ReactNode;
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
