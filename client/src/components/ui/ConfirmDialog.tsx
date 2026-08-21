import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as a destructive (red) action. */
  destructive?: boolean;
  isSubmitting?: boolean;
  /** Inline error shown when a previous confirm attempt failed; dialog stays open so the user can retry. */
  error?: string;
}

/** Styled, keyboard/focus-correct replacement for the ~15+ bare `window.confirm()`
 * calls previously used for admin delete actions. Built on the hardened Modal
 * so it inherits Escape-to-close, focus trap, and scroll-lock for free. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  isSubmitting = false,
  error,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
    {description && <p className="text-sm text-slateText leading-relaxed">{description}</p>}
    {error && (
      <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
        {error}
      </p>
    )}
    <div className="flex justify-end gap-3 pt-2">
      <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
        {cancelLabel}
      </Button>
      <Button
        variant={destructive ? 'danger' : 'lime'}
        size="sm"
        onClick={onConfirm}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Please wait…' : confirmLabel}
      </Button>
    </div>
  </Modal>
);
