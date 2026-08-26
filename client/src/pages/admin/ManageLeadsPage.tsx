import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { SEOHead } from '../../components/seo/SEOHead';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Plus,
  Settings,
  Trash2,
  CheckSquare,
  Upload,
  Download,
  Phone,
  Calendar,
  MessageSquare,
  Building,
  GripVertical,
  Pencil,
  FileSpreadsheet,
  ChevronDown,
  FileSignature,
  CheckCircle2,
  Search,
  ArrowRightLeft,
} from 'lucide-react';
import { NewLeadModal } from '../../components/crm/NewLeadModal';
import { useHotkey } from '../../hooks/useHotkey';
import { ManageStagesModal, StageItem } from '../../components/crm/ManageStagesModal';
import { EditLeadModal, LeadData } from '../../components/crm/EditLeadModal';
import { SendProposalModal } from '../../components/crm/SendProposalModal';
import { getApiUrl } from '../../services/api';

export const ManageLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [stages, setStages] = useState<StageItem[]>([]);
  const [stats, setStats] = useState({
    openCount: 0,
    pipelineValue: 0,
    wonMonthlyValue: 0,
    winRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Leads with at least one proposal that has actually been emailed (status: 'sent').
  const [sentProposalLeadIds, setSentProposalLeadIds] = useState<Set<string>>(new Set());

  // Drag and Drop state
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Modals state
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);
  const [targetStageForNewLead, setTargetStageForNewLead] = useState<string>('New');

  // Edit Lead Modal State
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<LeadData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Send Proposal Modal State
  const [selectedLeadForProposal, setSelectedLeadForProposal] = useState<{ _id: string; name: string; email?: string } | null>(null);
  const [isSendProposalOpen, setIsSendProposalOpen] = useState(false);

  // Export Dropdown State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Selection mode state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kanban board ref: wheel handling is attached natively (non-passive) so we
  // can actually preventDefault() the browser's vertical scroll, which React's
  // synthetic onWheel cannot reliably do.
  const boardRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const onWheel = (e: WheelEvent) => {
      // Only handle a gesture that's actually horizontal (trackpad shift-scroll
      // or a horizontal swipe) — pan the board to match. A vertical wheel
      // gesture is never redirected into horizontal movement: over a column
      // with room to scroll, the browser's native vertical scroll on that
      // column already just works without any JS here. Over an empty or
      // fully-scrolled column, a vertical gesture should simply do nothing
      // rather than jump the whole board sideways, which reads as broken.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (board.scrollWidth <= board.clientWidth) return;
      e.preventDefault();
      board.scrollLeft += e.deltaX;
    };

    board.addEventListener('wheel', onWheel, { passive: false });
    return () => board.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    if (!isExportDropdownOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExportDropdownOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isExportDropdownOpen]);

  // Click-and-drag panning on the board background, so the board scrolls
  // freely even on a plain mouse (no trackpad/shift-scroll needed). Dragging
  // starts only when the pointer goes down on empty board space - not on a
  // card, button, or input - so it never fights with lead drag-and-drop.
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    let isPanning = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, [draggable="true"]')) return;
      isPanning = true;
      moved = false;
      startX = e.clientX;
      startScrollLeft = board.scrollLeft;
      board.classList.add('cursor-grabbing');
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      board.scrollLeft = startScrollLeft - dx;
    };

    const stopPanning = () => {
      isPanning = false;
      board.classList.remove('cursor-grabbing');
    };

    // Swallow the click that follows a real drag, so panning never
    // accidentally opens a lead's edit modal.
    const onClickCapture = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };

    board.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopPanning);
    board.addEventListener('click', onClickCapture, true);

    return () => {
      board.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopPanning);
      board.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setLoadError(false);
    }
    try {
      const token = localStorage.getItem('adminToken');
      const [leadsRes, stagesRes, statsRes, leadProposalsRes] = await Promise.all([
        fetch(getApiUrl('/leads'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(getApiUrl('/leads/stages'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(getApiUrl('/leads/stats'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(getApiUrl('/proposals/lead-proposals'), { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!leadsRes.ok || !stagesRes.ok || !statsRes.ok) {
        setLoadError(true);
        return;
      }

      const leadsData = await leadsRes.json();
      const stagesData = await stagesRes.json();
      const statsData = await statsRes.json();
      const leadProposalsData = await leadProposalsRes.json();

      if (!leadsData.success || !stagesData.success || !statsData.success) {
        setLoadError(true);
        return;
      }

      setLeads(leadsData.data);
      setStages(stagesData.data);
      setStats(statsData.data);
      if (leadProposalsData.success) {
        setSentProposalLeadIds(
          new Set(
            leadProposalsData.data
              .filter((p: any) => p.status === 'sent')
              .map((p: any) => p.leadId)
          )
        );
      }
    } catch (err) {
      console.error('Error fetching pipeline data:', err);
      setLoadError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Unified Export Handler (Excel .xlsx or CSV .csv)
  const handleExport = (format: 'xlsx' | 'csv' = 'xlsx') => {
    setIsExportDropdownOpen(false);
    if (filteredLeads.length === 0) {
      showToast('error', 'No leads available to export.');
      return;
    }

    const exportData = filteredLeads.map((l) => ({
      'Name': l.name || '',
      'Company': l.company || '',
      'Email': l.email || '',
      'Phone': l.phone || '',
      'Stage': l.status || 'New',
      'Source': l.source || 'Other',
      'Estimated Value': l.estimatedValue || 0,
      'Follow-up Date': l.followUpDate ? new Date(l.followUpDate).toISOString().slice(0, 10) : '',
      'Assigned To': l.assignedTo || 'Unassigned',
      'Notes': l.notes || '',
      'Created At': l.createdAt ? new Date(l.createdAt).toISOString().slice(0, 10) : '',
      'Won At': l.wonAt ? new Date(l.wonAt).toISOString().slice(0, 10) : '',
      'Converted At': l.convertedAt ? new Date(l.convertedAt).toISOString().slice(0, 10) : '',
      'Lost Reason': l.lostReason || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    const fileName = `clienter-leads-${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === 'csv') {
      XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
    } else {
      XLSX.writeFile(workbook, fileName, { bookType: 'xlsx' });
    }
  };

  // Import Handler (Supports .xlsx, .xls, .csv, .json)
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (jsonRows.length === 0) {
          showToast('error', 'Uploaded file is empty or missing data rows.');
          return;
        }

        // Send parsed records to backend endpoint
        const response = await fetch(getApiUrl('/leads/import'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify({ leads: jsonRows }),
        });

        const resData = await response.json();
        if (resData.success) {
          showToast('success', `Successfully imported ${resData.count} lead(s) from "${file.name}".`);
          fetchPipelineData(true);
        } else {
          showToast('error', `Import failed: ${resData.message}`);
        }
      } catch (err: any) {
        showToast('error', `Error reading file: ${err.message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggingLeadId(leadId);
  };

  const handleDragEnd = () => {
    setDraggingLeadId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageName: string) => {
    e.preventDefault();
    if (dragOverStage !== stageName) {
      setDragOverStage(stageName);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string; action?: { label: string; onClick: () => void } } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (type: 'success' | 'error', text: string, action?: { label: string; onClick: () => void }) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, text, action });
    toastTimerRef.current = setTimeout(() => setToast(null), action ? 6000 : 5000);
  };

  const handleDrop = async (e: React.DragEvent, targetStageName: string) => {
    e.preventDefault();
    setDragOverStage(null);
    setDraggingLeadId(null);
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;
    await moveLead(leadId, targetStageName);
  };

  // Per-lead request-sequence counter. A status-string comparison ("is this
  // lead still showing the value I set?") looked like enough of a guard
  // against a stale failure clobbering a newer success, but it breaks when
  // two requests target the *same* stage (e.g. an impatient double-click
  // firing before the first optimistic update re-renders): both requests
  // read the same previousStatus, both set the same newStageName, so a
  // status-string check can't tell them apart - a late failure from the
  // first can still revert a real, server-confirmed success from the
  // second. A monotonic per-lead sequence number identifies which request
  // is actually the newest, regardless of what value it happens to share
  // with an earlier one, so only the request that's still "latest" when it
  // resolves is allowed to touch state.
  const moveSeqRef = useRef<Record<string, number>>({});

  // Shared by drag-drop and the keyboard "Move to stage" select so both paths
  // get the same optimistic update, server persistence, and an Undo toast on
  // success (a stage move is easy to trigger by accident, so the emergency
  // exit needs to be one click, not "drag it back and hope you remember where
  // it was").
  const moveLead = async (leadId: string, targetStageName: string) => {
    const lead = leads.find((l) => l._id === leadId);
    const previousStatus = lead?.status;
    if (!lead || previousStatus === targetStageName) return;

    const seq = (moveSeqRef.current[leadId] || 0) + 1;
    moveSeqRef.current[leadId] = seq;

    setLeads((prevLeads) =>
      prevLeads.map((l) => (l._id === leadId ? { ...l, status: targetStageName } : l))
    );

    await handleStageChange(leadId, targetStageName, previousStatus, {
      showUndo: true,
      leadName: lead.name || 'Lead',
      seq,
    });
  };

  const handleStageChange = async (
    leadId: string,
    newStageName: string,
    revertToStatus?: string,
    options?: { showUndo?: boolean; leadName?: string; seq?: number }
  ) => {
    try {
      const response = await fetch(getApiUrl(`/leads/${leadId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ status: newStageName }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        fetchPipelineData(true);
        // A newer move for this lead may have started since this request was
        // sent - if so, this one is superseded and shouldn't offer an Undo
        // that would stomp whatever the newer move is doing.
        const isLatest = options?.seq === undefined || moveSeqRef.current[leadId] === options.seq;
        if (options?.showUndo && revertToStatus !== undefined && isLatest) {
          showToast('success', `${options.leadName || 'Lead'} moved to ${newStageName}.`, {
            label: 'Undo',
            onClick: () => moveLead(leadId, revertToStatus),
          });
        }
      } else {
        throw new Error(data.message || 'Failed to move lead.');
      }
    } catch (err: any) {
      console.error('Failed to change lead stage:', err);
      const isLatest = options?.seq === undefined || moveSeqRef.current[leadId] === options.seq;
      if (revertToStatus !== undefined && isLatest) {
        // Only revert if no newer move for this lead has started since -
        // otherwise a late failure from a superseded request would stomp a
        // newer, possibly already-successful move.
        setLeads((prevLeads) =>
          prevLeads.map((l) => (l._id === leadId ? { ...l, status: revertToStatus } : l))
        );
      }
      showToast('error', err.message || 'Failed to move lead. It has been moved back.');
    }
  };

  const handleSelectToggle = (leadId: string) => {
    if (selectedLeadIds.includes(leadId)) {
      setSelectedLeadIds(selectedLeadIds.filter((id) => id !== leadId));
    } else {
      setSelectedLeadIds([...selectedLeadIds, leadId]);
    }
  };

  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');

  const requestBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    setBulkDeleteError('');
    setBulkDeleteConfirmOpen(true);
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    const token = localStorage.getItem('adminToken');
    const results = await Promise.allSettled(
      selectedLeadIds.map((id) =>
        fetch(getApiUrl(`/leads/${id}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
          if (!res.ok) throw new Error(`Failed to delete lead ${id}`);
          return res;
        })
      )
    );

    const failedCount = results.filter((r) => r.status === 'rejected').length;
    const succeededIds = selectedLeadIds.filter((_, i) => results[i].status === 'fulfilled');

    if (failedCount === 0) {
      setSelectedLeadIds([]);
      setBulkDeleteConfirmOpen(false);
    } else {
      setSelectedLeadIds(selectedLeadIds.filter((id) => !succeededIds.includes(id)));
      setBulkDeleteError(
        `${succeededIds.length} of ${selectedLeadIds.length} deleted — ${failedCount} failed. Try again for the rest.`
      );
    }
    setBulkDeleting(false);
    fetchPipelineData();
  };

  const filteredLeads = leads.filter((l) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (l.name || '').toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.phone || '').toLowerCase().includes(q)
    );
  });

  // "Send Proposal" only makes sense once a lead has actually reached the Proposal
  // Sent stage (or moved further along) - earlier stages shouldn't offer it.
  const proposalSentStage = stages.find((s) => s.name.trim().toLowerCase() === 'proposal sent');

  useHotkey('/', () => searchInputRef.current?.focus());
  useHotkey('n', () => {
    setTargetStageForNewLead(stages.length > 0 ? stages[0].name : 'New');
    setIsNewLeadOpen(true);
  });

  return (
    <div className="h-full min-h-0 flex flex-col gap-2">
      {toast && (
        <div
          role="status"
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          className={`fixed top-20 right-6 z-50 max-w-sm flex items-center gap-3 px-4 py-3 rounded-operateLg text-white text-xs font-semibold shadow-hover ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-dark'
          }`}
        >
          <span className="flex-1">{toast.text}</span>
          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                setToast(null);
              }}
              className="focus-ring shrink-0 underline underline-offset-2 hover:text-primary transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
      <SEOHead
        title="Leads Pipeline | Build Your Thoughts Admin"
        description="Manage, drag-and-drop, edit, export and import sales CRM prospects"
      />

      {/* Hidden File Input for Excel (.xlsx, .xls) / CSV / JSON Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".xlsx,.xls,.csv,.json"
        className="hidden"
      />

      {/* Search & Actions */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slateText" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search leads by name, company, email, or phone... (press / to focus)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus-ring w-full pl-10 pr-4 py-2.5 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2.5 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center gap-1.5"
            title="Import leads from Excel (.xlsx, .xls) or CSV"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </button>

          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              aria-expanded={isExportDropdownOpen}
              aria-haspopup="menu"
              className="px-3 py-2.5 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center gap-1.5"
              title={
                searchTerm.trim()
                  ? `Export the ${filteredLeads.length} matching lead(s)`
                  : 'Export leads to Excel or CSV'
              }
            >
              <Download className="w-3.5 h-3.5" /> Export{searchTerm.trim() ? ` (${filteredLeads.length})` : ''}
              <ChevronDown className="w-3 h-3 text-slateText ml-0.5" />
            </button>

            {isExportDropdownOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-dark/10 py-1.5 z-50 animate-in fade-in zoom-in duration-150">
                <button
                  role="menuitem"
                  onClick={() => handleExport('xlsx')}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-dark hover:bg-lime-50 hover:text-dark transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Export Excel (.xlsx)
                </button>
                <button
                  role="menuitem"
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-dark hover:bg-lime-50 hover:text-dark transition-colors flex items-center gap-2 border-t border-dark/5"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  Export CSV (.csv)
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSelectMode(!isSelectMode)}
            className={`px-3 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all ${
              isSelectMode ? 'bg-primary text-dark' : 'bg-white border border-dark/15 hover:border-dark/30 text-dark'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {isSelectMode ? 'Exit' : 'Select'}
          </button>

          <button
            onClick={() => setIsManageStagesOpen(true)}
            className="px-3 py-2.5 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" /> Stages
          </button>

          <button
            onClick={() => {
              setTargetStageForNewLead(stages.length > 0 ? stages[0].name : 'New');
              setIsNewLeadOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Lead
          </button>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {isSelectMode && selectedLeadIds.length > 0 && (
        <div className="shrink-0 p-3 bg-lime-50 border border-primary/40 rounded-operateLg flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="text-xs font-bold text-dark">
            {selectedLeadIds.length} lead(s) selected
          </span>
          <Button variant="secondary" size="sm" onClick={requestBulkDelete} className="text-rose-600 border-rose-200 hover:bg-rose-50">
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Selected
          </Button>
        </div>
      )}

      {/* Horizontal Scroll Track Kanban Board */}
      <div ref={boardRef} className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden overscroll-x-none pb-6 cursor-grab select-none">
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slateText animate-pulse">
            Loading pipeline leads...
          </div>
        ) : loadError ? (
          <div className="py-20 text-center space-y-3">
            <p className="text-rose-600 text-sm font-semibold">Couldn't load the pipeline.</p>
            <p className="text-slateText text-xs">Check your connection and try again.</p>
            <button
              onClick={() => fetchPipelineData()}
              className="focus-ring px-4 py-2 rounded-xl bg-dark text-white text-xs font-bold hover:bg-dark/90"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-row gap-6 min-w-max pr-6 h-full">
            {stages.map((stage) => {
              const stageLeads = filteredLeads.filter((l) => l.status === stage.name);
              const isDropTarget = dragOverStage === stage.name;

              return (
                <div
                  key={stage._id}
                  onDragOver={(e) => handleDragOver(e, stage.name)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.name)}
                  className={`w-[300px] shrink-0 bg-white rounded-operateLg border transition-all flex flex-col p-4 h-full min-h-0 ${
                    isDropTarget
                      ? 'border-primary bg-lime-50/40'
                      : 'border-dark/10 hover:border-dark/20'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-dark/10">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="font-display font-bold text-sm text-dark">{stage.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-background border border-dark/10 text-[10px] font-bold text-slateText">
                        {stageLeads.length}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setTargetStageForNewLead(stage.name);
                        setIsNewLeadOpen(true);
                      }}
                      className="p-1 hover:bg-dark/5 rounded-lg text-slateText hover:text-dark transition-colors"
                      title={`Add lead to ${stage.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add Lead Quick Button */}
                  <button
                    onClick={() => {
                      setTargetStageForNewLead(stage.name);
                      setIsNewLeadOpen(true);
                    }}
                    className="w-full mt-3 py-2 border border-dashed border-dark/20 hover:border-dark/40 rounded-xl text-xs font-bold text-slateText hover:text-dark hover:bg-dark/5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add lead
                  </button>

                  {/* Lead Cards Stream: fills the rest of the column's height so all
                      cards can be scrolled to and viewed properly. Wheel events over
                      this list scroll it vertically as normal; only wheel events over
                      the board background (outside any column list) pan the board
                      horizontally — see the native wheel listener above. */}
                  <div
                    data-lead-column={stageLeads.length === 0 ? 'empty' : 'filled'}
                    className="space-y-3 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 mt-3 no-scrollbar"
                  >
                    {stageLeads.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slateText/60 font-medium">
                        No leads in {stage.name}
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const isBeingDragged = draggingLeadId === lead._id;

                        const activateLead = () => {
                          if (isSelectMode) {
                            handleSelectToggle(lead._id);
                          } else {
                            setSelectedLeadForEdit(lead);
                            setIsEditModalOpen(true);
                          }
                        };

                        return (
                          <div
                            key={lead._id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, lead._id)}
                            onDragEnd={handleDragEnd}
                            onClick={activateLead}
                            role="button"
                            aria-label={isSelectMode ? `Select ${lead.name || 'lead'}` : `Edit ${lead.name || 'lead'}`}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.target !== e.currentTarget) return;
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                activateLead();
                              }
                            }}
                            className={`focus-ring p-4 bg-background rounded-2xl border transition-all cursor-pointer space-y-3 relative group ${
                              isBeingDragged
                                ? 'opacity-40 border-dashed border-dark'
                                : isSelectMode && selectedLeadIds.includes(lead._id)
                                ? 'border-primary ring-2 ring-primary bg-lime-50/20'
                                : 'border-dark/10 hover:border-dark/40 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                          >
                            {/* Drag Indicator, Selection Checkbox & Edit Icon */}
                            <div className="flex items-center justify-between text-slateText/50">
                              <GripVertical className="w-4 h-4 text-slateText/40 cursor-grab active:cursor-grabbing" />
                              <div className="flex items-center gap-1">
                                {isSelectMode ? (
                                  <input
                                    type="checkbox"
                                    checked={selectedLeadIds.includes(lead._id)}
                                    aria-label={`Select ${lead.name || 'lead'}`}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleSelectToggle(lead._id);
                                    }}
                                    className="accent-dark w-4 h-4 cursor-pointer"
                                  />
                                ) : (
                                  <>
                                    {(!proposalSentStage || stage.order >= proposalSentStage.order) && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedLeadForProposal({ _id: lead._id, name: lead.name, email: lead.email });
                                          setIsSendProposalOpen(true);
                                        }}
                                        className="focus-ring p-1 text-slateText/60 hover:text-dark hover:bg-dark/10 rounded-lg transition-colors"
                                        aria-label="Send Proposal"
                                        title="Send Proposal"
                                      >
                                        <FileSignature className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLeadForEdit(lead);
                                        setIsEditModalOpen(true);
                                      }}
                                      className="focus-ring p-1 text-slateText/60 hover:text-dark hover:bg-dark/10 rounded-lg transition-colors"
                                      aria-label="Edit Lead"
                                      title="Edit Lead"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    {/* Keyboard/screen-reader path for the pipeline stage-change that
                                        drag-and-drop otherwise gates entirely - same handler as handleDrop.
                                        The select sits invisibly over a fixed-size icon so the trigger
                                        stays compact without truncating stage names in the native
                                        dropdown itself (a 72px text label would clip "Proposal Sent"). */}
                                    <div className="relative p-1 text-slateText/60 hover:text-dark rounded-lg transition-colors">
                                      <ArrowRightLeft className="w-3.5 h-3.5 pointer-events-none" />
                                      <select
                                        value={stage.name}
                                        aria-label={`Move ${lead.name || 'lead'} to a different stage`}
                                        title="Move to stage"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => moveLead(lead._id, e.target.value)}
                                        className="focus-ring absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      >
                                        {stages.map((s) => (
                                          <option key={s._id} value={s.name}>
                                            {s.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Contact Name & Value */}
                            <div className="flex items-start justify-between">
                              <h4 className="font-display font-bold text-base text-dark capitalize group-hover:text-primary-dark transition-colors">
                                {lead.name}
                              </h4>
                              <span className="font-bold text-sm text-dark">
                                ₹{lead.estimatedValue ? lead.estimatedValue.toLocaleString('en-IN') : '0'}
                              </span>
                            </div>

                            {/* Contact Subtext */}
                            <div className="space-y-1 text-xs text-slateText">
                              {lead.company && (
                                <p className="flex items-center gap-1.5 font-medium">
                                  <Building className="w-3.5 h-3.5 text-slateText/70 shrink-0" />
                                  <span className="truncate">{lead.company}</span>
                                </p>
                              )}
                              {lead.phone && (
                                <p className="flex items-center gap-1.5 font-medium">
                                  <Phone className="w-3.5 h-3.5 text-slateText/70 shrink-0" />
                                  <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                                    {lead.phone}
                                  </a>
                                </p>
                              )}
                            </div>

                            {/* Badges Bar: Source, Date, Follow-up */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-dark/5 text-[10px]">
                              <Badge variant="dark" className="text-[9px] px-2 py-0.5">
                                {lead.source || 'Other'}
                              </Badge>

                              {sentProposalLeadIds.has(lead._id) && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1 border border-emerald-100">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Proposal Sent
                                </span>
                              )}

                              {lead.followUpDate && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold flex items-center gap-1 border border-rose-100">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(lead.followUpDate).getDate()}
                                </span>
                              )}

                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium flex items-center gap-1 border border-amber-100">
                                <MessageSquare className="w-3 h-3" />
                                Follow up NA
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        stages={stages}
        initialStageName={targetStageForNewLead}
        onLeadAdded={fetchPipelineData}
      />

      <ManageStagesModal
        isOpen={isManageStagesOpen}
        onClose={() => setIsManageStagesOpen(false)}
        stages={stages}
        onStagesUpdated={fetchPipelineData}
      />

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLeadForEdit(null);
        }}
        lead={selectedLeadForEdit}
        stages={stages}
        onLeadUpdated={fetchPipelineData}
      />

      <SendProposalModal
        isOpen={isSendProposalOpen}
        onClose={() => {
          setIsSendProposalOpen(false);
          setSelectedLeadForProposal(null);
        }}
        lead={selectedLeadForProposal}
        onSent={() => fetchPipelineData(true)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => {
          setBulkDeleteConfirmOpen(false);
          setBulkDeleteError('');
        }}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedLeadIds.length} lead(s)?`}
        description="Selected leads will be permanently removed."
        confirmLabel="Delete"
        destructive
        isSubmitting={bulkDeleting}
        error={bulkDeleteError}
      />
    </div>
  );
};
