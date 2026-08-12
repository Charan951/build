import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Plus, Trash2, Edit, Eye, ArrowLeft, Search, RefreshCw, Layers } from 'lucide-react';

interface ImpactMetric {
  label: string;
  value: string;
  description?: string;
}

interface ProjectData {
  _id?: string;
  title: string;
  slug: string;
  tagline: string;
  client: string;
  industry: string;
  category: 'Enterprise' | 'AI' | 'Mobile' | 'Cloud' | 'UI/UX';
  summary: string;
  heroImage: string;
  challenge: string;
  solution: string;
  technicalArchitecture: string;
  techStack: string[];
  impactMetrics: ImpactMetric[];
  websiteUrl?: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  location?: string;
  status: 'draft' | 'published';
  featured: boolean;
  order: number;
}

const emptyProject: ProjectData = {
  title: '',
  slug: '',
  tagline: '',
  client: '',
  industry: '',
  category: 'Enterprise',
  summary: '',
  heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  challenge: '',
  solution: '',
  technicalArchitecture: '',
  techStack: ['React', 'TypeScript', 'Node.js'],
  websiteUrl: '',
  playStoreUrl: '',
  appStoreUrl: '',
  location: '',
  impactMetrics: [
    { label: 'Latency Reduction', value: '45%', description: 'Improved system performance' }
  ],
  status: 'published',
  featured: false,
  order: 0,
};

