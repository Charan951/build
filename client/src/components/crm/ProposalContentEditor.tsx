import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface ProposalContentEditorProps {
  contentHtml: string;
  onChange: (html: string) => void;
  projectName?: string;
  type?: string;
  placeholder?: string;
}

interface PopoverState {
  top: number;
  left: number;
  range: Range;
}

// A reduced version of pdfService.ts's section stylesheet so the editable preview roughly
// matches the final PDF layout. Scoped under .proposal-editor-surface to avoid leaking out.
const EDITOR_STYLES = `
  .proposal-editor-surface { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12.5px; line-height: 1.55; color: #1a1a1a; }
  .proposal-editor-surface p { margin: 6px 0; }
  .proposal-editor-surface ul { padding-left: 20px; margin: 6px 0; }
  .proposal-editor-surface li { margin-bottom: 4px; }
  .proposal-editor-surface .section-bar {
    background: #4c1d95; color: #ffffff; font-weight: 700; font-size: 13px;
    padding: 8px 14px; border-radius: 6px; margin: 18px 0 10px;
  }
  .proposal-editor-surface .roles-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin: 8px 0;
  }
  .proposal-editor-surface .role-card { background: #f3edfc; border-radius: 10px; padding: 12px; }
  .proposal-editor-surface .role-card h4 { margin: 0 0 4px; font-size: 12px; color: #4c1d95; }
  .proposal-editor-surface .role-card p { margin: 0; font-size: 11px; color: #374151; }
  .proposal-editor-surface .feature-table, .proposal-editor-surface .comparison-table {
    width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px;
  }
  .proposal-editor-surface .feature-table th, .proposal-editor-surface .comparison-table th {
    background: #4c1d95; color: #ffffff; text-align: left; padding: 7px 10px;
  }
  .proposal-editor-surface .feature-table td, .proposal-editor-surface .comparison-table td {
    padding: 6px 10px; border-bottom: 1px solid #eee; vertical-align: top;
  }
  .proposal-editor-surface .comparison-table tr.total-row td { font-weight: 800; background: #f3edfc; }
  .proposal-editor-surface .plans-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin: 10px 0;
  }
  .proposal-editor-surface .plan-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; position: relative; }
  .proposal-editor-surface .plan-card.recommended { border: 2px solid #f97316; }
  .proposal-editor-surface .plan-card .plan-header { background: #4c1d95; color: #ffffff; padding: 12px 14px; }
  .proposal-editor-surface .plan-card .plan-header .plan-name { font-weight: 700; font-size: 12.5px; }
  .proposal-editor-surface .plan-card .plan-header .plan-price { font-weight: 800; font-size: 18px; margin-top: 2px; }
  .proposal-editor-surface .plan-card .plan-body { padding: 12px 14px; background: #ffffff; }
  .proposal-editor-surface .plan-card .plan-body ul { padding-left: 18px; margin: 0; font-size: 11px; }
  .proposal-editor-surface .plan-card .badge {
    position: absolute; top: 10px; right: 10px; background: #f97316; color: #fff;
    font-size: 8px; font-weight: 800; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.05em;
  }
`;

const QUICK_ACTIONS: Array<{ label: string; instruction: string }> = [
  { label: 'Shorten', instruction: 'Make this more concise while keeping the key information.' },
  { label: 'Expand', instruction: 'Expand this with more relevant detail.' },
];

