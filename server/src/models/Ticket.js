import mongoose from 'mongoose';

export const TICKET_STATUSES = ['open', 'in_progress', 'closed'];
export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: TICKET_STATUSES, default: 'open' },
    priority: { type: String, enum: TICKET_PRIORITIES, default: 'medium' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1, priority: 1, createdAt: -1 });
ticketSchema.index({ createdBy: 1, createdAt: -1 });

export const Ticket = mongoose.model('Ticket', ticketSchema);

