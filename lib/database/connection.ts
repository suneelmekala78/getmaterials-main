import mongoose from "mongoose";

/**
 * In-flight connect promise per mongoose instance. Next.js dev can end up with
 * more than one copy of mongoose loaded, and a connection belonging to one copy
 * says nothing about the others — models registered on an unconnected copy
 * would silently buffer until they time out.
 */
type ConnectCache = WeakMap<typeof mongoose, Promise<typeof mongoose>>;

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnectCache: ConnectCache | undefined;
}

const cache: ConnectCache = global.mongooseConnectCache ?? new WeakMap();

if (!global.mongooseConnectCache) {
  global.mongooseConnectCache = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // 1 = connected. readyState is scoped to this instance, so it is the only
  // trustworthy signal that the models we hand out are usable.
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  let promise = cache.get(mongoose);
  if (!promise) {
    promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        // Atlas TLS often fails on IPv6 from some ISPs (SSL alert 80).
        family: 4,
      })
      .catch((e) => {
        cache.delete(mongoose);
        throw e;
      });
    cache.set(mongoose, promise);
  }

  return promise;
}
