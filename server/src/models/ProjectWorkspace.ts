import mongoose, { Schema, Document } from 'mongoose';

export interface ITask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'backlog' | 'todo' | 'in_progress' | 'code_review' | 'qa_testing' | 'done';
  estimatedHours: number;
  loggedHours: number;
  dueDate?: Date;
}

export interface IMilestone {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amount: number;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'in_review' | 'completed';
  completedAt?: Date;
}

export interface ITeamMember {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  role?: string;
}

export interface IProgressUpdate {
  _id?: mongoose.Types.ObjectId;
  title: string;
  note?: string;
  createdAt?: Date;
}

export interface IDomainInfo {
  name?: string;
  registrar?: string;
  cost?: number;
  purchasedOn?: Date;
  expiresOn?: Date;
  autoRenew?: boolean;
}

export interface IHostingInfo {
  provider?: string;
  cost?: number;
  purchasedOn?: Date;
  expiresOn?: Date;
  autoRenew?: boolean;
}

export interface IPaymentHistoryEntry {
  amount?: number;
  method?: string;
  note?: string;
  editedAt?: Date;
}

export interface IPayment {
  _id?: mongoose.Types.ObjectId;
  amount: number;
  method?: string;
  date?: Date;
  note?: string;
  invoiceId?: mongoose.Types.ObjectId;
  history?: IPaymentHistoryEntry[];
}

export interface ITeamPayment {
  _id?: mongoose.Types.ObjectId;
  memberName: string;
  amount: number;
  date?: Date;
  note?: string;
}

export interface IClientTask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  status: 'todo' | 'done';
  addedBy: 'admin' | 'client';
  createdAt?: Date;
}

/**
 * A quotation is a freeform, Clienter-style canvas document: a list of pages,
 * each holding absolutely-positioned elements (text boxes / tables) that the
 * admin can drag, resize, and edit in place. `elements` is intentionally
 * `Mixed` rather than a strict sub-schema - the canvas shape is owned by the
 * editor UI, not the database, so new element fields (e.g. a future image
 * type) never require a migration.
 */
export interface IProjectQuotation {
  _id?: mongoose.Types.ObjectId;
  quotationNumber: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  documentTitle: string;
  agencyName: string;
  preparedByName?: string;
  clientName: string;
  clientEmail?: string;
  validUntil?: Date;
  accentColor: string;
  fontFamily: string;
  showTotalAmount: boolean;
  totalAmount?: string;
  requireSignature: boolean;
  pages: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectWorkspace extends Document {
  projectName: string;
  description?: string;
  projectType: 'one_off' | 'retainer';
  clientId: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  contractId?: mongoose.Types.ObjectId;
  techStack: string[];
  repositoryUrl?: string;
  stagingUrl?: string;
  productionUrl?: string;
  budget: number;
  paidAmount: number;
  expenses: number;
  startDate: Date;
  targetDeliveryDate?: Date;
  status: 'planning' | 'in_progress' | 'testing' | 'deployed' | 'completed' | 'on_hold';
  healthScore: number; // 0 to 100
  milestones: IMilestone[];
  tasks: ITask[];
  teamMembers: ITeamMember[];
  progressUpdates: IProgressUpdate[];
  domain?: IDomainInfo;
  hosting?: IHostingInfo;
  payments: IPayment[];
  teamPayments: ITeamPayment[];
  clientTasks: IClientTask[];
  quotations: IProjectQuotation[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  assigneeName: { type: String },
  assigneeEmail: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in_progress', 'code_review', 'qa_testing', 'done'],
    default: 'todo'
  },
  estimatedHours: { type: Number, default: 0 },
  loggedHours: { type: Number, default: 0 },
  dueDate: { type: Date }
});

const MilestoneSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true, default: 0 },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'in_review', 'completed'],
    default: 'pending'
  },
  completedAt: { type: Date }
});

const TeamMemberSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    role: { type: String },
  },
  { _id: true }
);

const ProgressUpdateSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    note: { type: String },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

const DomainInfoSchema: Schema = new Schema(
  {
    name: { type: String },
    registrar: { type: String },
    cost: { type: Number, default: 0 },
    purchasedOn: { type: Date },
    expiresOn: { type: Date },
    autoRenew: { type: Boolean, default: false },
  },
  { _id: false }
);

const HostingInfoSchema: Schema = new Schema(
  {
    provider: { type: String },
    cost: { type: Number, default: 0 },
    purchasedOn: { type: Date },
    expiresOn: { type: Date },
    autoRenew: { type: Boolean, default: false },
  },
  { _id: false }
);

const PaymentHistorySchema: Schema = new Schema(
  {
    amount: { type: Number },
    method: { type: String },
    note: { type: String },
    editedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PaymentSchema: Schema = new Schema(
  {
    amount: { type: Number, required: true },
    method: { type: String },
    date: { type: Date, default: Date.now },
    note: { type: String },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    history: [PaymentHistorySchema],
  },
  { _id: true }
);

const TeamPaymentSchema: Schema = new Schema(
  {
    memberName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: true }
);

const ClientTaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    status: { type: String, enum: ['todo', 'done'], default: 'todo' },
    addedBy: { type: String, enum: ['admin', 'client'], default: 'admin' },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

const ProjectQuotationSchema: Schema = new Schema(
  {
    quotationNumber: { type: String, required: true },
    status: { type: String, enum: ['draft', 'sent', 'approved', 'rejected'], default: 'draft' },
    documentTitle: { type: String, default: 'New Quotation' },
    agencyName: { type: String, default: 'Build Your Thoughts' },
    preparedByName: { type: String },
    clientName: { type: String, required: true },
    clientEmail: { type: String },
    validUntil: { type: Date },
    accentColor: { type: String, default: '#e8622c' },
    fontFamily: { type: String, default: 'Helvetica' },
    showTotalAmount: { type: Boolean, default: true },
    totalAmount: { type: String },
    requireSignature: { type: Boolean, default: true },
    pages: { type: [Schema.Types.Mixed], default: () => [] },
  },
  { _id: true, timestamps: true }
);

const ProjectWorkspaceSchema: Schema = new Schema(
  {
    projectName: { type: String, required: true, trim: true },
    description: { type: String },
    projectType: { type: String, enum: ['one_off', 'retainer'], default: 'one_off' },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    quotationId: { type: Schema.Types.ObjectId, ref: 'Quotation' },
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract' },
    techStack: [{ type: String }],
    repositoryUrl: { type: String },
    stagingUrl: { type: String },
    productionUrl: { type: String },
    budget: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    targetDeliveryDate: { type: Date },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'testing', 'deployed', 'completed', 'on_hold'],
      default: 'planning'
    },
    healthScore: { type: Number, default: 100 },
    milestones: [MilestoneSchema],
    tasks: [TaskSchema],
    teamMembers: [TeamMemberSchema],
    progressUpdates: [ProgressUpdateSchema],
    domain: { type: DomainInfoSchema, default: () => ({}) },
    hosting: { type: HostingInfoSchema, default: () => ({}) },
    payments: [PaymentSchema],
    teamPayments: [TeamPaymentSchema],
    clientTasks: [ClientTaskSchema],
    quotations: [ProjectQuotationSchema],
  },
  { timestamps: true }
);

ProjectWorkspaceSchema.index({ projectName: 'text', clientId: 1, status: 1 });

export default mongoose.model<IProjectWorkspace>('ProjectWorkspace', ProjectWorkspaceSchema);
