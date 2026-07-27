import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  DollarSign,
  Search,
  Star
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const ManagePricingPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('$');
  const [billingCycle, setBillingCycle] = useState('One-time payment');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>(['']);
  const [isPopular, setIsPopular] = useState(false);
  const [buttonText, setButtonText] = useState('Choose This Plan');
  const [buttonLink, setButtonLink] = useState('/contact');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/v1/pricing-plans/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      } else {
        setErrorMsg(data.message || 'Failed to fetch pricing plans');
      }
    } catch {
      setErrorMsg('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCurrency('$');
    setBillingCycle('One-time payment');
    setDescription('');
    setFeatures(['', '', '']);
    setIsPopular(false);
    setButtonText('Get Started');
    setButtonLink('/contact');
    setOrder(plans.length + 1);
    setIsActive(true);
    setEditingId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: any) => {
    setEditingId(plan._id);
    setName(plan.name);
    setPrice(plan.price);
    setCurrency(plan.currency || '$');
    setBillingCycle(plan.billingCycle || 'One-time payment');
    setDescription(plan.description || '');
    setFeatures(plan.features && plan.features.length > 0 ? plan.features : ['', '']);
    setIsPopular(!!plan.isPopular);
    setButtonText(plan.buttonText || 'Get Started');
    setButtonLink(plan.buttonLink || '/contact');
    setOrder(plan.order || 1);
    setIsActive(!!plan.isActive);
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

    const token = localStorage.getItem('adminToken');
    const cleanedFeatures = features.filter((f) => f.trim() !== '');

    const payload = {
      name,
      price,
      currency,
      billingCycle,
      description,
      features: cleanedFeatures,
      isPopular,
      buttonText,
      buttonLink,
      order: Number(order),
      isActive,
    };

    const url = editingId
      ? `/api/v1/pricing-plans/${editingId}`
      : '/api/v1/pricing-plans';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(
          editingId
            ? 'Pricing plan updated successfully!'
            : 'Pricing plan created successfully!'
        );
        setIsModalOpen(false);
        resetForm();
        fetchPlans();
      } else {
        setErrorMsg(data.message || 'Action failed.');
      }
    } catch {
      setErrorMsg('Server connection error.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pricing plan?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/v1/pricing-plans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Pricing plan deleted successfully!');
        fetchPlans();
      } else {
        setErrorMsg(data.message || 'Failed to delete plan.');
      }
    } catch {
      setErrorMsg('Error deleting plan.');
    }
  };

  const filteredPlans = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.price.includes(search)
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
            Startup Plans Manager
          </h1>
          <p className="text-xs text-gray-400">
            Manage pricing tiers, feature lists, popular highlights, and buttons for the website.
          </p>
        </div>

        <Button variant="lime" onClick={handleOpenCreateModal} className="gap-2 font-bold shrink-0">
          <Plus className="w-4 h-4" /> Add Pricing Plan
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
          placeholder="Search pricing plans by name or price..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-dark/60 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-mono">Loading pricing plans...</div>
      ) : filteredPlans.length === 0 ? (
        <div className="py-20 text-center text-gray-400 font-mono">No pricing plans found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPlans.map((plan) => (
            <Card
              key={plan._id}
              className={`p-8 bg-dark border flex flex-col justify-between space-y-6 rounded-3xl relative ${
                plan.isPopular ? 'border-primary/60 shadow-glow' : 'border-white/10'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full bg-primary text-dark">
                  <Star className="w-3.5 h-3.5 fill-dark" /> Most Popular
                </div>
              )}

              <div className="space-y-4">
                <span className="text-xs font-mono text-gray-400 font-bold">#{plan.order}</span>

                <h3 className="font-display text-2xl font-bold text-white">{plan.name}</h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-primary">{plan.currency}</span>
                  <span className="font-display text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-gray-400 font-medium ml-1">/ {plan.billingCycle}</span>
                </div>

                {plan.description && (
                  <p className="text-xs text-gray-400 leading-relaxed">{plan.description}</p>
                )}

                {/* Features */}
                <div className="space-y-2 pt-2">
                  {plan.features?.map((f: string, idx: number) => {
                    const isEx =
                      f.toLowerCase().startsWith('no ') ||
                      f.toLowerCase().startsWith('not ') ||
                      f.toLowerCase().startsWith('✕') ||
                      f.toLowerCase().startsWith('x ') ||
                      f.toLowerCase().startsWith('!');

                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {isEx ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <span className={isEx ? 'text-gray-400 line-through' : 'text-gray-200 font-medium'}>
                          {f}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${plan.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {plan.isActive ? '• Active' : '• Inactive'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(plan)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
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
        title={editingId ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
        subtitle="Configure plan details, pricing, and features for website display"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Startup Plan"
              className="w-full px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Price Amount</label>
              <input
                type="text"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 89,000"
                className="w-full px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Billing Cycle</label>
              <input
                type="text"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                placeholder="e.g. One-time payment"
                className="w-full px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Short Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Complete multi-app ecosystem for rapidly growing startup platforms."
              className="w-full px-3 py-2 rounded-xl bg-dark/60 border border-white/15 text-white text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Features List Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-300">Plan Features List</label>
              <span className="text-[10px] text-gray-400">Prefix with "No " or click "Not Included" for Red Cross Mark (✕)</span>
            </div>

            <div className="space-y-2">
              {features.map((feat, idx) => {
                const lowerF = feat.trim().toLowerCase();
                const isExcluded =
                  lowerF.startsWith('no ') ||
                  lowerF.startsWith('not ') ||
                  lowerF.startsWith('✕') ||
                  lowerF.startsWith('x ') ||
                  lowerF.startsWith('!');

                const toggleExcludedStatus = () => {
                  let next = [...features];
                  if (isExcluded) {
                    // Make included: strip No, Not, ✕, x, !
                    next[idx] = feat.replace(/^(no|not|✕|x|!)\s+/i, '');
                  } else {
                    // Make excluded: prepend No
                    next[idx] = `No ${feat}`;
                  }
                  setFeatures(next);
                };

                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={toggleExcludedStatus}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors shrink-0 ${
                        isExcluded
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      }`}
                    >
                      {isExcluded ? '✕ Excluded' : '✓ Included'}
                    </button>

                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      placeholder={`Feature #${idx + 1} (e.g. Master Admin Panel or No Source Code)`}
                      className={`flex-1 px-3 py-2 rounded-xl bg-dark/60 border text-xs focus:outline-none focus:border-primary ${
                        isExcluded ? 'border-rose-500/40 text-rose-200' : 'border-white/15 text-white'
                      }`}
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
                );
              })}
            </div>

            <button
              type="button"
              onClick={addFeatureInput}
              className="mt-2 text-xs font-bold text-primary hover:underline"
            >
              + Add Feature Line
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">Button Text</label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Choose This Plan"
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

          {/* Highlight & Active Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              Mark as "Most Popular" (Highlighted Blue Card)
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
            {editingId ? 'Save Changes' : 'Create Pricing Plan'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
