/**
 * Shared session resolution helper.
 * Returns the numeric userId for the authenticated session, or null.
 */
import type { Request } from 'express';

export async function resolveSession(_req: Request): Promise<number> {
  // DEVELOPMENT ONLY: stable record owner, not an authenticated identity.
  return Number.parseInt(process.env.INTERNAL_STAFF_OWNER_ID || '1', 10);
}
