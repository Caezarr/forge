import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL;

export const isDbConfigured = Boolean(url);

export const db = url
  ? drizzle(createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }), { schema })
  : null;
