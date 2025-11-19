'use client';

import { useEffect, useMemo, useState } from 'react';
import { Order } from '@/lib/types';
import { MapPin, Navigation, TrendingUp, Clock, Zap } from 'lucide-react';

interface DeliveryMapProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
}

interface DeliveryProgress {
  lat: number;
  lng: number;
  progress: number; // 0-100
  speed: number; // km/h
  eta: number; // minutes
}

export default function DeliveryMap({ orders, selectedOrder, onSelectOrder }: DeliveryMapProps) {
  const [deliveryProgress, setDeliveryProgress] = useState<Map<string, DeliveryProgress>>(new Map());
  const [globeRotation, setGlobeRotation] = useState(0);
  const [lights, setLights] = useState<Array<{ lat: number; lng: number }>>([]);

  useEffect(() => {
    // seed some city lights
    const cities = [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 34.0522, lng: -118.2437 },
      { lat: 40.7128, lng: -74.006 },
      { lat: 51.5074, lng: -0.1278 },
      { lat: 35.6762, lng: 139.6503 },
      { lat: 1.3521, lng: 103.8198 },
      { lat: -33.8688, lng: 151.2093 }
    ];
    setLights(cities);
  }, []);

  useEffect(() => {
    // Simulate GPS tracking with realistic movement
    const interval = setInterval(() => {
      setDeliveryProgress(prev => {
        const updated = new Map(prev);
        orders.forEach(order => {
          const current = prev.get(order.id) || {
            lat: order.deliveryLocation.lat - 0.15,
            lng: order.deliveryLocation.lng - 0.15,
            progress: 0,
            speed: 45 + Math.random() * 20, // 45-65 km/h
            eta: 30 + Math.random() * 40 // 30-70 minutes
          };

          // Calculate distance to destination
          const latDiff = order.deliveryLocation.lat - current.lat;
          const lngDiff = order.deliveryLocation.lng - current.lng;
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

          // Move with variable speed (2-5% closer per tick)
          const moveRate = 0.02 + Math.random() * 0.03;
          const newLat = current.lat + latDiff * moveRate;
          const newLng = current.lng + lngDiff * moveRate;
          const newProgress = Math.min(100, current.progress + (moveRate * 100));

          // Update speed and ETA
          const newSpeed = 40 + Math.random() * 30 + (newProgress / 5); // Speed increases with progress
          const remainingDistance = (100 - newProgress) / 100;
          const newEta = Math.max(1, Math.floor(remainingDistance * (25 + Math.random() * 15)));

          updated.set(order.id, {
            lat: newLat,
            lng: newLng,
            progress: newProgress,
            speed: newSpeed,
            eta: newEta
          });
        });
        return updated;
      });
    }, 800); // Update every 800ms for smooth animation

    return () => clearInterval(interval);
  }, [orders]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobeRotation((prev) => (prev + 0.1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Enhanced Map Visualization */}
      <div className="bg-slate-900 rounded-xl p-8 relative h-[500px] overflow-hidden shadow-2xl border border-slate-800">
        {/* Rotating globe */}
        <div className="absolute inset-0" style={{ perspective: '2000px' }}>
          <div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(20deg) rotate(${globeRotation}deg)`,
              transition: 'transform 0.05s linear'
            }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundImage: "url('/globe.svg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 0 60px rgba(14,165,233,0.2)'
              }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/80" />

        {/* city lights */}
        <div className="absolute inset-0">
          {lights.map((light, idx) => {
            const projectLat = (lat: number) => 100 - ((lat + 90) / 180) * 100;
            const projectLng = (lng: number) => ((lng + 180) / 360) * 100;
            const lat = projectLat(light.lat);
            const lng = projectLng(light.lng);
            return (
              <div
                key={idx}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 opacity-70 animate-pulse"
                style={{
                  left: `${lng}%`,
                  top: `${lat}%`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              />
            );
          })}
        </div>

        {/* meridian lines */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 grid grid-cols-16 grid-rows-8">
            {Array.from({ length: 128 }).map((_, i) => (
              <div key={i} className="border border-white/5" />
            ))}
          </div>
        </div>

        {/* Plot deliveries on map */}
        <div className="relative h-full">
          {orders.map((order) => {
            const progress = deliveryProgress.get(order.id) || {
              lat: order.deliveryLocation.lat - 0.15,
              lng: order.deliveryLocation.lng - 0.15,
              progress: 0,
              speed: 50,
              eta: 30
            };

            // Project coordinates to equirectangular map (0-100%)
            const projectLat = (lat: number) => 100 - ((lat + 90) / 180) * 100;
            const projectLng = (lng: number) => ((lng + 180) / 360) * 100;

            const normalizedLat = projectLat(progress.lat);
            const normalizedLng = projectLng(progress.lng);
            const destLat = projectLat(order.deliveryLocation.lat);
            const destLng = projectLng(order.deliveryLocation.lng);

            const isSelected = selectedOrder?.id === order.id;

            return (
              <div key={order.id}>
                {/* Animated Route Path */}
                <svg className="absolute inset-0 pointer-events-none">
                  {/* Background route */}
                  <line
                    x1={`${Math.max(0, Math.min(100, normalizedLng))}%`}
                    y1={`${Math.max(0, Math.min(100, 100 - normalizedLat))}%`}
                    x2={`${Math.max(0, Math.min(100, destLng))}%`}
                    y2={`${Math.max(0, Math.min(100, 100 - destLat))}%`}
                    stroke={isSelected ? 'rgba(251, 146, 60, 0.3)' : 'rgba(148, 163, 184, 0.2)'}
                    strokeWidth="4"
                    className="transition-all duration-300"
                  />
                  {/* Completed route (glowing) */}
                  <line
                    x1={`${Math.max(0, Math.min(100, normalizedLng))}%`}
                    y1={`${Math.max(0, Math.min(100, 100 - normalizedLat))}%`}
                    x2={`${Math.max(0, Math.min(100, destLng))}%`}
                    y2={`${Math.max(0, Math.min(100, 100 - destLat))}%`}
                    stroke={isSelected ? '#FB923C' : '#60A5FA'}
                    strokeWidth="3"
                    strokeDasharray={`${progress.progress} ${100 - progress.progress}`}
                    strokeDashoffset="0"
                    className="transition-all duration-300"
                    style={{
                      filter: isSelected ? 'drop-shadow(0 0 6px rgba(251, 146, 60, 0.8))' : 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.6))'
                    }}
                  />
                </svg>

                {/* Moving Truck with Trail Effect */}
                <button
                  onClick={() => onSelectOrder(order)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    isSelected ? 'z-30 scale-110' : 'z-20'
                  }`}
                  style={{
                    left: `${Math.max(0, Math.min(100, normalizedLng))}%`,
                    top: `${Math.max(0, Math.min(100, 100 - normalizedLat))}%`
                  }}
                >
                  {/* Pulsing ring effect */}
                  <div className={`absolute inset-0 rounded-full animate-ping ${
                    isSelected ? 'bg-amber-400' : 'bg-blue-400'
                  } opacity-75`} style={{ animationDuration: '2s' }} />

                  {/* Truck icon */}
                  <div className={`relative p-3 rounded-full shadow-2xl transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                      : 'bg-gradient-to-br from-blue-400 to-blue-600'
                  }`}
                    style={{
                      boxShadow: isSelected
                        ? '0 0 30px rgba(251, 146, 60, 0.6), 0 0 60px rgba(251, 146, 60, 0.3)'
                        : '0 0 20px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    <Navigation size={20} className="text-white" style={{ transform: 'rotate(45deg)' }} />
                  </div>

                  {/* Live stats tooltip */}
                  {isSelected && (
                    <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap shadow-2xl border border-amber-500/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Zap size={12} className="text-amber-400" />
                          <span>{progress.speed.toFixed(1)} km/h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-blue-400" />
                          <span>ETA {progress.eta}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} className="text-green-400" />
                          <span>{progress.progress.toFixed(0)}%</span>
                        </div>
                      </div>
                      {/* Arrow pointer */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                        <div className="border-8 border-transparent border-b-slate-900/95" />
                      </div>
                    </div>
                  )}
                </button>

                {/* Destination Marker with Glow */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${Math.max(0, Math.min(100, destLng))}%`,
                    top: `${Math.max(0, Math.min(100, 100 - destLat))}%`
                  }}
                >
                  <div className={`relative p-3 rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500 scale-110'
                      : 'bg-gradient-to-br from-slate-500 to-slate-600'
                  } shadow-xl`}
                    style={{
                      boxShadow: isSelected
                        ? '0 0 25px rgba(16, 185, 129, 0.7), 0 0 50px rgba(16, 185, 129, 0.3)'
                        : 'none'
                    }}
                  >
                    <MapPin size={20} className="text-white" />
                  </div>

                  {/* Destination pulse */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50"
                         style={{ animationDuration: '3s' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Legend */}
        <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl shadow-2xl text-xs space-y-2.5 border border-slate-600/50">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"
                 style={{ boxShadow: '0 0 12px rgba(59, 130, 246, 0.5)' }} />
            <span className="text-slate-200 font-medium">Active Delivery</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg"
                 style={{ boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)' }} />
            <span className="text-slate-200 font-medium">Destination</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
                 style={{ boxShadow: '0 0 12px rgba(251, 146, 60, 0.5)' }} />
            <span className="text-slate-200 font-medium">Selected Route</span>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-700">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Live GPS Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Selected Order Details */}
      {selectedOrder && (() => {
        const progress = deliveryProgress.get(selectedOrder.id);
        return (
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Live Delivery Tracking
              </h3>
              <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-md">
                IN TRANSIT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
                <div className="text-xs text-amber-700 font-medium mb-1">Order ID</div>
                <div className="font-mono text-sm text-amber-900 font-bold">{selectedOrder.id}</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
                <div className="text-xs text-amber-700 font-medium mb-1">Quantity</div>
                <div className="text-sm text-amber-900 font-bold">{selectedOrder.quantity} units</div>
              </div>
            </div>

            {/* Progress Bar */}
            {progress && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-amber-700">Delivery Progress</span>
                  <span className="text-xs font-bold text-amber-900">{progress.progress.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-amber-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-full transition-all duration-500 shadow-md"
                    style={{
                      width: `${progress.progress}%`,
                      boxShadow: '0 0 10px rgba(251, 146, 60, 0.5)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Live Metrics */}
            {progress && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 shadow-md">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap size={14} />
                    <span className="text-[10px] font-medium opacity-90">Speed</span>
                  </div>
                  <div className="text-lg font-bold">{progress.speed.toFixed(1)}</div>
                  <div className="text-[9px] opacity-75">km/h</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-lg p-3 shadow-md">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={14} />
                    <span className="text-[10px] font-medium opacity-90">ETA</span>
                  </div>
                  <div className="text-lg font-bold">{progress.eta}</div>
                  <div className="text-[9px] opacity-75">minutes</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-3 shadow-md">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-medium opacity-90">Status</span>
                  </div>
                  <div className="text-lg font-bold">{progress.progress < 30 ? 'Early' : progress.progress < 70 ? 'Mid' : 'Near'}</div>
                  <div className="text-[9px] opacity-75">route</div>
                </div>
              </div>
            )}

            {/* Coordinates */}
            <div className="space-y-2">
              <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-green-600" />
                  <span className="text-xs text-amber-700 font-medium">Destination</span>
                </div>
                <div className="font-mono text-[11px] text-amber-900 font-bold">
                  {selectedOrder.deliveryLocation.lat.toFixed(6)}, {selectedOrder.deliveryLocation.lng.toFixed(6)}
                </div>
              </div>
              {progress && (
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation size={14} className="text-blue-600" />
                    <span className="text-xs text-amber-700 font-medium">Current Position</span>
                  </div>
                  <div className="font-mono text-[11px] text-amber-900 font-bold">
                    {progress.lat.toFixed(6)}, {progress.lng.toFixed(6)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
