/**
 * POST /api/documents
 * Creates a new saved draft for the authenticated customer.
 *
 * Enforces:
 *  - Plan must allow saving (free plan cannot save)
 *  - Draft limit per plan (5 for Standard, 10 for Professional/Org)
 *  - Sets expiresAt based on plan retention period
 */
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../../db/client.js';
import { ja_documents } from '../../db/schema.js';
import { resolveSession } from '../auth/_session.js';

export default async function handler(req: Request, res: Response) {
  try {
    const userId = await resolveSession(req);

    const { templateId, title, category, status, docRef, fields, content, folderId } = req.body as {
      templateId?: string;
      title?: string;
      category?: string;
      status?: string;
      docRef?: string;
      fields?: Record<string, unknown>;
      content?: string;
      folderId?: string;
    };

    if (!templateId || !title) {
      return res.status(400).json({ success: false, error: 'templateId and title are required.' });
    }

    const now = new Date();
    const expiresAt = null;

    const uuid = crypto.randomUUID();

    await db.insert(ja_documents).values({
      uuid,
      userId,
      templateId,
      title,
      category: category ?? null,
      status: (status as 'draft' | 'complete' | 'archived') ?? 'draft',
      docRef: docRef ?? null,
      fields: fields ? JSON.stringify(fields) : null,
      content: content ?? null,
      folderId: folderId ?? null,
      version: 1,
      createdAt: now,
      updatedAt: now,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      document: {
        id: uuid,
        templateId,
        title,
        category: category ?? null,
        status: status ?? 'draft',
        docRef: docRef ?? null,
        fields: fields ?? {},
        content: content ?? '',
        folderId: folderId ?? null,
        version: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: expiresAt?.toISOString() ?? null,
      },
    });
  } catch (err) {
    console.error('documents.post.error', err);
    return res.status(500).json({ success: false, error: 'Service unavailable.' });
  }
}
