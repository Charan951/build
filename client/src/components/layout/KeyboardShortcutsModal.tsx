import React from 'react';
import { Modal } from '../ui/Modal';

interface ShortcutRow {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  rows: ShortcutRow[];
}

const GROUPS: ShortcutGroup[] = [
  {
    title: 'Everywhere',
    rows: [
      { keys: ['?'], description: 'Open this shortcuts panel' },
      { keys: ['Esc'], description: 'Close the open dialog or panel' },
      { keys: ['Tab'], description: 'Move to the next control' },
      { keys: ['Shift', 'Tab'], description: 'Move to the previous control' },
    ],
  },
  {
    title: 'Leads Pipeline & Client Projects',
    rows: [
      { keys: ['/'], description: 'Jump to the search field' },
      { keys: ['N'], description: 'Add a new lead or project' },
      {
        keys: [],
        description:
          'Each card has a move icon (↔) next to Edit — it opens a dropdown to change stage without dragging, for keyboard and screen-reader use.',
      },
    ],
  },
];

const Kbd: React.FC<{ children: string }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-2 rounded-operateSm border border-dark/15 bg-dark/[0.03] text-xs font-bold text-dark font-mono">
    {children}
  </kbd>
);

export const KeyboardShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts & Help" subtitle="Available anywhere in the admin dashboard">
    <div className="space-y-6">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slateText mb-2.5">{group.title}</h3>
          <div className="space-y-2.5">
            {group.rows.map((row, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <p className="text-sm text-dark/80 flex-1">{row.description}</p>
                {row.keys.length > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    {row.keys.map((k, j) => (
                      <React.Fragment key={k}>
                        {j > 0 && <span className="text-xs text-slateText">+</span>}
                        <Kbd>{k}</Kbd>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Modal>
);
