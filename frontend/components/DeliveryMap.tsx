'use client';

import { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import { MapPin, Navigation } from 'lucide-react';

interface DeliveryMapProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
}

export default function DeliveryMap({ orders, selectedOrder, onSelectOrder }: DeliveryMapProps) {
  // Simple canvas-based map visualization (avoiding SSR issues with Leaflet)
  const [currentPositions, setCurrentPositions] = useState<Map<string, { lat: number; lng: number }>>(new Map());

  useEffect(() => {
    // Simulate GPS tracking - move orders towards their destinations
    const interval = setInterval(() => {
      setCurrentPositions(prev => {
        const updated = new Map(prev);
        orders.forEach(order => {
          const current = prev.get(order.id) || {
            lat: order.deliveryLocation.lat - 0.1,
            lng: order.deliveryLocation.lng - 0.1
          };

          // Move 10% closer to destination
          const newLat = current.lat + (order.deliveryLocation.lat - current.lat) * 0.1;
          const newLng = current.lng + (order.deliveryLocation.lng - current.lng) * 0.1;

          updated.set(order.id, { lat: newLat, lng: newLng });
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  return (
    <div className="space-y-4">
      {/* Simplified Map Visualization */}
      <div className="bg-gray-100 rounded-lg p-8 relative h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 opacity-50" />

        {/* Grid lines for map effect */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-gray-300" />
          ))}
        </div>

        {/* Plot orders on map */}
        <div className="relative h-full">
          {orders.map((order) => {
            const current = currentPositions.get(order.id) || {
              lat: order.deliveryLocation.lat - 0.1,
              lng: order.deliveryLocation.lng - 0.1
            };

            // Normalize coordinates to fit in the container (0-100%)
            const normalizedLat = ((current.lat - 37.5) / 0.5) * 100;
            const normalizedLng = ((current.lng + 123) / 0.5) * 100;

            const destLat = ((order.deliveryLocation.lat - 37.5) / 0.5) * 100;
            const destLng = ((order.deliveryLocation.lng + 123) / 0.5) * 100;

            const isSelected = selectedOrder?.id === order.id;

            return (
              <div key={order.id}>
                {/* Route line */}
                <svg className="absolute inset-0 pointer-events-none">
                  <line
                    x1={`${Math.max(0, Math.min(100, normalizedLng))}%`}
                    y1={`${Math.max(0, Math.min(100, 100 - normalizedLat))}%`}
                    x2={`${Math.max(0, Math.min(100, destLng))}%`}
                    y2={`${Math.max(0, Math.min(100, 100 - destLat))}%`}
                    stroke={isSelected ? '#F59E0B' : '#CBD5E0'}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>

                {/* Current position (truck) */}
                <button
                  onClick={() => onSelectOrder(order)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 marker-pulse ${
                    isSelected ? 'z-20' : 'z-10'
                  }`}
                  style={{
                    left: `${Math.max(0, Math.min(100, normalizedLng))}%`,
                    top: `${Math.max(0, Math.min(100, 100 - normalizedLat))}%`
                  }}
                >
                  <div className={`p-2 rounded-full ${
                    isSelected ? 'bg-amber-500' : 'bg-blue-500'
                  } shadow-lg`}>
                    <Navigation size={16} className="text-white" />
                  </div>
                </button>

                {/* Destination marker */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-5"
                  style={{
                    left: `${Math.max(0, Math.min(100, destLng))}%`,
                    top: `${Math.max(0, Math.min(100, 100 - destLat))}%`
                  }}
                >
                  <div className={`p-2 rounded-full ${
                    isSelected ? 'bg-green-500' : 'bg-gray-400'
                  } shadow-md`}>
                    <MapPin size={16} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Current Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Selected Order Details */}
      {selectedOrder && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Selected Delivery</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-amber-700">Order ID:</span>
              <span className="ml-2 font-mono">{selectedOrder.id}</span>
            </div>
            <div>
              <span className="text-amber-700">Quantity:</span>
              <span className="ml-2 font-medium">{selectedOrder.quantity} units</span>
            </div>
            <div className="col-span-2">
              <span className="text-amber-700">Destination:</span>
              <span className="ml-2 font-mono text-xs">
                {selectedOrder.deliveryLocation.lat.toFixed(6)}, {selectedOrder.deliveryLocation.lng.toFixed(6)}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-amber-700">Current Position:</span>
              <span className="ml-2 font-mono text-xs">
                {currentPositions.get(selectedOrder.id)
                  ? `${currentPositions.get(selectedOrder.id)!.lat.toFixed(6)}, ${currentPositions.get(selectedOrder.id)!.lng.toFixed(6)}`
                  : 'Calculating...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
