import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  ChevronLeft,
  Pencil,
  Trash2,
  Phone,
  Globe,
  Paperclip,
  FolderKanban,
  Calendar,
  Plus,
  Save,
  KeyRound,
  UploadCloud,
  Search,
  Download,
  ChevronDown,
  ExternalLink,
  File as FileIcon,
} from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';
import { MeetingsPanel } from '../../components/crm/MeetingsPanel';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/FormField';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { CURRENCY_OPTIONS, timeAgo, formatMoney } from '../../utils/format';

interface ClientFileItem {
  _id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: 'admin' | 'client';
  createdAt: string;
}

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type Tab = 'portal' | 'files' | 'projects' | 'meetings';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'portal', label: 'Client Portal', icon: Globe },
  { id: 'files', label: 'Files', icon: Paperclip },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'meetings', label: 'Meetings', icon: Calendar },
];

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>('portal');

  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({ companyName: '', billingEmail: '', phone: '', currency: 'INR' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [sendingCreds, setSendingCreds] = useState(false);
  const [credsMsg, setCredsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [clientFiles, setClientFiles] = useState<ClientFileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [fileSearch, setFileSearch] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<string | null>(null);
  const [deleteClientConfirmOpen, setDeleteClientConfirmOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchClient = () => {
    setLoading(true);
    setLoadError(false);
    apiFetch(`/crm/clients`, { token })
      .then((res) => {
        if (!res.success) {
          setLoadError(true);
          return;
        }
        const found = (res.data || []).find((c: any) => c._id === id);
        setClient(found || null);
        if (found) {
          setFormData({
            companyName: found.companyName || '',
            billingEmail: found.billingEmail || '',
            phone: found.phone || '',
            currency: found.currency || 'INR',
          });
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  const fetchProjects = () => {
    setProjectsLoading(true);
    apiFetch('/crm/projects', { token })
      .then((res) => {
        if (res.success) {
          setProjects((res.data || []).filter((p: any) => p.clientId?._id === id || p.clientId === id));
        }
      })
      .finally(() => setProjectsLoading(false));
  };

  const fetchClientFiles = () => {
    setFilesLoading(true);
    apiFetch(`/crm/clients/${id}/files`, { token })
      .then((res) => {
        if (res.success) setClientFiles(res.data || []);
      })
      .finally(() => setFilesLoading(false));
  };

  useEffect(() => {
    fetchClient();
    fetchProjects();
    fetchClientFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUploadFile = async (file: File) => {
    setUploadingFile(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(getApiUrl(`/crm/clients/${id}/files`), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (data.success) fetchClientFiles();
      else setUploadError(data.message || 'Failed to upload file.');
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId: string) => {
    apiFetch(`/crm/clients/files/${fileId}`, { method: 'DELETE', token })
      .then((res) => {
        if (res.success) fetchClientFiles();
      })
      .finally(() => setDeleteFileTarget(null));
  };

  const handleViewFile = (file: ClientFileItem) => {
    const src = getApiUrl(`/crm/clients/files/${file._id}/download`);
    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => window.open(URL.createObjectURL(blob), '_blank'));
  };

  const filteredClientFiles = clientFiles.filter((f) =>
    f.fileName.toLowerCase().includes(fileSearch.trim().toLowerCase())
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    apiFetch(`/crm/clients/${id}`, { method: 'PUT', token, body: JSON.stringify(formData) })
      .then((res) => {
        if (res.success) {
          setEditOpen(false);
          fetchClient();
        } else {
          setFormError(res.error || res.message || 'Failed to save changes.');
        }
      })
      .catch((err) => setFormError('Error saving: ' + err.message))
      .finally(() => setSaving(false));
  };

  const handleSendCredentials = () => {
    setSendingCreds(true);
    setCredsMsg(null);
    apiFetch(`/crm/clients/${id}/send-credentials`, { method: 'POST', token })
      .then((res) => {
        setCredsMsg(
          res.success
            ? { type: 'success', text: 'Portal login credentials emailed to the client.' }
            : { type: 'error', text: res.message || 'Failed to send credentials.' }
        );
        if (res.success) fetchClient();
      })
      .catch((err) => setCredsMsg({ type: 'error', text: 'Error: ' + err.message }))
      .finally(() => setSendingCreds(false));
  };

  const handleDeleteClient = () => {
    apiFetch(`/crm/clients/${id}`, { method: 'DELETE', token })
      .then((res) => {
        if (res.success) navigate('/dashboard/clients');
      })
      .finally(() => setDeleteClientConfirmOpen(false));
  };

  if (loading) {
    return (
      <div className="py-8">
        <Spinner.CardSkeleton />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-16">
        <EmptyState
          icon={FolderKanban}
          title="Couldn't load this client"
          description="Check your connection and try again."
          action={
            <button
              onClick={fetchClient}
              className="focus-ring px-4 py-2 rounded-operateMd bg-dark text-white text-xs font-bold hover:bg-dark/90"
            >
              Retry
            </button>
          }
          className="border-rose-200 bg-rose-50/40"
        />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="py-16">
        <EmptyState
          icon={FolderKanban}
          title="Client not found"
          description="This client may have been deleted or the link is incorrect."
          action={
            <Button variant="ghost" onClick={() => navigate('/dashboard/clients')}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Clients
            </Button>
          }
        />
      </div>
    );
  }

  const paid = (client.totalRevenue || 0) - (client.outstandingBalance || 0);
  const currencyLabel = CURRENCY_OPTIONS.find((c) => c.code === (client.currency || 'INR'))?.code || 'INR';

  return (
    <div className="space-y-6">
      <SEOHead title={`${client.companyName} | Client Detail`} />

      <button
        onClick={() => navigate('/dashboard/clients')}
        className="flex items-center gap-1.5 text-xs font-bold text-slateText hover:text-dark transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Clients
      </button>

      <Card className="p-6 sm:p-8" hoverEffect={false}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark">{client.companyName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slateText font-semibold">
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {client.phone}
                </span>
              )}
              <span>Added {timeAgo(client.createdAt)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-dark/10 text-[10px] font-bold text-dark">
                <Globe className="w-3 h-3" /> Billed in {currencyLabel} · {CURRENCY_OPTIONS.find((c) => c.code === currencyLabel)?.label.split('— ')[1]}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  client.portalAccessEnabled
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border border-amber-200 text-amber-700'
                }`}
              >
                {client.portalAccessEnabled ? 'Portal Access Enabled' : 'No Portal Access'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/dashboard/client-projects/new?client=${id}`)}
              className="px-4 py-2.5 rounded-operateMd bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
            <button
              onClick={() => setEditOpen(true)}
              aria-label="Edit Client"
              className="focus-ring p-2.5 rounded-operateMd border border-dark/15 text-dark hover:bg-dark/5 transition-colors"
              title="Edit Client"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteClientConfirmOpen(true)}
              aria-label="Delete Client"
              className="focus-ring p-2.5 rounded-operateMd border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Client"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {credsMsg && (
          <div
            className={`mt-4 p-2.5 rounded-operateMd text-xs font-semibold ${
              credsMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border border-rose-200 text-rose-700'
            }`}
          >
            {credsMsg.text}
          </div>
        )}

        {/* Budget / Paid / Balance */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark/10 max-w-md">
          <div>
            <p className="text-[10px] font-bold text-slateText uppercase">Budget</p>
            <p className="font-bold text-lg text-dark">{formatMoney(client.totalRevenue || 0, client.currency)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slateText uppercase">Paid</p>
            <p className="font-bold text-lg text-emerald-600">{formatMoney(paid, client.currency)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slateText uppercase">Balance</p>
            <p className="font-bold text-lg text-rose-600">{formatMoney(client.outstandingBalance || 0, client.currency)}</p>
          </div>
        </div>
      </Card>

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
            {t.id === 'projects' && projects.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-dark/5 text-[9px] font-bold text-slateText">
                {projects.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'portal' && (
        <Card className="p-6 space-y-4" hoverEffect={false}>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-dark" />
            <h3 className="font-display text-sm font-bold text-dark">Client Portal</h3>
          </div>

          {client.portalAccessEnabled ? (
            <div className="p-4 rounded-operateMd bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-bold">Portal access is enabled for {client.companyName}.</p>
              <p>They can sign in with their billing email to follow projects, view invoices, and sign documents.</p>
            </div>
          ) : (
            <div className="p-5 rounded-operateMd bg-primary/10 border border-primary/30 space-y-3">
              <p className="text-sm font-bold text-dark">Give {client.companyName} a branded client portal</p>
              <p className="text-xs text-slateText leading-relaxed">
                Send a portal invite so this client can follow project progress, view invoices, and sign documents
                without emailing back and forth.
              </p>
              <button
                onClick={handleSendCredentials}
                disabled={sendingCreds || !client.billingEmail}
                title={!client.billingEmail ? 'Add an email first' : 'Send portal login credentials'}
                className="px-4 py-2 rounded-operateMd bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" /> {sendingCreds ? 'Sending...' : 'Send Portal Invite'}
              </button>
            </div>
          )}
        </Card>
      )}

      {tab === 'files' && (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadFile(f);
            }}
          />

          {/* Search + Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slateText" />
              <input
                type="text"
                placeholder="Search files..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-dark/10 rounded-operateMd text-xs text-dark focus:outline-none focus:border-dark shadow-sm"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className="w-full sm:w-auto px-4 py-2.5 rounded-operateMd bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> {uploadingFile ? 'Uploading...' : 'Upload Files'}
            </button>
            <span className="text-[10px] text-slateText font-semibold shrink-0 hidden sm:block">
              {clientFiles.length} file{clientFiles.length === 1 ? '' : 's'}
            </span>
          </div>

          {uploadError && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-operateMd px-3 py-2">
              {uploadError}
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Client files */}
            <Card className="p-5 space-y-3" hoverEffect={false}>
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-dark" />
                <h3 className="font-display text-sm font-bold text-dark">Client files</h3>
              </div>
              <p className="text-[11px] text-slateText -mt-2">
                Not tied to a project — contracts, brand assets, ID and tax documents.
              </p>

              {filesLoading ? (
                <Spinner.Skeleton lines={3} className="py-2" />
              ) : filteredClientFiles.length === 0 ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 rounded-operateMd border-2 border-dashed border-dark/15 hover:border-dark/30 bg-background/60 flex flex-col items-center justify-center gap-2 text-center transition-colors"
                >
                  <UploadCloud className="w-6 h-6 text-slateText" />
                  <p className="text-xs font-bold text-dark">Upload files for {client.companyName}</p>
                  <p className="text-[11px] text-slateText max-w-xs">
                    Drop in as many as you like — images, PDFs, documents, spreadsheets. 12MB each.
                  </p>
                </button>
              ) : (
                <div className="divide-y divide-dark/5">
                  {filteredClientFiles.map((f) => (
                    <div key={f._id} className="py-2.5 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                          <FileIcon className="w-3.5 h-3.5 text-dark" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-dark truncate">{f.fileName}</p>
                          <p className="text-[10px] text-slateText">{formatFileSize(f.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewFile(f)}
                          aria-label="View / Download"
                          className="focus-ring p-1.5 text-slateText hover:text-dark rounded-lg hover:bg-dark/5"
                          title="View / Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteFileTarget(f._id)}
                          aria-label="Delete file"
                          className="focus-ring p-1.5 text-slateText hover:text-rose-600 rounded-lg hover:bg-rose-50"
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

            {/* Project files */}
            <Card className="p-5 space-y-3" hoverEffect={false}>
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-dark" />
                <h3 className="font-display text-sm font-bold text-dark">Project files</h3>
              </div>
              <p className="text-[11px] text-slateText -mt-2">
                Uploaded on this client's projects. Manage them on the project page.
              </p>

              {projectsLoading ? (
                <Spinner.Skeleton lines={3} className="py-2" />
              ) : projects.length === 0 ? (
                <p className="text-xs text-slateText py-6 text-center">No projects yet for this client.</p>
              ) : (
                <div className="space-y-2">
                  {projects.map((p) => {
                    const isExpanded = expandedProjectId === p._id;
                    return (
                      <div key={p._id} className="rounded-operateMd border border-dark/10 overflow-hidden">
                        <div className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-dark/[0.02] transition-colors">
                          <button
                            onClick={() => setExpandedProjectId(isExpanded ? null : p._id)}
                            aria-expanded={isExpanded}
                            className="focus-ring flex items-center gap-2 min-w-0 flex-1 text-left rounded"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-slateText shrink-0 transition-transform ${
                                isExpanded ? '' : '-rotate-90'
                              }`}
                            />
                            <span className="text-xs font-bold text-dark truncate">{p.projectName}</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-dark/5 text-[9px] font-bold text-slateText shrink-0">
                              {p.fileCount || 0}
                            </span>
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/client-projects/${p._id}`)}
                            className="focus-ring text-[10px] font-bold text-primary-dark hover:underline flex items-center gap-1 shrink-0 rounded"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-0.5">
                            <p className="text-[11px] text-slateText">No files on this project yet.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <Card className="p-6 space-y-4" hoverEffect={false}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-dark">Projects</h3>
            <button
              onClick={() => navigate(`/dashboard/client-projects/new?client=${id}`)}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-[#bce63b] text-dark font-bold text-[10px] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
          </div>

          {projectsLoading ? (
            <Spinner.Skeleton lines={3} className="py-2" />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create the first project for this client to start tracking delivery."
              action={
                <button
                  onClick={() => navigate(`/dashboard/client-projects/new?client=${id}`)}
                  className="focus-ring px-4 py-2 rounded-operateMd bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New Project
                </button>
              }
            />
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => navigate(`/dashboard/client-projects/${p._id}`)}
                  className="w-full flex items-center justify-between p-3 rounded-operateMd bg-background border border-dark/10 hover:border-primary transition-colors text-left"
                >
                  <div>
                    <p className="font-bold text-xs text-dark">{p.projectName}</p>
                    <p className="text-[10px] text-slateText capitalize">{p.status?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs text-dark">{formatMoney(p.budget || 0, client.currency)}</p>
                    <p className="text-[10px] text-slateText">Paid {formatMoney(p.paidAmount || 0, client.currency)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'meetings' && (
        <Card className="p-6 space-y-4" hoverEffect={false}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-dark" />
            <h3 className="font-display text-sm font-bold text-dark">Meetings</h3>
          </div>
          <MeetingsPanel clientId={id!} clientName={client.companyName} />
        </Card>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Client" maxWidth="lg">
        {formError && (
          <div className="p-3 rounded-operateMd bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {formError}
          </div>
        )}
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Client Name"
            required
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
          <Input
            label="Email (optional)"
            type="email"
            value={formData.billingEmail}
            onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
          />
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select label="Invoice Currency" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark/5">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteFileTarget}
        onClose={() => setDeleteFileTarget(null)}
        onConfirm={() => deleteFileTarget && handleDeleteFile(deleteFileTarget)}
        title="Delete file?"
        confirmLabel="Delete"
        destructive
      />

      <ConfirmDialog
        isOpen={deleteClientConfirmOpen}
        onClose={() => setDeleteClientConfirmOpen(false)}
        onConfirm={handleDeleteClient}
        title="Delete client?"
        description="This client record will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};
