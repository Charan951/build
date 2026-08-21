import React from 'react';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'cyan';

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
};

// Single source of truth for mapping a known status string to a tone — replaces
// the `statusStyles` record previously copy-pasted between
// ClientPortalDashboardPage.tsx and ClientProjectDetailPage.tsx, plus the
// separate kanban-stage palette in ClientProjectsPage/ManageClientsPage.
const STATUS_TONE_MAP: Record<string, StatusTone> = {
  active: 'success',
  won: 'success',
  paid: 'success',
  completed: 'success',
  approved: 'success',
  pending: 'warning',
  draft: 'warning',
  planning: 'warning',
  'in progress': 'warning',
  'in-progress': 'warning',
  in_progress: 'info',
  testing: 'purple',
  deployed: 'cyan',
  review: 'info',
  new: 'info',
  inactive: 'neutral',
  archived: 'neutral',
  lost: 'danger',
  overdue: 'danger',
  unpaid: 'danger',
  failed: 'danger',
  cancelled: 'danger',
  rejected: 'danger',
  on_hold: 'danger',
};

interface StatusPillProps {
  /** The raw status/stage value (case-insensitive lookup against the known map). */
  status: string;
  /** Explicit tone overrides the inferred one — needed for dynamic/DB-driven
   * stage names the map can't know about ahead of time. */
  tone?: StatusTone;
  /** Display label, defaults to `status` as-is. */
  label?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, tone, label, className = '' }) => {
  const resolvedTone = tone ?? STATUS_TONE_MAP[status.toLowerCase()] ?? 'neutral';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-operateMd border text-[11px] font-bold ${toneClasses[resolvedTone]} ${className}`}
    >
      {label ?? status}
    </span>
  );
};
