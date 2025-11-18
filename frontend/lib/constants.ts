// ChainVault Constants

import { UserRole } from './types';

export const ROLE_COLORS: Record<UserRole, { primary: string; bg: string; text: string; border: string }> = {
  supplier: {
    primary: '#10B981', // green
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  buyer: {
    primary: '#3B82F6', // blue
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  logistics: {
    primary: '#F59E0B', // amber
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  },
  regulator: {
    primary: '#8B5CF6', // purple
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  supplier: 'ACME Corp',
  buyer: 'MegaRetail',
  logistics: 'FastShip',
  regulator: 'TradeComm'
};

export const DEMO_USERS = {
  supplier: { id: 'supplier-1', role: 'supplier' as UserRole, name: 'ACME Corp' },
  buyer: { id: 'buyer-1', role: 'buyer' as UserRole, name: 'MegaRetail' },
  logistics: { id: 'logistics-1', role: 'logistics' as UserRole, name: 'FastShip' },
  regulator: { id: 'regulator-1', role: 'regulator' as UserRole, name: 'TradeComm' }
};
