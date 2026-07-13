/**
 * GET /api/documents
 * Returns all documents for the authenticated customer.
 */
import type { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { ja_documents } from '../../db/schema.js';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  try {
    const userId = await resolveSession(req);

    const docs = await db
      .select()
      .from(ja_documents)
      .where(eq(ja_documents.userId, userId))
      .orderBy(desc(ja_documents.updatedAt));

    return res.json({
      success: true,
      documents: docs.map((d) => {
        const fields = d.fields ? JSON.parse(d.fields) as Record<string, unknown> : {};
        const templateName = typeof fields._templateName === 'string' ? fields._templateName : d.templateId;
        return {
          id: d.uuid,
          templateId: d.templateId,
          templateName,
          category: d.category,
          title: d.title,
          status: d.status,
          docRef: d.docRef,
          fields,
          content: d.content ?? '',
          // Legacy aliases for wizard/view pages
          formData: fields as Record<string, string>,
          generatedContent: d.content ?? '',
          version: d.version,
          folderId: d.folderId,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        };
      }),
    });
  } catch (err) {
    console.error('documents.get.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
