import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
  Star
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const ManagePlatformSolutionsPage: React.FC = () => {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/v1/platform-solutions/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
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
    if (!window.confirm('Are you sure you want to delete this platform solution?')) return;
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
    }
  };

  const filteredSolutions = solutions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6 space-y-8">
      {/* Back to Dashboard */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <Badge variant="lime" className="text-dark font-bold">Admin CMS Engine</Badge>
      </div>

      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark/80 p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <h1 className="font-display text-2xl md:text-3xl font-black text-white">
            Platform Solutions Manager
          </h1>
          <p className="text-xs text-gray-400">
            Create, edit, and organize industry platform cards displayed in the homepage carousel.
          </p>
        </div>

        <Button variant="lime" onClick={handleOpenCreateModal} className="gap-2 font-bold shrink-0">
          <Plus className="w-4 h-4" /> Add Platform Solution
        </Button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search solutions by title or description..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-dark/60 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Solutions Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono">Loading platform solutions...</div>
      ) : filteredSolutions.length === 0 ? (
        <div className="py-20 text-center text-gray-400 font-mono">No platform solutions found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSolutions.map((sol) => (
            <Card
              key={sol._id}
              className={`p-6 bg-dark border flex flex-col justify-between space-y-4 rounded-3xl relative ${
                sol.isHighlighted ? 'border-primary/60 shadow-glow' : 'border-white/10'
              }`}
            >
              {sol.isHighlighted && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-dark">
                  <Star className="w-3 h-3 fill-dark" /> Highlighted
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-gray-400">#{sol.order}</span>
                  {sol.badge && <Badge variant="lime">{sol.badge}</Badge>}
                </div>

                <h3 className="font-display text-xl font-bold text-white">{sol.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{sol.description}</p>

                {/* Features List */}
                <div className="space-y-1.5 pt-2">
                  {sol.features?.map((f: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${sol.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {sol.isActive ? '• Active' : '• Inactive'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(sol)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sol._id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
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
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Platform Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Food Delivery Platform"
              className="w-full px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Description</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Build a restaurant network platform like Swiggy and Zomato with seamless ordering."
              className="w-full px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Badge Tag</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Most Popular"
                className="w-full px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Display Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Features List Inputs */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">Checkmark Features (4 Items)</label>
            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder={`Feature #${idx + 1} (e.g. Real-time Order Tracking)`}
                    className="flex-1 px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-xs focus:outline-none focus:border-primary"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeatureInput(idx)}
                      className="p-2 text-rose-400 hover:text-rose-300 text-xs"
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
              className="mt-2 text-xs font-bold text-primary hover:underline"
            >
              + Add Feature Item
            </button>
          </div>

          {/* Highlight Toggle */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
              <input
                type="checkbox"
                checked={isHighlighted}
                onChange={(e) => setIsHighlighted(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              Highlight Card (Active Green Center Styling)
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
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
    </div>
  );
};
