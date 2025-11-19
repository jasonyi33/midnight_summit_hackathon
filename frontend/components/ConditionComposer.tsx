'use client';

import { useState } from 'react';
import { ConditionPhase, UserRole } from '@/lib/types';

interface ConditionComposerProps {
  orderId: string;
  role: UserRole;
  phase: ConditionPhase;
  onAddCondition: (orderId: string, payload: { description: string; role: UserRole; phase: ConditionPhase }) => void;
  placeholder?: string;
  buttonLabel?: string;
}

export default function ConditionComposer({
  orderId,
  role,
  phase,
  onAddCondition,
  placeholder = 'Add optional condition (e.g., refrigeration proof, extra custody photo)',
  buttonLabel = 'Add Condition'
}: ConditionComposerProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAddCondition(orderId, { description: value.trim(), role, phase });
    setValue('');
  };

  return (
    <div className="mt-3 border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
      />
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-40"
          disabled={!value.trim()}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

