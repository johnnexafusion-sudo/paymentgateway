import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

declare global {
  // eslint-disable-next-line no-var
  var paymentGatewayPool: Pool | undefined;
}

export const db =
  global.paymentGatewayPool ??
  new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  global.paymentGatewayPool = db;
}