import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Plus, Pencil, Trash2, FileText, ChevronRight, X, Loader2 } from 'lucide-react';
import { apiFetch } from '../../services/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-dark/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-dark/10 z-10 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-dark">New Proposal Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slateText hover:text-dark hover:bg-dark/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">Project Name *</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., HRMS"
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="w-full px-3 py-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
          />
        </div>

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
            onClick={submit}
            disabled={creating || !name.trim()}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-1.5"
          >
            {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {creating ? 'Creating' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ManageProposalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProposalProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/proposals/projects');
      if (res.success) setProjects(res.data);
    } catch (err) {
      console.error('Failed to load proposal projects:', err);
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
    } catch (err) {
      console.error('Failed to create proposal project:', err);
    }
  };

  const handleRenameProject = async (id: string) => {
    if (!renameValue.trim()) return;
    try {
      const res = await apiFetch(`/proposals/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (res.success) {
        setRenamingId(null);
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to rename proposal project:', err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Delete this proposal project and all its templates?')) return;
    try {
      const res = await apiFetch(`/proposals/projects/${id}`, { method: 'DELETE' });
      if (res.success) fetchProjects();
    } catch (err) {
      console.error('Failed to delete proposal project:', err);
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
            className="px-4 py-2 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>

        {/* Projects List */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {loading ? (
            <p className="text-xs text-slateText py-8 text-center">Loading proposal projects...</p>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-8 h-8 text-slateText/40 mx-auto mb-2" />
              <p className="text-xs text-slateText font-semibold">No proposal projects yet.</p>
              <p className="text-[10px] text-slateText/70 mt-1">Create one above to start building templates.</p>
            </div>
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

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(p._id);
                        setRenameValue(p.name);
                      }}
                      className="p-1.5 text-slateText hover:text-dark rounded-lg hover:bg-dark/5"
                      title="Rename"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(p._id);
                      }}
                      className="p-1.5 text-slateText hover:text-rose-600 rounded-lg hover:bg-rose-50"
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
    </div>
  );
};
