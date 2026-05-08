import { z } from 'zod';
import { TICKET_PRIORITIES, TICKET_STATUSES } from '../models/Ticket.js';

export const createTicketSchema = z.object({
  title: z.string().min(3).max(140),
  description: z.string().min(5).max(4000),
  priority: z.enum(TICKET_PRIORITIES).optional()
});

export const updateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  assignedTo: z.string().nullable().optional()
});

export const addCommentSchema = z.object({
  body: z.string().min(1).max(2000)
});

