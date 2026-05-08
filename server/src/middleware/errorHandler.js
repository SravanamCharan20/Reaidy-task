export function errorHandler(err, _req, res, _next) {
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.issues?.map((i) => ({ path: i.path?.join('.') || '', message: i.message })) || []
    });
  }

  if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });

  const status = err?.status || 500;
  const message = status >= 500 ? 'Server error' : err?.message || 'Request error';
  res.status(status).json({ error: message });
}

