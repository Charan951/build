import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Input, Select, Textarea } from '../ui/FormField';
import { Button } from '../ui/Button';
import { getApiUrl } from '../../services/api';

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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
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
    }
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
      const response = await fetch(getApiUrl(`/leads/${lead._id}`), {
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
    setConfirmDeleteOpen(false);
    setDeleteLoading(true);
    try {
      const response = await fetch(getApiUrl(`/leads/${lead._id}`), {
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
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Lead" subtitle="Update lead details and stage" maxWidth="md">
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Contact Name"
            required
            placeholder="e.g., Jane Doe"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company"
              placeholder="Company name"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Phone"
              placeholder="Phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Estimated Value (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.estimatedValue || ''}
            onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Stage"
              value={formData.status || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              {stages.map((st) => (
                <option key={st._id} value={st.name}>
                  {st.name}
                </option>
              ))}
            </Select>
            <Select
              label="Assign To"
              value={formData.assignedTo || 'Unassigned'}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            >
              <option value="Unassigned">Unassigned</option>
              <option value="Sales Rep 1">Sales Rep 1</option>
              <option value="Sales Rep 2">Sales Rep 2</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Follow-up Date"
              type="date"
              value={formData.followUpDate || ''}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={formData.followUpTime || ''}
              onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
            />
          </div>

          <Textarea
            label="Notes"
            rows={2}
            placeholder="Anything useful about this lead..."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={deleteLoading}
              className="focus-ring px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="lime" size="sm" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete lead?"
        description={`"${lead.name}" will be permanently removed.`}
        confirmLabel="Delete"
        isSubmitting={deleteLoading}
        destructive
      />
    </>
  );
};
