import React, { useState, useEffect } from 'react';
import { Trash2, ArrowUp, ArrowDown, Plus, Palette } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { getApiUrl } from '../../services/api';

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
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setLocalStages(stages);
  }, [stages]);

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
    const previousStages = localStages;
    try {
      const response = await fetch(getApiUrl('/leads/stages/reorder'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          stages: reordered.map((item) => ({ id: item._id, order: item.order })),
        }),
      });
      if (!response.ok) throw new Error('Failed to reorder stages.');
      onStagesUpdated();
    } catch (err) {
      console.error('Failed to reorder stages:', err);
      setLocalStages(previousStages);
      setFormError('Failed to reorder stages. Please try again.');
    }
  };

  const handleSaveStageItem = async (stage: StageItem) => {
    try {
      const response = await fetch(getApiUrl(`/leads/stages/${stage._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({ name: stage.name, color: stage.color, order: stage.order }),
      });
      if (!response.ok) throw new Error('Failed to save stage.');
      onStagesUpdated();
    } catch (err) {
      setFormError('Failed to save stage changes. Please try again.');
    }
  };

  const requestDeleteStage = (id: string) => {
    if (localStages.length <= 1) {
      setFormError('You must have at least one pipeline stage.');
      return;
    }
    setFormError('');
    setDeleteStageId(id);
  };

  const handleDeleteStage = async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/leads/stages/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete stage.');
      onStagesUpdated();
    } catch (err) {
      setFormError('Failed to delete stage. Please try again.');
    } finally {
      setDeleteStageId(null);
    }
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim()) return;

    setLoading(true);
    setFormError('');
    try {
      const response = await fetch(getApiUrl('/leads/stages'), {
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
      } else {
        setFormError(data.message || 'Failed to add stage.');
      }
    } catch (err) {
      setFormError('Failed to add stage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Pipeline Stages" subtitle="Add, rename, recolor, reorder or remove columns." maxWidth="md">
        {/* Existing Stages List with Scrollbar & Reorder */}
        <div
          className="space-y-2 max-h-[260px] sm:max-h-[280px] overflow-y-scroll pr-2 custom-form-scrollbar overscroll-contain"
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
                onClick={() => requestDeleteStage(stage._id)}
                className="p-1.5 text-slateText hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {formError && (
          <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {formError}
          </p>
        )}

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
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteStageId}
        onClose={() => setDeleteStageId(null)}
        onConfirm={() => deleteStageId && handleDeleteStage(deleteStageId)}
        title="Delete pipeline stage?"
        description="Leads in this stage will be reassigned to the default stage."
        confirmLabel="Delete"
        destructive
      />
    </>
  );
};
