import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/FormField';
import { Button } from '../../components/ui/Button';
import { Plus, Pencil, Trash2, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';

interface ProposalProjectItem {
  _id: string;
  name: string;
  description?: string;
}

const NewProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      await onCreate(name.trim());
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Proposal Project" maxWidth="sm">
      <Input
        label="Project Name"
        required
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., HRMS"
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="lime" size="sm" onClick={submit} disabled={creating || !name.trim()} className="gap-1.5">
          {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {creating ? 'Creating' : 'Create'}
        </Button>
      </div>
    </Modal>
  );
};

export const ManageProposalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProposalProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await apiFetch('/proposals/projects');
      if (res.success) setProjects(res.data);
      else setLoadError(true);
    } catch (err) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (name: string) => {
    try {
      const res = await apiFetch('/proposals/projects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      if (res.success) fetchProjects();
      else setErrorMsg(res.error || res.message || 'Failed to create proposal project.');
    } catch (err) {
      setErrorMsg('Failed to create proposal project. Please try again.');
    }
  };

  const handleRenameProject = async (id: string) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      const res = await apiFetch(`/proposals/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (res.success) {
        setRenamingId(null);
        fetchProjects();
      } else {
        setErrorMsg(res.error || res.message || 'Failed to rename proposal project.');
      }
    } catch (err) {
      setErrorMsg('Failed to rename proposal project. Please try again.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await apiFetch(`/proposals/projects/${id}`, { method: 'DELETE' });
      if (res.success) fetchProjects();
      else setErrorMsg(res.error || res.message || 'Failed to delete proposal project.');
    } catch (err) {
      setErrorMsg('Failed to delete proposal project. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col gap-4">
      <SEOHead
        title="Proposals | Build Your Thoughts Admin"
        description="Manage proposal projects and branded PDF templates"
      />

      <Card className="p-5 flex flex-col min-h-0 flex-1" hoverEffect={false}>
        {/* Header */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark/10">
          <div>
            <h2 className="font-display text-lg font-bold text-dark">Proposal Projects</h2>
            <p className="text-xs text-slateText mt-0.5">Manage each project's templates</p>
          </div>
          <button
            onClick={() => setIsNewProjectOpen(true)}
            className="focus-ring px-4 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>

        {errorMsg && (
          <div className="shrink-0 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between gap-3">
            {errorMsg}
            <button onClick={() => setErrorMsg('')} className="focus-ring shrink-0 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Projects List */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="py-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Spinner.Skeleton key={i} lines={2} />
              ))}
            </div>
          ) : loadError ? (
            <EmptyState
              icon={FileText}
              title="Couldn't load proposal projects"
              description="Check your connection and try again."
              action={
                <button
                  onClick={fetchProjects}
                  className="focus-ring px-4 py-2 rounded-xl bg-dark text-white text-xs font-bold hover:bg-dark/90"
                >
                  Retry
                </button>
              }
              className="border-rose-200 bg-rose-50/40"
            />
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No proposal projects yet"
              description="Create one above to start building templates."
            />
          ) : (
            <div className="divide-y divide-dark/5">
              {projects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/dashboard/proposals/${p._id}`)}
                  className="py-3 flex items-center justify-between gap-3 cursor-pointer group hover:bg-dark/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-dark" />
                    </div>
                    {renamingId === p._id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameProject(p._id)}
                        onBlur={() => handleRenameProject(p._id)}
                        className="flex-1 px-2 py-1 bg-background border border-dark/20 rounded-lg text-xs"
                      />
                    ) : (
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-sm text-dark leading-tight capitalize truncate">{p.name}</h3>
                        <p className="text-[11px] text-slateText truncate">
                          {p.description || 'Manage this project\'s proposal templates'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(p._id);
                        setRenameValue(p.name);
                      }}
                      aria-label="Rename"
                      className="focus-ring p-1.5 text-slateText hover:text-dark rounded-lg hover:bg-dark/5"
                      title="Rename"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(p._id);
                      }}
                      aria-label="Delete"
                      className="focus-ring p-1.5 text-slateText hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slateText/40 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreate={handleCreateProject}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDeleteProject(deleteTarget)}
        title="Delete proposal project?"
        description="This project and all its templates will be permanently removed."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};
