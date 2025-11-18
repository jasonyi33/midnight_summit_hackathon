'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/lib/types';
import { Shield, Lock, CheckCircle, Sparkles, Zap, Database, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ZKProofGeneratorProps {
  order: Order;
}

export default function ZKProofGenerator({ order }: ZKProofGeneratorProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 border border-[var(--border-default)]"
    >
      <div className="text-center space-y-6">
        {/* Animated ZK Proof Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-xl"></div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 relative">
                <Shield size={64} className="text-white relative z-10" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-purple-400"
                />
              </div>
            </motion.div>

            {/* Orbiting particles */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.5
                }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full blur-sm"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-3xl font-bold text-gradient mb-3">
            Generating Zero-Knowledge Proof
          </h3>
          <p className="text-[var(--text-tertiary)] text-lg">
            Verifying order quantity without revealing price data
          </p>
        </div>

        {/* Proof Steps */}
        <div className="space-y-3 text-left glass-strong p-6 rounded-2xl border border-[var(--border-subtle)]">
          <ProofStep
            label="Encrypting sensitive data"
            status={currentStep >= 0 ? (currentStep > 0 ? 'complete' : 'in-progress') : 'pending'}
            icon={<Lock size={18} />}
            delay={0}
          />
          <ProofStep
            label="Generating proof circuit"
            status={currentStep >= 1 ? (currentStep > 1 ? 'complete' : 'in-progress') : 'pending'}
            icon={<Zap size={18} />}
            delay={0.1}
          />
          <ProofStep
            label="Verifying constraints"
            status={currentStep >= 2 ? (currentStep > 2 ? 'complete' : 'in-progress') : 'pending'}
            icon={<Sparkles size={18} />}
            delay={0.2}
          />
          <ProofStep
            label="Publishing to Midnight blockchain"
            status={currentStep >= 3 ? 'complete' : 'pending'}
            icon={<Network size={18} />}
            delay={0.3}
          />
        </div>

        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-4 border border-purple-500/30 bg-purple-500/5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-purple-400" />
            <span className="text-sm font-semibold text-[var(--text-secondary)]">Order Details</span>
          </div>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-tertiary)]">Order ID:</span>
              <span className="text-[var(--text-primary)]">{order.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-tertiary)]">Quantity:</span>
              <span className="text-[var(--text-primary)]">{order.quantity} units</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-tertiary)]">Price:</span>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">ENCRYPTED</span>
                <Lock size={12} className="text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
            <span>Progress</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProofStep({
  label,
  status,
  icon,
  delay
}: {
  label: string;
  status: 'complete' | 'in-progress' | 'pending';
  icon: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 p-3 rounded-lg transition-all"
    >
      <div className={`relative ${
        status === 'complete' ? 'text-emerald-400' :
        status === 'in-progress' ? 'text-blue-400' :
        'text-[var(--text-tertiary)]'
      }`}>
        {status === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircle size={20} />
          </motion.div>
        )}
        {status === 'in-progress' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"
          />
        )}
        {status === 'pending' && (
          <div className="w-5 h-5 border-2 border-[var(--border-default)] rounded-full opacity-30" />
        )}
      </div>

      <div className="flex items-center gap-2 flex-1">
        <div className={`${
          status === 'complete' ? 'text-emerald-400' :
          status === 'in-progress' ? 'text-blue-400' :
          'text-[var(--text-tertiary)]'
        }`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${
          status === 'complete' ? 'text-[var(--text-primary)]' :
          status === 'in-progress' ? 'text-blue-400' :
          'text-[var(--text-tertiary)]'
        }`}>
          {label}
        </span>
      </div>

      {status === 'complete' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30"
        >
          <span className="text-xs text-emerald-400 font-semibold">Done</span>
        </motion.div>
      )}
    </motion.div>
  );
}
