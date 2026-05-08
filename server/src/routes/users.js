import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User, USER_ROLES } from '../models/User.js';

export const usersRouter = express.Router();

const roleSchema = z.object({ role: z.enum(USER_ROLES) });

usersRouter.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const users = await User.find().select('_id name email role createdAt').sort({ createdAt: -1 }).lean();
  res.json({ users });
});

usersRouter.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const input = roleSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(id, { role: input.role }, { new: true })
    .select('_id name email role createdAt');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

