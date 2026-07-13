/**
 * POST /api/stripe/add-seats
 * Creates a Stripe Checkout Session to purchase additional org seats.
 *
 * Body: { seatType: 'user' | 'manager' | 'admin', quantity: number }
 * Requires an active org plan subscription.
 */
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getSecret } from '#airo/secrets';
import { resolveSession } from '../../auth/_session.js';
import { db } from '../../../db/client.js';
import { ja_users, ja_organisations, ja_system_config } from '../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';

// Seat pricing per type per month (GBP pence)
const SEAT_PRICE_GBP: Record<string, number> = {
  user:    500,   // £5.00/seat/month
  manager: 800,   // £8.00/seat/month
  admin:   1200,  // £12.00/seat/month
};

const SEAT_LABELS: Record<string, string> = {
  user:    'User Seat',
  manager: 'Manager Seat',
  admin:   'Admin Seat',
};

const ORG_PLANS = ['org_starter', 'org_growth', 'org_professional'];

export default async function handler(req: Request, res: Response) {
  // Guard: payments must be enabled
  try {
    const toggleRows = await db
      .select({ value: ja_system_config.value })
      .from(ja_system_config)
      .where(eq(ja_system_config.configKey, 'toggle_payments'))
      .limit(1);
    if (toggleRows[0]?.value !== 'true') {
      return res.status(503).json({ success: false, error: 'Payments are not currently enabled.', code: 'PAYMENTS_DISABLED' });
    }
  } catch {
    return res.status(503).json({ success: false, error: 'Unable to verify payment configuration.', code: 'PAYMENTS_DISABLED' });
  }

  const userId = await resolveSession(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'You must be signed in to purchase seats.' });
  }

  const { seatType = 'user', quantity = 1 } = req.body as { seatType?: string; quantity?: number };

  if (!['user', 'manager', 'admin'].includes(seatType)) {
    return res.status(400).json({ success: false, error: 'Invalid seat type. Must be user, manager, or admin.' });
  }
  const qty = Math.max(1, Math.min(50, parseInt(String(quantity), 10) || 1));

  // Verify user is on an org plan
  const userRows = await db.select({ plan: ja_users.plan, email: ja_users.email }).from(ja_users).where(eq(ja_users.id, userId)).limit(1);
  const user = userRows[0];
  if (!user || !ORG_PLANS.includes(user.plan ?? '')) {
    return res.status(403).json({ success: false, error: 'Seat purchases are only available on Organisation plans.' });
  }

  // Get their org
  const orgRows = await db.execute(sql`
    SELECT o.id, o.uuid, o.name, o.max_seats
    FROM ja_organisations o
    JOIN ja_org_members m ON m.org_id = o.id
    WHERE m.user_id = ${userId} AND m.role IN ('owner', 'admin')
    LIMIT 1
  `);
  const org = ((orgRows as unknown as { rows?: unknown[] }).rows ?? [])[0] as { id: number; uuid: string; name: string; max_seats: number } | undefined;
  if (!org) {
    return res.status(403).json({ success: false, error: 'You must be an organisation owner or admin to purchase seats.' });
  }

  const secretKey = String(getSecret('STRIPE_SECRET_KEY') ?? '');
  if (!secretKey) {
    return res.status(503).json({ success: false, error: 'Stripe is not configured on this server.' });
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-05-27.dahlia' });
    const origin = `${req.protocol}://${req.get('host')}`;
    const unitAmount = SEAT_PRICE_GBP[seatType] ?? 500;
    const label = SEAT_LABELS[seatType] ?? 'Seat';

    // Create an inline price for the seat purchase
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(user.email ? { customer_email: user.email } : {}),
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${label} — ${org.name}`,
              description: `Additional ${label.toLowerCase()} for your ${org.name} organisation`,
            },
            unit_amount: unitAmount,
            recurring: { interval: 'month' },
          },
          quantity: qty,
        },
      ],
      success_url: `${origin}/settings?tab=subscription&seats=success`,
      cancel_url:  `${origin}/settings?tab=subscription&seats=cancelled`,
      allow_promotion_codes: true,
      metadata: {
        type:      'seat_purchase',
        orgId:     String(org.id),
        orgUuid:   org.uuid,
        userId:    String(userId),
        seatType,
        quantity:  String(qty),
      },
      subscription_data: {
        metadata: {
          type:    'seat_purchase',
          orgId:   String(org.id),
          orgUuid: org.uuid,
          userId:  String(userId),
          seatType,
          quantity: String(qty),
        },
      },
    });

    return res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('stripe.add-seats.error', err);
    const message = err instanceof Stripe.errors.StripeError ? err.message : 'Failed to create seat checkout session.';
    return res.status(500).json({ success: false, error: message });
  }
}
