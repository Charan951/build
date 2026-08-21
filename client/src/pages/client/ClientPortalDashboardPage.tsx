import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Badge } from '../../components/ui/Badge';
import { StatusPill } from '../../components/ui/StatusPill';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  Receipt,
  LayoutGrid,
  Shield,
  Paperclip,
  UploadCloud,
  Download,
  Trash2,
  File as FileIcon,
  Plus,
  LogOut,
  Sparkles,
  FolderKanban,
  CheckCircle2,
  Clock,
  IndianRupee,
  ListChecks,
  CalendarClock,
  Video,
  ChevronRight,
} from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';

interface ClientFileItem {
  _id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: 'admin' | 'client';
  createdAt: string;
}

type PortalTab = 'overview' | 'files' | 'invoices' | 'meetings';

const TABS: { id: PortalTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Projects', icon: LayoutGrid },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'meetings', label: 'Meetings', icon: CalendarClock },
];

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ClientPortalDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('clientToken');
  const clientInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('clientInfo') || '{}');
    } catch {
      return {};
    }
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<PortalTab>('overview');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [files, setFiles] = useState<ClientFileItem[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deleteFileTarget, setDeleteFileTarget] = useState<string | null>(null);

  const fetchFiles = () => {
    apiFetch('/portal/files', { token }).then((res) => {
      if (res.success) setFiles(res.data || []);
    });
  };

  const fetchAll = () => {
    setLoading(true);
    setLoadError(false);
    Promise.all([
      apiFetch('/portal/invoices', { token }),
      apiFetch('/portal/projects', { token }),
      apiFetch('/portal/files', { token }),
      apiFetch('/portal/meetings', { token }),
    ])
      .then(([iRes, pRes, fRes, mRes]) => {
        if (!iRes.success || !pRes.success || !fRes.success || !mRes.success) {
          setLoadError(true);
          return;
        }
        setInvoices(iRes.data || []);
        setProjects(pRes.data || []);
        setFiles(fRes.data || []);
        setMeetings(mRes.data || []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadFile = async (file: File) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(getApiUrl('/portal/files'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (data.success) fetchFiles();
      else alert(data.message || 'Failed to upload file.');
    } catch (err: any) {
      alert(err.message || 'Error uploading file.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId: string) => {
    apiFetch(`/portal/files/${fileId}`, { method: 'DELETE', token })
      .then((res) => {
        if (res.success) fetchFiles();
      })
      .finally(() => setDeleteFileTarget(null));
  };

  const handleViewFile = (file: ClientFileItem) => {
    const src = getApiUrl(`/portal/files/${file._id}/download`);
    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => window.open(URL.createObjectURL(blob), '_blank'));
  };

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientInfo');
    navigate('/login');
  };

  const outstandingTotal = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const activeProjectsCount = projects.filter((p) => p.status !== 'completed').length;

  const initials = (clientInfo.companyName || 'C')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-dark/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <p className="text-dark text-sm font-semibold">Couldn't load your dashboard.</p>
        <p className="text-slateText text-xs">Check your connection and try again.</p>
        <button
          onClick={fetchAll}
          className="focus-ring mt-1 px-4 py-2 rounded-xl bg-dark text-white text-xs font-bold hover:bg-dark/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Client Portal | Build Your Thoughts" />

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-dark text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-dark shrink-0">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-sm truncate">{clientInfo.companyName || 'Client Portal'}</p>
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> Secure Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              aria-label="Log out"
              className="focus-ring-inverse p-2 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Greeting + summary stats */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="lime" className="mb-2">Welcome back</Badge>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark">{clientInfo.companyName || 'Your workspace'}</h1>
            <p className="text-slateText text-xs mt-1">
              Track project progress, exchange files, and review invoices — all in one place.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-card border border-dark/10 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <FolderKanban className="w-4.5 h-4.5 text-dark" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slateText uppercase tracking-wide">Active Projects</p>
              <p className="font-display text-xl font-bold text-dark">{activeProjectsCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-card border border-dark/10 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Paperclip className="w-4.5 h-4.5 text-dark" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slateText uppercase tracking-wide">Shared Files</p>
              <p className="font-display text-xl font-bold text-dark">{files.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-card border border-dark/10 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
              <IndianRupee className="w-4.5 h-4.5 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slateText uppercase tracking-wide">Outstanding</p>
              <p className="font-display text-xl font-bold text-rose-600">₹{outstandingTotal.toLocaleString('en-IN')}</p>
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
              {t.id === 'files' && files.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-dark/5 text-[9px] font-bold text-slateText">
                  {files.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Projects */}
        {tab === 'overview' && (
          <div>
            {projects.length === 0 ? (
              <div className="bg-white rounded-card border border-dark/10 p-10 text-center">
                <FolderKanban className="w-8 h-8 text-slateText/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slateText">No active project workspaces assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => {
                  const doneTasks = (p.clientTasks || []).filter((t: any) => t.status === 'done').length;
                  const totalTasks = (p.clientTasks || []).length;
                  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : p.healthScore || 0;
                  return (
                    <button
                      key={p._id}
                      onClick={() => navigate(`/portal/projects/${p._id}`)}
                      className="text-left bg-white rounded-card border border-dark/10 hover:border-primary/50 hover:shadow-hover transition-all p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-bold text-base text-dark leading-tight">{p.projectName}</h3>
                        <StatusPill
                          status={p.status || ''}
                          label={(p.status || '').replace('_', ' ')}
                          className="shrink-0 uppercase !rounded-full !text-[9px] !px-2 !py-0.5"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slateText mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-dark/5 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-3 border-t border-dark/5 text-[11px] text-slateText">
                        <span className="flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5" /> {doneTasks}/{totalTasks} tasks
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> {p.progressUpdates?.length || 0} updates
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-slateText/40" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Files */}
        {tab === 'files' && (
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" /> {uploadingFile ? 'Uploading...' : 'Upload File'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadFile(f);
                }}
              />
            </div>

            {files.length === 0 ? (
              <div className="bg-white rounded-card border-2 border-dashed border-dark/15 p-12 flex flex-col items-center justify-center gap-2 text-center">
                <UploadCloud className="w-6 h-6 text-slateText" />
                <p className="text-xs font-bold text-dark">No files shared yet</p>
                <p className="text-[11px] text-slateText max-w-sm">
                  Contracts, brand assets, and documents shared by your project team will appear here — you can
                  upload files back too.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-card border border-dark/10 divide-y divide-dark/5">
                {files.map((f) => (
                  <div key={f._id} className="p-4 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <FileIcon className="w-4.5 h-4.5 text-dark" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-dark truncate">{f.fileName}</p>
                        <p className="text-[10px] text-slateText">
                          {formatFileSize(f.fileSize)} · {f.uploadedBy === 'admin' ? 'Shared by team' : 'Uploaded by you'} ·{' '}
                          {new Date(f.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleViewFile(f)}
                        aria-label="View / Download"
                        className="focus-ring p-2 text-slateText hover:text-dark rounded-lg hover:bg-dark/5"
                        title="View / Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {f.uploadedBy === 'client' && (
                        <button
                          onClick={() => setDeleteFileTarget(f._id)}
                          aria-label="Delete"
                          className="focus-ring p-2 text-slateText hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invoices */}
        {tab === 'invoices' && (
          <div>
            {invoices.length === 0 ? (
              <div className="bg-white rounded-card border border-dark/10 p-10 text-center">
                <Receipt className="w-8 h-8 text-slateText/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slateText">No billing invoices found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-card border border-dark/10 divide-y divide-dark/5">
                {invoices.map((inv) => (
                  <div key={inv._id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          inv.status === 'paid' ? 'bg-emerald-50' : 'bg-amber-50'
                        }`}
                      >
                        {inv.status === 'paid' ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-4.5 h-4.5 text-amber-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-dark truncate">{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-slateText">Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-dark text-sm">₹{inv.totalAmount?.toLocaleString('en-IN')}</p>
                      <Badge variant={inv.status === 'paid' ? 'lime' : 'dark'} className="mt-0.5">
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meetings */}
        {tab === 'meetings' && (
          <div>
            {meetings.length === 0 ? (
              <div className="bg-white rounded-card border border-dark/10 p-10 text-center">
                <CalendarClock className="w-8 h-8 text-slateText/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slateText">No meetings scheduled yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-card border border-dark/10 divide-y divide-dark/5">
                {meetings.map((m) => (
                  <div key={m._id} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                        <CalendarClock className="w-4.5 h-4.5 text-dark" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-dark truncate">{m.title}</p>
                        <p className="text-[10px] text-slateText">
                          {m.date} at {m.time} · {m.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    {m.meetingLink ? (
                      <a
                        href={m.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-[#bce63b] text-dark font-bold text-[10px] flex items-center gap-1.5 shrink-0"
                      >
                        <Video className="w-3 h-3" /> Join
                      </a>
                    ) : (
                      <span className="text-[10px] text-slateText shrink-0">No link yet</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteFileTarget}
        onClose={() => setDeleteFileTarget(null)}
        onConfirm={() => deleteFileTarget && handleDeleteFile(deleteFileTarget)}
        title="Delete file?"
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};
