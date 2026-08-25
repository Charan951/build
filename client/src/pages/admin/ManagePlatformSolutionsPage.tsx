import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { useHotkey } from '../../hooks/useHotkey';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  Star,
  Layers
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/FormField';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const ManagePlatformSolutionsPage: React.FC = () => {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [ctaText, setCtaText] = useState('BOOK FREE CONSULTATION');
  const [ctaLink, setCtaLink] = useState('/contact');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/platform-solutions/admin/all');
      if (data.success) {
        setSolutions(data.data);
      } else {
        setErrorMsg(data.message || 'Failed to fetch solutions');
      }
    } catch {
      setErrorMsg('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBadge('');
    setFeatures(['', '', '', '']);
    setCtaText('BOOK FREE CONSULTATION');
    setCtaLink('/contact');
    setIsHighlighted(false);
    setOrder(solutions.length + 1);
    setIsActive(true);
    setEditingId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  useHotkey('/', () => searchInputRef.current?.focus());
  useHotkey('n', () => handleOpenCreateModal());

  const handleOpenEditModal = (sol: any) => {
    setEditingId(sol._id);
    setTitle(sol.title);
    setDescription(sol.description);
    setBadge(sol.badge || '');
    setFeatures(sol.features && sol.features.length > 0 ? sol.features : ['', '']);
    setCtaText(sol.ctaText || 'BOOK FREE CONSULTATION');
    setCtaLink(sol.ctaLink || '/contact');
    setIsHighlighted(!!sol.isHighlighted);
    setOrder(sol.order || 1);
    setIsActive(!!sol.isActive);
    setIsModalOpen(true);
  };

  const handleFeatureChange = (idx: number, val: string) => {
    const next = [...features];
    next[idx] = val;
    setFeatures(next);
  };

  const addFeatureInput = () => {
    setFeatures([...features, '']);
  };

  const removeFeatureInput = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanedFeatures = features.filter((f) => f.trim() !== '');

    const payload = {
      title,
      description,
      badge,
      features: cleanedFeatures,
      ctaText,
      ctaLink,
      isHighlighted,
      order: Number(order),
      isActive,
    };

    const url = editingId
      ? `/platform-solutions/${editingId}`
      : '/platform-solutions';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const data = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (data.success) {
        setSuccessMsg(
          editingId
            ? 'Platform solution updated successfully!'
            : 'Platform solution created successfully!'
        );
        setIsModalOpen(false);
        resetForm();
        fetchSolutions();
      } else {
        setErrorMsg(data.message || 'Action failed.');
      }
    } catch {
      setErrorMsg('Server connection error.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const data = await apiFetch(`/platform-solutions/${id}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setSuccessMsg('Platform solution deleted successfully!');
        fetchSolutions();
      } else {
        setErrorMsg(data.message || 'Failed to delete solution.');
      }
    } catch {
      setErrorMsg('Error deleting solution.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredSolutions = solutions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-4 space-y-8">
      {/* Back to Dashboard */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-bold text-slateText hover:text-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Action Bar */}
      <div className="flex items-center justify-end">
        <Button variant="lime" onClick={handleOpenCreateModal} className="gap-2 font-bold shrink-0">
          <Plus className="w-4 h-4" /> Add Platform Solution
        </Button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-mutedOnLight absolute left-4 top-3.5" />
        <input
          ref={searchInputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search solutions by title or description... (press / to focus)"
          aria-label="Search platform solutions"
          className="focus-ring w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-dark/10 text-dark placeholder:text-mutedOnLight text-sm focus:outline-none focus:border-dark"
        />
      </div>

      {/* Solutions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <Spinner.CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredSolutions.length === 0 ? (
        <EmptyState icon={Layers} title="No platform solutions found" description="Create your first platform solution to feature it on the home page carousel." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSolutions.map((sol) => (
            <Card
              key={sol._id}
              className={`p-6 bg-white border flex flex-col justify-between space-y-4 relative ${
                sol.isHighlighted ? 'border-primary shadow-hover' : 'border-dark/10'
              }`}
            >
              {sol.isHighlighted && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-dark">
                  <Star className="w-3 h-3 fill-dark" /> Highlighted
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-mutedOnLight">#{sol.order}</span>
                  {sol.badge && <Badge variant="lime">{sol.badge}</Badge>}
                </div>

                <h3 className="font-display text-xl font-bold text-dark">{sol.title}</h3>
                <p className="text-xs text-slateText leading-relaxed line-clamp-2">{sol.description}</p>

                {/* Features List */}
                <div className="space-y-1.5 pt-2">
                  {sol.features?.map((f: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slateText">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-dark/10 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${sol.isActive ? 'text-emerald-600' : 'text-mutedOnLight'}`}>
                  {sol.isActive ? '• Active' : '• Inactive'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(sol)}
                    aria-label={`Edit ${sol.title}`}
                    className="focus-ring p-2 rounded-xl bg-dark/5 hover:bg-dark/10 text-slateText hover:text-dark transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: sol._id, title: sol.title })}
                    aria-label={`Delete ${sol.title}`}
                    className="focus-ring p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Platform Solution' : 'Create Platform Solution'}
        subtitle="Manage card content displayed on the home page solutions carousel"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Platform Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Food Delivery Platform"
          />

          <Textarea
            label="Description"
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Build a restaurant network platform like Swiggy and Zomato with seamless ordering."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Badge Tag" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. Most Popular" />
            <Input
              label="Display Order"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          {/* Features List Inputs */}
          <div>
            <label className="block text-xs font-bold text-dark mb-2">Checkmark Features (4 Items)</label>
            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder={`Feature #${idx + 1} (e.g. Real-time Order Tracking)`}
                    aria-label={`Feature ${idx + 1}`}
                    className="focus-ring flex-1 px-3 py-2 rounded-form bg-background border border-dark/10 text-dark text-xs focus:outline-none focus:border-dark"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeatureInput(idx)}
                      aria-label={`Remove feature ${idx + 1}`}
                      className="focus-ring p-2 text-rose-500 hover:text-rose-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFeatureInput}
              className="focus-ring mt-2 text-xs font-bold text-dark hover:text-primary"
            >
              + Add Feature Item
            </button>
          </div>

          {/* Highlight Toggle */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-dark font-bold">
              <input
                type="checkbox"
                checked={isHighlighted}
                onChange={(e) => setIsHighlighted(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              Highlight Card (Active Green Center Styling)
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-dark font-bold">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              Published (Active)
            </label>
          </div>

          <Button type="submit" variant="lime" className="w-full justify-center py-3 font-bold mt-4">
            {editingId ? 'Save Changes' : 'Create Solution'}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete platform solution?"
        description={deleteTarget ? `"${deleteTarget.title}" will be permanently removed from the home page carousel.` : undefined}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};
