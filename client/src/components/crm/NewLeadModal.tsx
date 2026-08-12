import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

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

  // Lock both html & body scrolling completely while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      setFormData((prev) => ({
        ...prev,
        status: initialStageName || (stages.length > 0 ? stages[0].name : 'New'),
      }));
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
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
      const response = await fetch('/api/v1/leads', {
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
    <div
      className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-hidden overscroll-none"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Compact Modal Box */}
      <div
        className="bg-white rounded-card p-4 sm:p-5 max-w-md w-full max-h-[82vh] flex flex-col shadow-2xl border border-dark/10 animate-in fade-in zoom-in duration-200"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark/10 pb-2.5 shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-dark">New Lead</h2>
            <p className="text-[10px] text-slateText">Add a prospect to your pipeline</p>
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

        {/* Scrollable Form Body with Isolated Mousewheel & VISIBLE Custom Scrollbar */}
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
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
                  value={formData.company}
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
                  value={formData.phone}
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
                value={formData.email}
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
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
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
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark font-semibold"
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
                  value={formData.assignedTo}
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
                    value={formData.followUpDate}
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
                    value={formData.followUpTime}
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
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
              />
            </div>
          </div>

          {/* Fixed Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2.5 shrink-0">
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
              {loading ? 'Adding...' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
