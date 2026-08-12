import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Badge } from '../../components/ui/Badge';
import {
  ChevronLeft,
  ListChecks,
  FileSignature,
  Receipt,
  Globe,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Circle,
  Server,
} from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';

type Tab = 'overview' | 'tasks' | 'quotations' | 'payments' | 'domain';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Circle },
  { id: 'tasks', label: 'To-do List', icon: ListChecks },
  { id: 'quotations', label: 'Quotations', icon: FileSignature },
  { id: 'payments', label: 'Payments & Invoices', icon: Receipt },
  { id: 'domain', label: 'Domain & Hosting', icon: Globe },
];

const statusStyles: Record<string, string> = {
  planning: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  testing: 'bg-purple-50 text-purple-700 border-purple-200',
  deployed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  on_hold: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const ClientProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('clientToken');

  const [project, setProject] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  const fetchProject = () => {
    apiFetch(`/portal/projects/${id}`, { token }).then((res) => {
      if (res.success) setProject(res.data);
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/portal/projects/${id}`, { token }),
      apiFetch('/portal/invoices', { token }),
    ])
      .then(([pRes, iRes]) => {
        if (pRes.success) setProject(pRes.data);
        if (iRes.success) setInvoices((iRes.data || []).filter((inv: any) => String(inv.projectId) === id));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    apiFetch(`/portal/projects/${id}/client-tasks`, {
      method: 'POST',
      token,
      body: JSON.stringify({ title: newTaskTitle.trim() }),
    })
      .then((res) => {
        if (res.success) {
          setProject(res.data);
          setNewTaskTitle('');
        }
      })
      .finally(() => setAddingTask(false));
  };

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    apiFetch(`/portal/projects/${id}/client-tasks/${taskId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ status: currentStatus === 'done' ? 'todo' : 'done' }),
    }).then((res) => {
      if (res.success) setProject(res.data);
    });
  };

  const handleViewQuotation = (quotationId: string) => {
    const src = getApiUrl(`/portal/projects/${id}/quotations/${quotationId}/pdf`);
    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => window.open(URL.createObjectURL(blob), '_blank'));
  };

  const handleViewInvoice = (invoiceId: string) => {
    const src = getApiUrl(`/portal/invoices/${invoiceId}/pdf`);
    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => window.open(URL.createObjectURL(blob), '_blank'));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-dark/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <p className="text-sm font-semibold text-slateText">Project not found.</p>
        <button
          onClick={() => navigate('/portal')}
          className="px-4 py-2 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back to Portal
        </button>
      </div>
    );
  }

  const doneTasks = (project.clientTasks || []).filter((t: any) => t.status === 'done').length;
  const totalClientTasks = (project.clientTasks || []).length;
  const balance = (project.budget || 0) - (project.paidAmount || 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${project.projectName} | Client Portal`} />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <button
          onClick={() => navigate('/portal')}
          className="flex items-center gap-1.5 text-xs font-bold text-slateText hover:text-dark transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Portal
        </button>

        <div className="bg-white rounded-card border border-dark/10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark">{project.projectName}</h1>
              {project.description && <p className="text-xs text-slateText mt-2 max-w-xl">{project.description}</p>}
              <span
                className={`inline-block mt-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                  statusStyles[project.status] || 'bg-dark/5 text-slateText border-dark/10'
                }`}
              >
                {(project.status || '').replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark/10 max-w-md">
            <div>
              <p className="text-[10px] font-bold text-slateText uppercase">Budget</p>
              <p className="font-bold text-lg text-dark">₹{(project.budget || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slateText uppercase">Paid</p>
              <p className="font-bold text-lg text-emerald-600">₹{(project.paidAmount || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slateText uppercase">Balance</p>
              <p className="font-bold text-lg text-rose-600">₹{balance.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-dark/10 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? 'border-primary text-dark' : 'border-transparent text-slateText hover:text-dark'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.id === 'tasks' && totalClientTasks > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-dark/5 text-[9px] font-bold text-slateText">
                  {doneTasks}/{totalClientTasks}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="bg-white rounded-card border border-dark/10 p-6 space-y-4">
            <h3 className="font-display text-sm font-bold text-dark">Progress Updates</h3>
            {(project.progressUpdates || []).length === 0 ? (
              <p className="text-xs text-slateText py-6 text-center">No updates shared yet.</p>
            ) : (
              <div className="space-y-2">
                {[...project.progressUpdates].reverse().map((u: any) => (
                  <div key={u._id} className="p-3 rounded-xl bg-background border border-dark/10">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-xs text-dark">{u.title}</p>
                      <span className="text-[10px] text-slateText shrink-0">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {u.note && <p className="text-[11px] text-slateText mt-1">{u.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks / To-do */}
        {tab === 'tasks' && (
          <div className="space-y-4">
            <div className="bg-white rounded-card border border-dark/10 p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-dark">Your To-do List</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add something you need from the team..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  className="flex-1 px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
                <button
                  onClick={handleAddTask}
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="px-3 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {(project.clientTasks || []).length === 0 ? (
                <p className="text-xs text-slateText py-4 text-center">No to-do items yet.</p>
              ) : (
                <div className="divide-y divide-dark/5">
                  {project.clientTasks.map((t: any) => (
                    <button
                      key={t._id}
                      onClick={() => handleToggleTask(t._id, t.status)}
                      className="w-full py-2.5 flex items-center gap-2.5 text-left group"
                    >
                      {t.status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slateText/40 shrink-0 group-hover:text-dark" />
                      )}
                      <span
                        className={`text-xs ${
                          t.status === 'done' ? 'line-through text-slateText' : 'text-dark font-semibold'
                        }`}
                      >
                        {t.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-card border border-dark/10 p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-dark">Team Task Board</h3>
              {(project.tasks || []).length === 0 ? (
                <p className="text-xs text-slateText py-4 text-center">No tasks logged yet.</p>
              ) : (
                <div className="divide-y divide-dark/5">
                  {project.tasks.map((t: any) => (
                    <div key={t._id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-dark truncate">{t.title}</p>
                        {t.dueDate && (
                          <p className="text-[10px] text-slateText">Due {new Date(t.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-dark/5 text-[9px] font-bold text-slateText uppercase shrink-0">
                        {(t.status || '').replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quotations */}
        {tab === 'quotations' && (
          <div className="bg-white rounded-card border border-dark/10 p-2">
            {(project.quotations || []).length === 0 ? (
              <p className="text-xs text-slateText py-8 text-center">No quotations shared yet.</p>
            ) : (
              <div className="divide-y divide-dark/5">
                {project.quotations.map((q: any) => (
                  <div key={q._id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <FileSignature className="w-4.5 h-4.5 text-dark" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-dark truncate">{q.quotationNumber}</p>
                        <p className="text-[10px] text-slateText">
                          {q.status} {q.validUntil && `· Valid until ${new Date(q.validUntil).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewQuotation(q._id)}
                      className="px-3 py-1.5 rounded-lg bg-dark/5 hover:bg-dark/10 text-dark font-bold text-[10px] flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3 h-3" /> View PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments & Invoices */}
        {tab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-card border border-dark/10 p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-dark">Payment History</h3>
              {(project.payments || []).length === 0 ? (
                <p className="text-xs text-slateText py-6 text-center">No payments recorded yet.</p>
              ) : (
                <div className="divide-y divide-dark/5">
                  {[...project.payments].reverse().map((p: any) => (
                    <div key={p._id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-xs text-dark">₹{(p.amount || 0).toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-slateText">
                          {p.method} · {p.date ? new Date(p.date).toLocaleDateString() : ''}
                        </p>
                      </div>
                      {p.note && <p className="text-[10px] text-slateText max-w-[140px] text-right">{p.note}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-card border border-dark/10 p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-dark">Invoices</h3>
              {invoices.length === 0 ? (
                <p className="text-xs text-slateText py-6 text-center">No invoices for this project yet.</p>
              ) : (
                <div className="divide-y divide-dark/5">
                  {invoices.map((inv) => (
                    <div key={inv._id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {inv.status === 'paid' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-dark truncate">{inv.invoiceNumber}</p>
                          <p className="text-[10px] text-slateText">₹{inv.totalAmount?.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewInvoice(inv._id)}
                        className="p-1.5 text-slateText hover:text-dark rounded-lg hover:bg-dark/5 shrink-0"
                        title="View / Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Domain & Hosting */}
        {tab === 'domain' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-card border border-dark/10 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-dark" />
                <h3 className="font-display text-sm font-bold text-dark">Domain</h3>
              </div>
              {project.domain?.name ? (
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-dark">{project.domain.name}</p>
                  {project.domain.registrar && <p className="text-slateText">Registrar: {project.domain.registrar}</p>}
                  {project.domain.expiresOn && (
                    <p className="text-slateText">Expires: {new Date(project.domain.expiresOn).toLocaleDateString()}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slateText py-4 text-center">No domain details added yet.</p>
              )}
            </div>

            <div className="bg-white rounded-card border border-dark/10 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-dark" />
                <h3 className="font-display text-sm font-bold text-dark">Hosting</h3>
              </div>
              {project.hosting?.provider ? (
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-dark">{project.hosting.provider}</p>
                  {project.hosting.expiresOn && (
                    <p className="text-slateText">Renews: {new Date(project.hosting.expiresOn).toLocaleDateString()}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slateText py-4 text-center">No hosting details added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
