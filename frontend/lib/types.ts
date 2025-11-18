// ChainVault Types

export type UserRole = 'supplier' | 'buyer' | 'logistics' | 'regulator';

export interface User {
  id: string;
  role: UserRole;
  name: string;
}

export interface Order {
  id: string;
  supplierId: string;
  buyerId: string;
  quantity: number;
  price: number; // Only visible to supplier
  status: OrderStatus;
  createdAt: Date;
  approvedAt?: Date;
  deliveredAt?: Date;
  deliveryLocation: {
    lat: number;
    lng: number;
  };
  currentLocation?: {
    lat: number;
    lng: number;
  };
  zkProof?: string;
}

export type OrderStatus =
  | 'pending_approval'
  | 'approved'
  | 'in_transit'
  | 'delivered'
  | 'payment_released';

export interface ComplianceRecord {
  orderId: string;
  timestamp: Date;
  action: string;
  verified: boolean;
  zkProofHash: string;
}
