import React, { useEffect, useRef, useState } from 'react';
import { useHotkey } from '../../hooks/useHotkey';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Trash2, Edit, Eye, ArrowLeft, Search, RefreshCw, FileText, Calendar } from 'lucide-react';

interface BlogData {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  readTime: string;
  isPublished: boolean;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const emptyBlog: BlogData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  category: 'Engineering',
  tags: ['Architecture', 'Scalability'],
  readTime: '5 min read',
  isPublished: true,
  author: {
    name: 'Engineering Team',
    role: 'Software Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
};

export const ManageBlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BlogData>(emptyBlog);
  const [viewBlog, setViewBlog] = useState<any>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBlogs();
  }, [token, navigate]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/blogs');
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      setErrorMsg('Failed to load blogs.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyBlog);
    setTagsInput(emptyBlog.tags.join(', '));
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);
  useHotkey('/', () => searchInputRef.current?.focus());
  useHotkey('n', () => handleOpenCreate());

  const handleOpenEdit = (blog: any) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      coverImage: blog.coverImage || '',
      category: blog.category || 'Engineering',
      tags: blog.tags || [],
      readTime: blog.readTime || '5 min read',
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
      author: {
        name: blog.author?.name || 'Engineering Team',
        role: blog.author?.role || 'Software Architect',
        avatar: blog.author?.avatar || '',
      },
    });
    setTagsInput((blog.tags || []).join(', '));
    setErrorMsg('');
    setSuccessMsg('');
    setIsFormOpen(true);
  };

  const handleOpenView = (blog: any) => {
    setViewBlog(blog);
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

    const tagsArr = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);

    const payload = {
      ...formData,
      tags: tagsArr,
    };

    try {
      const endpoint = editingId ? `/blogs/${editingId}` : '/blogs';
      const method = editingId ? 'PUT' : 'POST';

      const data = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (data.success) {
        setSuccessMsg(editingId ? 'Blog post updated successfully!' : 'Blog post published successfully!');
        setIsFormOpen(false);
        fetchBlogs();
      } else {
        setErrorMsg(data.message || 'Operation failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection error.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const data = await apiFetch(`/blogs/${id}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setSuccessMsg('Blog post deleted successfully!');
        fetchBlogs();
      } else {
        setErrorMsg(data.message || 'Failed to delete blog post.');
      }
    } catch (err) {
      setErrorMsg('Error deleting blog post.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-4 space-y-8">
      <SEOHead title="Manage Blogs | Headless CMS" />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="focus-ring inline-flex items-center gap-2 font-bold text-dark hover:text-primary transition-colors rounded">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Blog Post
        </Button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div role="status" className="p-4 rounded-operateLg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="focus-ring text-xs text-emerald-600 font-bold rounded">Dismiss</button>
        </div>
      )}
      {errorMsg && (
        <div role="alert" className="p-4 rounded-operateLg bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="focus-ring text-xs text-rose-600 font-bold rounded">Dismiss</button>
        </div>
      )}

      {/* Controls & Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slateText" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search blogs by title or excerpt... (press / to focus)"
              aria-label="Search blogs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus-ring w-full pl-11 pr-4 py-2.5 rounded-operateLg bg-background border border-dark/10 text-sm text-dark focus:outline-none focus:border-dark"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label htmlFor="blog-category-filter" className="text-xs font-bold text-slateText uppercase">
              Category:
            </label>
            <select
              id="blog-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="focus-ring px-4 py-2 rounded-operateLg bg-background border border-dark/10 text-xs font-bold text-dark focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Engineering">Engineering</option>
              <option value="Architecture">Architecture</option>
              <option value="AI & ML">AI & ML</option>
              <option value="DevOps">DevOps</option>
            </select>

            <button onClick={fetchBlogs} aria-label="Refresh" className="focus-ring p-2.5 rounded-operateLg border border-dark/10 hover:bg-background text-dark" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Blog Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.length === 0 ? (
          <Card className="p-8 text-center text-slateText col-span-3">
            {loading ? 'Loading blog posts...' : 'No blog posts found.'}
          </Card>
        ) : (
          filteredBlogs.map((b) => (
            <Card key={b._id} className="p-6 space-y-4 flex flex-col justify-between hover:border-dark/20 transition-all">
              <div className="space-y-3">
                <div className="relative aspect-video rounded-operateLg overflow-hidden bg-dark/5 border border-dark/10">
                  <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-dark/80 text-primary backdrop-blur-sm">
                      {b.category}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-slateText mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(b.publishedAt || b.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{b.readTime}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-dark line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-slateText mt-1 line-clamp-2">{b.excerpt}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dark/5">
                <span className="text-xs font-semibold text-dark truncate max-w-[120px]">
                  By {b.author?.name || 'Author'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenView(b)}
                    aria-label="Read Post"
                    className="focus-ring p-2 text-slateText hover:text-dark hover:bg-dark/5 rounded-operateMd transition-colors"
                    title="Read Post"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(b)}
                    aria-label="Edit Post"
                    className="focus-ring p-2 text-slateText hover:text-dark hover:bg-dark/5 rounded-operateMd transition-colors"
                    title="Edit Post"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(b._id)}
                    aria-label="Delete Post"
                    className="focus-ring p-2 text-rose-600 hover:bg-rose-50 rounded-operateMd transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Article' : 'Publish New Article'}
        subtitle={editingId ? 'Modify published technical article content' : 'Create and publish technical blog content'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Architecting Distributed Systems"
                className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. architecting-distributed-systems"
                className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Engineering"
                className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Read Time *</label>
              <input
                type="text"
                required
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="e.g. 5 min read"
                className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Cover Image URL *</label>
            <input
              type="text"
              required
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Article Excerpt *</label>
            <textarea
              rows={2}
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief preview text displayed in listing..."
              className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Full Content (Markdown or HTML) *</label>
            <textarea
              rows={6}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write technical post body content here..."
              className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Author Name *</label>
              <input
                type="text"
                required
                value={formData.author.name}
                onChange={(e) =>
                  setFormData({ ...formData, author: { ...formData.author, name: e.target.value } })
                }
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark uppercase mb-1">Author Role *</label>
              <input
                type="text"
                required
                value={formData.author.role}
                onChange={(e) =>
                  setFormData({ ...formData, author: { ...formData.author, role: e.target.value } })
                }
                placeholder="e.g. Principal Cloud Architect"
                className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark uppercase mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Cloud, Microservices, Kubernetes"
              className="w-full px-4 py-2.5 rounded-operateMd bg-background border border-dark/10 text-sm focus:outline-none focus:border-dark"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark/10">
            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-dark hover:bg-dark hover:text-white font-bold">
              {editingId ? 'Save Changes' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW DETAIL MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={viewBlog?.title || 'Blog Post Preview'}
        subtitle={`Category: ${viewBlog?.category || ''} • Read time: ${viewBlog?.readTime || ''}`}
        maxWidth="4xl"
      >
        {viewBlog && (
          <div className="space-y-6 text-dark">
            <img
              src={viewBlog.coverImage}
              alt={viewBlog.title}
              className="w-full h-64 object-cover rounded-operateLg border border-dark/10"
            />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-dark/10 overflow-hidden flex items-center justify-center font-bold text-dark">
                {viewBlog.author?.avatar ? (
                  <img src={viewBlog.author.avatar} alt={viewBlog.author.name} className="w-full h-full object-cover" />
                ) : (
                  viewBlog.author?.name?.[0] || 'A'
                )}
              </div>
              <div>
                <span className="font-bold text-sm text-dark block">{viewBlog.author?.name}</span>
                <span className="text-xs text-slateText block">{viewBlog.author?.role}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase text-slateText mb-1">Excerpt</h4>
              <p className="text-sm font-semibold italic text-slateText">{viewBlog.excerpt}</p>
            </div>

            <div className="p-4 rounded-operateLg bg-background border border-dark/5">
              <h4 className="font-bold text-xs uppercase text-slateText mb-2">Content</h4>
              <div className="text-sm whitespace-pre-wrap text-dark leading-relaxed font-sans">
                {viewBlog.content}
              </div>
            </div>

            {viewBlog.tags?.length > 0 && (
              <div>
                <h4 className="font-bold text-xs uppercase text-slateText mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {viewBlog.tags.map((t: string, i: number) => (
                    <Badge key={i} variant="dark">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete blog post?"
        description="This post will be permanently removed and unpublished from the site."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};
