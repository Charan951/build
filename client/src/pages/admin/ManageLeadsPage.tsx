import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Mail, Phone, Calendar, Trash2, Eye, Search, RefreshCw, Building } from 'lucide-react';
import { apiFetch } from '../../services/api';

export const ManageLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal detail view state
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchLeads();
  }, [token, navigate]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/leads');
      if (data.success) {
        setLeads(data.data);
      }
    } catch (err) {
      setErrorMsg('Failed to fetch lead inquiries.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const data = await apiFetch(`/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (data.success) {
        setSuccessMsg(`Status updated to "${newStatus}"!`);
        if (selectedLead && selectedLead._id === id) {
          setSelectedLead({ ...selectedLead, status: newStatus });
        }
        fetchLeads();
      }
    } catch (err) {
      setErrorMsg('Failed to update status.');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact inquiry?')) return;
    try {
      const data = await apiFetch(`/leads/${id}`, {
        method: 'DELETE',
      });
      if (data.success) {
        setSuccessMsg('Lead inquiry deleted successfully.');
        if (isViewOpen) setIsViewOpen(false);
        fetchLeads();
      } else {
        setErrorMsg(data.message || 'Failed to delete lead.');
      }
    } catch (err) {
      setErrorMsg('Error executing delete operation.');
    }
  };

  const handleOpenView = (lead: any) => {
    setSelectedLead(lead);
    setIsViewOpen(true);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.projectType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-6 space-y-8">
      <SEOHead title="Lead Inbox | Headless CMS" />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-2 font-bold text-dark hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-dark text-white p-8 rounded-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge variant="lime" className="mb-2">Inbound CRM Pipeline</Badge>
          <h1 className="font-display text-3xl font-bold">Contact Inquiries Inbox</h1>
          <p className="text-xs text-gray-400 mt-1">Review, process, view details, and manage client inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="lime" className="text-sm px-4 py-1.5 font-bold">
            Total: {leads.length} Leads
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-xs text-emerald-600 font-bold">Dismiss</button>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-xs text-rose-600 font-bold">Dismiss</button>
        </div>
      )}

      {/* Search & Filter bar */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slateText" />
            <input
              type="text"
              placeholder="Search leads by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-background border border-dark/10 text-sm text-dark focus:outline-none focus:border-dark"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['all', 'new', 'contacted', 'in_progress', 'closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-dark text-white shadow'
                    : 'bg-background text-slateText hover:text-dark border border-dark/10'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}

            <button onClick={fetchLeads} className="p-2 rounded-xl border border-dark/10 hover:bg-background text-dark" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Lead Cards Stream */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <Card className="p-12 text-center text-slateText">
            {loading ? 'Loading lead inbox...' : 'No contact inquiries match your criteria.'}
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead._id} className="p-6 space-y-4 hover:border-dark/20 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark/10 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-dark text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {lead.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-xl font-bold text-dark">{lead.name}</h3>
                      <Badge variant="lime">{lead.projectType}</Badge>
                    </div>
                    <p className="text-xs text-slateText mt-1 flex items-center gap-2">
                      {lead.company && (
                        <>
                          <Building className="w-3.5 h-3.5" />
                          <span>{lead.company}</span>
                          <span>•</span>
                        </>
                      )}
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold bg-background border border-dark/10 text-dark focus:outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>

                  <button
                    onClick={() => handleOpenView(lead)}
                    className="p-2 text-slateText hover:text-dark hover:bg-dark/5 rounded-xl transition-colors"
                    title="View Full Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteLead(lead._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-dark bg-background/60 p-3 rounded-xl border border-dark/5">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href={`mailto:${lead.email}`} className="hover:underline truncate">{lead.email}</a>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slateText">Budget:</span> {lead.budgetRange}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background border border-dark/5 text-sm text-slateText">
                <p className="font-bold text-dark text-xs uppercase mb-1">Message snippet:</p>
                <p className="line-clamp-2">{lead.message}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* VIEW LEAD DETAIL MODAL */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Inquiry from ${selectedLead?.name || 'Contact'}`}
        subtitle={`Submitted on ${selectedLead?.createdAt ? new Date(selectedLead.createdAt).toLocaleString() : ''}`}
        maxWidth="2xl"
      >
        {selectedLead && (
          <div className="space-y-6 text-dark">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-background border border-dark/5">
              <div>
                <span className="text-xs font-bold text-slateText uppercase block">Contact Name</span>
                <span className="font-semibold text-base">{selectedLead.name}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slateText uppercase block">Company / Org</span>
                <span className="font-semibold text-base">{selectedLead.company || 'N/A (Private)'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slateText uppercase block">Email Address</span>
                <a href={`mailto:${selectedLead.email}`} className="text-sm font-semibold text-dark hover:underline">
                  {selectedLead.email}
                </a>
              </div>
              <div>
                <span className="text-xs font-bold text-slateText uppercase block">Phone Number</span>
                <span className="text-sm font-semibold">{selectedLead.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slateText uppercase block">Project Category</span>
                <Badge variant="lime" className="mt-1">{selectedLead.projectType}</Badge>
              </div>
              <div>
                <span className="text-xs font-bold text-slateText uppercase block">Budget Range</span>
                <span className="text-sm font-semibold">{selectedLead.budgetRange}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slateText uppercase block mb-2">Full Message</span>
              <div className="p-4 rounded-2xl bg-background border border-dark/10 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedLead.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-dark/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slateText">Update Status:</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-background border border-dark/10 text-dark focus:outline-none"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <button
                onClick={() => handleDeleteLead(selectedLead._id)}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Inquiry
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
