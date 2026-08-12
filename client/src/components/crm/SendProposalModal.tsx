import React, { useEffect, useRef, useState } from 'react';
import { X, Send, CheckCircle2, Loader2, ChevronLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';
import { ProposalContentEditor } from './ProposalContentEditor';

interface SendProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: { _id: string; name: string; email?: string } | null;
  onSent?: () => void;
}

interface ProposalProjectItem {
  _id: string;
  name: string;
}

interface TemplateItem {
  _id: string;
  title: string;
  type: string;
  kind?: 'generated' | 'uploaded';
  fileName?: string;
}

interface LeadProposalData {
  _id: string;
  title: string;
  contentHtml: string;
  kind?: 'generated' | 'uploaded';
  fileUrl?: string;
  fileName?: string;
  branding: Record<string, any>;
  meta?: Record<string, any>;
  status: 'draft' | 'sent';
  sentAt?: string;
}

type Step = 'select' | 'edit';

export const SendProposalModal: React.FC<SendProposalModalProps> = ({ isOpen, onClose, lead, onSent }) => {
  const [step, setStep] = useState<Step>('select');
  const [projects, setProjects] = useState<ProposalProjectItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const [leadProposal, setLeadProposal] = useState<LeadProposalData | null>(null);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [editContentOpen, setEditContentOpen] = useState(false);

  const [cloning, setCloning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlRef = useRef<string>('');

  useEffect(() => {
    if (!isOpen || !lead) return;
    document.body.style.overflow = 'hidden';
    setStep('select');
    setSelectedProjectId('');
    setSelectedTemplateId('');
    setLeadProposal(null);
    setStatusMsg(null);
    setPreviewUrl('');
    setPreviewError('');
    fetchProjects();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, lead]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await apiFetch('/proposals/projects');
      if (res.success) setProjects(res.data);
    } catch (err) {
      console.error('Failed to load proposal projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchTemplates = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedTemplateId('');
    setLoadingTemplates(true);
    try {
      const res = await apiFetch(`/proposals/templates?proposalProjectId=${projectId}`);
      if (res.success) setTemplates(res.data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleUseTemplate = async () => {
    if (!lead || !selectedTemplateId) return;
    setCloning(true);
    setStatusMsg(null);
    try {
      const res = await apiFetch('/proposals/lead-proposals', {
        method: 'POST',
        body: JSON.stringify({ leadId: lead._id, templateId: selectedTemplateId }),
      });
      if (res.success) {
        setLeadProposal(res.data);
        setTitle(res.data.title);
        setContentHtml(res.data.contentHtml);
        setStep('edit');
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Failed to prepare proposal.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error connecting to server.' });
    } finally {
      setCloning(false);
    }
  };

  const refreshPreview = React.useCallback(async () => {
    if (!leadProposal || leadProposal.kind === 'uploaded' || !contentHtml.trim()) return;
    setPreviewLoading(true);
    setPreviewError('');
    try {
      const token = localStorage.getItem('adminToken') || '';
      const response = await fetch(getApiUrl('/proposals/preview-pdf'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ title, contentHtml, branding: leadProposal.branding, meta: leadProposal.meta }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to render PDF preview.');
      }
      const blob = await response.blob();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      setPreviewUrl(url);
    } catch (err: any) {
      setPreviewError(err.message || 'Failed to render PDF preview.');
    } finally {
      setPreviewLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadProposal, title, contentHtml]);

  useEffect(() => {
    if (step !== 'edit' || !leadProposal) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refreshPreview();
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, leadProposal, title, contentHtml]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleSaveDraft = async () => {
    if (!leadProposal) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/proposals/lead-proposals/${leadProposal._id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, contentHtml }),
      });
      if (res.success) {
        setLeadProposal(res.data);
        setStatusMsg({ type: 'success', text: 'Draft saved.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!leadProposal) return;
    setSending(true);
    setStatusMsg(null);
    try {
      // Persist edits first so what is sent matches what's shown in the editor.
      await apiFetch(`/proposals/lead-proposals/${leadProposal._id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, contentHtml }),
      });

      const res = await apiFetch(`/proposals/lead-proposals/${leadProposal._id}/send`, {
        method: 'POST',
      });

      if (res.success) {
        setLeadProposal(res.data);
        setStatusMsg({ type: 'success', text: 'Proposal sent successfully.' });
        onSent?.();
      } else {
        setStatusMsg({ type: 'error', text: res.message || 'Failed to send proposal.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error connecting to server.' });
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="fixed inset-0 bg-dark/75 backdrop-blur-md" onClick={onClose} />

      <div
        className={`relative w-full ${
          step === 'edit' ? 'max-w-6xl' : 'max-w-3xl'
        } bg-white rounded-3xl shadow-2xl border border-dark/10 overflow-hidden z-10 my-auto flex flex-col max-h-[95vh]`}
      >
        <div className="flex items-center justify-between p-5 bg-dark text-white border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {step === 'edit' && (
              <button
                onClick={() => setStep('select')}
                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-300"
                title="Back to template selection"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="font-display text-lg font-bold">Send Proposal</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {lead.name} {lead.email ? `· ${lead.email}` : '(no email on file)'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'select' ? (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {statusMsg && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                1. Proposal Project
              </label>
              {loadingProjects ? (
                <p className="text-xs text-slateText py-3">Loading projects</p>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => fetchTemplates(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark font-semibold"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedProjectId && (
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  2. Template
                </label>
                {loadingTemplates ? (
                  <p className="text-xs text-slateText py-3">Loading templates</p>
                ) : templates.length === 0 ? (
                  <p className="text-xs text-slateText py-3">No templates in this project yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {templates.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => setSelectedTemplateId(t._id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedTemplateId === t._id
                            ? 'border-primary bg-lime-50/40'
                            : 'border-dark/10 hover:border-dark/30'
                        }`}
                      >
                        <p className="text-xs font-bold text-dark">{t.title}</p>
                        <p className="text-[10px] text-slateText uppercase mt-0.5">
                          {t.kind === 'uploaded' ? 'Uploaded PDF' : t.type}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
            {/* Left: edit form */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 border-b lg:border-b-0 lg:border-r border-dark/10">
              {leadProposal?.status === 'sent' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Sent {leadProposal.sentAt ? new Date(leadProposal.sentAt).toLocaleString() : ''}
                </div>
              )}

              {statusMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold ${
                    statusMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>

              {leadProposal?.kind === 'uploaded' ? (
                <p className="text-[10px] text-slateText">
                  This is a ready-made PDF — it's sent to the lead exactly as uploaded, so there's no content to edit
                  here. Just confirm the title and send.
                </p>
              ) : (
                <>
                  <p className="text-[10px] text-slateText">
                    This copy is independent of the template - editing it here only affects this lead's proposal. The
                    PDF preview on the right always reflects the current content.
                  </p>

                  <div className="rounded-2xl bg-background border border-dark/10 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setEditContentOpen((v) => !v)}
                      className="w-full flex items-center justify-between p-4"
                    >
                      <div>
                        <h3 className="text-xs font-bold text-dark uppercase tracking-wider">
                          Edit content (this lead only)
                        </h3>
                        <p className="text-[10px] text-slateText mt-0.5">
                          Select any text below to refine just that part with AI.
                        </p>
                      </div>
                      {editContentOpen ? (
                        <ChevronUp className="w-4 h-4 text-dark" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-dark" />
                      )}
                    </button>
                    {editContentOpen && (
                      <div className="px-4 pb-4">
                        <ProposalContentEditor
                          contentHtml={contentHtml}
                          onChange={setContentHtml}
                          projectName={lead.name}
                          placeholder="No content yet."
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right: PDF preview - either the rendered draft, or the uploaded file as-is */}
            <div className="p-5 sm:p-6 flex flex-col min-h-[400px] lg:min-h-0 bg-background/60">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h3 className="text-[10px] font-bold text-dark uppercase tracking-wider">
                  {leadProposal?.kind === 'uploaded' ? 'Uploaded PDF' : 'Live PDF Preview'}
                </h3>
                {leadProposal?.kind !== 'uploaded' && (
                  <button
                    type="button"
                    onClick={refreshPreview}
                    disabled={previewLoading}
                    className="px-3 py-1.5 rounded-lg bg-dark/5 hover:bg-dark/10 text-dark font-bold text-[10px] flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {previewLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Refresh Preview
                  </button>
                )}
              </div>

              {previewError && (
                <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shrink-0">
                  {previewError}
                </div>
              )}

              <div className="flex-1 min-h-[420px] rounded-xl border border-dark/10 overflow-hidden bg-white relative">
                {leadProposal?.kind === 'uploaded' ? (
                  <iframe
                    title="Uploaded Proposal PDF"
                    src={getApiUrl(
                      `/proposals/lead-proposals/${leadProposal._id}/pdf?token=${encodeURIComponent(
                        localStorage.getItem('adminToken') || ''
                      )}`
                    )}
                    className="w-full h-full"
                  />
                ) : previewUrl ? (
                  <iframe title="Lead Proposal PDF Preview" src={previewUrl} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slateText font-semibold text-center px-6">
                    {previewLoading ? 'Rendering preview' : 'Preview will appear here.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 p-5 border-t border-dark/10 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-dark/20 text-dark font-bold text-xs hover:bg-dark/5"
          >
            Close
          </button>

          {step === 'select' ? (
            <button
              onClick={handleUseTemplate}
              disabled={!selectedTemplateId || cloning}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md disabled:opacity-50"
            >
              {cloning ? 'Preparing' : 'Use Template'}
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-4 py-2 rounded-xl border border-dark/20 text-dark font-bold text-xs hover:bg-dark/5 disabled:opacity-50"
              >
                {saving ? 'Saving' : 'Save Draft'}
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !lead.email}
                title={!lead.email ? 'This lead has no email address on file' : undefined}
                className="px-5 py-2 rounded-xl bg-dark hover:bg-primary hover:text-dark text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {sending ? 'Sending' : 'Send'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
