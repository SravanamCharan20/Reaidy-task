import { createApp } from '../server/src/app.js';
import { connectDb } from '../server/src/lib/db.js';

let isBootstrapped = false;

async function bootstrap() {
  if (isBootstrapped) return;

  const uri = process.env.MONGODB_URI;
  const secret = process.env.JWT_SECRET;

  if (!uri || !secret) {
    const msg = 'Server configuration missing (MONGODB_URI or JWT_SECRET). Set them in Vercel env.';
    console.error(msg);
    throw new Error(msg);
  }

  await connectDb(uri);
  isBootstrapped = true;
}

const app = createApp();

export default async function handler(req, res) {
  try {
    await bootstrap();
    return app(req, res);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Server configuration error',
        message: 'Check server logs and environment variables on Vercel.'
      })
    );
  }
}

