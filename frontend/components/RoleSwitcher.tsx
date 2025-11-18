'use client';

import { UserRole } from '@/lib/types';
import { TrendingUp, Shield, Truck, FileText, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roles = [
  {
    value: 'supplier' as UserRole,
    label: 'Supplier',
    icon: TrendingUp,
    color: 'emerald',
    gradient: 'from-emerald-500 to-green-600'
  },
  {
    value: 'buyer' as UserRole,
    label: 'Buyer',
    icon: Shield,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-700'
  },
  {
    value: 'logistics' as UserRole,
    label: 'Logistics',
    icon: Truck,
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    value: 'regulator' as UserRole,
    label: 'Regulator',
    icon: FileText,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-700'
  }
];

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentRoleData = roles.find(r => r.value === currentRole);
  const CurrentIcon = currentRoleData?.icon || Shield;

  return (
    <div className="relative">
      {/* Current Role Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="glass-strong px-4 py-2.5 rounded-xl flex items-center gap-3 min-w-[180px] transition-all hover:border-[var(--accent-primary)] group"
      >
        <div className={`p-2 rounded-lg bg-gradient-to-br ${currentRoleData?.gradient} relative`}>
          <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CurrentIcon size={18} className="relative text-white" />
        </div>

        <div className="flex-1 text-left">
          <div className="text-xs text-[var(--text-tertiary)] font-mono">Role</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            {currentRoleData?.label}
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`text-[var(--text-tertiary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 glass-strong rounded-xl border border-[var(--border-default)] overflow-hidden z-50 shadow-xl"
            >
              <div className="p-2 space-y-1">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = role.value === currentRole;

                  return (
                    <motion.button
                      key={role.value}
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        onRoleChange(role.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-3 rounded-lg flex items-center gap-3 transition-all group ${
                        isActive
                          ? 'bg-[var(--bg-elevated)] border border-[var(--accent-primary)]'
                          : 'hover:bg-[var(--bg-elevated)] border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${role.gradient} relative`}>
                        {isActive && (
                          <div className="absolute inset-0 bg-white/30 rounded-lg blur-sm animate-pulse"></div>
                        )}
                        <Icon size={18} className="relative text-white" />
                      </div>

                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                          {role.label}
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)] animate-pulse"></div>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)] capitalize">
                          {role.value}
                        </div>
                      </div>

                      {isActive && (
                        <div className="text-[var(--accent-primary)] text-xs font-mono">
                          Active
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--border-default)] px-4 py-2 bg-[var(--bg-primary)]">
                <p className="text-xs text-[var(--text-tertiary)] text-center">
                  Switch roles to view different dashboards
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
