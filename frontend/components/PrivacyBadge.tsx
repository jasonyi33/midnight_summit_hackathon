import { Lock, LockOpen } from 'lucide-react';

interface PrivacyBadgeProps {
  isLocked: boolean;
}

export default function PrivacyBadge({ isLocked }: PrivacyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
        isLocked
          ? 'bg-red-100 text-red-700 privacy-locked'
          : 'bg-green-100 text-green-700'
      }`}
      title={isLocked ? 'Hidden via ZK Proof' : 'Revealed'}
    >
      {isLocked ? (
        <>
          <Lock size={12} />
          <span>Locked</span>
        </>
      ) : (
        <>
          <LockOpen size={12} />
          <span>Revealed</span>
        </>
      )}
    </span>
  );
}
