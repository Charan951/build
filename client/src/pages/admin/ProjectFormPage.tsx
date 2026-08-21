import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface ClientItem {
  _id: string;
  companyName: string;
}

const STATUS_OPTIONS = [
  { value: 'planning', label: 'New' },
  { value: 'in_progress', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

const EMPTY_FORM = {
  projectName: '',
  description: '',
  projectType: 'one_off' as 'one_off' | 'retainer',
  clientId: '',
  status: 'planning',
  budget: '',
  startDate: '',
  targetDeliveryDate: '',
  domainName: '',
  domainRegistrar: '',
  domainCost: '',
  hostingProvider: '',
  hostingCost: '',
};

export const ProjectFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // present only when editing
  const [searchParams] = useSearchParams();
  const preselectedClient = searchParams.get('client') || '';
  const token = localStorage.getItem('adminToken');
  const isEdit = !!id;

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [form, setForm] = useState({ ...EMPTY_FORM, clientId: preselectedClient });
  const [domainOpen, setDomainOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    apiFetch('/crm/clients', { token })
      .then((res) => {
        if (res.success) setClients(res.data || []);
        else setError('Failed to load clients. Please refresh and try again.');
      })
      .catch(() => setError('Failed to load clients. Please refresh and try again.'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isEdit) return;
    apiFetch('/crm/projects', { token })
      .then((res) => {
        if (!res.success) return;
        const p = (res.data || []).find((proj: any) => proj._id === id);
        if (!p) return;
        setForm({
          projectName: p.projectName || '',
          description: p.description || '',
          projectType: p.projectType || 'one_off',
          clientId: typeof p.clientId === 'object' ? p.clientId._id : p.clientId || '',
          status: p.status || 'planning',
          budget: String(p.budget || 0),
          startDate: p.startDate ? p.startDate.slice(0, 10) : '',
          targetDeliveryDate: p.targetDeliveryDate ? p.targetDeliveryDate.slice(0, 10) : '',
          domainName: p.domain?.name || '',
          domainRegistrar: p.domain?.registrar || '',
          domainCost: p.domain?.cost ? String(p.domain.cost) : '',
          hostingProvider: p.hosting?.provider || '',
          hostingCost: p.hosting?.cost ? String(p.hosting.cost) : '',
        });
      })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName.trim() || !form.clientId) return;
    setSaving(true);
    setError('');

    const payload = {
      projectName: form.projectName.trim(),
      description: form.description,
      projectType: form.projectType,
      clientId: form.clientId,
      status: form.status,
      budget: parseFloat(form.budget) || 0,
      startDate: form.startDate || undefined,
      targetDeliveryDate: form.targetDeliveryDate || undefined,
      domain: {
        name: form.domainName,
        registrar: form.domainRegistrar,
        cost: parseFloat(form.domainCost) || 0,
      },
      hosting: {
        provider: form.hostingProvider,
        cost: parseFloat(form.hostingCost) || 0,
      },
    };

    apiFetch(isEdit ? `/crm/projects/${id}` : '/crm/projects', {
      method: isEdit ? 'PUT' : 'POST',
      token,
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.success) {
          navigate(`/dashboard/client-projects/${res.data._id}`);
        } else {
          setError(res.error || res.message || 'Failed to save project.');
        }
      })
      .catch((err) => setError('Error saving project: ' + err.message))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <div className="py-24 text-center text-slateText text-sm font-semibold animate-pulse">Loading project...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <SEOHead title={isEdit ? 'Edit Project' : 'New Project'} />

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slateText hover:text-dark transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="font-display text-2xl font-bold text-dark">{isEdit ? 'Edit Project' : 'Create New Project'}</h1>
        <p className="text-xs text-slateText mt-1">Set up a new project for your client</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="p-6 space-y-4">
          <h2 className="text-xs font-bold text-dark uppercase tracking-wide">Basic Information</h2>

          <div>
            <label className="block text-xs font-bold text-dark mb-1">
              Project Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Website Redesign"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of the project..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm resize-none focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark mb-1.5">Project Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, projectType: 'one_off' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.projectType === 'one_off' ? 'border-primary bg-lime-50/50' : 'border-dark/10 hover:border-dark/20'
                }`}
              >
                <p className="font-bold text-xs text-dark">One-off Project</p>
                <p className="text-[10px] text-slateText mt-0.5">Fixed scope & budget</p>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, projectType: 'retainer' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  form.projectType === 'retainer' ? 'border-primary bg-lime-50/50' : 'border-dark/10 hover:border-dark/20'
                }`}
              >
                <p className="font-bold text-xs text-dark">Monthly Retainer</p>
                <p className="text-[10px] text-slateText mt-0.5">Recurring monthly fee</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-dark mb-1">
                Client <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm font-semibold"
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-dark mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm font-semibold"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark mb-1">
              Budget (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              placeholder="0.00"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-dark mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark mb-1">Deadline</label>
              <input
                type="date"
                value={form.targetDeliveryDate}
                onChange={(e) => setForm({ ...form, targetDeliveryDate: e.target.value })}
                className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <button
            type="button"
            onClick={() => setDomainOpen((v) => !v)}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <h2 className="text-xs font-bold text-dark uppercase tracking-wide">Domain & Hosting</h2>
              <p className="text-[10px] text-slateText mt-0.5">Optional — track renewal costs</p>
            </div>
            {domainOpen ? <ChevronUp className="w-4 h-4 text-dark" /> : <ChevronDown className="w-4 h-4 text-dark" />}
          </button>

          {domainOpen && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Domain Name</label>
                  <input
                    type="text"
                    placeholder="example.com"
                    value={form.domainName}
                    onChange={(e) => setForm({ ...form, domainName: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Registrar</label>
                  <input
                    type="text"
                    placeholder="e.g., GoDaddy"
                    value={form.domainRegistrar}
                    onChange={(e) => setForm({ ...form, domainRegistrar: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Domain Cost (₹)</label>
                <input
                  type="number"
                  value={form.domainCost}
                  onChange={(e) => setForm({ ...form, domainCost: e.target.value })}
                  className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Hosting Provider</label>
                  <input
                    type="text"
                    placeholder="e.g., Vercel, AWS"
                    value={form.hostingProvider}
                    onChange={(e) => setForm({ ...form, hostingProvider: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark mb-1 uppercase">Hosting Cost (₹)</label>
                  <input
                    type="number"
                    value={form.hostingCost}
                    onChange={(e) => setForm({ ...form, hostingCost: e.target.value })}
                    className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
};
