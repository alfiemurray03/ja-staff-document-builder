/**
 * Shared openid-client Issuer + Client singleton.
 * Discovered lazily on first use so startup is not blocked.
 *
 * This is a **server-side confidential** OIDC client.
 * The client secret is read from server secrets and never sent to the browser.
 *
 * Microsoft Entra workforce tenant note
 * ─────────────────────────────────────────
 * CIAM tenants do NOT support the /common multi-tenant discovery endpoint.
 * The discovery URL must use the tenant-specific base:
 *
 *   https://<subdomain>.ciamlogin.com/<tenantId>/v2.0/.well-known/openid-configuration
 *
 * We derive this from OIDC_AUTHORITY by:
 *   1. Extracting the hostname (e.g. jagroupservicescustomerhub.ciamlogin.com)
 *   2. Using the configured OIDC_TENANT_ID.
 *
 * The OIDC_AUTHORITY value "https://jagroupservicescustomerhub.ciamlogin.com/common"
 * is used only to derive the hostname — the /common path is replaced with the tenant ID.
 */
import { Issuer, type Client } from 'openid-client';
import { getSecret } from '#airo/secrets';

let _client: Client | null = null;
let _discovering = false;
let _queue: Array<{ resolve: (c: Client) => void; reject: (e: unknown) => void }> = [];

function buildDiscoveryUrl(): string {
  const tenantId = String(getSecret('OIDC_TENANT_ID') ?? '').trim();
  const authority = String(getSecret('OIDC_AUTHORITY') ?? '').replace(/\/+$/, '').trim();
  if (!tenantId || !authority) throw new Error('OIDC_TENANT_ID and OIDC_AUTHORITY are required');
  const url = new URL(authority);
  if (url.protocol !== 'https:' || url.hostname !== 'login.microsoftonline.com') {
    throw new Error('OIDC_AUTHORITY must use https://login.microsoftonline.com');
  }
  return `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/v2.0/.well-known/openid-configuration`;
}

export async function getOidcClient(): Promise<Client> {
  if (_client) return _client;

  if (_discovering) {
    return new Promise((resolve, reject) => {
      _queue.push({ resolve, reject });
    });
  }

  _discovering = true;
  try {
    const clientId    = String(getSecret('OIDC_CLIENT_ID') ?? '');
    const secret      = String(getSecret('OIDC_CLIENT_SECRET') ?? '');
    const redirectUri = String(getSecret('OIDC_REDIRECT_URI') ?? '');
    if (!clientId || !secret || !redirectUri) throw new Error('Microsoft Entra OIDC configuration is incomplete');

    const discoveryUrl = buildDiscoveryUrl();
    console.log('oidc.client: discovering from', discoveryUrl);

    const issuer = await Issuer.discover(discoveryUrl);
    console.log('oidc.client: discovered issuer', issuer.issuer);

    _client = new issuer.Client({
      client_id:                  clientId,
      client_secret:              secret,
      redirect_uris:              [redirectUri],
      response_types:             ['code'],
      token_endpoint_auth_method: 'client_secret_post',
    });

    // Flush queue
    for (const { resolve } of _queue) resolve(_client);
    _queue = [];
    _discovering = false;
    return _client;
  } catch (err) {
    _discovering = false;
    _client = null;
    console.error('oidc.client: discovery failed', err);
    for (const { reject } of _queue) reject(err);
    _queue = [];
    throw err;
  }
}
