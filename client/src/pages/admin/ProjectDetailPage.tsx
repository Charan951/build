import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import {
  ChevronLeft,
  Trash2,
  Pencil,
  IndianRupee,
  Users,
  TrendingUp,
  CheckSquare,
  Plus,
  UserPlus,
  X,
  Receipt,
  Download,
  CheckCircle2,
  Save,
  History,
  Calendar,
} from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';
import { buildDefaultQuotationPages } from './QuotationEditorPage';

const STATUS_LABEL: Record<string, string> = {
  planning: 'New',
  in_progress: 'Ongoing',
  testing: 'Testing',
  deployed: 'Deployed',
  completed: 'Completed',
  on_hold: 'On Hold',
};

const PAYMENT_METHODS = ['UPI', 'NetBanking', 'Wire', 'Cheque', 'Cash'];

const TASK_COLUMNS: { id: string; label: string; statuses: string[]; dropStatus: string }[] = [
  { id: 'todo', label: 'To do', statuses: ['backlog', 'todo'], dropStatus: 'todo' },
  { id: 'in_progress', label: 'In progress', statuses: ['in_progress', 'code_review', 'qa_testing'], dropStatus: 'in_progress' },
  { id: 'done', label: 'Completed', statuses: ['done'], dropStatus: 'done' },
];

type Tab = 'overview' | 'payments' | 'tasks' | 'team' | 'domain' | 'quotations';

interface LineItemForm {
  description: string;
  qty: string;
  rate: string;
  taxPercent: string;
}

