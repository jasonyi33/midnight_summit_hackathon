'use client';

import { Order } from '@/lib/types';
import { Shield, Lock, CheckCircle } from 'lucide-react';

interface ZKProofGeneratorProps {
  order: Order;
}

export default function ZKProofGenerator({ order }: ZKProofGeneratorProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full proof-animation">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Shield size={64} className="text-blue-600 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock size={32} className="text-blue-800" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Generating Zero-Knowledge Proof
            </h3>
            <p className="text-gray-600">
              Verifying order quantity without revealing price data
            </p>
          </div>

          <div className="space-y-3 text-left bg-gray-50 p-4 rounded-lg">
            <ProofStep
              label="Encrypting sensitive data"
              status="complete"
            />
            <ProofStep
              label="Generating proof circuit"
              status="in-progress"
            />
            <ProofStep
              label="Verifying constraints"
              status="pending"
            />
            <ProofStep
              label="Publishing to Midnight blockchain"
              status="pending"
            />
          </div>

          <div className="text-sm text-gray-500 font-mono bg-blue-50 p-3 rounded">
            Order: {order.id}<br />
            Quantity: {order.quantity} units<br />
            Price: <span className="text-red-600">ENCRYPTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofStep({ label, status }: { label: string; status: 'complete' | 'in-progress' | 'pending' }) {
  return (
    <div className="flex items-center gap-3">
      {status === 'complete' && (
        <CheckCircle size={20} className="text-green-600" />
      )}
      {status === 'in-progress' && (
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      )}
      {status === 'pending' && (
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
      )}
      <span className={`text-sm ${status === 'complete' ? 'text-gray-700' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}
