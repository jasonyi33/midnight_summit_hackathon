'use client';

import { Lock, LockOpen, Eye, EyeOff, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrivacyBadgeProps {
  isLocked: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showTooltip?: boolean;
}

export default function PrivacyBadge({ isLocked, variant = 'default', showTooltip = true }: PrivacyBadgeProps) {
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
          isLocked
            ? 'bg-purple-500/10 border border-purple-500/30'
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}
        title={isLocked ? 'Hidden via ZK Proof' : 'Publicly visible'}
      >
        {isLocked ? (
          <Lock size={10} className="text-purple-400" />
        ) : (
          <Eye size={10} className="text-blue-400" />
        )}
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
          isLocked
            ? 'bg-purple-500/10 border border-purple-500/30'
            : 'bg-blue-500/10 border border-blue-500/30'
        }`}
        title={isLocked ? 'Protected by Zero-Knowledge Proof' : 'Publicly visible data'}
      >
        <div className={`p-1.5 rounded-md ${isLocked ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
          {isLocked ? (
            <Shield size={14} className="text-purple-400" />
          ) : (
            <Eye size={14} className="text-blue-400" />
          )}
        </div>
        <div className="flex flex-col">
          <span className={`text-xs font-semibold ${isLocked ? 'text-purple-400' : 'text-blue-400'}`}>
            {isLocked ? 'ZK Protected' : 'Visible'}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {isLocked ? 'Encrypted' : 'Public'}
          </span>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
        isLocked
          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
          : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      }`}
      title={showTooltip ? (isLocked ? 'Hidden via Zero-Knowledge Proof' : 'Publicly visible') : undefined}
    >
      {isLocked ? (
        <>
          <Lock size={12} className="animate-pulse" />
          <span>Locked</span>
        </>
      ) : (
        <>
          <EyeOff size={12} />
          <span>Visible</span>
        </>
      )}
    </motion.span>
  );
}
