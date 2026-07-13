# JA Staff Portal

> **WARNING: This development build does not contain authentication or access control. Do not expose it to the public internet or use it to store sensitive, personal, safeguarding, financial or confidential information until authentication and authorisation have been reimplemented.**

JA Staff Portal is the internal workspace for managing the everyday operations, documents, governance and board activities of JA Group Services Ltd. Its Document Studio preserves the complete document-production capability for JA Group Services Ltd and JSDS Group Ltd.

The temporary browser-local staff profile is only a development convenience. It does not identify or verify anybody and is not a security control. Workforce authentication and role-based access control must be reintroduced before production deployment.

## Browser-local storage

With `VITE_STORAGE_MODE=local` (the default), bundled builder templates load directly from the source catalogue and documents, folders, statuses, references, template overrides and the local audit trail are stored in IndexedDB. No Express server, MySQL database or authentication endpoint is required by the active builders, dashboard, Documents page or Staff Account page. This data is device-and-browser-specific, is not shared, and the audit trail is not tamper-resistant.

Use **Staff Account > Local backup and restore** to download or import the validated JSON backup. Clearing browser site data can permanently delete locally stored documents.

## Preserved functionality

The letter, email, policy, form, invoice, checklist, report, minutes, proposal and contract builders remain, together with the template catalogue, guided fields, rich-text editing, live preview, drafts, saved and completed documents, folders, references, printing, export, document signing, branding, layout controls, template administration and audit records.

JA Group Services Ltd and JSDS Group Ltd are available as staff company selections. Configure the temporary default with `VITE_STAFF_COMPANY`. Company registration details, office, logo, website, email, telephone, footer, brand settings and approved signatories should be maintained in company-branding settings rather than hard-coded into documents.

## Local installation

1. Install Node.js 22 and MySQL 8.
2. Copy `env.example` to `.env` and enter local database values.
3. Run `npm install`.
4. Run migrations with `npx tsx src/server/db/migrate.ts` or allow application startup to run the idempotent migration runner.
5. Run `npm run dev` and open the local URL only.

Configure the development staff profile through the `VITE_STAFF_*` variables or the Staff Account screen. The browser stores staff preferences locally. `INTERNAL_STAFF_OWNER_ID` supplies a stable, non-authenticated owner value for legacy document tables that still require `user_id`.

Validation commands are `npm run type-check`, `npm test`, `npm run lint`, `npm run build`, and `npm audit`.

## Retired legacy schema

Authentication, sessions, customer users, customer organisations, password resets, subscriptions, Stripe, affiliate, reseller, referral, support-ticket and commercial configuration tables and columns remain in the historical schema where immediate deletion would be destructive. The development document flow must not treat these records as identity, permission, plan or quota inputs. Remove them only through a reviewed future migration with an approved retention plan.
