import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Job } from '../jobs/entities/job.entity';

type Env = Record<string, string | undefined>;

/**
 * TLS settings for the Postgres connection.
 *   DB_SSL=disable    -> no TLS (local Postgres)
 *   DB_SSL=no-verify  -> TLS without certificate verification
 *   unset             -> verified TLS, or no TLS for localhost
 */
export function sslOption(
  url: string,
  mode = '',
): false | { rejectUnauthorized: boolean } {
  const value = mode.toLowerCase();
  if (value === 'disable' || value === 'false') return false;
  if (value === 'no-verify') return { rejectUnauthorized: false };
  try {
    const { hostname } = new URL(url);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
  } catch {
    // fall through to verified TLS
  }
  return { rejectUnauthorized: true };
}

export function databaseConfig(env: Env = process.env): TypeOrmModuleOptions {
  const url = env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill it in.',
    );
  }
  return {
    type: 'postgres',
    url,
    entities: [Job],
    // Auto-create/alter tables from the entity. Defaults to on so a fresh database
    // works out of the box; set DB_SYNCHRONIZE=false once you manage schema changes yourself.
    synchronize: (env.DB_SYNCHRONIZE ?? 'true').toLowerCase() !== 'false',
    ssl: sslOption(url, env.DB_SSL),
  };
}

/** FRONTEND_URL may be a comma-separated list; trailing slashes are ignored. */
export function corsOrigins(env: Env = process.env): string[] {
  return (env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}
