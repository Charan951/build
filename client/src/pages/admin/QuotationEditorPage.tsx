import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Undo2,
  Redo2,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  Type,
  Table as TableIcon,
  Layers,
  Settings2,
} from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const PAGE_W = 794;
export const PAGE_H = 1123;

export interface QElement {
  id: string;
  type: 'text' | 'table' | 'divider';
  x: number;
  y: number;
  w: number;
  h: number;
  content?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  color?: string;
  rows?: string[][];
  /** Optional block background fill (e.g. a section-bar heading band). */
  bg?: string;
  /** Optional accent border on the left edge (e.g. a role/plan card). */
  borderLeftColor?: string;
}

export interface QPage {
  id: string;
  elements: QElement[];
}

const uid = () => Math.random().toString(36).slice(2, 10);

const text = (partial: Partial<QElement> & { x: number; y: number; w: number; h: number }): QElement => ({
  id: uid(),
  type: 'text',
  fontSize: 10,
  align: 'left',
  color: '#1f2937',
  content: '',
  ...partial,
});

const table = (x: number, y: number, w: number, h: number, rows: string[][]): QElement => ({
  id: uid(),
  type: 'table',
  x,
  y,
  w,
  h,
  rows,
});

const divider = (x: number, y: number, w: number, h: number, color = '#e8622c'): QElement => ({
  id: uid(),
  type: 'divider',
  x,
  y,
  w,
  h,
  color,
});

const TECH_ROWS = [
  ['Component', 'Technology'],
  ['UI Design', ''],
  ['Frontend', ''],
  ['Backend & API', ''],
  ['Database & Authentication', ''],
  ['Notifications & Alerts', ''],
  ['Device Support', ''],
  ['Export & Reports', ''],
  ['Hosting', ''],
];

