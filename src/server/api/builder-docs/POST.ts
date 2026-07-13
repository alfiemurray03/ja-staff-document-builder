import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { ja_builder_docs } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveSession } from '../auth/_session.js';
import crypto from 'node:crypto';

export default async function handler(req: Request, res: Response) {
  const userId = await resolveSession(req);

  const { builderId, templateId, title, fields, brandColor, logoUrl, status, layoutId } = req.body as {
    builderId?: string; templateId?: string; title?: string;
    fields?: Record<string, string>; brandColor?: string; logoUrl?: string;
    status?: string; layoutId?: string;
  };
  if (!builderId || !templateId || !title || !fields) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' });
  }
  try {
    const uuid = crypto.randomUUID();
    await db.insert(ja_builder_docs).values({
      uuid,
      userId,
      builderId: String(builderId).slice(0, 50),
      templateId: String(templateId).slice(0, 100),
      title: String(title).slice(0, 255),
      fields: JSON.stringify(fields),
      brandColor: brandColor ? String(brandColor).slice(0, 20) : null,
      logoUrl: logoUrl ? String(logoUrl).slice(0, 2000) : null,
      layoutId: layoutId ? String(layoutId).slice(0, 50) : null,
      status: (status as string) || 'draft',
    });
    const [row] = await db.select({
      id: ja_builder_docs.uuid,
      title: ja_builder_docs.title,
      updatedAt: ja_builder_docs.updatedAt,
    }).from(ja_builder_docs).where(eq(ja_builder_docs.uuid, uuid)).limit(1);
    return res.status(201).json({ success: true, doc: row });
  } catch (err) {
    console.error('builder-docs.post.error', err);
    return res.status(500).json({ success: false, error: 'Failed to save document.' });
  }
}
