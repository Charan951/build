import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FadeIn } from '../../components/ui/motion';
import { ArrowLeft, Plus, Pencil, Trash2, FileText, Upload, Eye, X, Loader2 } from 'lucide-react';
import { apiFetch, getApiUrl } from '../../services/api';
import { TemplateEditorModal, ProposalTemplateData } from '../../components/crm/TemplateEditorModal';

interface ProposalProjectItem {
  _id: string;
  name: string;
  description?: string;
}

const UploadTemplateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  proposalProjectId: string;
  projectName: string;
  onUploaded: () => void;
}> = ({ isOpen, onClose, proposalProjectId, projectName, onUploaded }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setFile(null);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!title.trim()) {
      setErrorMsg('Give this proposal a title.');
      return;
    }
    if (!file) {
      setErrorMsg('Choose a PDF file to upload.');
      return;
    }
    setUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('proposalProjectId', proposalProjectId);
      formData.append('title', title.trim());
      formData.append('file', file);

      const token = localStorage.getItem('adminToken') || '';
      const response = await fetch(getApiUrl('/proposals/templates/upload'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        onUploaded();
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to upload PDF.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to server.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-dark/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-dark/10 z-10 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-dark">Upload Ready-Made Proposal</h2>
            <p className="text-xs text-slateText mt-0.5">{projectName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slateText hover:text-dark hover:bg-dark/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., CRM Standard Estimate"
            className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">PDF File *</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-dark/20 hover:border-dark/40 rounded-xl text-xs font-bold text-slateText hover:text-dark hover:bg-dark/5 transition-all flex flex-col items-center justify-center gap-1.5"
          >
            <Upload className="w-5 h-5" />
            {file ? file.name : 'Click to choose a PDF'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>

        <p className="text-[10px] text-slateText">
          This PDF is sent to leads exactly as uploaded — no content generation needed.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-dark/20 text-dark font-bold text-xs hover:bg-dark/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {uploading ? 'Uploading' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PdfViewerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templateId: string;
}> = ({ isOpen, onClose, title, templateId }) => {
  if (!isOpen) return null;
  const token = localStorage.getItem('adminToken') || '';
  const src = getApiUrl(`/proposals/templates/${templateId}/pdf?token=${encodeURIComponent(token)}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-dark/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-dark/10 z-10 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-dark text-white shrink-0">
          <h2 className="font-display text-sm font-bold truncate pr-4">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <iframe title={title} src={src} className="flex-1 w-full bg-background" />
      </div>
    </div>
  );
};

export const ProposalProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ProposalProjectItem | null>(null);
  const [templates, setTemplates] = useState<ProposalTemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplateData | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<ProposalTemplateData | null>(null);

  const fetchProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiFetch('/proposals/projects');
      if (res.success) {
        const found = res.data.find((p: ProposalProjectItem) => p._id === id) || null;
        setProject(found);
      }
    } catch (err) {
      console.error('Failed to load proposal project:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    if (!id) return;
    setTemplatesLoading(true);
    try {
      const res = await apiFetch(`/proposals/templates?proposalProjectId=${id}`);
      if (res.success) setTemplates(res.data);
    } catch (err) {
      console.error('Failed to load proposal templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchTemplates();
  }, [id]);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Delete this proposal template?')) return;
    try {
      const res = await apiFetch(`/proposals/templates/${templateId}`, { method: 'DELETE' });
      if (res.success) fetchTemplates();
    } catch (err) {
      console.error('Failed to delete proposal template:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-full min-h-0 flex items-center justify-center">
        <p className="text-xs text-slateText">Loading proposal project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full min-h-0 flex flex-col items-center justify-center gap-3">
        <p className="text-xs text-slateText font-semibold">Proposal project not found.</p>
        <button
          onClick={() => navigate('/dashboard/proposals')}
          className="px-4 py-2 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Proposals
        </button>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 flex flex-col gap-4">
      <SEOHead
        title={`${project.name} Templates | Build Your Thoughts Admin`}
        description="Manage proposal templates and branded PDF content"
      />

      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/dashboard/proposals')}
            className="text-xs font-bold text-slateText hover:text-dark flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Proposals
          </button>
          <h1 className="font-display text-2xl font-bold text-dark capitalize">{project.name} Templates</h1>
          <p className="text-xs text-slateText mt-0.5">Build, edit, and manage templates for this proposal project</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-dark/15 hover:border-dark/30 text-dark font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" /> Upload PDF
          </button>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setEditorOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> New Template
          </button>
        </div>
      </div>

      {/* Templates */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-2">
        {templatesLoading ? (
          <p className="text-xs text-slateText py-8 text-center">Loading templates...</p>
        ) : templates.length === 0 ? (
          <Card className="p-10 text-center">
            <FileText className="w-8 h-8 text-slateText/40 mx-auto mb-2" />
            <p className="text-xs text-slateText font-semibold">No templates yet for this project.</p>
            <p className="text-[10px] text-slateText/70 mt-1">
              Build one from scratch, or upload a ready-made PDF above.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((t, idx) => {
              const isUploaded = t.kind === 'uploaded';
              return (
                <FadeIn key={t._id} delay={idx * 0.03}>
                  <Card className="p-4 space-y-3" hoverEffect>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-bold text-sm text-dark leading-tight">{t.title}</h3>
                      <Badge
                        variant={isUploaded ? 'lime' : 'dark'}
                        className="text-[9px] px-2 py-0.5 shrink-0"
                      >
                        {isUploaded ? 'Uploaded PDF' : t.type}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slateText line-clamp-3">
                      {isUploaded
                        ? t.fileName || 'Ready-made PDF uploaded for this project.'
                        : t.contentHtml
                        ? t.contentHtml.replace(/<[^>]+>/g, ' ').slice(0, 140)
                        : 'No content yet.'}
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-dark/5">
                      {isUploaded ? (
                        <button
                          onClick={() => setViewingTemplate(t)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-dark/5 hover:bg-dark/10 text-dark font-bold text-[10px] flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View PDF
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingTemplate(t);
                            setEditorOpen(true);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-dark/5 hover:bg-dark/10 text-dark font-bold text-[10px] flex items-center justify-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => t._id && handleDeleteTemplate(t._id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[10px] flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </Card>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>

      <TemplateEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        proposalProjectId={project._id}
        projectName={project.name}
        template={editingTemplate}
        onSaved={() => fetchTemplates()}
      />
      <UploadTemplateModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        proposalProjectId={project._id}
        projectName={project.name}
        onUploaded={() => fetchTemplates()}
      />

      <PdfViewerModal
        isOpen={!!viewingTemplate}
        onClose={() => setViewingTemplate(null)}
        title={viewingTemplate?.title || ''}
        templateId={viewingTemplate?._id || ''}
      />
    </div>
  );
};
