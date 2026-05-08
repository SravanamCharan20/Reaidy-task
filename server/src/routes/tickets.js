import express from 'express';
import mongoose from 'mongoose';

import { requireAuth, requireRole } from '../middleware/auth.js';
import { Ticket, TICKET_PRIORITIES, TICKET_STATUSES } from '../models/Ticket.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';
import { addCommentSchema, createTicketSchema, updateTicketSchema } from '../validation/tickets.js';

export const ticketsRouter = express.Router();

function canSeeTicket(user, ticket) {
  if (user.role === 'admin' || user.role === 'support') return true;
  const createdById =
    typeof ticket.createdBy === 'object' && ticket.createdBy !== null && '_id' in ticket.createdBy
      ? ticket.createdBy._id
      : ticket.createdBy;
  return createdById?.toString?.() === user._id.toString();
}

ticketsRouter.get('/', requireAuth, async (req, res) => {
  const {
    status,
    priority,
    mine,
    q,
    sort = 'newest'
  } = req.query;

  const filter = {};

  if (status && TICKET_STATUSES.includes(status)) filter.status = status;
  if (priority && TICKET_PRIORITIES.includes(priority)) filter.priority = priority;

  const mineFlag = mine === 'true';
  if (mineFlag || req.user.role === 'user') filter.createdBy = req.user._id;

  if (q && typeof q === 'string' && q.trim()) {
    filter.$or = [
      { title: { $regex: q.trim(), $options: 'i' } },
      { description: { $regex: q.trim(), $options: 'i' } }
    ];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priority_high: { priority: -1, createdAt: -1 },
    updated: { updatedAt: -1 }
  };

  const sortBy = sortMap[sort] || sortMap.newest;

  const tickets = await Ticket.find(filter)
    .sort(sortBy)
    .populate('createdBy', '_id name email role')
    .populate('assignedTo', '_id name email role')
    .lean();

  res.json({ tickets });
});

ticketsRouter.post('/', requireAuth, async (req, res) => {
  const input = createTicketSchema.parse(req.body);
  const ticket = await Ticket.create({
    title: input.title,
    description: input.description,
    priority: input.priority || 'medium',
    createdBy: req.user._id
  });
  const full = await Ticket.findById(ticket._id)
    .populate('createdBy', '_id name email role')
    .populate('assignedTo', '_id name email role');
  res.status(201).json({ ticket: full });
});

ticketsRouter.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ticket id' });

  const ticket = await Ticket.findById(id)
    .populate('createdBy', '_id name email role')
    .populate('assignedTo', '_id name email role');
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (!canSeeTicket(req.user, ticket)) return res.status(403).json({ error: 'Forbidden' });

  const comments = await Comment.find({ ticket: ticket._id })
    .sort({ createdAt: 1 })
    .populate('author', '_id name email role')
    .lean();

  res.json({ ticket, comments });
});

ticketsRouter.post('/:id/comments', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ticket id' });

  const ticket = await Ticket.findById(id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  if (!canSeeTicket(req.user, ticket)) return res.status(403).json({ error: 'Forbidden' });

  const input = addCommentSchema.parse(req.body);
  const comment = await Comment.create({
    ticket: ticket._id,
    author: req.user._id,
    body: input.body
  });

  const full = await Comment.findById(comment._id).populate('author', '_id name email role');
  res.status(201).json({ comment: full });
});

ticketsRouter.patch('/:id', requireAuth, requireRole('admin', 'support'), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid ticket id' });

  const input = updateTicketSchema.parse(req.body);
  const update = {};

  if (input.status) update.status = input.status;
  if (input.priority) update.priority = input.priority;
  if (Object.prototype.hasOwnProperty.call(input, 'assignedTo')) {
    if (input.assignedTo === null || input.assignedTo === '') {
      update.assignedTo = null;
    } else if (mongoose.isValidObjectId(input.assignedTo)) {
      const user = await User.findById(input.assignedTo).select('_id');
      if (!user) return res.status(400).json({ error: 'assignedTo user not found' });
      update.assignedTo = user._id;
    } else {
      return res.status(400).json({ error: 'Invalid assignedTo' });
    }
  }

  const ticket = await Ticket.findByIdAndUpdate(id, update, { new: true })
    .populate('createdBy', '_id name email role')
    .populate('assignedTo', '_id name email role');
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  res.json({ ticket });
});

