/**
 * Decides whether write access to /jobs is configured, and how.
 *
 * The previous `AdminKeyGuard` returned `true` whenever `ADMIN_API_KEY` was
 * unset — "local development and the public demo" — which meant the deployed
 * API accepted POST, PATCH and DELETE from anyone on the internet. The
 * frontend never sends `x-admin-key` at all, so that was the live behaviour,
 * not a theoretical gap.
 *
 * Writes are now closed unless something explicitly opens them:
 *
 *   ADMIN_API_KEY=<secret>      writes require a matching x-admin-key header
 *   ALLOW_PUBLIC_WRITES=true    writes are open to anyone (opt-in, logged loudly)
 *   neither                     writes are refused with 503
 *
 * `ALLOW_PUBLIC_WRITES` exists because a public, writable demo is a legitimate
 * thing to want for a portfolio project — but it is now a decision someone
 * typed, with a name that says what it does, rather than the silent default.
 */

export type WriteMode = 'api-key' | 'public' | 'closed';

type Env = Record<string, string | undefined>;

export function writeMode(env: Env = process.env): WriteMode {
  if (env.ADMIN_API_KEY) return 'api-key';
  // Deliberately strict: only the exact string enables it.
  if (env.ALLOW_PUBLIC_WRITES === 'true') return 'public';
  return 'closed';
}

/** One-line summary for the startup log, so the running mode is never a guess. */
export function describeWriteMode(env: Env = process.env): string {
  switch (writeMode(env)) {
    case 'api-key':
      return 'Write access: ADMIN_API_KEY is set; POST/PATCH/DELETE /jobs require the x-admin-key header.';
    case 'public':
      return 'Write access: ALLOW_PUBLIC_WRITES=true — POST/PATCH/DELETE /jobs are OPEN TO ANYONE. Never use this for data you care about.';
    case 'closed':
      return 'Write access: DISABLED. POST/PATCH/DELETE /jobs will return 503 until you set ADMIN_API_KEY (or ALLOW_PUBLIC_WRITES=true for an intentionally public demo).';
  }
}
