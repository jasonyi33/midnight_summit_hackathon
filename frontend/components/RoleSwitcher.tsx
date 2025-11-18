'use client';

import { UserRole } from '@/lib/types';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/constants';
import { Building2, ShoppingCart, Truck, Shield } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLE_ICONS = {
  supplier: Building2,
  buyer: ShoppingCart,
  logistics: Truck,
  regulator: Shield
};

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const roles: UserRole[] = ['supplier', 'buyer', 'logistics', 'regulator'];

  return (
    <div className="flex gap-2 p-1.5 bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-100">
      {roles.map((role) => {
        const Icon = ROLE_ICONS[role];
        const isActive = currentRole === role;
        const colors = ROLE_COLORS[role];

        return (
          <button
            key={role}
            onClick={() => onRoleChange(role)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
              ${isActive
                ? `${colors.bg} ${colors.text} shadow-md scale-105 border-2 ${colors.border}`
                : 'text-gray-600 hover:bg-white hover:shadow-sm border-2 border-transparent'
              }
            `}
          >
            <Icon size={18} className={isActive ? '' : 'opacity-60'} />
            <span>{ROLE_LABELS[role]}</span>
          </button>
        );
      })}
    </div>
  );
}
