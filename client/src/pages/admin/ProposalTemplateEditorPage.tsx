import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Wand2,
  Loader2,
} from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PAGE_W, PAGE_H, QElement, QPage } from './QuotationEditorPage';

const uid = () => Math.random().toString(36).slice(2, 10);

const text = (partial: Partial<QElement> & { x: number; y: number; w: number; h: number }): QElement => ({
  id: uid(),
  type: 'text',
  fontSize: 10.5,
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

const FONT_OPTIONS = ['Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'Segoe UI'];

const MARGIN_X = 40;
const MARGIN_Y = 40;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const MAX_Y = PAGE_H - MARGIN_Y;

const estimateLines = (str: string, fontSize: number, width: number): number => {
  const charsPerLine = Math.max(10, Math.floor(width / (fontSize * 0.55)));
  return str.split('\n').reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / charsPerLine || 1)), 0);
};

/**
 * Flows AI-generated proposal HTML (section-bar/p/ul/table/roles-grid/plans-grid,
 * see aiContentService's prompt) onto freeform canvas pages, stacking blocks
 * top-to-bottom and estimating each block's height from its text so it wraps to
 * a new page instead of overflowing. This is intentionally lossy - grid/card
 * layouts (roles-grid, plans-grid) flatten into bullet text since the canvas
 * only supports text/table/divider elements - the admin can then freely
 * rearrange, resize, or restyle what AI dropped in.
 */
const aiHtmlToPages = (html: string): QPage[] => {
  const container = document.createElement('div');
  container.innerHTML = html;

  const pages: QPage[] = [{ id: uid(), elements: [] }];
  let y = MARGIN_Y;

  const ensureRoom = (neededH: number) => {
    if (y + neededH > MAX_Y && pages[pages.length - 1].elements.length > 0) {
      pages.push({ id: uid(), elements: [] });
      y = MARGIN_Y;
    }
  };

  const addText = (content: string, opts: Partial<QElement> = {}) => {
    const trimmed = content.replace(/\n{3,}/g, '\n\n').trim();
    if (!trimmed) return;
    const fontSize = opts.fontSize || 10.5;
    const lines = estimateLines(trimmed, fontSize, CONTENT_W);
    const h = Math.max(22, lines * fontSize * 1.5 + 8);
    ensureRoom(h);
    pages[pages.length - 1].elements.push(text({ x: MARGIN_X, y, w: CONTENT_W, h, content: trimmed, fontSize, ...opts }));
    y += h + 10;
  };

  const addTable = (rows: string[][]) => {
    if (rows.length === 0) return;
    const rowH = 24;
    const h = rows.length * rowH;
    ensureRoom(h);
    pages[pages.length - 1].elements.push(table(MARGIN_X, y, CONTENT_W, h, rows));
    y += h + 14;
  };

  const tableRowsFrom = (tableEl: Element): string[][] =>
    Array.from(tableEl.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.querySelectorAll('th,td')).map((cell) => (cell.textContent || '').trim())
    );

  const cardGroupToText = (group: Element): string =>
    Array.from(group.children)
      .map((card) => {
        const heading = card.querySelector('h4, .plan-name');
        const body = card.querySelector('p');
        const items = Array.from(card.querySelectorAll('li')).map((li) => (li.textContent || '').trim());
        const bodyText = body ? (body.textContent || '').trim() : items.join(', ');
        const price = card.querySelector('.plan-price')?.textContent?.trim();
        const label = [heading?.textContent?.trim(), price].filter(Boolean).join(' — ');
        return label ? `${label}: ${bodyText}` : bodyText;
      })
      .filter(Boolean)
      .join('\n');

  const walk = (node: Element) => {
    const cls = node.classList;
    const tag = node.tagName.toLowerCase();

    if (cls.contains('section-bar')) {
      addText((node.textContent || '').trim(), { bold: true, fontSize: 13, color: '#0f2a3d' });
    } else if (cls.contains('roles-grid') || cls.contains('plans-grid')) {
      addText(cardGroupToText(node), { fontSize: 10.5 });
    } else if (cls.contains('info-box')) {
      addText((node.textContent || '').trim(), { fontSize: 10, italic: true, color: '#b45309' });
    } else if (cls.contains('highlight-box')) {
      addText((node.textContent || '').trim(), { fontSize: 10, italic: true, color: '#047857' });
    } else if (tag === 'table') {
      addTable(tableRowsFrom(node));
    } else if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(node.children).map((li) => `•  ${(li.textContent || '').trim()}`);
      addText(items.join('\n'), { fontSize: 10.5 });
    } else if (tag === 'p') {
      addText((node.textContent || '').trim(), { fontSize: 10.5 });
    } else if (node.children.length > 0) {
      Array.from(node.children).forEach(walk);
    } else if ((node.textContent || '').trim()) {
      addText((node.textContent || '').trim(), { fontSize: 10.5 });
    }
  };

  Array.from(container.children).forEach(walk);

  return pages;
};

