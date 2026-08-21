import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Trash2, Edit, ArrowLeft, Search, RefreshCw, Sparkles, Eye, CheckCircle2 } from 'lucide-react';

interface SubServiceInput {
  num: string;
  title: string;
  slug: string;
}

interface CategoryData {
  _id?: string;
  num: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  subServices: SubServiceInput[];
  order: number;
  isActive: boolean;
}

interface SingleServiceData {
  _id?: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  featuresStr: string;
  benefitsStr: string;
  techStackStr: string;
  isActive: boolean;
}

const emptyCategory: CategoryData = {
  num: '09',
  title: '',
  slug: '',
  description: '',
  icon: 'Code',
  subServices: [
    { num: '01', title: '', slug: '' }
  ],
  order: 9,
  isActive: true
};

const emptyServiceDetail: SingleServiceData = {
  title: '',
  slug: '',
  category: 'UI/UX & Product Design',
  shortDescription: '',
  fullDescription: '',
  icon: 'Layout',
  featuresStr: 'Strategic Roadmap & Systems Architecture, Custom UI/UX Component System, High-Throughput API Integration, Core Web Vitals Optimization',
  benefitsStr: 'High Availability SLA, Conversion UX Design, Hardened Security, Sub-second Latency',
  techStackStr: 'React 19, TypeScript, Node.js, Figma, TailwindCSS',
  isActive: true,
};

