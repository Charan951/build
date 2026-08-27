import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export interface PortalTabDef<T extends string> {
  id: T;
  label: string;
  icon: React.ElementType;
  /** Optional trailing count badge, e.g. unread files or completed/total tasks. */
  badge?: string | number;
}

interface PortalTabsProps<T extends string> {
  tabs: PortalTabDef<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Distinguishes the two tab bars sharing this component for layoutId
   * scoping — without it, Framer Motion would try to animate the sliding
   * indicator between the dashboard's tabs and a project detail page's
   * tabs if both were ever mounted in the same tree at once. */
  groupId: string;
}

/** Shared tab bar for the client portal (dashboard + project detail pages).
 * Real role="tablist" semantics and roving-tabindex arrow-key navigation -
 * the plain button-row version this replaced had neither, so a keyboard
 * user had to Tab through every single tab instead of using arrow keys
 * once focus reached the tablist, and a screen reader had no way to know
 * these buttons were a tab group at all. The sliding underline is the
 * same layoutId pattern already established in Navbar.tsx, restrained to
 * one quick, functional motion moment per DESIGN.md's Operate guidance. */
export function PortalTabs<T extends string>({ tabs, active, onChange, groupId }: PortalTabsProps<T>) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusAndActivate = (id: T) => {
    onChange(id);
    tabRefs.current[id]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    let nextIdx = idx;
    if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = tabs.length - 1;
    focusAndActivate(tabs[nextIdx].id);
  };

  return (
    <div role="tablist" className="flex items-center gap-1 border-b border-dark/10 overflow-x-auto no-scrollbar">
      {tabs.map((t, idx) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            role="tab"
            id={`${groupId}-tab-${t.id}`}
            aria-selected={isActive}
            aria-controls={`${groupId}-panel-${t.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`focus-ring relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap ${
              isActive ? 'text-dark' : 'text-slateText hover:text-dark'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.badge !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full bg-dark/5 text-[9px] font-bold text-slateText">
                {t.badge}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId={`${groupId}-active-tab-indicator`}
                className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
