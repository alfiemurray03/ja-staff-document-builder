/**
 * PUT /api/builder-docs/:id
 * Updates an existing saved builder document (title, fields, branding, layout).
 * Only the owning user may update their own document.
 */
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { ja_builder_docs } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { resolveSession } from '../../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Please sign in to continue.', code: 'NOT_AUTHENTICATED' });
  }

  const { id } = req.params as { id: string };
  if (!id) {
    return res.status(400).json({ success: false, error: 'Document ID is required.' });
  }

  const { title, fields, brandColor, logoUrl, status, layoutId } = req.body as {
    title?: string;
    fields?: Record<string, string>;
    brandColor?: string;
    logoUrl?: string;
    status?: string;
    layoutId?: string;
  };

  if (!title || !fields) {
    return res.status(400).json({ success: false, error: 'Missing required fields: title and fields.' });
  }

  try {
    // Verify the doc belongs to this user
    const existing = await db
      .select({ id: ja_builder_docs.id, uuid: ja_builder_docs.uuid })
      .from(ja_builder_docs)
      .where(and(eq(ja_builder_docs.uuid, id), eq(ja_builder_docs.userId, userId)))
      .limit(1);

    if (!existing[0]) {
      return res.status(404).json({ success: false, error: 'Document not found or access denied.' });
    }

    await db
      .update(ja_builder_docs)
      .set({
        title:      String(title).slice(0, 255),
        fields:     JSON.stringify(fields),
        brandColor: brandColor ? String(brandColor).slice(0, 20) : null,
        logoUrl:    logoUrl    ? String(logoUrl).slice(0, 2000)  : null,
        layoutId:   layoutId   ? String(layoutId).slice(0, 50)   : null,
        status:     (status as string) || 'draft',
        updatedAt:  new Date(),
      })
      .where(and(eq(ja_builder_docs.uuid, id), eq(ja_builder_docs.userId, userId)));

    const [row] = await db
      .select({
        id:        ja_builder_docs.uuid,
        title:     ja_builder_docs.title,
        updatedAt: ja_builder_docs.updatedAt,
      })
      .from(ja_builder_docs)
      .where(eq(ja_builder_docs.uuid, id))
      .limit(1);

    return res.json({ success: true, doc: row });
  } catch (err) {
    console.error('builder-docs.put.error', err);
    return res.status(500).json({ success: false, error: 'Failed to update document.' });
  }
}
