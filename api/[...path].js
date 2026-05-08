const path = require('path');
const { pathToFileURL } = require('url');

const serverLibBase = pathToFileURL(path.join(__dirname, '..', 'server', 'src')).href;

async function ensureBootstrapped() {
  const state = globalThis.__vercelBoot || (globalThis.__vercelBoot = { booting: null });
  if (state.booting) return state.booting;

  const uri = process.env.MONGODB_URI;
  const secret = process.env.JWT_SECRET;

  if (!uri || !secret) {
    throw new Error('Server configuration missing (MONGODB_URI or JWT_SECRET). Set them in Vercel env.');
  }

  state.booting = (async () => {
    const dbMod = await import(`${serverLibBase}/lib/db.js`);
    await dbMod.connectDb(uri);
  })();

  return state.booting;
}

module.exports = async function handler(req, res) {
  try {
    await ensureBootstrapped();
    const appMod = await import(`${serverLibBase}/app.js`);
    const app = appMod.createApp();
    return app(req, res);
  } catch (err) {
    const message = err && err.message ? err.message : 'Internal error';
    console.error(err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error', message }));
  }
};

module.exports.config = { runtime: 'nodejs' };

