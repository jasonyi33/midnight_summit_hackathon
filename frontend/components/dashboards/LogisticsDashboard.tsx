'use client';

import { useState } from 'react';
import { User, Order } from '@/lib/types';
import {
  Truck,
  MapPin,
  Navigation,
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  Route,
  Radio,
  Zap,
  AlertCircle,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeliveryMap from '@/components/DeliveryMap';

interface LogisticsDashboardProps {
  user: User;
  orders: Order[];
  onDelivery: (orderId: string, location: { lat: number; lng: number }) => void;
}

export default function LogisticsDashboard({ user, orders, onDelivery }: LogisticsDashboardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [simulatingDelivery, setSimulatingDelivery] = useState<string | null>(null);

  const activeOrders = orders.filter(
    order => order.status === 'approved' || order.status === 'in_transit'
  );
  const deliveredOrders = orders.filter(order => order.status === 'delivered' || order.status === 'payment_released');
  const inTransit = orders.filter(o => o.status === 'in_transit');

  const handleSimulateDelivery = async (order: Order) => {
    setSimulatingDelivery(order.id);
    // Simulate GPS arrival delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    onDelivery(order.id, order.deliveryLocation);
    setSimulatingDelivery(null);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Truck />}
          label="Active Deliveries"
          value={activeOrders.length}
          change="+3"
          gradient="from-cyan-500 to-blue-500"
        />
        <StatCard
          icon={<Navigation />}
          label="In Transit"
          value={inTransit.length}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={<CheckCircle />}
          label="Delivered"
          value={deliveredOrders.length}
          change="+12%"
          gradient="from-emerald-500 to-green-600"
        />
        <StatCard
          icon={<Route />}
          label="Total Routes"
          value={orders.length}
          gradient="from-purple-500 to-purple-700"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map View - 2 columns */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 relative">
                <MapPin size={24} className="text-white" />
                {activeOrders.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">GPS Delivery Tracker</h2>
                <p className="text-sm text-[var(--text-tertiary)]">Real-time location monitoring</p>
              </div>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-16">
                <Truck size={64} className="mx-auto text-[var(--text-tertiary)] mb-4 opacity-30" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Active Deliveries</h3>
                <p className="text-[var(--text-tertiary)]">All shipments have been delivered</p>
              </div>
            ) : (
              <div className="glass-strong rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                <DeliveryMap
                  orders={activeOrders}
                  selectedOrder={selectedOrder}
                  onSelectOrder={setSelectedOrder}
                />
              </div>
            )}
          </div>
        </div>

        {/* Route Info Sidebar */}
        <div className="space-y-4">
          {selectedOrder ? (
            <SelectedOrderInfo
              order={selectedOrder}
              onDelivery={handleSimulateDelivery}
              isSimulating={simulatingDelivery === selectedOrder.id}
            />
          ) : (
            <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-4">
                <Radio size={20} className="text-[var(--accent-primary)]" />
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Fleet Status</h3>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">
                {activeOrders.length > 0
                  ? 'Select a delivery on the map to view route details'
                  : 'No active routes at the moment'}
              </p>
              <div className="space-y-2">
                <FleetItem label="Online Vehicles" value={activeOrders.length} color="success" />
                <FleetItem label="Avg. Speed" value="45 mph" color="primary" />
                <FleetItem label="On-Time Rate" value="98%" color="purple" />
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-5 border border-[var(--border-default)]">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Delivery Status</h3>
            <div className="space-y-3">
              <StatusItem label="Awaiting Pickup" count={orders.filter(o => o.status === 'approved').length} color="warning" />
              <StatusItem label="In Transit" count={inTransit.length} color="primary" />
              <StatusItem label="Delivered" count={orders.filter(o => o.status === 'delivered').length} color="purple" />
              <StatusItem label="Paid Out" count={orders.filter(o => o.status === 'payment_released').length} color="success" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Deliveries List */}
      {activeOrders.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Active Deliveries</h2>

          <div className="space-y-3">
            {activeOrders.map((order, index) => (
              <ActiveDeliveryCard
                key={order.id}
                order={order}
                index={index}
                isSelected={selectedOrder?.id === order.id}
                onSelect={() => setSelectedOrder(order)}
                onDeliver={handleSimulateDelivery}
                isSimulating={simulatingDelivery === order.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delivery History */}
      <div className="glass rounded-2xl p-6 border border-[var(--border-default)]">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Delivery History</h2>

        {deliveredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-[var(--text-tertiary)] mb-3 opacity-50" />
            <p className="text-[var(--text-tertiary)]">No completed deliveries yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveredOrders.map((order, index) => (
              <DeliveryHistoryCard key={order.id} order={order} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, gradient }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-[var(--border-default)] card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
        {change && (
          <div className="flex items-center gap-1 text-emerald-400 text-sm font-mono">
            <TrendingUp size={14} />
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-[var(--text-tertiary)] mb-1">{label}</p>
        <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </motion.div>
  );
}

function SelectedOrderInfo({ order, onDelivery, isSimulating }: any) {
  // Calculate mock progress based on status
  const progress = order.status === 'in_transit' ? 75 : 25;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-2xl p-5 border border-cyan-500/30 bg-cyan-500/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target size={20} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Active Route</h3>
      </div>

      <div className="space-y-4">
        <div>
          <span className="font-mono text-xs text-[var(--text-tertiary)] block mb-1">Order ID</span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{order.id}</span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-tertiary)]">Progress</span>
            <span className="text-xs font-semibold text-cyan-400">{progress}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
        </div>

        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-[var(--text-tertiary)]" />
            <span className="text-xs text-[var(--text-tertiary)]">Destination</span>
          </div>
          <p className="font-mono text-xs text-[var(--text-secondary)]">
            {order.deliveryLocation.lat.toFixed(6)}, {order.deliveryLocation.lng.toFixed(6)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-lg p-2">
            <span className="text-xs text-[var(--text-tertiary)] block mb-1">ETA</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">~15 min</span>
          </div>
          <div className="glass rounded-lg p-2">
            <span className="text-xs text-[var(--text-tertiary)] block mb-1">Quantity</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{order.quantity}</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onDelivery(order)}
          disabled={isSimulating}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <div className="spinner w-4 h-4 border-2 border-white/30 border-t-white"></div>
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              Confirm Delivery
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

function ActiveDeliveryCard({ order, index, isSelected, onSelect, onDeliver, isSimulating }: any) {
  const statusConfig = {
    approved: { label: 'Awaiting Pickup', color: 'yellow', class: 'status-pending', icon: Clock },
    in_transit: { label: 'In Transit', color: 'blue', class: 'status-in-transit', icon: Navigation }
  };

  const status = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = status?.icon || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-strong rounded-xl p-4 border transition-all cursor-pointer ${
        isSelected
          ? 'border-cyan-500 bg-cyan-500/5'
          : 'border-[var(--border-default)] hover:border-[var(--accent-primary)]'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500/20' : 'bg-[var(--bg-elevated)]'}`}>
            <StatusIcon size={18} className={isSelected ? 'text-cyan-400' : 'text-[var(--text-tertiary)]'} />
          </div>
          <div>
            <span className="font-mono text-xs text-[var(--text-tertiary)] block">{order.id}</span>
            <div className="flex items-center gap-2 mt-1">
              <div className={`status-dot ${status.class}`}></div>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">{status.label}</span>
            </div>
          </div>
        </div>
        {order.status === 'in_transit' && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
            <Zap size={10} className="text-blue-400" />
            <span className="text-xs text-blue-400 font-semibold">Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Quantity</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{order.quantity} units</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Destination</p>
          <p className="font-mono text-xs text-[var(--text-secondary)]">
            {order.deliveryLocation.lat.toFixed(2)}, {order.deliveryLocation.lng.toFixed(2)}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          onDeliver(order);
        }}
        disabled={isSimulating}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSimulating ? (
          <>
            <div className="spinner w-4 h-4 border-2 border-white/30 border-t-white"></div>
            Confirming GPS Arrival...
          </>
        ) : (
          <>
            <MapPin size={16} />
            Confirm Delivery
          </>
        )}
      </motion.button>
    </motion.div>
  );
}

function DeliveryHistoryCard({ order, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-strong rounded-xl p-4 border border-[var(--border-default)] hover:border-[var(--accent-success)] transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <CheckCircle size={18} className="text-emerald-400" />
        </div>
        <div>
          <span className="font-mono text-xs text-[var(--text-tertiary)]">{order.id}</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="status-dot status-delivered"></div>
            <span className="text-xs font-semibold text-emerald-400">Delivered</span>
            {order.status === 'payment_released' && (
              <>
                <div className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]"></div>
                <div className="status-dot status-paid"></div>
                <span className="text-xs font-semibold text-emerald-400">Paid</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Quantity</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{order.quantity} units</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Delivered</p>
          <p className="text-sm font-mono text-[var(--text-secondary)]">
            {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)] mb-1">Location</p>
          <p className="font-mono text-xs text-[var(--text-secondary)]">
            {order.deliveryLocation.lat.toFixed(2)}, {order.deliveryLocation.lng.toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatusItem({ label, count, color }: any) {
  const colors = {
    warning: 'bg-yellow-500',
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[color]}`}></div>
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      </div>
      <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">{count}</span>
    </div>
  );
}

function FleetItem({ label, value, color }: any) {
  const colors = {
    success: 'text-emerald-400',
    primary: 'text-blue-400',
    purple: 'text-purple-400'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
      <span className={`text-xs font-semibold ${colors[color]}`}>{value}</span>
    </div>
  );
}
