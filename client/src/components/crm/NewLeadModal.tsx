import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/FormField';
import { Button } from '../ui/Button';
import { getApiUrl } from '../../services/api';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: Array<{ _id: string; name: string }>;
  initialStageName?: string;
  onLeadAdded: () => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  stages,
  initialStageName,
  onLeadAdded,
}) => {
  const defaultStage = initialStageName || (stages.length > 0 ? stages[0].name : 'New');

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    estimatedValue: '',
    status: defaultStage,
    assignedTo: 'Unassigned',
    followUpDate: '',
    followUpTime: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        status: initialStageName || (stages.length > 0 ? stages[0].name : 'New'),
      }));
    }
  }, [isOpen, initialStageName, stages]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Contact name is required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(getApiUrl('/leads'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          ...formData,
          estimatedValue: parseFloat(formData.estimatedValue as string) || 0,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onLeadAdded();
        onClose();
        setFormData({
          name: '',
          company: '',
          phone: '',
          email: '',
          estimatedValue: '',
          status: defaultStage,
          assignedTo: 'Unassigned',
          followUpDate: '',
          followUpTime: '',
          notes: '',
        });
      } else {
        setErrorMsg(data.message || 'Failed to add lead.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Lead" subtitle="Add a prospect to your pipeline" maxWidth="md">
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
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Company"
            placeholder="Company name"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <Input
            label="Phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Estimated Value (₹)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.estimatedValue}
          onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Stage" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
            {stages.map((st) => (
              <option key={st._id} value={st.name}>
                {st.name}
              </option>
            ))}
          </Select>
          <Select
            label="Assign To"
            value={formData.assignedTo}
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
            value={formData.followUpDate}
            onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
          />
          <Input
            label="Time"
            type="time"
            value={formData.followUpTime}
            onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
          />
        </div>

        <Textarea
          label="Notes"
          rows={2}
          placeholder="Anything useful about this lead..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="lime" size="sm" disabled={loading}>
            {loading ? 'Adding...' : 'Add Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
