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
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
      {roles.map((role) => {
        const Icon = ROLE_ICONS[role];
        const isActive = currentRole === role;
        const colors = ROLE_COLORS[role];

        return (
          <button
            key={role}
            onClick={() => onRoleChange(role)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all
              ${isActive
                ? `${colors.bg} ${colors.text} shadow-sm`
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <Icon size={18} />
            <span>{ROLE_LABELS[role]}</span>
          </button>
        );
      })}
    </div>
  );
}
