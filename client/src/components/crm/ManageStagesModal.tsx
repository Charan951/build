import React, { useState, useEffect } from 'react';
import { X, Trash2, ArrowUp, ArrowDown, Plus, Palette } from 'lucide-react';

export interface StageItem {
  _id: string;
  name: string;
  color: string;
  order: number;
}

interface ManageStagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: StageItem[];
  onStagesUpdated: () => void;
}

const PRESET_COLORS = ['#3B82F6', '#A855F7', '#EAB308', '#F97316', '#10B981'];

export const ManageStagesModal: React.FC<ManageStagesModalProps> = ({
  isOpen,
  onClose,
  stages,
  onStagesUpdated,
}) => {
  const [localStages, setLocalStages] = useState<StageItem[]>(stages);
  const [newStageName, setNewStageName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

  // Lock document body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (id: string, newName: string) => {
    setLocalStages(localStages.map((s) => (s._id === id ? { ...s, name: newName } : s)));
  };

  const handleColorChange = (id: string, newColor: string) => {
    setLocalStages(localStages.map((s) => (s._id === id ? { ...s, color: newColor } : s)));
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localStages.length) return;

    const copy = [...localStages];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Re-assign order numbers
    const reordered = copy.map((item, idx) => ({ ...item, order: idx }));
    setLocalStages(reordered);

    // Persist reorder to server
    try {
      await fetch('/api/v1/leads/stages/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          stages: reordered.map((item) => ({ id: item._id, order: item.order })),
        }),
      });
      onStagesUpdated();
    } catch (err) {
      console.error('Failed to reorder stages:', err);
    }
  };

  const handleSaveStageItem = async (stage: StageItem) => {
    try {
      await fetch(`/api/v1/leads/stages/${stage._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ name: stage.name, color: stage.color, order: stage.order }),
      });
      onStagesUpdated();
    } catch (err) {}
  };

  const handleDeleteStage = async (id: string) => {
    if (localStages.length <= 1) {
      alert('You must have at least one pipeline stage.');
      return;
    }
    if (!window.confirm('Are you sure? Leads in this stage will be reassigned to default stage.')) return;

    try {
      await fetch(`/api/v1/leads/stages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      onStagesUpdated();
    } catch (err) {}
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/leads/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          name: newStageName.trim(),
          color: selectedColor,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewStageName('');
        onStagesUpdated();
      }
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-hidden overscroll-none"
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-card p-4 sm:p-5 max-w-md w-full max-h-[82vh] flex flex-col shadow-2xl border border-dark/10 animate-in fade-in zoom-in duration-200"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark/10 pb-2.5 shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-dark">Manage Pipeline Stages</h2>
            <p className="text-[10px] text-slateText">Add, rename, recolor, reorder or remove columns.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slateText hover:text-dark hover:bg-dark/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Stages List with Scrollbar & Reorder */}
        <div
          className="space-y-2 max-h-[260px] sm:max-h-[280px] overflow-y-scroll my-2.5 pr-2 custom-form-scrollbar overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
        >
          {localStages.map((stage, idx) => (
            <div
              key={stage._id}
              className="flex items-center gap-2 p-2 bg-background rounded-xl border border-dark/10 hover:border-dark/20 transition-all"
            >
              {/* Up/Down Reorder Handle */}
              <div className="flex flex-col text-slateText shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="hover:text-dark disabled:opacity-20 p-0.5"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === localStages.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="hover:text-dark disabled:opacity-20 p-0.5"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Color Picker Indicator */}
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={stage.color}
                  onChange={(e) => handleColorChange(stage._id, e.target.value)}
                  onBlur={() => handleSaveStageItem(stage)}
                  className="w-6 h-6 rounded-full border-none cursor-pointer opacity-0 absolute inset-0"
                />
                <div
                  className="w-6 h-6 rounded-full border border-dark/10 shadow-sm"
                  style={{ backgroundColor: stage.color }}
                />
              </div>

              {/* Stage Name Input */}
              <input
                type="text"
                value={stage.name}
                onChange={(e) => handleNameChange(stage._id, e.target.value)}
                onBlur={() => handleSaveStageItem(stage)}
                className="flex-1 p-2 bg-white border border-dark/10 rounded-lg text-xs font-bold text-dark focus:outline-none focus:border-dark"
              />

              {/* Delete Trash Button */}
              <button
                type="button"
                onClick={() => handleDeleteStage(stage._id)}
                className="p-1.5 text-slateText hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add a New Stage Form */}
        <form onSubmit={handleAddStage} className="pt-2.5 border-t border-dark/10 space-y-2 shrink-0">
          <span className="text-[10px] font-bold text-dark flex items-center gap-1.5 uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5 text-slateText" /> Add a new stage
          </span>

          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  selectedColor === c ? 'scale-110 ring-2 ring-dark' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <div className="relative">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-5 h-5 rounded-full opacity-0 cursor-pointer absolute inset-0"
              />
              <div
                className="w-5 h-5 rounded-full border border-dark/20 flex items-center justify-center text-slateText bg-gradient-to-tr from-blue-400 via-pink-400 to-yellow-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Stage name (e.g., Negotiating...)"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-background border border-dark/10 rounded-xl text-xs text-dark focus:outline-none focus:border-dark"
            />
            <button
              type="submit"
              disabled={loading || !newStageName.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-dark hover:bg-black text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
