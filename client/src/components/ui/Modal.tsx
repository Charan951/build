import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { useOperateMode } from './OperateModeContext';

/** Keeps the latest onClose without making it an effect dependency — an inline
 * arrow passed by nearly every caller would otherwise re-run the open/close
 * effect (and re-steal focus to the close button) on every parent re-render,
 * including one caused by typing into a field inside the modal. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/** Tracks which Modal instances are currently open, in open-order, so a
 * ConfirmDialog stacked on top of another Modal only closes itself on
 * Escape — without this, both dialogs shared one `window` keydown listener
 * and a single Escape press closed them both. Also keeps body scroll locked
 * until the last modal in the stack closes, not just the innermost one. */
const openModalStack: string[] = [];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  /** Skips the default p-6 space-y-4 body wrapper for content that manages
   * its own internal layout (e.g. a two-pane grid with per-pane padding). */
  noBodyPadding?: boolean;
  /** Persistent action bar rendered below the scrollable body, outside it -
   * for Cancel/Save-style footers that should stay visible while the body scrolls. */
  footer?: React.ReactNode;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
  noBodyPadding = false,
  footer,
}) => {
  const titleId = useId();
  const instanceId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useLatest(onClose);
  // Under /dashboard or /portal, Operate mode's tight 16px radius replaces
  // Persuade's 36px dialog radius — see DESIGN.md's Operate radius scale.
  const isOperate = useOperateMode();

  // Lifecycle: scroll lock, initial focus, and focus restore — runs once per
  // open/close transition, never on an unrelated parent re-render.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    openModalStack.push(instanceId);
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => {
      // Prefer the first focusable field inside the body content over the
      // header's close button, so typing can start immediately.
      const contentFocusable = contentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const dialogFocusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      (contentFocusable?.[0] ?? dialogFocusable?.[0] ?? dialogRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      const idx = openModalStack.indexOf(instanceId);
      if (idx !== -1) openModalStack.splice(idx, 1);
      if (openModalStack.length === 0) document.body.style.overflow = 'unset';
      previouslyFocused.current?.focus();
    };
  }, [isOpen]);

  // Keyboard handling: safe to re-bind on every render since it doesn't touch focus.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Only the topmost dialog in the stack closes on Escape.
        if (openModalStack[openModalStack.length - 1] !== instanceId) return;
        onCloseRef.current();
        return;
      }
      // Focus trap: keep Tab cycling within the dialog while it's open.
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCloseRef]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-dark/75 ${isOperate ? '' : 'backdrop-blur-md'} transition-opacity animate-in fade-in duration-200`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidthClasses} bg-white ${isOperate ? 'rounded-operateLg' : 'rounded-dialog'} shadow-hover border border-dark/10 overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] focus:outline-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-dark text-white border-b border-white/10">
          <div>
            <h2 id={titleId} className="font-display text-xl font-bold">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-mutedOnDark mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="focus-ring-inverse p-2 rounded-xl text-mutedOnDark hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {/* noBodyPadding content owns its own scroll regions (e.g. independently
            scrollable panes in a two-pane layout) rather than one outer scroll box. */}
        <div ref={contentRef} className={noBodyPadding ? 'flex-1 min-h-0 flex flex-col' : 'p-6 overflow-y-auto space-y-4'}>
          {children}
        </div>

        {footer && <div className="p-6 border-t border-dark/10 shrink-0">{footer}</div>}
      </div>
    </div>
  );
};
