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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin size={24} className="text-amber-600" />
          GPS Delivery Tracker
        </h2>

        {activeOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Truck size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No active deliveries</p>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Deliveries</h2>

          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  selectedOrder?.id === order.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-gray-500">{order.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {order.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <span className="ml-2 font-medium">{order.quantity} units</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Destination:</span>
                        <span className="ml-2 font-mono text-xs">
                          {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSimulateDelivery(order);
                      }}
                      className="w-full bg-amber-600 text-white py-2 px-4 rounded-md font-medium hover:bg-amber-700 transition-colors"
                    >
                      <MapPin size={16} className="inline mr-2" />
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery History</h2>

        {deliveredOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No completed deliveries yet.</p>
        ) : (
          <div className="space-y-3">
            {deliveredOrders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-gray-500">{order.id}</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    DELIVERED
                  </span>
                  {order.status === 'payment_released' && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      PAID
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Quantity:</span>
                    <span className="ml-2 font-medium">{order.quantity} units</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Delivered:</span>
                    <span className="ml-2 font-medium">
                      {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-mono text-xs">
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
