import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Star,
  Tag
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/FormField';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const ManagePricingPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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
    try {
      const data = await apiFetch('/pricing-plans/admin/all');
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
      ? `/pricing-plans/${editingId}`
      : '/pricing-plans';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const data = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

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
    try {
      const data = await apiFetch(`/pricing-plans/${id}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setSuccessMsg('Pricing plan deleted successfully!');
        fetchPlans();
      } else {
        setErrorMsg(data.message || 'Failed to delete plan.');
      }
    } catch {
      setErrorMsg('Error deleting plan.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredPlans = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.price.includes(search)
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
          <Plus className="w-4 h-4" /> Add Pricing Plan
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
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pricing plans by name or price..."
          aria-label="Search pricing plans"
          className="focus-ring w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-dark/10 text-dark placeholder:text-mutedOnLight text-sm focus:outline-none focus:border-dark"
        />
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[0, 1, 2].map((i) => (
            <Spinner.CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <EmptyState icon={Tag} title="No pricing plans found" description="Create your first pricing plan to show it on the public pricing section." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPlans.map((plan) => (
            <Card
              key={plan._id}
              className={`p-8 bg-white border flex flex-col justify-between space-y-6 relative ${
                plan.isPopular ? 'border-primary shadow-hover' : 'border-dark/10'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full bg-primary text-dark">
                  <Star className="w-3.5 h-3.5 fill-dark" /> Most Popular
                </div>
              )}

              <div className="space-y-4">
                <span className="text-xs font-mono text-mutedOnLight font-bold">#{plan.order}</span>

                <h3 className="font-display text-2xl font-bold text-dark">{plan.name}</h3>

                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-dark">{plan.currency}</span>
                  <span className="font-display text-4xl font-extrabold text-dark">{plan.price}</span>
                  <span className="text-xs text-mutedOnLight font-medium ml-1">/ {plan.billingCycle}</span>
                </div>

                {plan.description && (
                  <p className="text-xs text-slateText leading-relaxed">{plan.description}</p>
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
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <span className={isEx ? 'text-mutedOnLight line-through' : 'text-dark font-medium'}>
                          {f}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-dark/10 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${plan.isActive ? 'text-emerald-600' : 'text-mutedOnLight'}`}>
                  {plan.isActive ? '• Active' : '• Inactive'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(plan)}
                    aria-label={`Edit ${plan.name}`}
                    className="focus-ring p-2 rounded-xl bg-dark/5 hover:bg-dark/10 text-slateText hover:text-dark transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: plan._id, name: plan.name })}
                    aria-label={`Delete ${plan.name}`}
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
        title={editingId ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
        subtitle="Configure plan details, pricing, and features for website display"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Plan Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Startup Plan" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price Amount" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 89,000" />
            <Input label="Billing Cycle" value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} placeholder="e.g. One-time payment" />
          </div>

          <Input
            label="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Complete multi-app ecosystem for rapidly growing startup platforms."
          />

          {/* Features List Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-dark">Plan Features List</label>
              <span className="text-[10px] text-mutedOnLight">Prefix with "No " or click "Not Included" for Red Cross Mark (✕)</span>
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
                      className={`focus-ring px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors shrink-0 ${
                        isExcluded
                          ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {isExcluded ? '✕ Excluded' : '✓ Included'}
                    </button>

                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      placeholder={`Feature #${idx + 1} (e.g. Master Admin Panel or No Source Code)`}
                      aria-label={`Feature ${idx + 1}`}
                      className={`focus-ring flex-1 px-3 py-2 rounded-form bg-background border text-xs focus:outline-none focus:border-dark ${
                        isExcluded ? 'border-rose-200 text-rose-600' : 'border-dark/10 text-dark'
                      }`}
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
                );
              })}
            </div>

            <button
              type="button"
              onClick={addFeatureInput}
              className="focus-ring mt-2 text-xs font-bold text-dark hover:text-primary"
            >
              + Add Feature Line
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Button Text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="e.g. Choose This Plan" />
            <Input label="Display Order" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
          </div>

          {/* Highlight & Active Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-dark font-bold">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              Mark as "Most Popular" (Highlighted Card)
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
            {editingId ? 'Save Changes' : 'Create Pricing Plan'}
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        title="Delete pricing plan?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently removed from the public pricing section.` : undefined}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};