interface ProposalBranding {
  logoUrl: string;
  headerGradientFrom: string;
  headerGradientTo: string;
  companyName: string;
  companyTagline: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  footerAddress: string;
  footerAddressLine2: string;
}

const DEFAULT_BRANDING: ProposalBranding = {
  logoUrl: '',
  headerGradientFrom: '#0f2a3d',
  headerGradientTo: '#1f9d63',
  companyName: 'Speshway Solutions',
  companyTagline: 'Website & App Development Company | Hyderabad, India',
  contactEmail: 'info@speshway.com',
  contactPhone: '+91 91000 06020',
  website: 'www.speshway.com',
  footerAddress: 'T-Hub, Plot No 1/C, Sy No 83/1, Raidurgam, Knowledge City Road,',
  footerAddressLine2: 'Serilingampalle (M), Hyderabad, Telangana 500032, India',
};

// Mirrors server/src/services/pdfService.ts's Puppeteer header/footer margins
// (90px / 80px) at the same 96dpi scale the canvas already uses, so the bands
// shown here occupy exactly the space the exported PDF reserves for them.
const HEADER_BAND_H = 90;
const FOOTER_BAND_H = 80;

interface ProposalMeta {
  title: string;
  type: string;
  preparedFor: string;
  projectType: string;
  currency: string;
  docRef: string;
  validityText: string;
  fontFamily: string;
}

const EMPTY_META: ProposalMeta = {
  title: 'Untitled Proposal',
  type: 'website',
  preparedFor: '',
  projectType: '',
  currency: 'Indian Rupees (INR)',
  docRef: '',
  validityText: '30 Days from Date of Issue',
  fontFamily: 'Helvetica',
};

