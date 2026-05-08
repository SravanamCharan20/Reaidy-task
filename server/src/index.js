import dotenv from 'dotenv';

import { connectDb } from './lib/db.js';
import { createApp } from './app.js';

dotenv.config();

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');

const port = Number(process.env.PORT || 4000);

await connectDb(process.env.MONGODB_URI);
const app = createApp();
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

