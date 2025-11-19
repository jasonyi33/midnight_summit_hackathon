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
    <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
      {roles.map((role) => {
        const Icon = ROLE_ICONS[role];
        const isActive = currentRole === role;
        const colors = ROLE_COLORS[role];

        return (
          <button
            key={role}
            onClick={() => onRoleChange(role)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border
              ${isActive
                ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
                : 'text-slate-600 bg-white border-slate-200 hover:text-slate-900'
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
