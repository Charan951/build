import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Trash2, Edit3 } from 'lucide-react';

export interface LeadData {
  _id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  source?: string;
  estimatedValue?: number;
  status: string;
  assignedTo?: string;
  followUpDate?: string;
  followUpTime?: string;
  notes?: string;
}

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadData | null;
  stages: Array<{ _id: string; name: string }>;
  onLeadUpdated: () => void;
  onLeadDeleted?: () => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  stages,
  onLeadUpdated,
  onLeadDeleted,
}) => {
  const [formData, setFormData] = useState<Partial<LeadData>>({});
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (lead && isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      setFormData({
        name: lead.name || '',
        company: lead.company || '',
        phone: lead.phone || '',
        email: lead.email || '',
        estimatedValue: lead.estimatedValue || 0,
        status: lead.status || (stages.length > 0 ? stages[0].name : 'New'),
        assignedTo: lead.assignedTo || 'Unassigned',
        followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
        followUpTime: lead.followUpTime || '',
        notes: lead.notes || '',
      });
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [lead, isOpen, stages]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setErrorMsg('Contact name is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`/api/v1/leads/${lead._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          ...formData,
          estimatedValue: parseFloat(formData.estimatedValue as any) || 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onLeadUpdated();
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to update lead.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating lead.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/v1/leads/${lead._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        if (onLeadDeleted) onLeadDeleted();
        onLeadUpdated();
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to delete lead.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting lead.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-hidden overscroll-none"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Compact Modal Box */}
      <div
        className="bg-white rounded-card p-4 sm:p-5 max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-dark/10 animate-in fade-in zoom-in duration-200"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark/10 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-dark">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-dark">Edit Lead</h2>
              <p className="text-[10px] text-slateText">Update lead details and stage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slateText hover:text-dark hover:bg-dark/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden mt-2.5">
          <div
            className="max-h-[280px] sm:max-h-[300px] overflow-y-scroll overflow-x-hidden pr-3 space-y-2.5 border-b border-dark/10 pb-3 custom-form-scrollbar overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Contact Name * */}
            <div>
              <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                Contact Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Jane Doe"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark font-bold"
              />
            </div>

            {/* Company & Phone */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Company name"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
              />
            </div>

            {/* Estimated Value */}
            <div>
              <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                Estimated Value (₹)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.estimatedValue || ''}
                onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
              />
            </div>

            {/* Stage & Assign To */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Stage
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark font-bold"
                >
                  {stages.map((st) => (
                    <option key={st._id} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Assign To
                </label>
                <select
                  value={formData.assignedTo || 'Unassigned'}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Sales Rep 1">Sales Rep 1</option>
                  <option value="Sales Rep 2">Sales Rep 2</option>
                </select>
              </div>
            </div>

            {/* Follow-up Date & Time */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Follow-up Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slateText" />
                  <input
                    type="date"
                    value={formData.followUpDate || ''}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                  Time
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slateText" />
                  <input
                    type="time"
                    value={formData.followUpTime || ''}
                    onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
                    className="w-full pl-8 pr-2 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold text-dark mb-1 uppercase tracking-wider">
                Notes
              </label>
              <textarea
                rows={2}
                placeholder="Anything useful about this lead..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
              />
            </div>
          </div>

          {/* Fixed Footer Buttons with Delete Action */}
          <div className="flex items-center justify-between pt-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl border border-dark/20 text-dark font-bold text-xs hover:bg-dark/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-1.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-xs shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
