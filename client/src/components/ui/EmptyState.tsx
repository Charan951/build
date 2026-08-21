import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Single visual treatment for "nothing here yet" — replaces the three divergent
 * patterns previously scattered across InvoiceManagerPage, ClientDetailPage,
 * ClientPortalDashboardPage, and assorted plain-text fallbacks. */
export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className = '' }) => (
  <div
    className={`flex flex-col items-center justify-center text-center gap-3 p-10 rounded-2xl border-2 border-dashed border-dark/10 bg-background ${className}`}
  >
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-dark/5 text-mutedOnLight flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
    )}
    <div className="space-y-1">
      <p className="text-sm font-bold text-dark">{title}</p>
      {description && <p className="text-xs text-mutedOnLight max-w-xs">{description}</p>}
    </div>
    {action}
  </div>
);
