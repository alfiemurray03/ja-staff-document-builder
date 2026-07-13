/** Environment-backed replacement for the original export-platform secret adapter. */
export function getSecret(name: string): string | undefined {
  return process.env[name];
}
