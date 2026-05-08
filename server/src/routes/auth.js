import express from 'express';
import { User } from '../models/User.js';
import { signToken } from '../lib/jwt.js';
import { loginSchema, registerSchema } from '../validation/auth.js';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  const input = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: input.email });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await User.hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: 'user'
  });

  const token = signToken({ sub: user._id.toString(), role: user.role });
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

authRouter.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await User.findOne({ email: input.email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await user.verifyPassword(input.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ sub: user._id.toString(), role: user.role });
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