export const ManageProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectData>(emptyProject);
  const [viewProject, setViewProject] = useState<any>(null);
  const [techStackInput, setTechStackInput] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProjects();
  }, [token, navigate]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/projects');
      if (data.success) {
        setProjects(data.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyProject);
    setTechStackInput(emptyProject.techStack.join(', '));
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (proj: any) => {
    setEditingId(proj._id);
    setFormData({
      title: proj.title || '',
      slug: proj.slug || '',
      tagline: proj.tagline || '',
      client: proj.client || '',
      industry: proj.industry || '',
      category: proj.category || 'Enterprise',
      summary: proj.summary || '',
      heroImage: proj.heroImage || '',
      challenge: proj.challenge || '',
      solution: proj.solution || '',
      technicalArchitecture: proj.technicalArchitecture || '',
      techStack: proj.techStack || [],
      impactMetrics: proj.impactMetrics?.length ? proj.impactMetrics : [{ label: '', value: '' }],
      status: proj.status || 'published',
      featured: proj.featured || false,
      order: proj.order || 0,
    });
    setTechStackInput((proj.techStack || []).join(', '));
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleOpenView = (proj: any) => {
    setViewProject(proj);
    setIsViewOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingId ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const techStackArray = techStackInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      techStack: techStackArray,
    };

    try {
      const endpoint = editingId ? `/projects/${editingId}` : '/projects';
      const method = editingId ? 'PUT' : 'POST';

      const data = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (data.success) {
        setSuccessMsg(editingId ? 'Case Study updated successfully!' : 'Case Study created successfully!');
        setIsFormOpen(false);
        fetchProjects();
      } else {
        setErrorMsg(data.message || 'Operation failed.');
      }
    } catch (err: any) {
      setErrorMsg('Server connection error.');
    }
  };

  const handleToggleFeatured = async (proj: any) => {
    try {
      const data = await apiFetch(`/projects/${proj._id}`, {
        method: 'PUT',
        body: JSON.stringify({ featured: !proj.featured }),
      });
      if (data.success) {
        setProjects(projects.map((p) => (p._id === proj._id ? { ...p, featured: !p.featured } : p)));
      }
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      const data = await apiFetch(`/projects/${id}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setSuccessMsg('Project deleted successfully.');
        fetchProjects();
      } else {
        setErrorMsg(data.message || 'Delete failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 pb-4  ">
      <SEOHead title="Manage Projects - Admin Dashboard" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center text-xs font-bold text-slateText hover:text-dark mb-2 gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Project
        </Button>
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

      {/* Controls & Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slateText" />
            <input
              type="text"
              placeholder="Search projects by title, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-background border border-dark/10 text-sm text-dark focus:outline-none focus:border-dark"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-slateText uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-2xl bg-background border border-dark/10 text-xs font-bold text-dark focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Enterprise">Enterprise</option>
              <option value="AI">AI</option>
              <option value="Mobile">Mobile</option>
              <option value="Cloud">Cloud</option>
              <option value="UI/UX">UI/UX</option>
            </select>

            <button onClick={fetchProjects} className="p-2.5 rounded-2xl border border-dark/10 hover:bg-background text-dark" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Table List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dark/10 text-xs font-bold uppercase text-slateText">
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Client / Industry</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Home Showcase</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark/5 text-sm font-medium">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slateText">
                    {loading ? 'Loading projects...' : 'No projects found.'}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-background/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.heroImage}
                          alt={proj.title}
                          className="w-12 h-12 rounded-xl object-cover border border-dark/10 bg-dark/5"
                        />
                        <div>
                          <span className="font-bold text-dark text-base block">{proj.title}</span>
                          <span className="text-xs text-slateText block truncate max-w-xs">{proj.tagline}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-dark block">{proj.client}</span>
                      <span className="text-xs text-slateText block">{proj.industry}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="lime">{proj.category}</Badge>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(proj)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shrink-0 ${
                          proj.featured
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {proj.featured ? '✓ On Home Page' : '✕ Hidden'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={proj.status === 'published' ? 'lime' : 'dark'}>{proj.status}</Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenView(proj)}
                          className="p-2 text-slateText hover:text-dark hover:bg-dark/5 rounded-xl transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(proj)}
                          className="p-2 text-slateText hover:text-dark hover:bg-dark/5 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(proj._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Case Study' : 'Create Case Study'}
        subtitle={editingId ? 'Update project case study details' : 'Add a new showcase project to the website'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Fintech Mobile Platform"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. fintech-mobile-platform"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="e.g. Apex Global Bank"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Industry *</label>
              <input
                type="text"
                required
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Financial Services"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm font-semibold text-dark focus:outline-none"
              >
                <option value="Enterprise">Enterprise</option>
                <option value="AI">AI</option>
                <option value="Mobile">Mobile</option>
                <option value="Cloud">Cloud</option>
                <option value="UI/UX">UI/UX</option>
              </select>
            </div>

            {/* Location & External Links */}
            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Location / City</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Kota, India or San Francisco, USA"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Live Website URL</label>
              <input
                type="url"
                value={formData.websiteUrl || ''}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="e.g. https://www.buildyourthougths.in/"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Google Play Store URL</label>
              <input
                type="url"
                value={formData.playStoreUrl || ''}
                onChange={(e) => setFormData({ ...formData, playStoreUrl: e.target.value })}
                placeholder="e.g. https://play.google.com/store/apps/details?id=..."
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Apple App Store URL</label>
              <input
                type="url"
                value={formData.appStoreUrl || ''}
                onChange={(e) => setFormData({ ...formData, appStoreUrl: e.target.value })}
                placeholder="e.g. https://apps.apple.com/app/..."
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm font-semibold text-dark focus:outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Showcase on Home Page?</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-between ${
                  formData.featured
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
              >
                <span>{formData.featured ? '✓ Displaying on Home Page Showcase' : '✕ Hidden from Home Page Showcase'}</span>
                <span className="text-[10px] uppercase font-bold underline">Click to Toggle</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Tagline *</label>
            <input
              type="text"
              required
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Next-gen digital banking for 2M+ active users"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Hero Image URL *</label>
            <input
              type="text"
              required
              value={formData.heroImage}
              onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Executive Summary *</label>
            <textarea
              rows={2}
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief overview of project goals and scope..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">The Challenge *</label>
              <textarea
                rows={3}
                required
                value={formData.challenge}
                onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                placeholder="What legacy problems did the client face?"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Our Solution *</label>
              <textarea
                rows={3}
                required
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                placeholder="How did our engineering team solve it?"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Technical Architecture *</label>
            <textarea
              rows={2}
              required
              value={formData.technicalArchitecture}
              onChange={(e) => setFormData({ ...formData, technicalArchitecture: e.target.value })}
              placeholder="System design, microservices, cloud infrastructure details..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Tech Stack (comma separated)</label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="React, TypeScript, Node.js, GraphQL, PostgreSQL"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark/10">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-dark hover:bg-dark hover:text-white font-bold">
              {editingId ? 'Save Changes' : 'Create Case Study'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAIL MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={viewProject?.title || 'Case Study Detail'}
        subtitle={`Client: ${viewProject?.client || ''} • Category: ${viewProject?.category || ''}`}
        maxWidth="4xl"
      >
        {viewProject && (
          <div className="space-y-6 text-dark">
            <img
              src={viewProject.heroImage}
              alt={viewProject.title}
              className="w-full h-64 object-cover rounded-2xl border border-dark/10"
            />

            <div>
              <h4 className="font-bold text-xs uppercase text-slateText mb-1">Tagline</h4>
              <p className="font-semibold text-lg">{viewProject.tagline}</p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase text-slateText mb-1">Summary</h4>
              <p className="text-sm leading-relaxed">{viewProject.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-background border border-dark/5">
              <div>
                <h4 className="font-bold text-xs uppercase text-slateText mb-1">Challenge</h4>
                <p className="text-sm">{viewProject.challenge}</p>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase text-slateText mb-1">Solution</h4>
                <p className="text-sm">{viewProject.solution}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase text-slateText mb-1">Technical Architecture</h4>
              <p className="text-sm text-slateText">{viewProject.technicalArchitecture}</p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase text-slateText mb-2">Technologies Used</h4>
              <div className="flex flex-wrap gap-2">
                {viewProject.techStack?.map((tech: string, i: number) => (
                  <Badge key={i} variant="dark">{tech}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