const EMPTY_LINE_ITEM: LineItemForm = { description: '', qty: '1', rate: '0', taxPercent: '0' };

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  const [updateTitle, setUpdateTitle] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverTaskCol, setDragOverTaskCol] = useState<string | null>(null);

  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentNote, setPaymentNote] = useState('');

  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPaymentAmount, setEditPaymentAmount] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('UPI');
  const [editPaymentNote, setEditPaymentNote] = useState('');
  const [historyPaymentId, setHistoryPaymentId] = useState<string | null>(null);

  const [teamPaymentOpen, setTeamPaymentOpen] = useState(false);
  const [teamPaymentMember, setTeamPaymentMember] = useState('');
  const [teamPaymentAmount, setTeamPaymentAmount] = useState('');

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    fromName: 'Build Your Thoughts',
    fromEmail: '',
    fromPhone: '',
    billToName: '',
    billToEmail: '',
    billToPhone: '',
    notes: 'Thank you for your business.',
  });
  const [lineItems, setLineItems] = useState<LineItemForm[]>([{ ...EMPTY_LINE_ITEM }]);
  const [savingInvoice, setSavingInvoice] = useState(false);

  const [creatingQuotation, setCreatingQuotation] = useState(false);

  const fetchProject = () => {
    setLoading(true);
    apiFetch('/crm/projects', { token })
      .then((res) => {
        if (res.success) {
          const found = (res.data || []).find((p: any) => p._id === id);
          setProject(found || null);
          const clientId = typeof found?.clientId === 'object' ? found.clientId?._id : found?.clientId;
          if (clientId) {
            apiFetch('/crm/clients', { token }).then((cRes) => {
              if (cRes.success) setClient((cRes.data || []).find((c: any) => c._id === clientId) || null);
            });
          }
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchInvoices = () => {
    setInvoicesLoading(true);
    apiFetch(`/crm/invoices?projectId=${id}`, { token })
      .then((res) => {
        if (res.success) setInvoices(res.data || []);
      })
      .finally(() => setInvoicesLoading(false));
  };

  useEffect(() => {
    fetchProject();
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = () => {
    if (!window.confirm('Move this project to trash? This cannot be undone.')) return;
    apiFetch(`/crm/projects/${id}`, { method: 'DELETE', token }).then((res) => {
      if (res.success) navigate('/dashboard/client-projects');
    });
  };

  const handleAddUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim()) return;
    apiFetch(`/crm/projects/${id}/updates`, {
      method: 'POST',
      token,
      body: JSON.stringify({ title: updateTitle.trim(), note: updateNote.trim() }),
    }).then((res) => {
      if (res.success) {
        setUpdateTitle('');
        setUpdateNote('');
        fetchProject();
      }
    });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;
    apiFetch(`/crm/projects/${id}/payments`, {
      method: 'POST',
      token,
      body: JSON.stringify({ amount: parseFloat(paymentAmount), method: paymentMethod, note: paymentNote.trim() }),
    }).then((res) => {
      if (res.success) {
        setPaymentOpen(false);
        setPaymentAmount('');
        setPaymentNote('');
        fetchProject();
        fetchInvoices();
      }
    });
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!window.confirm('Delete this payment?')) return;
    apiFetch(`/crm/projects/${id}/payments/${paymentId}`, { method: 'DELETE', token }).then((res) => {
      if (res.success) fetchProject();
    });
  };

  const openEditPayment = (p: any) => {
    setEditingPaymentId(p._id);
    setEditPaymentAmount(String(p.amount));
    setEditPaymentMethod(p.method || 'UPI');
    setEditPaymentNote(p.note || '');
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaymentId || !editPaymentAmount) return;
    apiFetch(`/crm/projects/${id}/payments/${editingPaymentId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ amount: parseFloat(editPaymentAmount), method: editPaymentMethod, note: editPaymentNote.trim() }),
    }).then((res) => {
      if (res.success) {
        setEditingPaymentId(null);
        fetchProject();
        fetchInvoices();
      }
    });
  };

  const handleAddTeamPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamPaymentMember || !teamPaymentAmount) return;
    apiFetch(`/crm/projects/${id}/team-payments`, {
      method: 'POST',
      token,
      body: JSON.stringify({ memberName: teamPaymentMember, amount: parseFloat(teamPaymentAmount) }),
    }).then((res) => {
      if (res.success) {
        setTeamPaymentOpen(false);
        setTeamPaymentMember('');
        setTeamPaymentAmount('');
        fetchProject();
      }
    });
  };

  const handleDeleteTeamPayment = (paymentId: string) => {
    apiFetch(`/crm/projects/${id}/team-payments/${paymentId}`, { method: 'DELETE', token }).then((res) => {
      if (res.success) fetchProject();
    });
  };

  const openNewInvoiceModal = () => {
    setEditingInvoiceId(null);
    setInvoiceForm({
      invoiceNumber: '',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: '',
      fromName: 'Build Your Thoughts',
      fromEmail: '',
      fromPhone: '',
      billToName: client?.companyName || '',
      billToEmail: client?.billingEmail || '',
      billToPhone: client?.phone || '',
      notes: 'Thank you for your business.',
    });
    setLineItems([{ ...EMPTY_LINE_ITEM }]);
    setInvoiceModalOpen(true);
  };

  const openEditInvoiceModal = (inv: any) => {
    setEditingInvoiceId(inv._id);
    setInvoiceForm({
      invoiceNumber: inv.invoiceNumber || '',
      issueDate: inv.createdAt ? inv.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : '',
      fromName: inv.fromName || 'Build Your Thoughts',
      fromEmail: inv.fromEmail || '',
      fromPhone: inv.fromPhone || '',
      billToName: inv.billToName || '',
      billToEmail: inv.billToEmail || '',
      billToPhone: inv.billToPhone || '',
      notes: inv.notes || '',
    });
    setLineItems(
      (inv.lineItems || []).map((li: any) => ({
        description: li.description || '',
        qty: String(li.quantity ?? 1),
        rate: String(li.price ?? 0),
        taxPercent: '0',
      }))
    );
    setInvoiceModalOpen(true);
  };

  const invoiceTotals = lineItems.reduce(
    (acc, li) => {
      const amount = (parseFloat(li.qty) || 0) * (parseFloat(li.rate) || 0);
      const tax = amount * ((parseFloat(li.taxPercent) || 0) / 100);
      return { subtotal: acc.subtotal + amount, tax: acc.tax + tax };
    },
    { subtotal: 0, tax: 0 }
  );

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInvoice(true);
    const payload = {
      ...invoiceForm,
      invoiceNumber: invoiceForm.invoiceNumber || undefined,
      lineItems: lineItems.map((li) => ({
        description: li.description,
        qty: parseFloat(li.qty) || 1,
        rate: parseFloat(li.rate) || 0,
        taxPercent: parseFloat(li.taxPercent) || 0,
      })),
    };
    const request = editingInvoiceId
      ? apiFetch(`/crm/projects/${id}/invoices/${editingInvoiceId}`, { method: 'PUT', token, body: JSON.stringify(payload) })
      : apiFetch(`/crm/projects/${id}/invoices`, { method: 'POST', token, body: JSON.stringify(payload) });

    request
      .then((res) => {
        if (res.success) {
          setInvoiceModalOpen(false);
          fetchInvoices();
        }
      })
      .finally(() => setSavingInvoice(false));
  };

  const handleMarkPaid = (invoiceId: string) => {
    apiFetch(`/crm/projects/${id}/invoices/${invoiceId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ markPaid: true }),
    }).then((res) => {
      if (res.success) fetchInvoices();
    });
  };

  const handleMarkDue = (invoiceId: string) => {
    apiFetch(`/crm/projects/${id}/invoices/${invoiceId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ markDue: true }),
    }).then((res) => {
      if (res.success) fetchInvoices();
    });
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (!window.confirm('Delete this invoice?')) return;
    apiFetch(`/crm/projects/${id}/invoices/${invoiceId}`, { method: 'DELETE', token }).then((res) => {
      if (res.success) fetchInvoices();
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    apiFetch(`/crm/projects/${id}/tasks`, {
      method: 'POST',
      token,
      body: JSON.stringify({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        assigneeName: newTaskAssignee.trim(),
        dueDate: newTaskDueDate || undefined,
      }),
    }).then((res) => {
      if (res.success) {
        setTaskModalOpen(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskAssignee('');
        setNewTaskDueDate('');
        fetchProject();
      }
    });
  };

  const handleSetTaskStatus = (taskId: string, status: string) => {
    apiFetch(`/crm/projects/${id}/tasks/status`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ taskId, status }),
    }).then((res) => {
      if (res.success) fetchProject();
    });
  };

  const handleDeleteTask = (taskId: string) => {
    apiFetch(`/crm/projects/${id}/tasks/${taskId}`, { method: 'DELETE', token }).then((res) => {
      if (res.success) fetchProject();
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;
    apiFetch(`/crm/projects/${id}/team`, {
      method: 'POST',
      token,
      body: JSON.stringify({ name: memberName.trim(), email: memberEmail.trim() }),
    }).then((res) => {
      if (res.success) {
        setMemberName('');
        setMemberEmail('');
        fetchProject();
      }
    });
  };

  const handleRemoveMember = (memberId: string) => {
    apiFetch(`/crm/projects/${id}/team/${memberId}`, { method: 'DELETE', token }).then((res) => {
      if (res.success) fetchProject();
    });
  };

  const handleCreateQuotation = () => {
    setCreatingQuotation(true);
    apiFetch(`/crm/projects/${id}/quotations`, {
      method: 'POST',
      token,
      body: JSON.stringify({
        documentTitle: 'New Quotation',
        clientName: client?.companyName || '',
        pages: buildDefaultQuotationPages(),
      }),
    })
      .then((res) => {
        if (res.success) navigate(`/dashboard/client-projects/${id}/quotations/${res.data._id}`);
      })
      .finally(() => setCreatingQuotation(false));
  };

  const handleDeleteQuotation = (quotationId: string) => {
    if (!window.confirm('Delete this quotation?')) return;
    apiFetch(`/crm/projects/${id}/quotations/${quotationId}`, { method: 'DELETE', token }).then((res) => {
      if (res.success) fetchProject();
    });
  };

  if (loading) {
    return <div className="py-24 text-center text-slateText text-sm font-semibold animate-pulse">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="py-24 text-center space-y-3">
        <p className="text-slateText text-sm font-semibold">Project not found.</p>
        <button
          onClick={() => navigate('/dashboard/client-projects')}
          className="text-xs font-bold text-dark underline"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const budget = project.budget || 0;
  const paid = project.paidAmount || 0;
  const remaining = budget - paid;
  const expenses = project.expenses || 0;
  const profit = budget - expenses;
  const doneTasks = project.tasks.filter((t: any) => t.status === 'done').length;
  const budgetProgress = budget > 0 ? Math.min(100, (paid / budget) * 100) : 0;
  const clientCompany = typeof project.clientId === 'object' ? project.clientId?.companyName : '';
  const clientId = typeof project.clientId === 'object' ? project.clientId?._id : project.clientId;

  const deadline = project.targetDeliveryDate ? new Date(project.targetDeliveryDate) : null;
  let deadlineInfo: { daysLeft: number; pctElapsed: number; overdue: boolean } | null = null;
  if (deadline && project.startDate) {
    const start = new Date(project.startDate).getTime();
    const end = deadline.getTime();
    const now = Date.now();
    const totalMs = Math.max(end - start, 1);
    const elapsedMs = now - start;
    const daysLeft = Math.ceil((end - now) / 86400000);
    deadlineInfo = {
      daysLeft,
      pctElapsed: Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)),
      overdue: now > end,
    };
  }

  return (
    <div className="space-y-6">
      <SEOHead title={`${project.projectName} | Project`} />

      <button
        onClick={() => navigate('/dashboard/client-projects')}
        className="flex items-center gap-1.5 text-xs font-bold text-slateText hover:text-dark transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Projects
      </button>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark">{project.projectName}</h1>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-lime-100 text-dark text-[10px] font-bold uppercase">
                {STATUS_LABEL[project.status] || project.status}
              </span>
              {clientCompany && (
                <span className="text-slateText font-semibold">
                  Client:{' '}
                  <Link to={`/dashboard/clients/${clientId}`} className="text-dark underline">
                    {clientCompany}
                  </Link>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDelete}
              className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Move to Trash
            </button>
            <button
              onClick={() => navigate(`/dashboard/client-projects/${id}/edit`)}
              className="px-3 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs flex items-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Project
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-dark/10">
          <div className="p-3 rounded-xl bg-background border border-dark/10">
            <p className="text-[9px] font-bold text-slateText uppercase flex items-center gap-1">
              <IndianRupee className="w-3 h-3" /> Budget
            </p>
            <p className="font-bold text-sm text-dark mt-1">₹{budget.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-xl bg-background border border-dark/10">
            <p className="text-[9px] font-bold text-slateText uppercase">Paid</p>
            <p className="font-bold text-sm text-emerald-600 mt-1">₹{paid.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-xl bg-background border border-dark/10">
            <p className="text-[9px] font-bold text-slateText uppercase">Remaining</p>
            <p className="font-bold text-sm text-dark mt-1">₹{remaining.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-xl bg-background border border-dark/10">
            <p className="text-[9px] font-bold text-slateText uppercase flex items-center gap-1">
              <Users className="w-3 h-3" /> Team
            </p>
            <p className="font-bold text-sm text-dark mt-1">{project.teamMembers.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-background border border-dark/10">
            <p className="text-[9px] font-bold text-slateText uppercase">Expenses</p>
            <p className="font-bold text-sm text-rose-600 mt-1">₹{expenses.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-xl bg-background border border-dark/10">
            <p className="text-[9px] font-bold text-slateText uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Profit
            </p>
            <p className="font-bold text-sm text-dark mt-1">₹{profit.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-1 border-b border-dark/10 overflow-x-auto no-scrollbar">
        {(['overview', 'payments', 'tasks', 'team', 'quotations', 'domain'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-bold capitalize border-b-2 transition-colors whitespace-nowrap ${
              tab === t ? 'border-primary text-dark' : 'border-transparent text-slateText hover:text-dark'
            }`}
          >
            {t === 'domain' ? 'Domain & Hosting' : t === 'payments' ? 'Payments & Invoices' : t === 'quotations' ? 'Quotations' : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <Card className="p-6 space-y-4">
            <h3 className="font-display text-sm font-bold text-dark flex items-center gap-2">Progress</h3>
            {project.description && <p className="text-xs text-slateText">{project.description}</p>}

            <form onSubmit={handleAddUpdate} className="space-y-2 pt-2 border-t border-dark/5">
              <input
                type="text"
                placeholder="Title (e.g. Design phase)"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
              />
              <textarea
                rows={2}
                placeholder="What's happening now?"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-xs resize-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-[10px] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Update
              </button>
            </form>

            {project.progressUpdates.length > 0 && (
              <div className="space-y-2 pt-2">
                {project.progressUpdates.map((u: any) => (
                  <div key={u._id} className="p-3 rounded-xl bg-background border border-dark/10">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-dark">{u.title}</p>
                      <p className="text-[9px] text-slateText">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB') : ''}
                      </p>
                    </div>
                    {u.note && <p className="text-[11px] text-slateText mt-1">{u.note}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-dark/5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-dark">Budget Progress</span>
                <span className="font-bold text-dark">{budgetProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-dark/10 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${budgetProgress}%` }} />
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {deadlineInfo && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[10px] font-bold text-slateText uppercase">Deadline</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      deadlineInfo.overdue ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {deadlineInfo.overdue ? 'Overdue' : 'On Track'}
                  </span>
                </div>
                <p className="font-bold text-lg text-dark">
                  {deadline!.toLocaleDateString('en-GB')}
                </p>
                <div className="w-full h-1.5 rounded-full bg-dark/10 overflow-hidden mt-3 mb-1.5">
                  <div
                    className={`h-full ${deadlineInfo.overdue ? 'bg-rose-500' : 'bg-primary'}`}
                    style={{ width: `${deadlineInfo.pctElapsed}%` }}
                  />
                </div>
                <p className="text-[10px] text-slateText">
                  {deadlineInfo.overdue
                    ? `Overdue by ${Math.abs(deadlineInfo.daysLeft)} days`
                    : `${deadlineInfo.daysLeft} days left`}{' '}
                  · {deadlineInfo.pctElapsed.toFixed(0)}% of time elapsed
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-dark">Payments</h3>
                <span className="text-[10px] font-bold text-slateText uppercase">
                  Total Received:{' '}
                  <span className="text-emerald-600">₹{paid.toLocaleString('en-IN')}</span>
                </span>
              </div>

              {project.payments.length === 0 ? (
                <p className="text-xs text-slateText text-center py-6">No payments recorded yet.</p>
              ) : (
                <div className="divide-y divide-dark/5">
                  {project.payments.map((p: any) =>
                    editingPaymentId === p._id ? (
                      <form
                        key={p._id}
                        onSubmit={handleUpdatePayment}
                        className="py-3 space-y-2"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            required
                            value={editPaymentAmount}
                            onChange={(e) => setEditPaymentAmount(e.target.value)}
                            className="p-2 bg-background border border-dark/10 rounded-lg text-xs"
                          />
                          <select
                            value={editPaymentMethod}
                            onChange={(e) => setEditPaymentMethod(e.target.value)}
                            className="p-2 bg-background border border-dark/10 rounded-lg text-xs font-semibold"
                          >
                            {PAYMENT_METHODS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Note (optional)"
                          value={editPaymentNote}
                          onChange={(e) => setEditPaymentNote(e.target.value)}
                          className="w-full p-2 bg-background border border-dark/10 rounded-lg text-xs"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingPaymentId(null)}
                            className="px-3 py-1.5 rounded-lg border border-dark/20 text-dark font-bold text-[10px]"
                          >
                            Cancel
                          </button>
                          <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary text-dark font-bold text-[10px]">
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div key={p._id} className="py-3">
                        <div className="flex items-start justify-between">
                          <p className="font-bold text-base text-dark">₹{p.amount.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slateText/70">
                            {p.date ? new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {p.invoiceId && (
                            <a
                              href={getApiUrl(`/crm/projects/${id}/invoices/${p.invoiceId}/pdf?token=${encodeURIComponent(token || '')}`)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] font-bold text-primary-dark hover:underline"
                            >
                              <Receipt className="w-3 h-3" /> View Invoice
                            </a>
                          )}
                          <button
                            onClick={() => openEditPayment(p)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slateText hover:text-dark"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p._id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slateText hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                          {p.history?.length > 0 && (
                            <button
                              onClick={() => setHistoryPaymentId(historyPaymentId === p._id ? null : p._id)}
                              className="flex items-center gap-1 text-[11px] font-bold text-slateText hover:text-dark"
                            >
                              <History className="w-3 h-3" /> History
                            </button>
                          )}
                        </div>
                        {historyPaymentId === p._id && (
                          <div className="mt-2 space-y-1.5 p-2.5 rounded-lg bg-background border border-dark/10">
                            {p.history.map((h: any, idx: number) => (
                              <div key={idx} className="text-[10px] text-slateText flex items-center justify-between">
                                <span>
                                  ₹{(h.amount || 0).toLocaleString('en-IN')} · {h.method}
                                  {h.note ? ` · ${h.note}` : ''}
                                </span>
                                <span className="text-slateText/60">
                                  {h.editedAt ? new Date(h.editedAt).toLocaleString('en-GB') : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              {paymentOpen ? (
                <form onSubmit={handleAddPayment} className="p-3 rounded-xl bg-background border border-dark/10 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      placeholder="Amount (₹)"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="p-2 bg-white border border-dark/10 rounded-lg text-xs"
                    />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="p-2 bg-white border border-dark/10 rounded-lg text-xs font-semibold"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full p-2 bg-white border border-dark/10 rounded-lg text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentOpen(false)}
                      className="px-3 py-1.5 rounded-lg border border-dark/20 text-dark font-bold text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-primary text-dark font-bold text-[10px]"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setPaymentOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Payment
                </button>
              )}
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-dark flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" /> Invoices
                </h3>
                <button
                  onClick={openNewInvoiceModal}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-[#bce63b] text-dark font-bold text-[10px] flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New Invoice
                </button>
              </div>

              {invoicesLoading ? (
                <p className="text-xs text-slateText text-center py-6">Loading invoices...</p>
              ) : invoices.length === 0 ? (
                <p className="text-xs text-slateText text-center py-6">No invoices yet. Create one to send to your client.</p>
              ) : (
                <div className="space-y-2.5">
                  {invoices.map((inv) => {
                    const overdue = inv.status !== 'paid' && inv.dueDate && new Date(inv.dueDate) < new Date();
                    const isPaid = inv.status === 'paid';
                    return (
                      <div
                        key={inv._id}
                        className={`p-3.5 rounded-xl border space-y-1.5 ${
                          isPaid
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : overdue
                            ? 'bg-rose-50/60 border-rose-200'
                            : 'bg-background border-dark/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-xs text-dark flex items-center gap-1.5 flex-wrap">
                            {inv.invoiceNumber}
                            <span
                              className={`text-[9px] font-bold uppercase ${
                                isPaid ? 'text-emerald-600' : overdue ? 'text-rose-600' : 'text-amber-600'
                              }`}
                            >
                              {isPaid ? 'Paid' : overdue ? 'Overdue' : 'Unpaid'}
                            </span>
                          </p>
                          <p className="font-bold text-sm text-dark shrink-0">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-slateText">
                            Issued {new Date(inv.createdAt).toLocaleDateString('en-GB')}
                          </p>
                          <p className="text-[10px] text-slateText">
                            {inv.lineItems.length} item{inv.lineItems.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-1.5 border-t border-dark/5 flex-wrap">
                          <a
                            href={getApiUrl(`/crm/projects/${id}/invoices/${inv._id}/pdf?token=${encodeURIComponent(token || '')}`)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-slateText hover:text-dark"
                          >
                            <Download className="w-3 h-3" /> Download PDF
                          </a>
                          {isPaid ? (
                            <button
                              onClick={() => handleMarkDue(inv._id)}
                              className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700"
                            >
                              <History className="w-3 h-3" /> Mark Due
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMarkPaid(inv._id)}
                              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => openEditInvoiceModal(inv)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slateText hover:text-dark"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv._id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-slateText hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <Card className="p-6 space-y-3">
            <h3 className="font-display text-sm font-bold text-dark">Team Member Payments</h3>
            {project.teamPayments.length === 0 ? (
              <p className="text-xs text-slateText text-center py-4">No team payments recorded yet.</p>
            ) : (
              <div className="space-y-1.5">
                {project.teamPayments.map((p: any) => (
                  <div key={p._id} className="flex items-center justify-between p-2.5 rounded-lg bg-background group">
                    <div>
                      <p className="font-bold text-xs text-dark">{p.memberName}</p>
                      <p className="text-[10px] text-slateText">
                        ₹{p.amount.toLocaleString('en-IN')} ·{' '}
                        {p.date ? new Date(p.date).toLocaleDateString('en-GB') : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTeamPayment(p._id)}
                      className="opacity-0 group-hover:opacity-100 text-slateText hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {teamPaymentOpen ? (
              <form onSubmit={handleAddTeamPayment} className="p-3 rounded-xl bg-background border border-dark/10 flex flex-col sm:flex-row gap-2">
                <select
                  required
                  value={teamPaymentMember}
                  onChange={(e) => setTeamPaymentMember(e.target.value)}
                  className="flex-1 p-2 bg-white border border-dark/10 rounded-lg text-xs font-semibold"
                >
                  <option value="">Select member</option>
                  {project.teamMembers.map((m: any) => (
                    <option key={m._id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  required
                  placeholder="Amount (₹)"
                  value={teamPaymentAmount}
                  onChange={(e) => setTeamPaymentAmount(e.target.value)}
                  className="p-2 bg-white border border-dark/10 rounded-lg text-xs"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTeamPaymentOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-dark/20 text-dark font-bold text-[10px]"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary text-dark font-bold text-[10px]">
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setTeamPaymentOpen(true)}
                disabled={project.teamMembers.length === 0}
                className="px-4 py-2 rounded-xl bg-dark/5 hover:bg-dark/10 text-dark font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Team Payment
              </button>
            )}
          </Card>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] text-slateText font-semibold">Internal only — never shown to the client.</p>
            <button
              onClick={() => setTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TASK_COLUMNS.map((col) => {
              const colTasks = project.tasks.filter((t: any) => col.statuses.includes(t.status));
              const isDropTarget = dragOverTaskCol === col.id;
              return (
                <div
                  key={col.id}
                  onDragOver={(e: React.DragEvent) => {
                    e.preventDefault();
                    if (dragOverTaskCol !== col.id) setDragOverTaskCol(col.id);
                  }}
                  onDragLeave={(e: React.DragEvent) => e.preventDefault()}
                  onDrop={(e: React.DragEvent) => {
                    e.preventDefault();
                    setDragOverTaskCol(null);
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) handleSetTaskStatus(taskId, col.dropStatus);
                  }}
                  className={`p-4 space-y-3 min-h-[220px] rounded-card border bg-white shadow-glass transition-all ${
                    isDropTarget ? 'border-primary ring-4 ring-primary/40 bg-lime-50/30' : 'border-dark/10'
                  }`}
                >
                  <h3 className="font-display font-bold text-sm text-dark flex items-center gap-2">
                    {col.label} <span className="text-slateText font-semibold text-xs">({colTasks.length})</span>
                  </h3>

                  {colTasks.length === 0 ? (
                    <p className="text-xs text-slateText/60 text-center py-8">Nothing here</p>
                  ) : (
                    <div className="space-y-2.5">
                      {colTasks.map((task: any) => (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', task._id);
                            setDraggingTaskId(task._id);
                          }}
                          onDragEnd={() => setDraggingTaskId(null)}
                          className={`p-3 rounded-xl bg-background border space-y-1.5 transition-all ${
                            draggingTaskId === task._id ? 'opacity-40 border-dashed border-dark' : 'border-dark/10'
                          }`}
                        >
                          <p className="font-bold text-xs text-dark">{task.title}</p>
                          {task.description && <p className="text-[10.5px] text-slateText">{task.description}</p>}
                          {task.assigneeName && (
                            <p className="flex items-center gap-1 text-[10px] text-slateText font-semibold">
                              <Users className="w-3 h-3" /> {task.assigneeName}
                            </p>
                          )}
                          {task.dueDate && (
                            <p className="flex items-center gap-1 text-[10px] text-slateText font-semibold">
                              <Calendar className="w-3 h-3" /> Due {new Date(task.dueDate).toLocaleDateString('en-GB')}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-1.5">
                            {task.status !== 'done' ? (
                              <button
                                onClick={() => handleSetTaskStatus(task._id, 'done')}
                                className="px-3 py-1 rounded-lg bg-primary hover:bg-[#bce63b] text-dark font-bold text-[10px]"
                              >
                                Complete
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                <CheckSquare className="w-3 h-3" /> Done
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-slateText hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-card p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-dark">New Task</h2>
              <button onClick={() => setTaskModalOpen(false)} className="p-1 text-slateText hover:text-dark">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-dark mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-dark mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-dark mb-1">Assignee</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-dark/20 text-dark font-bold text-xs hover:bg-dark/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === 'team' && (
        <Card className="p-6 space-y-3">
          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input
              type="text"
              placeholder="Member name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
            />
            <button
              type="submit"
              className="px-4 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs flex items-center gap-1.5 justify-center"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add
            </button>
          </form>

          {project.teamMembers.length === 0 ? (
            <p className="text-xs text-slateText text-center py-8">No team members assigned yet.</p>
          ) : (
            <div className="space-y-1.5">
              {project.teamMembers.map((m: any) => (
                <div key={m._id} className="flex items-center justify-between p-2.5 rounded-lg bg-background group">
                  <div>
                    <p className="font-bold text-xs text-dark">{m.name}</p>
                    {m.email && <p className="text-[10px] text-slateText">{m.email}</p>}
                  </div>
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    className="opacity-0 group-hover:opacity-100 text-slateText hover:text-rose-600 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'domain' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Card className="p-6 space-y-2">
            <h3 className="font-display text-sm font-bold text-dark">Domain</h3>
            {project.domain?.name ? (
              <div className="space-y-1.5 text-xs">
                <p>
                  <span className="text-slateText font-semibold">Name:</span> {project.domain.name}
                </p>
                {project.domain.registrar && (
                  <p>
                    <span className="text-slateText font-semibold">Registrar:</span> {project.domain.registrar}
                  </p>
                )}
                <p>
                  <span className="text-slateText font-semibold">Cost:</span> ₹
                  {(project.domain.cost || 0).toLocaleString('en-IN')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slateText">No domain details added.</p>
            )}
          </Card>
          <Card className="p-6 space-y-2">
            <h3 className="font-display text-sm font-bold text-dark">Hosting</h3>
            {project.hosting?.provider ? (
              <div className="space-y-1.5 text-xs">
                <p>
                  <span className="text-slateText font-semibold">Provider:</span> {project.hosting.provider}
                </p>
                <p>
                  <span className="text-slateText font-semibold">Cost:</span> ₹
                  {(project.hosting.cost || 0).toLocaleString('en-IN')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slateText">No hosting details added.</p>
            )}
          </Card>
        </div>
      )}

      {tab === 'quotations' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-dark">Quotations</h3>
            <button
              onClick={handleCreateQuotation}
              disabled={creatingQuotation}
              className="px-3 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> {creatingQuotation ? 'Creating...' : 'Create Quote'}
            </button>
          </div>

          {!project.quotations?.length ? (
            <p className="text-xs text-slateText">No quotations yet.</p>
          ) : (
            <div className="space-y-2">
              {project.quotations.map((q: any) => (
                <div
                  key={q._id}
                  onClick={() => navigate(`/dashboard/client-projects/${id}/quotations/${q._id}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-background border border-dark/10 cursor-pointer hover:border-dark/30"
                >
                  <div>
                    <p className="text-xs font-bold text-dark">{q.documentTitle || q.quotationNumber}</p>
                    <p className="text-[10px] text-slateText mt-0.5">
                      {q.quotationNumber} · {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-GB') : ''} · {q.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={getApiUrl(`/crm/projects/${id}/quotations/${q._id}/pdf?token=${encodeURIComponent(token || '')}`)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg text-dark hover:bg-dark/5"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuotation(q._id);
                      }}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}


      {/* New / Edit Invoice Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-card p-6 max-w-2xl w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-dark">
                  {editingInvoiceId ? 'Edit Invoice' : 'New Invoice'}
                </h2>
                <p className="text-[10px] text-slateText mt-0.5">
                  Fill in the details, then save. You can download the PDF afterwards.
                </p>
              </div>
              <button onClick={() => setInvoiceModalOpen(false)} className="p-1 text-slateText hover:text-dark">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Issue Date</label>
                  <input
                    type="date"
                    value={invoiceForm.issueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">From (your brand)</label>
                  <input
                    type="text"
                    placeholder="Your company name"
                    value={invoiceForm.fromName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, fromName: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={invoiceForm.fromEmail}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, fromEmail: e.target.value })}
                      className="p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={invoiceForm.fromPhone}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, fromPhone: e.target.value })}
                      className="p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Bill To</label>
                  <input
                    type="text"
                    placeholder="Client name"
                    value={invoiceForm.billToName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, billToName: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Client email"
                      value={invoiceForm.billToEmail}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, billToEmail: e.target.value })}
                      className="p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Client phone"
                      value={invoiceForm.billToPhone}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, billToPhone: e.target.value })}
                      className="p-2.5 bg-background border border-dark/10 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark mb-1.5 uppercase">Line Items</label>
                <div className="space-y-2">
                  {lineItems.map((li, idx) => {
                    const amount = (parseFloat(li.qty) || 0) * (parseFloat(li.rate) || 0);
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-background border border-dark/10 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Item description"
                            value={li.description}
                            onChange={(e) => {
                              const next = [...lineItems];
                              next[idx] = { ...next[idx], description: e.target.value };
                              setLineItems(next);
                            }}
                            className="flex-1 p-2 bg-white border border-dark/10 rounded-lg text-xs"
                          />
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[9px] text-slateText mb-0.5">Qty</label>
                            <input
                              type="number"
                              value={li.qty}
                              onChange={(e) => {
                                const next = [...lineItems];
                                next[idx] = { ...next[idx], qty: e.target.value };
                                setLineItems(next);
                              }}
                              className="w-full p-2 bg-white border border-dark/10 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slateText mb-0.5">Rate</label>
                            <input
                              type="number"
                              value={li.rate}
                              onChange={(e) => {
                                const next = [...lineItems];
                                next[idx] = { ...next[idx], rate: e.target.value };
                                setLineItems(next);
                              }}
                              className="w-full p-2 bg-white border border-dark/10 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slateText mb-0.5">Tax %</label>
                            <input
                              type="number"
                              value={li.taxPercent}
                              onChange={(e) => {
                                const next = [...lineItems];
                                next[idx] = { ...next[idx], taxPercent: e.target.value };
                                setLineItems(next);
                              }}
                              className="w-full p-2 bg-white border border-dark/10 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                        <p className="text-right text-[10px] text-slateText">
                          Amount: <span className="font-bold text-dark">₹{amount.toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setLineItems([...lineItems, { ...EMPTY_LINE_ITEM }])}
                  className="mt-2 text-[10px] font-bold text-dark flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add line item
                </button>
              </div>

              <div className="grid grid-cols-[1fr_220px] gap-4 items-start">
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Notes</label>
                  <textarea
                    rows={3}
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-xs resize-none"
                  />
                </div>
                <div className="p-3 rounded-xl bg-background border border-dark/10 space-y-1 text-xs">
                  <div className="flex justify-between text-slateText">
                    <span>Subtotal</span>
                    <span>₹{invoiceTotals.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slateText">
                    <span>Tax</span>
                    <span>₹{invoiceTotals.tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-dark pt-1 border-t border-dark/10">
                    <span>Total</span>
                    <span>₹{(invoiceTotals.subtotal + invoiceTotals.tax).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark/5">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-dark/20 text-dark font-bold text-xs hover:bg-dark/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInvoice}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> {savingInvoice ? 'Saving...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
