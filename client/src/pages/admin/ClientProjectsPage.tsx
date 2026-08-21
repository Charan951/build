import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { SEOHead } from '../../components/seo/SEOHead';
import {
  Plus,
  Search,
  Download,
  TrendingUp,
  Calendar,
  Users,
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { formatMoney } from '../../utils/format';

interface ProjectItem {
  _id: string;
  projectName: string;
  description?: string;
  projectType: 'one_off' | 'retainer';
  clientId?: { _id: string; companyName: string; currency?: string } | string;
  budget: number;
  paidAmount: number;
  targetDeliveryDate?: string;
  status: 'planning' | 'in_progress' | 'testing' | 'deployed' | 'completed' | 'on_hold';
  teamMembers: any[];
}

type ColumnId = 'new' | 'ongoing' | 'completed';

const COLUMNS: { id: ColumnId; label: string; dot: string; badge: string; representativeStatus: ProjectItem['status'] }[] = [
  { id: 'new', label: 'New', dot: '#a855f7', badge: 'bg-purple-100 text-purple-700', representativeStatus: 'planning' },
  { id: 'ongoing', label: 'Ongoing', dot: '#10b981', badge: 'bg-emerald-100 text-emerald-700', representativeStatus: 'in_progress' },
  { id: 'completed', label: 'Completed', dot: '#3b82f6', badge: 'bg-blue-100 text-blue-700', representativeStatus: 'completed' },
];

const columnOf = (status: ProjectItem['status']): ColumnId => {
  if (status === 'planning') return 'new';
  if (status === 'completed') return 'completed';
  return 'ongoing'; // in_progress, testing, deployed, on_hold
};

const clientName = (p: ProjectItem): string =>
  typeof p.clientId === 'object' && p.clientId ? p.clientId.companyName : '';

const clientCurrency = (p: ProjectItem): string | undefined =>
  typeof p.clientId === 'object' && p.clientId ? p.clientId.currency : undefined;

export const ClientProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);

  const token = localStorage.getItem('adminToken');
  const boardRef = useRef<HTMLDivElement>(null);

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

  const fetchProjects = () => {
    setLoading(true);
    apiFetch('/crm/projects', { token })
      .then((res) => {
        if (res.success) setProjects(res.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDrop = (e: React.DragEvent, column: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const projectId = e.dataTransfer.getData('text/plain');
    if (!projectId) return;
    const status = COLUMNS.find((c) => c.id === column)!.representativeStatus;
    setProjects((prev) => prev.map((p) => (p._id === projectId ? { ...p, status } : p)));
    apiFetch(`/crm/projects/${projectId}`, { method: 'PUT', token, body: JSON.stringify({ status }) }).then((res) => {
      if (res.success) fetchProjects();
    });
  };

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clientName(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [projects, searchTerm]
  );

  const handleExport = (format: 'csv' | 'json') => {
    if (projects.length === 0) return;
    const rows = projects.map((p) => ({
      'Project Name': p.projectName,
      'Client': clientName(p),
      'Status': COLUMNS.find((c) => c.id === columnOf(p.status))?.label || p.status,
      'Type': p.projectType === 'retainer' ? 'Retainer' : 'One-off',
      'Budget': p.budget || 0,
      'Paid': p.paidAmount || 0,
      'Deadline': p.targetDeliveryDate ? p.targetDeliveryDate.slice(0, 10) : '',
      'Team Size': p.teamMembers?.length || 0,
    }));
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects');
    XLSX.writeFile(workbook, `projects-${new Date().toISOString().slice(0, 10)}.csv`, { bookType: 'csv' });
  };

  return (
    <div className="h-full min-h-0 flex flex-col gap-4">
      <SEOHead title="Client Projects | Admin Dashboard" />

      {/* Search & Actions */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slateText" />
          <input
            type="text"
            placeholder="Search projects, clients, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => navigate('/dashboard/client-projects/new')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={projects.length === 0}
            className="px-3 py-2.5 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={projects.length === 0}
            className="px-3 py-2.5 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
        </div>
      </div>

      <div ref={boardRef} className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden overscroll-x-none pb-4 no-scrollbar">
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slateText animate-pulse">Loading projects...</div>
        ) : (
          <div className="flex flex-row gap-5 min-w-max pr-6 h-full">
            {COLUMNS.map((col) => {
              const colProjects = filtered.filter((p) => columnOf(p.status) === col.id);
              const isDropTarget = dragOverColumn === col.id;
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverColumn !== col.id) setDragOverColumn(col.id);
                  }}
                  onDragLeave={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`w-[320px] shrink-0 bg-white rounded-card border transition-all flex flex-col p-4 h-full min-h-0 ${
                    isDropTarget
                      ? 'border-[#CDFB47] ring-4 ring-[#CDFB47]/60 shadow-2xl bg-lime-100/30 scale-[1.02] border-2'
                      : 'border-dark/10 hover:border-dark/20'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-dark/10 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.dot }} />
                      <h3 className="font-display font-bold text-sm text-dark">{col.label}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-background border border-dark/10 text-[10px] font-bold text-slateText">
                        {colProjects.length}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/client-projects/new')}
                      className="p-1 hover:bg-dark/5 rounded-lg text-slateText hover:text-dark transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div data-project-column className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1 mt-3 no-scrollbar">
                    {colProjects.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slateText/60 font-medium">
                        No {col.label.toLowerCase()} projects
                      </div>
                    ) : (
                      colProjects.map((p) => {
                        const budget = p.budget || 0;
                        const paidAmount = p.paidAmount || 0;
                        const pct = budget > 0 ? Math.min(100, (paidAmount / budget) * 100) : 0;
                        const pending = Math.max(0, budget - paidAmount);
                        return (
                          <div
                            key={p._id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', p._id);
                              setDraggingId(p._id);
                            }}
                            onDragEnd={() => setDraggingId(null)}
                            onClick={() => navigate(`/dashboard/client-projects/${p._id}`)}
                            className={`p-4 bg-background rounded-2xl border cursor-pointer space-y-2.5 transition-all ${
                              draggingId === p._id
                                ? 'opacity-40 border-dashed border-dark'
                                : 'border-dark/10 hover:border-dark/40 hover:shadow-md hover:-translate-y-0.5'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-display font-bold text-sm text-dark leading-tight">{p.projectName}</h4>
                              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold ${col.badge}`}>
                                {col.label}
                              </span>
                            </div>
                            {clientName(p) && <p className="text-[10.5px] text-slateText font-semibold">{clientName(p)}</p>}
                            {p.description && <p className="text-[10.5px] text-slateText/80 line-clamp-2">{p.description}</p>}

                            <div className="pt-1.5">
                              <div className="flex items-center justify-between text-[10px] text-slateText font-semibold mb-1">
                                <span>Budget progress</span>
                                <span className="font-bold text-dark">
                                  {formatMoney(paidAmount, clientCurrency(p))} / {formatMoney(budget, clientCurrency(p))}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-dark/10 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                              </div>
                            </div>

                            {pending > 0 && (
                              <p className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                <TrendingUp className="w-3 h-3" /> Pending: {formatMoney(pending, clientCurrency(p))}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-slateText font-semibold pt-2 border-t border-dark/5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {p.targetDeliveryDate ? new Date(p.targetDeliveryDate).toLocaleDateString('en-GB') : 'No deadline'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {p.teamMembers?.length || 0} members
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
    </div>
  );
};