export const ProposalTemplateEditorPage: React.FC = () => {
  const { id: proposalProjectId, templateId } = useParams<{ id: string; templateId: string }>();
  const navigate = useNavigate();
  const isNew = templateId === 'new';

  const [projectName, setProjectName] = useState('');
  const [resolvedId, setResolvedId] = useState<string | null>(isNew ? null : templateId || null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<ProposalMeta>(EMPTY_META);
  const [branding, setBranding] = useState<ProposalBranding>(DEFAULT_BRANDING);
  const [pages, setPages] = useState<QPage[]>([{ id: uid(), elements: [] }]);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(76);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'design' | 'details'>('design');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const historyRef = useRef<QPage[][]>([]);
  const historyIndexRef = useRef(-1);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creatingRef = useRef(false);

  const currentPage = pages[pageIndex];
  const selectedElement = currentPage?.elements.find((el) => el.id === selectedId) || null;

  // Create-then-redirect: a "new" template gets a real id up front so every
  // subsequent edit autosaves via PUT like an existing one, instead of the
  // page having to branch its save logic on whether an id exists yet.
  useEffect(() => {
    if (!proposalProjectId) return;

    if (!isNew) {
      apiFetch(`/proposals/templates/${templateId}`).then((res) => {
        if (res.success) {
          const t = res.data;
          setMeta({
            title: t.title || 'Untitled Proposal',
            type: t.type || 'website',
            preparedFor: t.meta?.preparedFor || '',
            projectType: t.meta?.projectType || '',
            currency: t.meta?.currency || 'Indian Rupees (INR)',
            docRef: t.meta?.docRef || '',
            validityText: t.meta?.validityText || '30 Days from Date of Issue',
            fontFamily: t.fontFamily || 'Helvetica',
          });
          setBranding({ ...DEFAULT_BRANDING, ...(t.branding || {}) });
          const initialPages = Array.isArray(t.pages) && t.pages.length ? t.pages : [{ id: uid(), elements: [] }];
          setPages(initialPages);
          historyRef.current = [JSON.parse(JSON.stringify(initialPages))];
          historyIndexRef.current = 0;
        }
        setLoading(false);
      });
      return;
    }

    if (creatingRef.current) return;
    creatingRef.current = true;
    apiFetch('/proposals/projects').then((projRes) => {
      const project = projRes.success ? projRes.data.find((p: any) => p._id === proposalProjectId) : null;
      setProjectName(project?.name || '');
    });
    apiFetch('/proposals/templates', {
      method: 'POST',
      body: JSON.stringify({ proposalProjectId, title: EMPTY_META.title, type: EMPTY_META.type, pages: [] }),
    }).then((res) => {
      if (res.success) {
        setResolvedId(res.data._id);
        navigate(`/dashboard/proposals/${proposalProjectId}/templates/${res.data._id}`, { replace: true });
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalProjectId, templateId]);

  useEffect(() => {
    if (isNew || !proposalProjectId) return;
    apiFetch('/proposals/projects').then((res) => {
      if (res.success) {
        const project = res.data.find((p: any) => p._id === proposalProjectId);
        setProjectName(project?.name || '');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalProjectId]);

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
    setPages(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    setPages(JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current])));
  };

  // Debounced autosave whenever pages or meta change (skip the very first load,
  // and skip entirely until we have a real id to save against).
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (loading || !resolvedId) return;
    setSaveState('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      apiFetch(`/proposals/templates/${resolvedId}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: meta.title,
          type: meta.type,
          fontFamily: meta.fontFamily,
          meta: {
            preparedFor: meta.preparedFor,
            projectType: meta.projectType,
            currency: meta.currency,
            docRef: meta.docRef,
            validityText: meta.validityText,
          },
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
  }, [pages, meta, resolvedId, loading]);

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

  const handleGenerate = async () => {
    if (!aiInstruction.trim()) {
      setAiError('Enter a short instruction first.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const res = await apiFetch('/proposals/ai-generate', {
        method: 'POST',
        body: JSON.stringify({
          instruction: aiInstruction,
          projectName,
          type: meta.type,
          currency: meta.currency,
        }),
      });
      if (res.success) {
        const generatedPages = aiHtmlToPages(res.contentHtml);
        commitPages(() => generatedPages);
        setPageIndex(0);
        setSelectedId(null);
        setAiOpen(false);
        setAiInstruction('');
      } else {
        setAiError(res.message || 'AI generation failed.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Error contacting AI service.');
    } finally {
      setAiLoading(false);
    }
  };

  const downloadUrl = resolvedId ? getApiUrl(`/proposals/templates/${resolvedId}/pdf`) : '';

  // Header/footer bands and the page itself all scale together as one unit,
  // so the on-canvas preview stays a true WYSIWYG match for the exported PDF
  // (which reserves this exact band height via Puppeteer's margin/header/footer).
  const scaledStackStyle: React.CSSProperties = {
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
  };

  const pageCanvasStyle: React.CSSProperties = {
    width: PAGE_W,
    height: PAGE_H,
    fontFamily: meta.fontFamily,
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-xs text-slateText">Loading proposal template...</div>;
  }

  return (
    <div className="h-full min-h-0 flex flex-col bg-[#F5F6F4]">
      {/* Top toolbar */}
      <div className="shrink-0 h-14 bg-white border-b border-dark/10 flex items-center gap-3 px-4">
        <button
          onClick={() => navigate(`/dashboard/proposals/${proposalProjectId}`)}
          className="focus-ring flex items-center gap-1 text-xs font-bold text-slateText hover:text-dark rounded"
        >
          <ChevronLeft className="w-4 h-4" /> Back to {projectName || 'Project'}
        </button>
        <input
          value={meta.title}
          onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
          aria-label="Template title"
          maxLength={120}
          className="focus-ring font-display text-sm font-bold text-dark bg-transparent border-none focus:outline-none focus:bg-background rounded px-1.5 py-0.5 min-w-[160px]"
        />
        <span role="status" aria-live="polite" className="text-[10px] font-bold text-slateText/70">
          {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved ✓' : ''}
        </span>

        <div className="flex-1" />

        <div className="relative">
          <button
            onClick={() => setAiOpen((v) => !v)}
            className="focus-ring px-3 py-1.5 rounded-xl bg-dark text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" /> Generate with AI
          </button>
          {aiOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-2xl border border-dark/10 p-3 space-y-2 z-50">
              <p className="text-[10px] font-bold uppercase tracking-wider text-dark">Describe the proposal content</p>
              <textarea
                rows={4}
                autoFocus
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder="e.g., Write a project estimation for an HRMS web app with payroll and attendance modules, two pricing plans"
                maxLength={2000}
                className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-sm text-dark focus:outline-none focus:border-dark resize-none"
              />
              {aiError && <p className="text-[10px] font-semibold text-rose-600">{aiError}</p>}
              <p className="text-[10px] text-slateText">This replaces the current pages with a freshly laid-out draft.</p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAiOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-dark font-bold text-[11px] hover:bg-dark/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={aiLoading || !aiInstruction.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-[#bce63b] text-dark font-bold text-[11px] flex items-center gap-1.5 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  {aiLoading ? 'Generating' : 'Generate'}
                </button>
              </div>
            </div>
          )}
        </div>

        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          className={`focus-ring px-3 py-1.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-sm flex items-center gap-1.5 ${!resolvedId ? 'pointer-events-none opacity-50' : ''}`}
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
            <div style={scaledStackStyle}>
              {/* Non-interactive preview of the branded header band the exported
                  PDF adds via Puppeteer's displayHeaderFooter - shown here purely
                  so the canvas matches the final document, never draggable/selectable. */}
              <div
                className="pointer-events-none shadow-xl"
                style={{
                  width: PAGE_W,
                  height: HEADER_BAND_H,
                  background: `linear-gradient(90deg, ${branding.headerGradientFrom}, ${branding.headerGradientTo})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 28px',
                  boxSizing: 'border-box',
                  fontFamily: "'Segoe UI', Arial, sans-serif",
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {branding.logoUrl ? (
                      <img src={branding.logoUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontWeight: 700, fontSize: 14, color: branding.headerGradientFrom }}>
                        {branding.companyName.charAt(0).toUpperCase() || 'S'}
                      </span>
                    )}
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: '#fff',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {branding.companyName.toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: 8,
                        color: '#e2e8f0',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {branding.companyTagline}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#fff', whiteSpace: 'nowrap' }}>COMMERCIAL QUOTATION</div>
                  <div style={{ fontSize: 8, color: '#e2e8f0', whiteSpace: 'nowrap' }}>
                    Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-xl relative" style={pageCanvasStyle} onPointerDown={(e) => e.stopPropagation()}>
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
                                className={`border border-dark/15 px-2 py-1.5 align-top outline-none ${ri === 0 ? 'bg-dark/10 font-bold' : ''}`}
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

              {/* Footer band preview - mirrors buildFooterTemplate in pdfService.ts. */}
              <div
                className="pointer-events-none"
                style={{ width: PAGE_W, fontFamily: "'Segoe UI', Arial, sans-serif" }}
              >
                <div style={{ width: '100%', height: 2, background: `linear-gradient(90deg, ${branding.headerGradientFrom}, ${branding.headerGradientTo})` }} />
                <div
                  style={{
                    width: PAGE_W,
                    height: FOOTER_BAND_H - 2,
                    background: '#0f1f2e',
                    padding: '8px 28px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box',
                    color: '#fff',
                  }}
                >
                  <div style={{ maxWidth: '60%', overflowWrap: 'break-word' }}>
                    <div style={{ fontWeight: 700, fontSize: 9, color: '#fff' }}>{branding.companyName}</div>
                    <div style={{ fontSize: 7, color: '#cbd5e1', lineHeight: 1.4 }}>
                      {branding.footerAddress}
                      <br />
                      {branding.footerAddressLine2}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', maxWidth: '40%', overflowWrap: 'break-word' }}>
                    <div style={{ fontWeight: 700, fontSize: 9, color: '#fff' }}>Contact</div>
                    <div style={{ fontSize: 7, color: '#cbd5e1' }}>
                      {branding.contactEmail} | {branding.contactPhone}
                    </div>
                    <div style={{ fontSize: 7, color: '#cbd5e1' }}>{branding.website}</div>
                  </div>
                </div>
              </div>
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
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Font Family</label>
                  <select
                    value={meta.fontFamily}
                    onChange={(e) => setMeta((m) => ({ ...m, fontFamily: e.target.value }))}
                    aria-label="Font family"
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
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
                  resize. <b>Ctrl+Z / Ctrl+Y</b> to undo/redo. Use <b>Generate with AI</b> above to lay out a full
                  draft from a short description.
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
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Type</label>
                  <select
                    value={meta.type}
                    onChange={(e) => setMeta((m) => ({ ...m, type: e.target.value }))}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  >
                    <option value="website">Website</option>
                    <option value="app">App</option>
                    <option value="website_app">Website + App</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Prepared For</label>
                  <input
                    value={meta.preparedFor}
                    onChange={(e) => setMeta((m) => ({ ...m, preparedFor: e.target.value }))}
                    maxLength={120}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Project Type</label>
                  <input
                    value={meta.projectType}
                    onChange={(e) => setMeta((m) => ({ ...m, projectType: e.target.value }))}
                    maxLength={120}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Currency</label>
                  <input
                    value={meta.currency}
                    onChange={(e) => setMeta((m) => ({ ...m, currency: e.target.value }))}
                    maxLength={60}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Document Ref</label>
                  <input
                    value={meta.docRef}
                    onChange={(e) => setMeta((m) => ({ ...m, docRef: e.target.value }))}
                    maxLength={80}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Validity</label>
                  <input
                    value={meta.validityText}
                    onChange={(e) => setMeta((m) => ({ ...m, validityText: e.target.value }))}
                    maxLength={120}
                    className="focus-ring w-full px-2.5 py-2 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
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
          <button onClick={() => setZoom((z) => Math.max(25, z - 10))} aria-label="Zoom out" className="focus-ring p-1 rounded hover:bg-dark/5 text-dark">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-dark w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(200, z + 10))} aria-label="Zoom in" className="focus-ring p-1 rounded hover:bg-dark/5 text-dark">
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