export const ManageServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'services'>('categories');
  
  // Category state
  const [categories, setCategories] = useState<any[]>([]);
  const [catSearch, setCatSearch] = useState('');
  
  // Single Service details state
  const [singleServices, setSingleServices] = useState<any[]>([]);
  const [srvSearch, setSrvSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<string | null>(null);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState<string | null>(null);

  // Category Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catFormData, setCatFormData] = useState<CategoryData>(emptyCategory);
  const [subServices, setSubServices] = useState<SubServiceInput[]>(emptyCategory.subServices);

  // Single Service Modal states
  const [isSrvModalOpen, setIsSrvModalOpen] = useState(false);
  const [editingSrvId, setEditingSrvId] = useState<string | null>(null);
  const [srvFormData, setSrvFormData] = useState<SingleServiceData>(emptyServiceDetail);

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchSingleServices();
  }, [token]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let data = await apiFetch('/service-categories/admin/all');
      
      if (!data.success || !data.data || data.data.length === 0) {
        data = await apiFetch('/service-categories');
      }

      if (data.success && data.data) {
        setCategories(data.data);
      } else {
        setErrorMsg('Failed to load service categories.');
      }
    } catch (err) {
      setErrorMsg('Server connection error while fetching categories.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleServices = async () => {
    try {
      const data = await apiFetch('/services');
      if (data.success && data.data) {
        setSingleServices(data.data);
      } else {
        setErrorMsg('Failed to load services.');
      }
    } catch (err) {
      setErrorMsg('Server connection error while fetching services.');
    }
  };

  // --- Category CRUD Handlers ---
  const handleOpenCreateCategory = () => {
    setEditingCatId(null);
    setCatFormData({
      ...emptyCategory,
      num: String(categories.length + 1).padStart(2, '0'),
      order: categories.length + 1
    });
    setSubServices([
      { num: '01', title: '', slug: '' }
    ]);
    setErrorMsg('');
    setSuccessMsg('');
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: any) => {
    setEditingCatId(cat._id);
    setCatFormData({
      num: cat.num,
      title: cat.title,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon || 'Code',
      subServices: cat.subServices || [],
      order: cat.order || 0,
      isActive: cat.isActive !== false
    });
    setSubServices(cat.subServices && cat.subServices.length > 0 ? cat.subServices : [
      { num: '01', title: '', slug: '' }
    ]);
    setErrorMsg('');
    setSuccessMsg('');
    setIsCatModalOpen(true);
  };

  const handleAddSubServiceToCategory = (cat: any) => {
    handleOpenEditCategory(cat);
    setSubServices((prev) => [
      ...prev,
      {
        num: String(prev.length + 1).padStart(2, '0'),
        title: '',
        slug: ''
      }
    ]);
  };

  const handleSubServiceChange = (index: number, field: keyof SubServiceInput, value: string) => {
    const next = [...subServices];
    next[index][field] = value;
    if (field === 'title') {
      next[index].slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    setSubServices(next);
  };

  const addSubServiceInput = () => {
    setSubServices([
      ...subServices,
      {
        num: String(subServices.length + 1).padStart(2, '0'),
        title: '',
        slug: ''
      }
    ]);
  };

  const removeSubServiceInput = (index: number) => {
    setSubServices(subServices.filter((_, idx) => idx !== index));
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      ...catFormData,
      subServices: subServices.filter((s) => s.title.trim().length > 0)
    };

    try {
      const url = editingCatId ? `/api/v1/service-categories/${editingCatId}` : '/api/v1/service-categories';
      const method = editingCatId ? 'PUT' : 'POST';

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
        setSuccessMsg(editingCatId ? 'Service category updated successfully!' : 'Service category created successfully!');
        setIsCatModalOpen(false);
        fetchCategories();
      } else {
        setErrorMsg(data.message || 'Operation failed.');
      }
    } catch (err: any) {
      setErrorMsg('Server connection error.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/service-categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Service category deleted successfully.');
        fetchCategories();
      } else {
        setErrorMsg(data.message || 'Delete failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setDeleteCategoryTarget(null);
    }
  };

  // --- Single Service Detail Page Handlers ---
  const handleOpenCreateServiceDetail = (catTitle?: string) => {
    setEditingSrvId(null);
    setSrvFormData({
      ...emptyServiceDetail,
      category: catTitle || (categories[0]?.title || 'UI/UX & Product Design')
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsSrvModalOpen(true);
  };

  const handleOpenEditServiceDetail = (srv: any) => {
    setEditingSrvId(srv._id);
    setSrvFormData({
      title: srv.title,
      slug: srv.slug,
      category: srv.category || 'UI/UX & Product Design',
      shortDescription: srv.shortDescription || '',
      fullDescription: srv.fullDescription || '',
      icon: srv.icon || 'Layout',
      featuresStr: Array.isArray(srv.features) ? srv.features.join(', ') : '',
      benefitsStr: Array.isArray(srv.benefits) ? srv.benefits.join(', ') : '',
      techStackStr: Array.isArray(srv.techStack) ? srv.techStack.join(', ') : '',
      isActive: srv.isActive !== false,
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsSrvModalOpen(true);
  };

  const handleServiceDetailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      title: srvFormData.title,
      slug: srvFormData.slug,
      category: srvFormData.category,
      shortDescription: srvFormData.shortDescription,
      fullDescription: srvFormData.fullDescription || srvFormData.shortDescription,
      icon: srvFormData.icon,
      features: srvFormData.featuresStr.split(',').map((s) => s.trim()).filter(Boolean),
      benefits: srvFormData.benefitsStr.split(',').map((s) => s.trim()).filter(Boolean),
      techStack: srvFormData.techStackStr.split(',').map((s) => s.trim()).filter(Boolean),
      isActive: srvFormData.isActive,
    };

    try {
      const endpoint = editingSrvId ? `/services/${editingSrvId}` : '/services';
      const method = editingSrvId ? 'PUT' : 'POST';

      const data = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (data.success) {
        setSuccessMsg(editingSrvId ? 'Service page updated successfully!' : 'New Service page created successfully!');
        setIsSrvModalOpen(false);
        fetchSingleServices();
      } else {
        setErrorMsg(data.message || 'Operation failed.');
      }
    } catch (err: any) {
      setErrorMsg('Server connection error.');
    }
  };

  const handleDeleteServiceDetail = async (id: string) => {
    try {
      const data = await apiFetch(`/services/${id}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setSuccessMsg('Service page deleted.');
        fetchSingleServices();
      } else {
        setErrorMsg(data.message || 'Delete failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    } finally {
      setDeleteServiceTarget(null);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(catSearch.toLowerCase()) ||
    cat.description.toLowerCase().includes(catSearch.toLowerCase())
  );

  const filteredServices = singleServices.filter((srv) =>
    srv.title.toLowerCase().includes(srvSearch.toLowerCase()) ||
    srv.category.toLowerCase().includes(srvSearch.toLowerCase()) ||
    srv.slug.toLowerCase().includes(srvSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-4  ">
      <SEOHead title="Manage Services & Categories - Admin CMS" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="focus-ring inline-flex items-center text-xs font-bold text-slateText hover:text-dark mb-2 gap-1 rounded">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleOpenCreateCategory} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
          <Button variant="secondary" onClick={() => handleOpenCreateServiceDetail()} className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Create Service Page
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Services view" className="flex items-center gap-1 border-b border-dark/10 overflow-x-auto no-scrollbar">
        <button
          role="tab"
          aria-selected={activeTab === 'categories'}
          onClick={() => setActiveTab('categories')}
          className={`focus-ring flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'categories' ? 'border-primary text-dark' : 'border-transparent text-slateText hover:text-dark'
          }`}
        >
          Categories & Sub-Services
          <span className="px-1.5 py-0.5 rounded-full bg-dark/5 text-[9px] font-bold text-slateText">
            {categories.length}
          </span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'services'}
          onClick={() => setActiveTab('services')}
          className={`focus-ring flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'services' ? 'border-primary text-dark' : 'border-transparent text-slateText hover:text-dark'
          }`}
        >
          Dedicated Service Pages
          <span className="px-1.5 py-0.5 rounded-full bg-dark/5 text-[9px] font-bold text-slateText">
            {singleServices.length}
          </span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* TAB 1: Categories & Sub-Services Accordion CMS */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slateText" />
                <input
                  type="text"
                  placeholder="Search service categories by title..."
                  aria-label="Search service categories"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="focus-ring w-full pl-11 pr-4 py-2.5 rounded-2xl bg-background border border-dark/10 text-sm text-dark focus:outline-none focus:border-dark"
                />
              </div>

              <button onClick={fetchCategories} className="focus-ring p-2.5 rounded-2xl border border-dark/10 hover:bg-background text-dark flex items-center gap-2 text-xs font-bold">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Categories
              </button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6">
            {filteredCategories.map((cat) => (
              <Card key={cat._id} className="p-6 hover:shadow-lg transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark/10 pb-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg font-black text-primary bg-dark px-3 py-1 rounded-xl">
                      {cat.num}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-dark">{cat.title}</h3>
                      <p className="text-xs text-slateText mt-0.5">{cat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddSubServiceToCategory(cat)}
                      className="focus-ring px-4 py-2 rounded-xl bg-primary/20 text-dark hover:bg-primary font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Service to {cat.title}
                    </button>
                    <button
                      onClick={() => handleOpenEditCategory(cat)}
                      aria-label="Edit Category & Services"
                      className="focus-ring p-2 text-slateText hover:text-dark hover:bg-dark/5 rounded-xl transition-colors"
                      title="Edit Category & Services"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteCategoryTarget(cat._id)}
                      className="focus-ring p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-Services Pill Grid */}
                <div>
                  <span className="text-[11px] font-black uppercase text-slateText tracking-wider block mb-2">
                    Sub-Services in {cat.title} ({cat.subServices?.length || 0}):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {cat.subServices?.map((sub: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl bg-background border border-dark/10 flex items-center justify-between">
                        <div className="truncate pr-2">
                          <span className="text-[10px] font-mono font-bold text-primary mr-2">#{sub.num}</span>
                          <span className="text-xs font-bold text-dark uppercase">{sub.title}</span>
                          <span className="text-[10px] text-slateText block font-mono">/services/{sub.slug}</span>
                        </div>
                        <Link
                          to={`/services/${sub.slug}`}
                          className="focus-ring text-[10px] font-bold text-dark hover:underline shrink-0 rounded"
                          target="_blank"
                        >
                          View ↗
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Individual Service Details Pages CMS */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slateText" />
                <input
                  type="text"
                  placeholder="Search service pages by title or slug..."
                  aria-label="Search service pages"
                  value={srvSearch}
                  onChange={(e) => setSrvSearch(e.target.value)}
                  className="focus-ring w-full pl-11 pr-4 py-2.5 rounded-2xl bg-background border border-dark/10 text-sm text-dark focus:outline-none focus:border-dark"
                />
              </div>

              <button onClick={fetchSingleServices} className="focus-ring p-2.5 rounded-2xl border border-dark/10 hover:bg-background text-dark flex items-center gap-2 text-xs font-bold">
                <RefreshCw className="w-4 h-4" /> Refresh Pages
              </button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="overflow-x-auto custom-form-scrollbar pb-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dark/10 text-xs font-bold uppercase text-slateText">
                    <th className="py-3 px-4">Service Page Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">URL Slug</th>
                    <th className="py-3 px-4 text-right sticky right-0 bg-white border-l border-dark/10">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark/5 text-sm font-medium">
                  {filteredServices.map((srv) => (
                    <tr key={srv._id} className="group hover:bg-background/50 transition-colors">
                      <td className="py-4 px-4 font-bold text-dark">{srv.title}</td>
                      <td className="py-4 px-4">
                        <Badge variant="lime">{srv.category}</Badge>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slateText">/services/{srv.slug}</td>
                      <td className="py-4 px-4 text-right sticky right-0 bg-white group-hover:bg-background/50 border-l border-dark/10 transition-colors">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditServiceDetail(srv)}
                            aria-label="Edit Service Page Content"
                            className="focus-ring p-2 text-slateText hover:text-dark hover:bg-dark/5 rounded-xl transition-colors"
                            title="Edit Service Page Content"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteServiceTarget(srv._id)}
                            aria-label="Delete Service Page"
                            className="focus-ring p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Service Page"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link to={`/services/${srv.slug}`} target="_blank" className="px-3 py-1.5 rounded-xl bg-dark text-white text-xs font-bold inline-flex items-center gap-1">
                            View ↗
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Category & Sub-Services Edit/Create */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCatId ? `Edit Category: ${catFormData.title}` : 'Create Service Category'}
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4 text-dark max-h-[80vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Number (#) *</label>
              <input
                type="text"
                required
                value={catFormData.num}
                onChange={(e) => setCatFormData({ ...catFormData, num: e.target.value })}
                placeholder="e.g. 01, 02"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Icon *</label>
              <select
                value={catFormData.icon}
                onChange={(e) => setCatFormData({ ...catFormData, icon: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm font-semibold text-dark focus:outline-none"
              >
                <option value="Code">Code</option>
                <option value="Layout">Layout</option>
                <option value="ShoppingCart">ShoppingCart</option>
                <option value="Bot">Bot</option>
                <option value="TrendingUp">TrendingUp</option>
                <option value="Palette">Palette</option>
                <option value="ShieldCheck">ShieldCheck</option>
                <option value="Video">Video</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Category Title *</label>
            <input
              type="text"
              required
              value={catFormData.title}
              onChange={(e) => {
                const title = e.target.value;
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setCatFormData({ ...catFormData, title, slug });
              }}
              placeholder="e.g. UI/UX & Product Design"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Category Description *</label>
            <textarea
              required
              rows={2}
              value={catFormData.description}
              onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
              placeholder="Brief overview of this service category..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          {/* Sub-Services Input Section */}
          <div className="pt-2 border-t border-dark/10">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-dark uppercase">Add / Edit Services inside this Category</label>
              <span className="text-[10px] text-slateText font-medium">Auto-generates unique URL slugs</span>
            </div>

            <div className="space-y-3">
              {subServices.map((sub, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-background border border-dark/10 space-y-2">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={sub.num}
                      onChange={(e) => handleSubServiceChange(idx, 'num', e.target.value)}
                      placeholder="#"
                      className="w-14 px-2 py-1.5 rounded-xl bg-white border border-dark/10 text-xs font-mono font-bold text-center"
                    />

                    <input
                      type="text"
                      value={sub.title}
                      onChange={(e) => handleSubServiceChange(idx, 'title', e.target.value)}
                      placeholder={`Service name #${idx + 1} (e.g. MOBILE APP UI DESIGN)`}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-dark/10 text-xs font-bold uppercase focus:outline-none"
                    />

                    {subServices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubServiceInput(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSubServiceInput}
              className="mt-3 text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Service to {catFormData.title || 'Category'}
            </button>
          </div>

          <div className="pt-4 border-t border-dark/10 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Category & Services
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Single Service Page Creation / Editing */}
      <Modal
        isOpen={isSrvModalOpen}
        onClose={() => setIsSrvModalOpen(false)}
        title={editingSrvId ? `Edit Service Page: ${srvFormData.title}` : 'Create Dedicated Service Page'}
      >
        <form onSubmit={handleServiceDetailSubmit} className="space-y-4 text-dark max-h-[80vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Service Page Title *</label>
            <input
              type="text"
              required
              value={srvFormData.title}
              onChange={(e) => {
                const title = e.target.value;
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setSrvFormData({ ...srvFormData, title, slug });
              }}
              placeholder="e.g. Static HTML Website Design"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">URL Slug *</label>
            <input
              type="text"
              required
              value={srvFormData.slug}
              onChange={(e) => setSrvFormData({ ...srvFormData, slug: e.target.value })}
              placeholder="e.g. static-html-website-design"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Category *</label>
            <select
              value={srvFormData.category}
              onChange={(e) => setSrvFormData({ ...srvFormData, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm font-bold text-dark"
            >
              {categories.map((c) => (
                <option key={c._id} value={c.title}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Short Description *</label>
            <textarea
              required
              rows={2}
              value={srvFormData.shortDescription}
              onChange={(e) => setSrvFormData({ ...srvFormData, shortDescription: e.target.value })}
              placeholder="Overview of this specific service..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Full Description *</label>
            <textarea
              required
              rows={3}
              value={srvFormData.fullDescription}
              onChange={(e) => setSrvFormData({ ...srvFormData, fullDescription: e.target.value })}
              placeholder="Detailed explanation..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Core Features (Comma-Separated)</label>
            <input
              type="text"
              value={srvFormData.featuresStr}
              onChange={(e) => setSrvFormData({ ...srvFormData, featuresStr: e.target.value })}
              placeholder="e.g. Custom Architecture, Speed Optimization, Security Hardening"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Tech Stack (Comma-Separated)</label>
            <input
              type="text"
              value={srvFormData.techStackStr}
              onChange={(e) => setSrvFormData({ ...srvFormData, techStackStr: e.target.value })}
              placeholder="e.g. React 19, TypeScript, Node.js, TailwindCSS, Figma"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-dark/10 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setIsSrvModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingSrvId ? 'Update Service Page' : 'Save Service Page'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        onConfirm={() => deleteCategoryTarget && handleDeleteCategory(deleteCategoryTarget)}
        title="Delete service category?"
        description="This category and its sub-services will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        destructive
      />

      <ConfirmDialog
        isOpen={!!deleteServiceTarget}
        onClose={() => setDeleteServiceTarget(null)}
        onConfirm={() => deleteServiceTarget && handleDeleteServiceDetail(deleteServiceTarget)}
        title="Delete service page?"
        description="This service detail page will be permanently removed."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};
