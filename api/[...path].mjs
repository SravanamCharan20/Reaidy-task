import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/lib/db.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');

await connectDb(process.env.MONGODB_URI);

export default createApp();