const COST_ROWS = [
  ['Area', 'Details', 'Estimated Cost'],
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

/** Builds the default 4-page layout matching New-Quotation.pdf, as freeform canvas elements. */
export const buildDefaultQuotationPages = (): QPage[] => [
  {
    id: uid(),
    elements: [
      divider(0, 0, PAGE_W, 6),
      text({ x: 480, y: 32, w: 274, h: 22, align: 'right', bold: true, fontSize: 13, content: 'Build Your Thoughts' }),
      text({ x: 480, y: 56, w: 274, h: 16, align: 'right', fontSize: 9, color: '#9ca3af', content: '' }),
      text({ x: 40, y: 96, w: 714, h: 32, align: 'center', bold: true, fontSize: 19, content: 'COMPREHENSIVE PROJECT QUOTATION' }),
      divider(40, 138, 714, 2),
      text({
        x: 40,
        y: 156,
        w: 400,
        h: 110,
        fontSize: 10,
        content: 'Client: \nProject Name: \nProject Type: \nProject Duration: \nSupport: ',
      }),
      text({
        x: 554,
        y: 156,
        w: 200,
        h: 70,
        align: 'right',
        fontSize: 10,
        content: `No. \n${new Date().toLocaleDateString('en-GB')}\nValid until: `,
      }),
      text({ x: 40, y: 286, w: 714, h: 22, align: 'center', bold: true, fontSize: 11, color: '#e8622c', content: 'PROJECT SUMMARY' }),
      text({ x: 40, y: 314, w: 714, h: 90, fontSize: 10, content: 'Click to add a project summary...' }),
      text({ x: 40, y: 420, w: 714, h: 22, align: 'center', bold: true, fontSize: 11, color: '#e8622c', content: 'TECHNOLOGY STACK' }),
      table(40, 448, 714, 320, TECH_ROWS),
    ],
  },
  {
    id: uid(),
    elements: [
      text({ x: 40, y: 40, w: 714, h: 22, align: 'center', bold: true, fontSize: 11, color: '#e8622c', content: 'PROJECT SCOPE' }),
      text({
        x: 40,
        y: 76,
        w: 714,
        h: 960,
        fontSize: 10,
        content: '1. \n\n2. \n\n3. \n\n4. \n\n5. \n\n6. ',
      }),
    ],
  },
  {
    id: uid(),
    elements: [
      text({ x: 40, y: 40, w: 714, h: 22, align: 'center', bold: true, fontSize: 11, color: '#e8622c', content: 'COST BREAKDOWN' }),
      table(40, 76, 714, 260, COST_ROWS),
      text({ x: 554, y: 350, w: 200, h: 30, align: 'right', bold: true, fontSize: 11, content: 'TOTAL: ' }),
      text({ x: 40, y: 400, w: 714, h: 40, fontSize: 9, color: '#6b7280', content: 'Note: ' }),
    ],
  },
  {
    id: uid(),
    elements: [
      text({ x: 40, y: 40, w: 714, h: 22, bold: true, fontSize: 11, color: '#e8622c', content: 'MAINTENANCE & SUPPORT POLICY' }),
      text({ x: 40, y: 70, w: 714, h: 60, fontSize: 10, content: '' }),
      text({ x: 40, y: 136, w: 714, h: 30, fontSize: 9, color: '#6b7280', content: 'Note: ' }),
      text({ x: 40, y: 190, w: 714, h: 22, bold: true, fontSize: 11, color: '#e8622c', content: 'TERMS AND CONDITIONS' }),
      text({ x: 40, y: 220, w: 714, h: 140, fontSize: 10, content: '' }),
      text({ x: 40, y: 380, w: 714, h: 22, bold: true, fontSize: 11, color: '#e8622c', content: 'PAYMENT TERMS' }),
      text({ x: 40, y: 410, w: 714, h: 80, fontSize: 10, content: '' }),
      text({ x: 40, y: 510, w: 714, h: 22, bold: true, fontSize: 11, color: '#e8622c', content: 'AGREEMENT NOTE' }),
      text({ x: 40, y: 540, w: 714, h: 80, fontSize: 10, content: '' }),
      text({ x: 40, y: 660, w: 300, h: 50, fontSize: 10, bold: true, content: '' }),
    ],
  },
];

const FONT_OPTIONS = ['Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Segoe UI'];

interface QuotationMeta {
  quotationNumber: string;
  status: string;
  documentTitle: string;
  agencyName: string;
  preparedByName: string;
  clientName: string;
  clientEmail: string;
  validUntil: string;
  accentColor: string;
  fontFamily: string;
  showTotalAmount: boolean;
  totalAmount: string;
  requireSignature: boolean;
}

const EMPTY_META: QuotationMeta = {
  quotationNumber: '',
  status: 'draft',
  documentTitle: 'New Quotation',
  agencyName: 'Build Your Thoughts',
  preparedByName: '',
  clientName: '',
  clientEmail: '',
  validUntil: '',
  accentColor: '#e8622c',
  fontFamily: 'Helvetica',
  showTotalAmount: true,
  totalAmount: '',
  requireSignature: true,
};

export const QuotationEditorPage: React.FC = () => {
  const { id: projectId, quotationId } = useParams<{ id: string; quotationId: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<QuotationMeta>(EMPTY_META);
  const [pages, setPages] = useState<QPage[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(76);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'design' | 'details'>('design');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const historyRef = useRef<QPage[][]>([]);
  const historyIndexRef = useRef(-1);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextHistoryPush = useRef(false);

  const currentPage = pages[pageIndex];
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedId) || null;

  useEffect(() => {
    if (!projectId || !quotationId) return;
    apiFetch(`/crm/projects/${projectId}/quotations/${quotationId}`, { token }).then((res) => {
      if (res.success) {
        const q = res.data;
        setMeta({
          quotationNumber: q.quotationNumber || '',
          status: q.status || 'draft',
          documentTitle: q.documentTitle || 'New Quotation',
          agencyName: q.agencyName || 'Build Your Thoughts',
          preparedByName: q.preparedByName || '',
          clientName: q.clientName || '',
          clientEmail: q.clientEmail || '',
          validUntil: q.validUntil ? String(q.validUntil).slice(0, 10) : '',
          accentColor: q.accentColor || '#e8622c',
          fontFamily: q.fontFamily || 'Helvetica',
          showTotalAmount: q.showTotalAmount !== false,
          totalAmount: q.totalAmount || '',
          requireSignature: q.requireSignature !== false,
        });
        const initialPages = Array.isArray(q.pages) && q.pages.length ? q.pages : buildDefaultQuotationPages();
        setPages(initialPages);
        historyRef.current = [JSON.parse(JSON.stringify(initialPages))];
        historyIndexRef.current = 0;
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, quotationId]);

  const pushHistory = useCallback((next: QPage[]) => {
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
    trimmed.push(JSON.parse(JSON.stringify(next)));
    if (trimmed.length > 60) trimmed.shift();
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
  }, []);

  const commitPages = useCallback(
    (updater: (prev: QPage[]) => QPage[], { history = true }: { history?: boolean } = {}) => {
      setPages((prev) => {
        const next = updater(prev);
        if (history) pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  const undo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    skipNextHistoryPush.current = true;
    setPages(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    skipNextHistoryPush.current = true;
    setPages(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
  };

  // Debounced autosave whenever pages or meta change (skip the very first load).
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (loading) return;
    setSaveState('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      apiFetch(`/crm/projects/${projectId}/quotations/${quotationId}`, {
        method: 'PUT',
        token,
        body: JSON.stringify({
          ...meta,
          validUntil: meta.validUntil || undefined,
          pages,
        }),
      }).then((res) => {
        setSaveState(res.success ? 'saved' : 'idle');
      });
    }, 700);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, meta]);

  // Keyboard shortcuts: undo/redo, delete selected element.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditingText = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !isEditingText && !editingId) {
        e.preventDefault();
        deleteElement(selectedId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, editingId, pages]);

  const updateElement = (id: string, patch: Partial<QElement>, { history = true }: { history?: boolean } = {}) => {
    commitPages(
      (prev) =>
        prev.map((p, idx) =>
          idx !== pageIndex ? p : { ...p, elements: p.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)) }
        ),
      { history }
    );
  };

  const deleteElement = (id: string) => {
    commitPages((prev) => prev.map((p, idx) => (idx !== pageIndex ? p : { ...p, elements: p.elements.filter((el) => el.id !== id) })));
    if (selectedId === id) setSelectedId(null);
  };

  const addElement = (type: 'text' | 'table') => {
    const el: QElement =
      type === 'text'
        ? text({ x: 60, y: 60, w: 300, h: 60, content: 'New text' })
        : table(60, 60, 400, 120, [
            ['Column 1', 'Column 2'],
            ['', ''],
          ]);
    commitPages((prev) => prev.map((p, idx) => (idx !== pageIndex ? p : { ...p, elements: [...p.elements, el] })));
    setSelectedId(el.id);
    setAddMenuOpen(false);
  };

  const addPage = () => {
    commitPages((prev) => [...prev, { id: uid(), elements: [] }]);
    setPageIndex(pages.length);
  };

  const [confirmDeletePage, setConfirmDeletePage] = useState(false);

  const requestDeletePage = () => {
    if (pages.length <= 1) return;
    setConfirmDeletePage(true);
  };

  const deletePage = () => {
    commitPages((prev) => prev.filter((_, idx) => idx !== pageIndex));
    setPageIndex((idx) => Math.max(0, idx - 1));
    setConfirmDeletePage(false);
  };

  // --- Drag & resize ---
  const dragStateRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeStateRef = useRef<{ id: string; startX: number; startY: number; origW: number; origH: number } | null>(null);

  const onElementPointerDown = (e: React.PointerEvent, el: QElement) => {
    if (editingId === el.id) return;
    e.stopPropagation();
    setSelectedId(el.id);
    const scale = zoom / 100;
    dragStateRef.current = { id: el.id, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y };
    const onMove = (ev: PointerEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      const dx = (ev.clientX - ds.startX) / scale;
      const dy = (ev.clientY - ds.startY) / scale;
      updateElement(ds.id, { x: Math.round(ds.origX + dx), y: Math.round(ds.origY + dy) }, { history: false });
    };
    const onUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setPages((cur) => {
        pushHistory(cur);
        return cur;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const onResizePointerDown = (e: React.PointerEvent, el: QElement) => {
    e.stopPropagation();
    e.preventDefault();
    const scale = zoom / 100;
    resizeStateRef.current = { id: el.id, startX: e.clientX, startY: e.clientY, origW: el.w, origH: el.h };
    const onMove = (ev: PointerEvent) => {
      const rs = resizeStateRef.current;
      if (!rs) return;
      const dx = (ev.clientX - rs.startX) / scale;
      const dy = (ev.clientY - rs.startY) / scale;
      updateElement(rs.id, { w: Math.max(30, Math.round(rs.origW + dx)), h: Math.max(20, Math.round(rs.origH + dy)) }, { history: false });
    };
    const onUp = () => {
      resizeStateRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setPages((cur) => {
        pushHistory(cur);
        return cur;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const commitTextEdit = (id: string, newContent: string) => {
    updateElement(id, { content: newContent });
    setEditingId(null);
  };

  const commitTableCell = (id: string, rowIdx: number, colIdx: number, value: string, rows: string[][]) => {
    const next = rows.map((r) => [...r]);
    next[rowIdx][colIdx] = value;
    updateElement(id, { rows: next });
  };

  const downloadUrl = getApiUrl(`/crm/projects/${projectId}/quotations/${quotationId}/pdf`);

  const pageCanvasStyle: React.CSSProperties = {
    width: PAGE_W,
    height: PAGE_H,
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-slateText">Loading quotation...</div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#F5F6F4]">
      {/* Top toolbar */}
      <div className="shrink-0 h-14 bg-white border-b border-dark/10 flex items-center gap-3 px-4">
        <button
          onClick={() => navigate(`/dashboard/client-projects/${projectId}`)}
          className="focus-ring flex items-center gap-1 text-xs font-bold text-slateText hover:text-dark rounded"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Project
        </button>
        <input
          value={meta.documentTitle}
          onChange={(e) => setMeta({ ...meta, documentTitle: e.target.value })}
          aria-label="Document title"
          className="focus-ring font-display text-sm font-bold text-dark bg-transparent border-none focus:outline-none focus:bg-background rounded px-1.5 py-0.5 min-w-[160px]"
        />
        <span role="status" aria-live="polite" className="text-[10px] font-bold text-slateText/70">
          {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved ✓' : ''}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-background border border-dark/10 text-[9px] font-bold uppercase text-slateText">
          {meta.status}
        </span>

        <div className="flex-1" />

        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="focus-ring px-3 py-1.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </a>
      </div>

      <div className="flex-1 min-h-0 flex">
        {/* Left mini rail: add element */}
        <div className="w-14 shrink-0 bg-white border-r border-dark/10 flex flex-col items-center py-4 gap-2">
          <div className="relative">
            <button
              onClick={() => setAddMenuOpen((v) => !v)}
              aria-label="Add element"
              aria-expanded={addMenuOpen}
              aria-haspopup="menu"
              className="focus-ring w-10 h-10 rounded-xl bg-primary hover:bg-[#bce63b] text-dark flex items-center justify-center shadow-sm"
              title="Add element"
            >
              <Plus className="w-5 h-5" />
            </button>
            {addMenuOpen && (
              <div role="menu" className="absolute left-12 top-0 w-40 bg-white rounded-xl shadow-2xl border border-dark/10 py-1.5 z-50">
                <button
                  role="menuitem"
                  onClick={() => addElement('text')}
                  className="focus-ring w-full px-3 py-2 text-left text-xs font-bold text-dark hover:bg-lime-50 flex items-center gap-2"
                >
                  <Type className="w-3.5 h-3.5" /> Text
                </button>
                <button
                  role="menuitem"
                  onClick={() => addElement('table')}
                  className="focus-ring w-full px-3 py-2 text-left text-xs font-bold text-dark hover:bg-lime-50 flex items-center gap-2"
                >
                  <TableIcon className="w-3.5 h-3.5" /> Table
                </button>
              </div>
            )}
          </div>
          <button
            onClick={undo}
            aria-label="Undo"
            className="focus-ring w-10 h-10 rounded-xl hover:bg-dark/5 text-dark flex items-center justify-center"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            aria-label="Redo"
            className="focus-ring w-10 h-10 rounded-xl hover:bg-dark/5 text-dark flex items-center justify-center"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 min-h-0 overflow-auto py-8" onPointerDown={() => setSelectedId(null)}>
          <div className="mx-auto" style={{ width: PAGE_W * (zoom / 100) }}>
            <div
              className="bg-white shadow-xl relative"
              style={pageCanvasStyle}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {currentPage?.elements.map((el) => (
                <div
                  key={el.id}
                  onPointerDown={(e) => onElementPointerDown(e, el)}
                  onDoubleClick={() => el.type !== 'divider' && setEditingId(el.id)}
                  className={`absolute ${selectedId === el.id ? 'outline outline-2 outline-primary' : 'hover:outline hover:outline-1 hover:outline-dark/20'} ${
                    el.type === 'divider' ? 'cursor-default' : 'cursor-move'
                  }`}
                  style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
                >
                  {el.type === 'divider' && <div className="w-full h-full" style={{ backgroundColor: el.color }} />}

                  {el.type === 'text' &&
                    (editingId === el.id ? (
                      <textarea
                        autoFocus
                        defaultValue={el.content}
                        onBlur={(e) => commitTextEdit(el.id, e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-full h-full resize-none border-none outline-none bg-white/90 p-0"
                        style={{
                          fontSize: el.fontSize,
                          fontWeight: el.bold ? 700 : 400,
                          fontStyle: el.italic ? 'italic' : 'normal',
                          textDecoration: el.underline ? 'underline' : 'none',
                          textAlign: el.align,
                          color: el.color,
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full whitespace-pre-wrap"
                        style={{
                          fontSize: el.fontSize,
                          fontWeight: el.bold ? 700 : 400,
                          fontStyle: el.italic ? 'italic' : 'normal',
                          textDecoration: el.underline ? 'underline' : 'none',
                          textAlign: el.align,
                          color: el.color,
                        }}
                      >
                        {el.content || <span className="text-dark/20">Click twice to add text</span>}
                      </div>
                    ))}

                  {el.type === 'table' && (
                    <table className="w-full h-full border-collapse text-[10px]">
                      <tbody>
                        {(el.rows || []).map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                contentEditable
                                suppressContentEditableWarning
                                onPointerDown={(e) => e.stopPropagation()}
                                onBlur={(e) => commitTableCell(el.id, ri, ci, e.currentTarget.textContent || '', el.rows || [])}
                                className={`border border-dark/15 px-2 py-1.5 align-top outline-none ${ri === 0 ? 'bg-[#d9d5cd] font-bold' : ''}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {selectedId === el.id && el.type !== 'divider' && (
                    <div
                      onPointerDown={(e) => onResizePointerDown(e, el)}
                      className="absolute -right-1.5 -bottom-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow cursor-se-resize"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 shrink-0 bg-white border-l border-dark/10 flex flex-col">
          <div role="tablist" aria-label="Editor panel" className="flex items-center border-b border-dark/10 shrink-0">
            <button
              role="tab"
              aria-selected={rightTab === 'design'}
              onClick={() => setRightTab('design')}
              className={`focus-ring flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 ${
                rightTab === 'design' ? 'text-dark border-b-2 border-primary' : 'text-slateText'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Design
            </button>
            <button
              role="tab"
              aria-selected={rightTab === 'details'}
              onClick={() => setRightTab('details')}
              className={`focus-ring flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 ${
                rightTab === 'details' ? 'text-dark border-b-2 border-primary' : 'text-slateText'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" /> Details
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {rightTab === 'design' && !selectedElement && (
              <>
                <p className="text-[10px] font-bold uppercase text-slateText tracking-wide">Document Style</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={meta.accentColor}
                    onChange={(e) => setMeta({ ...meta, accentColor: e.target.value })}
                    aria-label="Accent color"
                    title="Accent color"
                    className="focus-ring w-9 h-9 rounded-lg border border-dark/10 cursor-pointer"
                  />
                  <select
                    value={meta.fontFamily}
                    onChange={(e) => setMeta({ ...meta, fontFamily: e.target.value })}
                    aria-label="Font family"
                    className="focus-ring flex-1 px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slateText leading-relaxed pt-2">
                  <b>Click</b> any text or table cell to edit it. <b>Drag</b> to move, pull the bottom-right handle to
                  resize. <b>Ctrl+Z / Ctrl+Y</b> to undo/redo.
                </p>
              </>
            )}

            {rightTab === 'design' && selectedElement && selectedElement.type === 'text' && (
              <>
                <p className="text-[10px] font-bold uppercase text-slateText tracking-wide">Text</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={selectedElement.fontSize}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                    aria-label="Font size"
                    title="Font size"
                    className="focus-ring w-16 px-2 py-1.5 bg-background border border-dark/10 rounded-lg text-xs"
                  />
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                    aria-label="Text color"
                    title="Text color"
                    className="focus-ring w-9 h-9 rounded-lg border border-dark/10 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateElement(selectedElement.id, { bold: !selectedElement.bold })}
                    aria-label="Bold"
                    aria-pressed={!!selectedElement.bold}
                    className={`focus-ring w-8 h-8 rounded-lg flex items-center justify-center ${selectedElement.bold ? 'bg-primary text-dark' : 'bg-background text-slateText'}`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })}
                    aria-label="Italic"
                    aria-pressed={!!selectedElement.italic}
                    className={`focus-ring w-8 h-8 rounded-lg flex items-center justify-center ${selectedElement.italic ? 'bg-primary text-dark' : 'bg-background text-slateText'}`}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { underline: !selectedElement.underline })}
                    aria-label="Underline"
                    aria-pressed={!!selectedElement.underline}
                    className={`focus-ring w-8 h-8 rounded-lg flex items-center justify-center ${selectedElement.underline ? 'bg-primary text-dark' : 'bg-background text-slateText'}`}
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-6 bg-dark/10 mx-1" />
                  <button
                    onClick={() => updateElement(selectedElement.id, { align: 'left' })}
                    aria-label="Align left"
                    aria-pressed={selectedElement.align === 'left'}
                    className={`focus-ring w-8 h-8 rounded-lg flex items-center justify-center ${selectedElement.align === 'left' ? 'bg-primary text-dark' : 'bg-background text-slateText'}`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { align: 'center' })}
                    aria-label="Align center"
                    aria-pressed={selectedElement.align === 'center'}
                    className={`focus-ring w-8 h-8 rounded-lg flex items-center justify-center ${selectedElement.align === 'center' ? 'bg-primary text-dark' : 'bg-background text-slateText'}`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { align: 'right' })}
                    aria-label="Align right"
                    aria-pressed={selectedElement.align === 'right'}
                    className={`focus-ring w-8 h-8 rounded-lg flex items-center justify-center ${selectedElement.align === 'right' ? 'bg-primary text-dark' : 'bg-background text-slateText'}`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="focus-ring w-full mt-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete element
                </button>
              </>
            )}

            {rightTab === 'design' && selectedElement && selectedElement.type === 'table' && (
              <>
                <p className="text-[10px] font-bold uppercase text-slateText tracking-wide">Table</p>
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      rows: [...(selectedElement.rows || []), (selectedElement.rows?.[0] || ['']).map(() => '')],
                    })
                  }
                  className="focus-ring w-full px-3 py-2 rounded-xl bg-background border border-dark/10 text-dark font-bold text-xs"
                >
                  + Add row
                </button>
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      rows: (selectedElement.rows || []).map((r) => [...r, '']),
                    })
                  }
                  className="focus-ring w-full px-3 py-2 rounded-xl bg-background border border-dark/10 text-dark font-bold text-xs"
                >
                  + Add column
                </button>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="focus-ring w-full mt-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete table
                </button>
              </>
            )}

            {rightTab === 'details' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Agency Name</label>
                  <input
                    value={meta.agencyName}
                    onChange={(e) => setMeta({ ...meta, agencyName: e.target.value })}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Prepared By</label>
                  <input
                    value={meta.preparedByName}
                    onChange={(e) => setMeta({ ...meta, preparedByName: e.target.value })}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Client Name</label>
                  <input
                    value={meta.clientName}
                    onChange={(e) => setMeta({ ...meta, clientName: e.target.value })}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Client Email</label>
                  <input
                    value={meta.clientEmail}
                    onChange={(e) => setMeta({ ...meta, clientEmail: e.target.value })}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Valid Until</label>
                  <input
                    type="date"
                    value={meta.validUntil}
                    onChange={(e) => setMeta({ ...meta, validUntil: e.target.value })}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Status</label>
                  <select
                    value={meta.status}
                    onChange={(e) => setMeta({ ...meta, status: e.target.value })}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-dark pt-1">
                  <input
                    type="checkbox"
                    checked={meta.showTotalAmount}
                    onChange={(e) => setMeta({ ...meta, showTotalAmount: e.target.checked })}
                  />
                  Show total amount
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-dark">
                  <input
                    type="checkbox"
                    checked={meta.requireSignature}
                    onChange={(e) => setMeta({ ...meta, requireSignature: e.target.checked })}
                  />
                  Require name to sign
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom page/zoom bar */}
      <div className="shrink-0 h-11 bg-white border-t border-dark/10 flex items-center justify-between px-4 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={pageIndex === 0}
            aria-label="Previous page"
            className="focus-ring p-1 rounded hover:bg-dark/5 text-dark disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-dark">
            Page {pageIndex + 1}/{pages.length}
          </span>
          <button
            onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
            disabled={pageIndex === pages.length - 1}
            aria-label="Next page"
            className="focus-ring p-1 rounded hover:bg-dark/5 text-dark disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={addPage} className="focus-ring ml-2 px-2 py-1 rounded-lg bg-background border border-dark/10 font-bold text-dark">
            + Page
          </button>
          <button onClick={requestDeletePage} className="focus-ring px-2 py-1 rounded-lg bg-background border border-dark/10 font-bold text-rose-600">
            Delete Page
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(25, z - 10))}
            aria-label="Zoom out"
            className="focus-ring p-1 rounded hover:bg-dark/5 text-dark"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-dark w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            aria-label="Zoom in"
            className="focus-ring p-1 rounded hover:bg-dark/5 text-dark"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDeletePage}
        onClose={() => setConfirmDeletePage(false)}
        onConfirm={deletePage}
        title="Delete this page?"
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};
