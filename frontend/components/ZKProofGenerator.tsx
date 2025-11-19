'use client';

import { useEffect, useMemo, useState } from 'react';
import { Order } from '@/lib/types';
import { Shield, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface ZKProofGeneratorProps {
  order: Order;
}

export default function ZKProofGenerator({ order }: ZKProofGeneratorProps) {
  const proofSteps = useMemo(
    () => [
      {
        id: 'seal',
        label: 'Encrypting MegaRetail pricing payload',
        subtext: 'AES-256 + shielding commitments'
      },
      {
        id: 'circuit',
        label: 'Synthesising proof circuit',
        subtext: 'Groth16 circuit for quantity disclosure'
      },
      {
        id: 'verify',
        label: 'Verifying constraints & witnesses',
        subtext: 'Midnight verifier contract checks'
      },
      {
        id: 'publish',
        label: 'Publishing proof hash to Midnight L1',
        subtext: 'Event emitted for regulators'
      }
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= proofSteps.length) return prev;
        return prev + 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [proofSteps]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-slate-200">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Shield size={64} className="text-slate-900 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock size={32} className="text-emerald-500" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">
              MegaRetail Proof Generation
            </h3>
            <p className="text-sm text-slate-500">
              Every step is captured before we hand control back to the buyer.
            </p>
          </div>

          <ol className="space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
            {proofSteps.map((step, index) => {
              let status: 'complete' | 'in-progress' | 'pending' = 'pending';
              if (activeIndex > index) status = 'complete';
              else if (activeIndex === index) status = 'in-progress';
              return (
                <li key={step.id}>
                  <ProofStep label={step.label} subtext={step.subtext} status={status} />
                </li>
              );
            })}
          </ol>

          <div className="text-sm text-slate-600 font-mono bg-slate-100 border border-slate-200 p-4 rounded-xl">
            <div>Order: {order.id}</div>
            <div>Supplier → MegaRetail</div>
            <div>Quantity: {order.quantity} units</div>
            <div>
              Price: <span className="text-red-600 tracking-widest">ENCRYPTED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProofStep({
  label,
  subtext,
  status
}: {
  label: string;
  subtext: string;
  status: 'complete' | 'in-progress' | 'pending';
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg ${
        status === 'in-progress' ? 'bg-white shadow-sm border border-slate-200' : ''
      }`}
    >
      <div className="mt-0.5">
        {status === 'complete' && <CheckCircle size={20} className="text-emerald-500" />}
        {status === 'in-progress' && <Loader2 size={20} className="text-blue-600 animate-spin" />}
        {status === 'pending' && <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />}
      </div>
      <div>
        <p
          className={`text-sm font-medium ${
            status === 'complete' ? 'text-slate-700' : status === 'in-progress' ? 'text-slate-900' : 'text-slate-500'
          }`}
        >
          {label}
        </p>
        <p className="text-xs text-slate-400">{subtext}</p>
      </div>
    </div>
  );
}
