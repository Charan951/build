import { useEffect } from 'react';

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
};

interface HotkeyOptions {
  /** Skip the handler while focus is inside a text field, so typing "/" or "n"
   * into a search box or form never gets hijacked as a shortcut. Defaults to
   * true; pass false only for keys (like Escape) that should always fire. */
  ignoreInEditable?: boolean;
  enabled?: boolean;
}

/** Fires `handler` when `key` (as reported by KeyboardEvent.key, case-sensitive)
 * is pressed with no modifier keys held, anywhere in the document. */
export function useHotkey(key: string, handler: () => void, options: HotkeyOptions = {}) {
  const { ignoreInEditable = true, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== key) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (ignoreInEditable && isEditableTarget(e.target)) return;
      e.preventDefault();
      handler();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, handler, ignoreInEditable, enabled]);
}
