import mongoose from 'mongoose';

export async function connectDb(uri) {
  if (!uri) throw new Error('MONGODB_URI is required');
  mongoose.set('strictQuery', true);
  const state = globalThis.__mongooseState || { promise: null, conn: null };
  globalThis.__mongooseState = state;

  if (state.conn) return state.conn;
  if (!state.promise) {
    state.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000,
        maxPoolSize: 5
      })
      .then((m) => m.connection);
  }
  state.conn = await state.promise;
  return state.conn;
}

