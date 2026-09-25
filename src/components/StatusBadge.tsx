import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'application' | 'drive' | 'eligibility' | 'general';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'application' }) => {
  // Color configuration adhering to accessible contrast and clean typography
  let styles = 'text-slate-600 bg-slate-50 border-slate-200';
  let dotColor = 'bg-slate-400';

  const s = status.toLowerCase();

  if (s.includes('select') || s.includes('placed') || s.includes('approved') || s.includes('eligible') && !s.includes('ineligible')) {
    styles = 'text-emerald-700 bg-emerald-50/70 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (s.includes('interview') || s.includes('shortlist') || s.includes('active')) {
    styles = 'text-blue-700 bg-blue-50/70 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (s.includes('pending') || s.includes('review') || s.includes('applied')) {
    styles = 'text-amber-700 bg-amber-50/70 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (s.includes('reject') || s.includes('closed') || s.includes('ineligible') || s.includes('shortfall')) {
    styles = 'text-rose-700 bg-rose-50/70 border-rose-200';
    dotColor = 'bg-rose-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded border ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
