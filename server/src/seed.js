import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDb } from './lib/db.js';
import { User } from './models/User.js';
import { Ticket } from './models/Ticket.js';
import { Comment } from './models/Comment.js';

dotenv.config();

const demoPassword = 'Password123!';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function upsertUser({ name, email, role }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  const passwordHash = await User.hashPassword(demoPassword);
  return User.create({ name, email, role, passwordHash });
}

async function run() {
  await connectDb(process.env.MONGODB_URI);

  await Comment.deleteMany({});
  await Ticket.deleteMany({});

  const admin = await upsertUser({ name: 'Admin', email: 'admin@demo.com', role: 'admin' });
  const support = await upsertUser({ name: 'Support', email: 'support@demo.com', role: 'support' });
  const user = await upsertUser({ name: 'User', email: 'user@demo.com', role: 'user' });

  const statuses = ['open', 'in_progress', 'closed'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  const samples = [
    { title: 'Login page shows blank screen', description: 'After submitting credentials, the page stays white.' },
    { title: 'Invoice export fails for large accounts', description: 'Export sometimes returns a 500 error.' },
    { title: 'Need help resetting password', description: 'Password reset email never arrives.' },
    { title: 'Bug: search results duplicate', description: 'Searching for the same query repeats items.' },
    { title: 'Feature request: dark mode', description: 'Please add a dark theme to the dashboard.' }
  ];

  const tickets = [];
  for (const s of samples) {
    tickets.push(
      await Ticket.create({
        ...s,
        status: pick(statuses),
        priority: pick(priorities),
        createdBy: user._id,
        assignedTo: Math.random() > 0.5 ? support._id : null
      })
    );
  }

  const adminTickets = [
    { title: 'Audit roles and permissions', description: 'Verify endpoints are correctly protected.' },
    { title: 'Triage high priority tickets', description: 'Review urgent tickets and assign support.' }
  ];
  for (const s of adminTickets) {
    tickets.push(
      await Ticket.create({
        ...s,
        status: pick(statuses),
        priority: pick(priorities),
        createdBy: admin._id,
        assignedTo: support._id
      })
    );
  }

  for (const t of tickets) {
    const commentCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < commentCount; i++) {
      const author = pick([admin, support, user]);
      await Comment.create({
        ticket: t._id,
        author: author._id,
        body: pick([
          'Acknowledged. Looking into it now.',
          'Can you share steps to reproduce?',
          'This should be resolved in the next update.',
          'Assigned and tracking progress.'
        ])
      });
    }
  }

  console.log('Seed complete');
  console.log('admin@demo.com / Password123!');
  console.log('support@demo.com / Password123!');
  console.log('user@demo.com / Password123!');
}

await run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });

