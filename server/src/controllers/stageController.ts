import { Request, Response } from 'express';
import PipelineStage from '../models/PipelineStage';
import Lead from '../models/Lead';

const DEFAULT_STAGES = [
  { name: 'New', color: '#3B82F6', order: 0, isSystemDefault: true },
  { name: 'Contacted', color: '#A855F7', order: 1, isSystemDefault: true },
  { name: 'Qualified', color: '#EAB308', order: 2, isSystemDefault: true },
  { name: 'Proposal Sent', color: '#F97316', order: 3, isSystemDefault: true },
  { name: 'Won', color: '#10B981', order: 4, isSystemDefault: true },
  { name: 'Lost', color: '#9CA3AF', order: 5, isSystemDefault: true }
];

export class StageController {
  // Get all pipeline stages sorted by order (auto-seeds defaults if empty)
  public static async getStages(req: Request, res: Response) {
    try {
      let stages = await PipelineStage.find().sort({ order: 1 });
      if (stages.length === 0) {
        stages = await PipelineStage.insertMany(DEFAULT_STAGES);
      }
      return res.json({ success: true, count: stages.length, data: stages });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Create a new custom pipeline stage
  public static async createStage(req: Request, res: Response) {
    try {
      const { name, color } = req.body;
      const count = await PipelineStage.countDocuments();
      const stage = new PipelineStage({
        name,
        color: color || '#3B82F6',
        order: count,
        isSystemDefault: false
      });
      await stage.save();
      return res.status(201).json({ success: true, data: stage });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // Update a stage (rename, recolor)
  public static async updateStage(req: Request, res: Response) {
    try {
      const { name, color, order } = req.body;
      const stage = await PipelineStage.findByIdAndUpdate(
        req.params.id,
        { name, color, order },
        { new: true }
      );
      if (!stage) return res.status(404).json({ success: false, message: 'Stage not found' });
      return res.json({ success: true, data: stage });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // Reorder stages array
  public static async reorderStages(req: Request, res: Response) {
    try {
      const { stages } = req.body; // Array of { id, order }
      if (Array.isArray(stages)) {
        for (const item of stages) {
          await PipelineStage.findByIdAndUpdate(item.id, { order: item.order });
        }
      }
      const updated = await PipelineStage.find().sort({ order: 1 });
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Delete a stage (reassigns leads in that stage to 'New')
  public static async deleteStage(req: Request, res: Response) {
    try {
      const stage = await PipelineStage.findById(req.params.id);
      if (!stage) return res.status(404).json({ success: false, message: 'Stage not found' });

      // Move leads assigned to this stage name/id to default 'New'
      const defaultStage = await PipelineStage.findOne({ name: 'New' });
      const fallbackName = defaultStage ? defaultStage.name : 'New';

      await Lead.updateMany(
        { $or: [{ stageId: stage._id }, { status: stage.name }] },
        { status: fallbackName, stageId: defaultStage?._id }
      );

      await PipelineStage.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Stage deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}