export const ProposalContentEditor: React.FC<ProposalContentEditorProps> = ({
  contentHtml,
  onChange,
  projectName,
  type,
  placeholder,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep the DOM in sync with external contentHtml changes (e.g. whole-doc AI regenerate),
  // but avoid clobbering the DOM while the admin is actively typing inside it.
  const lastSyncedHtml = useRef<string>('');
  useEffect(() => {
    if (!editorRef.current) return;
    if (contentHtml === lastSyncedHtml.current) return;
    if (document.activeElement && editorRef.current.contains(document.activeElement)) return;
    editorRef.current.innerHTML = contentHtml || '';
    lastSyncedHtml.current = contentHtml || '';
  }, [contentHtml]);

  const syncFromDom = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastSyncedHtml.current = html;
    onChange(html);
  }, [onChange]);

  const closePopover = useCallback(() => {
    setPopover(null);
    setInstruction('');
    setError('');
    savedRangeRef.current = null;
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const editorEl = editorRef.current;
    if (!editorEl) return;
    // Guard: selection must be fully inside the editable root.
    if (
      !editorEl.contains(range.startContainer) ||
      !editorEl.contains(range.endContainer)
    ) {
      return;
    }
    const text = range.toString();
    if (!text || !text.trim()) return;

    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return;

    savedRangeRef.current = range.cloneRange();
    setError('');
    // Store viewport-relative coordinates (used directly with position: fixed below).
    setPopover({
      top: rect.top,
      left: rect.left + rect.width / 2,
      range,
    });
  }, []);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!popover) return;
      const target = e.target as Node;
      if (popoverRef.current && popoverRef.current.contains(target)) return;
      if (editorRef.current && editorRef.current.contains(target)) return;
      closePopover();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && popover) {
        closePopover();
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [popover, closePopover]);

  const getSelectedHtml = (range: Range): string => {
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    return container.innerHTML;
  };

  const restoreSelection = (range: Range) => {
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const applyRefine = async (instructionText: string) => {
    const range = savedRangeRef.current;
    const editorEl = editorRef.current;
    if (!range || !editorEl) {
      setError('Selection was lost. Please select the content again.');
      return;
    }
    if (!instructionText.trim()) {
      setError('Enter an instruction first.');
      return;
    }

    const selectedHtml = getSelectedHtml(range);
    if (!selectedHtml.trim()) {
      setError('Selection is empty.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/proposals/ai-refine', {
        method: 'POST',
        body: JSON.stringify({
          contentHtml: editorEl.innerHTML,
          selectedHtml,
          instruction: instructionText,
          projectName,
          type,
        }),
      });

      if (!res.success) {
        setError(res.message || 'AI refine failed.');
        setLoading(false);
        return;
      }

      const refinedHtml: string = res.refinedHtml || '';

      // Restore the selection, then replace it with the refined HTML. execCommand is
      // deprecated but remains the most reliable cross-browser way to splice HTML into a
      // contentEditable region without hand-rolling fragile Range/Node mutation logic -
      // acceptable here since this is an internal admin tool.
      editorEl.focus();
      restoreSelection(range);
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        try {
          range.deleteContents();
          restoreSelection(range);
        } catch {
          // ignore; execCommand below will still attempt the replace
        }
        const inserted = document.execCommand('insertHTML', false, refinedHtml);
        if (!inserted) {
          // Fallback: manual insertion if execCommand is unsupported.
          const frag = range.createContextualFragment(refinedHtml);
          range.insertNode(frag);
        }
      }

      syncFromDom();
      closePopover();
    } catch (err: any) {
      setError(err.message || 'Error contacting AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <style>{EDITOR_STYLES}</style>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onMouseUp={handleMouseUp}
        onInput={syncFromDom}
        onBlur={syncFromDom}
        data-placeholder={placeholder}
        className="proposal-editor-surface min-h-[220px] max-h-[420px] overflow-y-auto p-4 bg-white border border-dark/10 rounded-xl text-dark focus:outline-none focus:border-dark empty:before:content-[attr(data-placeholder)] empty:before:text-slateText/60"
      />

      {popover && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: Math.max(8, popover.top - 86),
            left: Math.min(Math.max(popover.left - 160, 8), window.innerWidth - 336),
          }}
          className="z-[70] w-80 rounded-2xl bg-dark text-white shadow-2xl border border-white/10 p-3 space-y-2"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
              Refine selected content
            </span>
            <button
              type="button"
              onClick={closePopover}
              className="ml-auto p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={loading}
                onClick={() => {
                  setInstruction(action.instruction);
                  applyRefine(action.instruction);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyRefine(instruction);
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              autoFocus
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Refine selected content with Gemini..."
              disabled={loading}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/10 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-primary disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !instruction.trim()}
              className="shrink-0 p-1.5 rounded-lg bg-primary text-dark disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            </button>
          </form>

          {error && <p className="text-[10px] font-semibold text-rose-300">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ProposalContentEditor;
